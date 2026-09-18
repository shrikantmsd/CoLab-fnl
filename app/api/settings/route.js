import { supabaseAdmin } from '../../../lib/supabase';

// GET — return profile fields and whether a custom password is set.
// Deliberately never returns the actual password value, even the custom
// one — a password field only ever needs write capability, never display.
export async function GET() {
  const db = supabaseAdmin();
  try {
    const { data, error } = await db
      .from('app_settings')
      .select('profile_name, profile_email, profile_role, access_password')
      .eq('id', 1)
      .single();

    if (error) {
      // Table likely doesn't exist yet (SQL migration not run) — degrade
      // gracefully instead of breaking the Settings screen.
      return Response.json({
        data: { profile_name: '', profile_email: '', profile_role: '', has_custom_password: false },
        migrationPending: true,
      });
    }

    return Response.json({
      data: {
        profile_name: data?.profile_name || '',
        profile_email: data?.profile_email || '',
        profile_role: data?.profile_role || '',
        has_custom_password: !!data?.access_password,
      },
    });
  } catch (err) {
    return Response.json({ error: err.message, data: null }, { status: 200 });
  }
}

// POST — partial update. Accepts any subset of profile_name, profile_email,
// profile_role, new_password. Only provided fields are changed.
export async function POST(request) {
  const db = supabaseAdmin();
  try {
    const body = await request.json();
    const updates = { updated_at: new Date().toISOString() };

    if (body.profile_name !== undefined) updates.profile_name = body.profile_name;
    if (body.profile_email !== undefined) updates.profile_email = body.profile_email;
    if (body.profile_role !== undefined) updates.profile_role = body.profile_role;
    if (body.new_password !== undefined && body.new_password.trim()) {
      updates.access_password = body.new_password.trim();
    }

    const { error } = await db.from('app_settings').update(updates).eq('id', 1);
    if (error) throw error;

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
