import { supabaseAdmin } from '../../../lib/supabase';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const dossier_id = searchParams.get('dossier_id');
  const sequence   = searchParams.get('sequence') || '0000';
  if (!dossier_id) return Response.json({ error: 'dossier_id required' }, { status: 400 });

  const db = supabaseAdmin();

  try {
    // Get dossier info
    const { data: dossier } = await db.from('dossiers').select('*').eq('id', dossier_id).single();

    // Get all nodes
    const { data: nodes } = await db.from('dossier_nodes')
      .select('*')
      .eq('dossier_id', dossier_id)
      .eq('sequence_number', sequence)
      .neq('operation', 'unchanged')  // Only export changed/new/replace/delete nodes
      .order('section');

    // Also get ALL nodes for the manifest (including unchanged)
    const { data: allNodes } = await db.from('dossier_nodes')
      .select('*').eq('dossier_id', dossier_id).eq('sequence_number', sequence).order('section');

    // Get all documents
    const { data: docs } = await db.from('documents').select('*').eq('dossier_id', dossier_id);

    const nodeMap = {};
    (nodes || []).forEach(n => { nodeMap[n.id] = n; });

    const isActd = dossier.dossier_format === 'ACTD';

    function sectionToPath(node) {
      const sec = node.section.toLowerCase().replace(/\./g, '-');
      const mod = node.module.toLowerCase().replace(/\s+/g, '');
      if (isActd) {
        if (mod === 'parti') return `part-i/${sec}`;
        if (mod === 'partii') return `part-ii/${sec}`;
        if (mod === 'partiii') return `part-iii/${sec}`;
        return `part-iv/${sec}`;
      }
      const mnum = mod.replace(/[^0-9]/g, '')[0] || '1';
      return `m${mnum}/${sec}`;
    }

    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    const product = (dossier.product_name || 'product').replace(/\s+/g, '-').toLowerCase();
    const authority = (dossier.authority || 'auth').replace(/\s+/g, '-').toUpperCase();
    const seqPadded = sequence.padStart(4,'0');
    const rootFolder = `${authority}-${product}-seq${seqPadded}`;

    let uploadedCount = 0;
    const xmlLeafs = [];

    for (const doc of (docs || [])) {
      const node = nodeMap[doc.node_id];
      if (!node) continue;

      const { data: fileData, error: fileErr } = await db.storage.from('colab-documents').download(doc.file_path);
      if (fileErr || !fileData) continue;

      const buffer = Buffer.from(await fileData.arrayBuffer());
      const folderPath = sectionToPath(node);
      const safeFile = doc.filename.replace(/[^a-zA-Z0-9._-]/g, '-');
      zip.file(`${rootFolder}/${folderPath}/${safeFile}`, buffer);
      uploadedCount++;

      const secId = node.section.toLowerCase().replace(/\./g, '-');
      xmlLeafs.push(`  <leaf ID="${secId}" xlink:href="${folderPath}/${safeFile}" checksum="" checksum-type="md5" operation="new">\n    <title>${node.title.replace(/&/g,'&amp;').replace(/</g,'&lt;')}</title>\n  </leaf>`);
    }

    // index.xml
    zip.file(`${rootFolder}/index.xml`,
`<?xml version="1.0" encoding="UTF-8"?>
<!-- RAISA eCTD Export — ${dossier.dossier_format} v3.2.2 -->
<!-- ${dossier.product_name} | ${dossier.country} | ${dossier.authority} | ${dossier.submission_type} -->
<!-- Generated: ${new Date().toISOString().split('T')[0]} by RAISA -->
<ich:ich xmlns:ich="http://www.ich.org/ich-ectd-3-2.xsd"
         xmlns:xlink="http://www.w3.org/1999/xlink"
         ICHVersion="3.2.2" version="0000">
  <regional>
    <authority>${dossier.authority}</authority>
    <country>${dossier.country}</country>
    <submission-type>${dossier.submission_type}</submission-type>
    <sequence>0000</sequence>
  </regional>
${xmlLeafs.join('\n')}
</ich:ich>`);

    // Node manifest CSV
    const csv = ['Module,Section,Title,Required,Status,File',
      ...(allNodes||nodes||[]).map(n => {
        const doc = (docs||[]).find(d => d.node_id === n.id);
        return `"${n.module}","${n.section}","${n.title.replace(/"/g,'""')}","${n.required?'Yes':'No'}","${n.status}","${doc?doc.filename:''}"`;
      })].join('\n');
    zip.file(`${rootFolder}/node-manifest.csv`, csv);

    // README
    zip.file(`${rootFolder}/README.txt`,
`RAISA eCTD Export
Product    : ${dossier.product_name}
Country    : ${dossier.country}
Authority  : ${dossier.authority}
Submission : ${dossier.submission_type}
Format     : ${dossier.dossier_format} / M4Q(${dossier.m4q_version})
Generated  : ${new Date().toISOString().split('T')[0]} by RAISA
Sequence   : ${sequence}
Type       : ${sequence === '0000' ? 'Initial Submission' : 'Amendment / Response'}
Uploaded   : ${uploadedCount} changed sections in this sequence
Status     : ${uploadedCount === (nodes||[]).length ? 'COMPLETE — All sections uploaded' : `INCOMPLETE — ${(nodes||[]).length - uploadedCount} sections missing`}
`);

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 6 } });

    return new Response(zipBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${rootFolder}.zip"`,
        'Content-Length': zipBuffer.length.toString(),
      }
    });

  } catch (err) {
    console.error('Export error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
