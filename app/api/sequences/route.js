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
    if (error) throw error;
    return Response.json({ data });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
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
