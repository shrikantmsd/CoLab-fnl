import { supabaseAdmin } from '../../../lib/supabase';

// GET - fetch nodes for a dossier with their documents
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const dossier_id = searchParams.get('dossier_id');
  const db = supabaseAdmin();

  try {
    const sequence = searchParams.get('sequence') || '0000';

    let nodesQuery = db
      .from('dossier_nodes')
      .select(`
        *,
        documents (
          id, filename, file_path, file_size, review_score,
          review_status, review_summary, critical_issues,
          major_issues, minor_issues, uploaded_at, reviewed_at,
          sequence_number
        )
      `)
      .eq('dossier_id', dossier_id)
      .eq('sequence_number', sequence)
      .order('section');

    const { data: nodes, error } = await nodesQuery;

    if (error) throw error;

    // Calculate gap report
    const total = nodes.length;
    const uploaded = nodes.filter(n => n.status !== 'missing').length;
    const reviewed = nodes.filter(n => n.status === 'reviewed').length;
    const issues = nodes.filter(n => n.status === 'issues').length;
    const missing = nodes.filter(n => n.status === 'missing').length;
    const allDocs = nodes.flatMap(n => n.documents || []);
    const scoredDocs = allDocs.filter(d => d && d.review_score);
    const avgScore = scoredDocs.length > 0
      ? scoredDocs.reduce((sum, d) => sum + d.review_score, 0) / scoredDocs.length
      : 0;

    return Response.json({
      data: nodes,
      gap_report: {
        total,
        uploaded,
        reviewed,
        issues,
        missing,
        completeness: total > 0 ? Math.round((uploaded / total) * 100) : 0,
        avg_score: Math.round(avgScore) || 0,
      }
    });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
