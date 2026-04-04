import { supabaseAdmin } from '../../../lib/supabase';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const db = supabaseAdmin();

  try {
    if (type === 'dossiers') {
      // Dossiers joined with products for product name
      const { data: dossiers } = await db
        .from('dossiers')
        .select(`
          id, country, authority, submission_type, dossier_format, status,
          m4q_version, created_at, updated_at,
          products ( name, inn, dosage_form )
        `)
        .order('updated_at', { ascending: false })
        .limit(50);

      // Get node counts per dossier
      const { data: nodeCounts } = await db
        .from('dossier_nodes')
        .select('dossier_id, status')
        .in('dossier_id', (dossiers||[]).map(d => d.id));

      const countMap = {};
      (nodeCounts||[]).forEach(n => {
        if (!countMap[n.dossier_id]) countMap[n.dossier_id] = { total:0, uploaded:0 };
        countMap[n.dossier_id].total++;
        if (['uploaded','reviewed','approved'].includes(n.status))
          countMap[n.dossier_id].uploaded++;
      });

      const enriched = (dossiers||[]).map(d => ({
        ...d,
        product_name: d.products?.name || 'Unknown',
        inn:          d.products?.inn,
        node_counts:  countMap[d.id] || { total:0, uploaded:0 },
      }));

      return Response.json({ data: enriched });
    }

    if (type === 'activity') {
      // Recent document uploads and reviews
      const { data: docs } = await db
        .from('documents')
        .select(`
          id, filename, uploaded_at, reviewed_at,
          review_status, review_score, file_type,
          dossier_nodes ( section, title, dossier_id ),
          dossiers ( country, authority )
        `)
        .order('uploaded_at', { ascending: false })
        .limit(30);

      const enriched = (docs||[]).map(d => ({
        id:            d.id,
        filename:      d.filename,
        uploaded_at:   d.uploaded_at,
        reviewed_at:   d.reviewed_at,
        review_status: d.review_status,
        review_score:  d.review_score,
        section:       d.dossier_nodes?.section,
        title:         d.dossier_nodes?.title,
        country:       d.dossiers?.country,
        authority:     d.dossiers?.authority,
      }));

      return Response.json({ data: enriched });
    }

    return Response.json({ error: 'Unknown type' }, { status: 400 });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
