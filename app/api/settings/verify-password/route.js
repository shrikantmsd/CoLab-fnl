import { supabaseAdmin } from '../../../../lib/supabase';

// Verifies a login attempt server-side. Accepts EITHER:
//   1. The original NEXT_PUBLIC_ACCESS_PASSWORD env var (always valid,
//      unconditionally — this can never be disabled by anything that
//      happens in Settings), OR
//   2. Whatever custom password is currently stored in app_settings
//      (if one has ever been set)
//
// This is additive-only by design: setting a new password in Settings
// can never lock anyone out, because the original password keeps working
// no matter what is stored in the database, and if the database is ever
// unreachable this still degrades safely to "check the env var only".
export async function POST(request) {
  try {
    const { password } = await request.json();
    if (!password) return Response.json({ ok: false });

    const envPassword = process.env.NEXT_PUBLIC_ACCESS_PASSWORD || 'CoLAB@2026';
    if (password === envPassword) return Response.json({ ok: true });

    try {
      const db = supabaseAdmin();
      const { data } = await db
        .from('app_settings')
        .select('access_password')
        .eq('id', 1)
        .single();
      if (data?.access_password && password === data.access_password) {
        return Response.json({ ok: true });
      }
    } catch { /* table missing or unreachable — env-var check above already ran */ }

    return Response.json({ ok: false });
  } catch (err) {
    return Response.json({ ok: false, error: err.message });
  }
}
