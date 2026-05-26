import { supabaseAdmin } from '../../../lib/supabase';

// GET - fetch documents for a node or dossier
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const node_id = searchParams.get('node_id');
  const dossier_id = searchParams.get('dossier_id');
  const db = supabaseAdmin();

  try {
    let query = db.from('documents').select('*').order('uploaded_at', { ascending: false });
    if (node_id) query = query.eq('node_id', node_id);
    if (dossier_id) query = query.eq('dossier_id', dossier_id);
    const { data, error } = await query;
    if (error) throw error;
    return Response.json({ data });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// POST - upload a file to Supabase Storage + create document record
export async function POST(request) {
  const db = supabaseAdmin();

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const node_id = formData.get('node_id');
    const dossier_id = formData.get('dossier_id');
    const section = formData.get('section');
    const doc_type = formData.get('doc_type') || 'CTD Module';

    if (!file || !node_id) {
      return Response.json({ error: 'file and node_id are required' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = file.name.split('.').pop();
    const filePath = `${dossier_id}/${node_id}/${Date.now()}-${file.name}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await db.storage
      .from('colab-documents')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // Get signed URL (valid 7 days)
    const { data: urlData } = await db.storage
      .from('colab-documents')
      .createSignedUrl(filePath, 60 * 60 * 24 * 7);

    // Create document record
    const { data: doc, error: docError } = await db
      .from('documents')
      .insert({
        node_id,
        dossier_id,
        filename: file.name,
        file_path: filePath,
        file_size: file.size,
        file_type: ext,
        review_status: 'pending',
      })
      .select()
      .single();

    if (docError) throw docError;

    // Update node status to 'uploaded'
    await db.from('dossier_nodes').update({ status: 'uploaded' }).eq('id', node_id);

    // Trigger AI review asynchronously (don't wait)
    triggerAIReview(doc.id, file, section, doc_type, db).catch(console.error);

    return Response.json({
      data: { ...doc, signed_url: urlData?.signedUrl },
    });

  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// DELETE - remove document and file from storage
export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const db = supabaseAdmin();

  try {
    // Get file path first
    const { data: doc } = await db.from('documents').select('file_path, node_id').eq('id', id).single();

    // Delete from storage
    if (doc?.file_path) {
      await db.storage.from('colab-documents').remove([doc.file_path]);
    }

    // Delete record
    await db.from('documents').delete().eq('id', id);

    // Check if node has remaining documents
    const { data: remaining } = await db.from('documents').select('id').eq('node_id', doc.node_id);
    if (!remaining || remaining.length === 0) {
      await db.from('dossier_nodes').update({ status: 'missing' }).eq('id', doc.node_id);
    }

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// Async AI review function
async function triggerAIReview(docId, file, section, docType, db) {
  try {
    // Update status to reviewing
    await db.from('documents').update({ review_status: 'reviewing' }).eq('id', docId);

    // Read file as base64 for Claude
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');
    const mediaType = file.type || 'application/pdf';

    const prompt = buildReviewPrompt(section, docType);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'document',
              source: { type: 'base64', media_type: mediaType, data: base64 },
            },
            { type: 'text', text: prompt },
          ],
        }],
      }),
    });

    const result = await response.json();
    const text = result.content?.[0]?.text || '';

    // Parse JSON from response
    let reviewData = {};
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) reviewData = JSON.parse(jsonMatch[0]);
    } catch {
      reviewData = { score: 50, summary: text.slice(0, 300), issues: [] };
    }

    const score = reviewData.score || 50;
    const critical = (reviewData.issues || []).filter(i => i.severity === 'critical').length;
    const major = (reviewData.issues || []).filter(i => i.severity === 'major').length;
    const minor = (reviewData.issues || []).filter(i => i.severity === 'minor').length;

    // Save review results
    await db.from('documents').update({
      review_status: 'done',
      review_score: score,
      review_json: reviewData,
      review_summary: reviewData.summary || '',
      critical_issues: critical,
      major_issues: major,
      minor_issues: minor,
      reviewed_at: new Date().toISOString(),
    }).eq('id', docId);

    // Update node status
    const nodeStatus = score >= 70 ? 'reviewed' : 'issues';
    await db.from('dossier_nodes').update({ status: nodeStatus })
      .eq('id', (await db.from('documents').select('node_id').eq('id', docId).single()).data?.node_id);

  } catch (err) {
    console.error('AI review failed:', err);
    await db.from('documents').update({
      review_status: 'failed',
      review_summary: 'AI review failed: ' + err.message,
    }).eq('id', docId);
  }
}

function buildReviewPrompt(section, docType) {
  return `You are a pharmaceutical regulatory affairs expert. Review this document for ICH CTD compliance.

Section: ${section}
Document type: ${docType}

Analyse the document and respond ONLY with a JSON object in this exact format:
{
  "score": <0-100 integer>,
  "verdict": "PASS" | "FAIL" | "REVIEW",
  "summary": "<2-3 sentence summary of the document and its compliance status>",
  "issues": [
    {
      "severity": "critical" | "major" | "minor",
      "section": "<section reference>",
      "description": "<clear description of the issue>",
      "recommendation": "<what to fix>"
    }
  ],
  "strengths": ["<strength 1>", "<strength 2>"],
  "ichrefs": ["<ICH guideline referenced>"]
}

Score guide: 90-100 = excellent, 70-89 = good with minor issues, 50-69 = significant issues, below 50 = major non-compliance.`;
}
