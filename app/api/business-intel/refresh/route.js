import { supabaseAdmin } from '../../../../lib/supabase';
import { runAISearch, CATEGORIES } from '../../../../lib/businessIntel';

// POST /api/business-intel/refresh
// Body: { category: 'tenders' | 'patent-cliff' | 'para-iv' | 'news' | 'all' }
//
// This is the ONLY endpoint (besides the weekly cron) that spends Anthropic
// tokens. It is triggered deliberately from the "🔄 Update Now" button in
// Business Dev — never automatically on a page view.
//
// For each requested category: runs the AI search, then REPLACES all
// source='ai' rows for that category with the fresh results. Rows with
// source='manual' are never touched — they persist until explicitly deleted.
export async function POST(request) {
  const db = supabaseAdmin();
  try {
    const body = await request.json();
    const requested = body.category === 'all' ? CATEGORIES : [body.category];

    const invalid = requested.filter(c => !CATEGORIES.includes(c));
    if (invalid.length > 0) {
      return Response.json({ error: `Invalid category: ${invalid.join(', ')}` }, { status: 400 });
    }

    const results = {};

    for (const category of requested) {
      const { data, error, errorCode, errorDetail } = await runAISearch(category);

      if (error) {
        results[category] = { success: false, error, errorCode, errorDetail, count: 0 };
        continue;
      }

      // Replace all previous AI-sourced rows for this category
      await db.from('business_intel').delete().eq('category', category).eq('source', 'ai');

      const rows = data.map(item => ({
        category,
        data: item,
        source: 'ai',
      }));

      if (rows.length > 0) {
        const { error: insertErr } = await db.from('business_intel').insert(rows);
        if (insertErr) {
          results[category] = { success: false, error: insertErr.message, count: 0 };
          continue;
        }
      }

      results[category] = { success: true, count: rows.length };
    }

    return Response.json({ results, updated_at: new Date().toISOString() });
  } catch (err) {
    console.error('business-intel/refresh error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
