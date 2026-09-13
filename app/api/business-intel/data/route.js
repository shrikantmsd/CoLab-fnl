import { supabaseAdmin } from '../../../../lib/supabase';

// GET /api/business-intel/data?category=tenders
// Read-only. Never calls Anthropic. Safe for every page view, every user,
// unlimited frequency — this is a plain database read.
export async function GET(request) {
  const db = supabaseAdmin();
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    if (!category) {
      return Response.json({ error: 'category is required' }, { status: 400 });
    }

    const { data: rows, error } = await db
      .from('business_intel')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false });

    if (error) {
      // Table probably doesn't exist yet — graceful empty response
      console.warn('business_intel read failed:', error.message);
      return Response.json({ items: [], lastAiUpdate: null, lastManualUpdate: null });
    }

    const aiRows = (rows || []).filter(r => r.source === 'ai');
    const manualRows = (rows || []).filter(r => r.source === 'manual');

    const items = (rows || []).map(r => ({ ...r.data, id: r.id, createdAt: r.created_at, _origin: r.source }));
    const lastAiUpdate = aiRows.length > 0 ? aiRows[0].created_at : null;
    const lastManualUpdate = manualRows.length > 0
      ? manualRows.reduce((max, r) => r.created_at > max ? r.created_at : max, manualRows[0].created_at)
      : null;

    return Response.json({ items, lastAiUpdate, lastManualUpdate });
  } catch (err) {
    console.error('business-intel/data error:', err);
    return Response.json({ items: [], error: err.message }, { status: 200 });
  }
}
