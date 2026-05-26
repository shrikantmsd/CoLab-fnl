import { supabaseAdmin } from '../../../../lib/supabase';

// POST — create node extension(s) — supports single or batch
export async function POST(request) {
  const db = supabaseAdmin();
  try {
    const body = await request.json();

    // Batch mode: create multiple nodes at once (sub-tree clone)
    if (body.batch && Array.isArray(body.batch)) {
      const rows = body.batch.map(n => ({
        dossier_id: n.dossier_id,
        module: n.module || 'Module 3',
        section: n.section,
        title: n.title,
        required: n.required || false,
        status: 'missing',
        sequence_number: n.sequence_number || '0000',
        operation: 'new',
      }));

      const { data, error } = await db.from('dossier_nodes').insert(rows).select();
      if (error) throw error;
      return Response.json({ data, count: data?.length || 0 });
    }

    // Single mode
    const { dossier_id, module, section, title, sequence_number } = body;
    if (!dossier_id || !section || !title) {
      return Response.json({ error: 'dossier_id, section, and title are required' }, { status: 400 });
    }

    const { data: existing } = await db
      .from('dossier_nodes')
      .select('id')
      .eq('dossier_id', dossier_id)
      .eq('section', section)
      .limit(1);

    if (existing && existing.length > 0) {
      return Response.json({ error: 'Node with this section already exists' }, { status: 409 });
    }

    const { data, error } = await db
      .from('dossier_nodes')
      .insert({
        dossier_id,
        module: module || 'Module 3',
        section,
        title,
        required: false,
        status: 'missing',
        sequence_number: sequence_number || '0000',
        operation: 'new',
      })
      .select()
      .single();

    if (error) throw error;
    return Response.json({ data });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// DELETE — remove node extension(s) by id or prefix
export async function DELETE(request) {
  const db = supabaseAdmin();
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const prefix = searchParams.get('prefix');
    const dossier_id = searchParams.get('dossier_id');

    if (prefix && dossier_id) {
      // Delete by prefix — removes the extension and ALL its children
      if (!prefix.includes('.NE')) {
        return Response.json({ error: 'Cannot delete standard CTD sections. Only node extensions (.NE) can be removed.' }, { status: 403 });
      }

      // Delete all nodes whose section starts with the prefix
      // This catches: 3.2.S.NE1, 3.2.S.NE1.1.1, 3.2.S.NE1.2.1, etc.
      const { data: toDelete } = await db
        .from('dossier_nodes')
        .select('id, section')
        .eq('dossier_id', dossier_id)
        .like('section', prefix + '%');

      if (toDelete && toDelete.length > 0) {
        const ids = toDelete.map(n => n.id);
        // Also delete associated documents
        for (const nodeId of ids) {
          await db.from('documents').delete().eq('node_id', nodeId);
        }
        await db.from('dossier_nodes').delete().in('id', ids);
      }

      return Response.json({ success: true, deleted: toDelete?.length || 0 });
    } else if (id) {
      // Delete single node by id — only if it's a node extension
      const { data: node } = await db.from('dossier_nodes').select('section').eq('id', id).single();
      if (node && !node.section.includes('.NE')) {
        return Response.json({ error: 'Cannot delete standard CTD sections.' }, { status: 403 });
      }
      await db.from('documents').delete().eq('node_id', id);
      await db.from('dossier_nodes').delete().eq('id', id);
      return Response.json({ success: true });
    }

    return Response.json({ error: 'id or prefix+dossier_id required' }, { status: 400 });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
