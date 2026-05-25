import { supabaseAdmin } from '../../../../lib/supabase';

// POST — create a node extension
export async function POST(request) {
  const db = supabaseAdmin();
  try {
    const body = await request.json();
    const { dossier_id, module, section, title, sequence_number } = body;

    if (!dossier_id || !section || !title) {
      return Response.json({ error: 'dossier_id, section, and title are required' }, { status: 400 });
    }

    // Check for duplicate section
    const { data: existing } = await db
      .from('dossier_nodes')
      .select('id')
      .eq('dossier_id', dossier_id)
      .eq('section', section)
      .limit(1);

    if (existing && existing.length > 0) {
      return Response.json({ error: 'Node extension with this section already exists' }, { status: 409 });
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

// DELETE — remove a node extension
export async function DELETE(request) {
  const db = supabaseAdmin();
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const section = searchParams.get('section');
    const dossier_id = searchParams.get('dossier_id');

    if (id) {
      // Only allow deleting node extensions (sections containing .NE)
      const { data: node } = await db.from('dossier_nodes').select('section').eq('id', id).single();
      if (node && !node.section.includes('.NE')) {
        return Response.json({ error: 'Cannot delete standard CTD sections. Only node extensions can be removed.' }, { status: 403 });
      }
      const { error } = await db.from('dossier_nodes').delete().eq('id', id);
      if (error) throw error;
    } else if (section && dossier_id) {
      if (!section.includes('.NE')) {
        return Response.json({ error: 'Cannot delete standard CTD sections.' }, { status: 403 });
      }
      const { error } = await db.from('dossier_nodes').delete()
        .eq('dossier_id', dossier_id).eq('section', section);
      if (error) throw error;
    }

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
