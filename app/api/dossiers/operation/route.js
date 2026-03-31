import { supabaseAdmin } from '../../../../lib/supabase';

export async function POST(request) {
  const { node_id, operation } = await request.json();
  const db = supabaseAdmin();
  try {
    const { data, error } = await db
      .from('dossier_nodes')
      .update({ operation })
      .eq('id', node_id)
      .select()
      .single();
    if (error) throw error;
    return Response.json({ data });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
