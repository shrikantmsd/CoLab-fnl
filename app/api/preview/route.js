import { supabaseAdmin } from '../../../lib/supabase';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const file_path = searchParams.get('file_path');

  if (!file_path) {
    return Response.json({ error: 'file_path required' }, { status: 400 });
  }

  const db = supabaseAdmin();

  try {
    // Generate a signed URL valid for 1 hour
    const { data, error } = await db.storage
      .from('colab-documents')
      .createSignedUrl(file_path, 3600);

    if (error) throw error;

    return Response.json({ url: data.signedUrl });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
