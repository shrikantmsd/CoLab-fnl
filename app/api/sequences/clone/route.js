import { supabaseAdmin } from '../../../../lib/supabase';

// POST — clone nodes from one sequence to next, marking all as 'unchanged'
export async function POST(request) {
  const { dossier_id, from_sequence, to_sequence } = await request.json();
  const db = supabaseAdmin();

  try {
    // Get all nodes from the source sequence
    const { data: sourceNodes, error } = await db
      .from('dossier_nodes')
      .select('*')
      .eq('dossier_id', dossier_id)
      .eq('sequence_number', from_sequence);

    if (error) throw error;

    if (!sourceNodes || sourceNodes.length === 0) {
      return Response.json({ data: [], message: 'No nodes found in source sequence' });
    }

    // Clone each node with new sequence number and operation = 'unchanged'
    const newNodes = sourceNodes.map(node => ({
      dossier_id: node.dossier_id,
      module: node.module,
      section: node.section,
      title: node.title,
      required: node.required,
      status: node.status === 'missing' ? 'missing' : 'unchanged',
      sequence_number: to_sequence,
      operation: 'unchanged',
    }));

    const { data: created, error: createErr } = await db
      .from('dossier_nodes')
      .insert(newNodes)
      .select();

    if (createErr) throw createErr;

    return Response.json({ data: created, count: created.length });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
