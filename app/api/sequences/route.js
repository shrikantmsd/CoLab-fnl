import { supabaseAdmin } from '../../../lib/supabase';

// GET sequences for a dossier
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const dossier_id = searchParams.get('dossier_id');
  const db = supabaseAdmin();
  try {
    const { data, error } = await db
      .from('sequences')
      .select('*')
      .eq('dossier_id', dossier_id)
      .order('sequence_number');
    if (error) {
      // Table might not exist yet — return empty array instead of crashing
      console.warn('sequences query failed:', error.message);
      return Response.json({ data: [] });
    }
    return Response.json({ data: data || [] });
  } catch (err) {
    // Graceful fallback
    return Response.json({ data: [] });
  }
}

// POST create new sequence
export async function POST(request) {
  const body = await request.json();
  const db = supabaseAdmin();
  try {
    const { data, error } = await db
      .from('sequences')
      .insert(body)
      .select()
      .single();
    if (error) throw error;
    return Response.json({ data });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// DELETE a sequence and all its nodes
export async function DELETE(request) {
  const body = await request.json();
  const { dossier_id, sequence_number } = body;
  if (!dossier_id || !sequence_number) return Response.json({ error: 'dossier_id and sequence_number required' }, { status: 400 });
  if (sequence_number === '0000') return Response.json({ error: 'Cannot delete initial sequence 0000' }, { status: 400 });
  const db = supabaseAdmin();
  try {
    // Delete dossier_nodes for this sequence
    await db.from('dossier_nodes').delete()
      .eq('dossier_id', dossier_id).eq('sequence_number', sequence_number);
    // Delete the sequence record
    const { error } = await db.from('sequences').delete()
      .eq('dossier_id', dossier_id).eq('sequence_number', sequence_number);
    if (error) throw error;
    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
