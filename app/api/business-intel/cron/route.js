import { supabaseAdmin } from '../../../../lib/supabase';
import { runAISearch, CATEGORIES } from '../../../../lib/businessIntel';

// GET /api/business-intel/cron
// Called automatically by Vercel's scheduler (see vercel.json "crons" entry).
// Vercel sends `Authorization: Bearer <CRON_SECRET>` on every invocation —
// this route rejects anything else, so a random visitor hitting this URL
// directly cannot trigger paid AI calls.
//
// Runs all 4 categories unattended, same replace-AI-rows logic as the
// manual refresh endpoint.
export async function GET(request) {
  const authHeader = request.headers.get('authorization');
  const expected = `Bearer ${process.env.CRON_SECRET}`;

  if (!process.env.CRON_SECRET || authHeader !== expected) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = supabaseAdmin();
  const results = {};

  for (const category of CATEGORIES) {
    const { data, error, errorCode } = await runAISearch(category);

    if (error) {
      results[category] = { success: false, error, errorCode, count: 0 };
      continue;
    }

    await db.from('business_intel').delete().eq('category', category).eq('source', 'ai');

    const rows = data.map(item => ({ category, data: item, source: 'ai' }));
    if (rows.length > 0) {
      const { error: insertErr } = await db.from('business_intel').insert(rows);
      if (insertErr) {
        results[category] = { success: false, error: insertErr.message, count: 0 };
        continue;
      }
    }

    results[category] = { success: true, count: rows.length };
  }

  console.log('[business-intel:cron] Weekly refresh complete:', JSON.stringify(results));
  return Response.json({ results, ran_at: new Date().toISOString() });
}
