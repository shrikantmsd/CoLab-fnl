import { supabaseAdmin } from '../../../../lib/supabase';
import { CATEGORIES } from '../../../../lib/businessIntel';

// POST /api/business-intel/manual
// Body: { category, data: {...fields matching that category's shape} }
// Admin manually types in something they read elsewhere (e.g. a tender
// noticed on a site like PharmaExpress). No AI call, no token cost.
export async function POST(request) {
  const db = supabaseAdmin();
  try {
    const body = await request.json();
    const { category, data } = body;

    if (!CATEGORIES.includes(category)) {
      return Response.json({ error: `Invalid category: ${category}` }, { status: 400 });
    }
    if (!data || typeof data !== 'object') {
      return Response.json({ error: 'data object is required' }, { status: 400 });
    }

    const { data: row, error } = await db
      .from('business_intel')
      .insert({ category, data, source: 'manual' })
      .select()
      .single();

    if (error) throw error;

    return Response.json({ item: { id: row.id, source: 'manual', createdAt: row.created_at, ...row.data } });
  } catch (err) {
    console.error('business-intel/manual POST error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/business-intel/manual?id=<uuid>
// Removes any item — AI-found or manually added. Admin has full control
// to clear stale entries (expired tenders, outdated news) at any time.
export async function DELETE(request) {
  const db = supabaseAdmin();
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return Response.json({ error: 'id is required' }, { status: 400 });
    }

    const { error } = await db.from('business_intel').delete().eq('id', id);
    if (error) throw error;

    return Response.json({ success: true });
  } catch (err) {
    console.error('business-intel/manual DELETE error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
