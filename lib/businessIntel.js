// Shared Business Intelligence search logic.
// Used by BOTH the admin-triggered manual refresh and the automatic
// weekly cron job — this is the ONLY place that spends Anthropic tokens.
// Regular page views never call this; they read from Supabase instead.

export const PROMPTS = {
  tenders: `Search the web for pharmaceutical procurement tenders from international bodies and government portals (WHO, UNICEF Supply Division, USAID, Global Fund, GeM India, national health ministries, UNGM, DG Market) that are CURRENTLY OPEN for bidding — meaning today's date is before their submission deadline. A tender posted 2-3 weeks ago with a deadline that hasn't passed yet still counts as open and should be included.

Do not restrict to only tenders posted in the last few days — search broadly and find the most relevant currently-open tenders regardless of when they were originally posted, as long as the deadline hasn't passed.

Return a JSON array of up to 6 real tenders with this exact structure:
[{"title":"short tender title","authority":"issuing body","country":"country/region","product":"product category","value":"estimated value with currency","deadline":"deadline date","daysLeft":number_of_days_remaining,"category":"therapeutic category","postedAgo":"how long ago it was posted, e.g. '2 weeks ago'","url":"source url if available"}]

Return ONLY the JSON array as the very last thing in your response, no markdown formatting, no backticks after it.`,

  'patent-cliff': `Search the web for major pharmaceutical brand-name drugs/molecules whose patent protection is expiring soon (patent cliff) or has recently expired, creating generic entry opportunities. This is inherently slow-moving information — use the most recent, most authoritative data available even if the underlying article or database entry is a few months old. Do not return empty just because there's no brand-new news today; patent expiry dates are known well in advance and should always be findable.

Return a JSON array of up to 6 real molecules with this exact structure:
[{"brand":"brand name","molecule":"generic/INN name","originator":"originator company","market":"primary market (US/EU/etc)","expiryDate":"patent expiry date or year","annualSales":"approximate annual sales value","therapeuticArea":"therapeutic category","dataAsOf":"how recent this information is, e.g. 'Updated 3 weeks ago'"}]

Return ONLY the JSON array as the very last thing in your response, no markdown, no backticks after it.`,

  'para-iv': `Search the web for Paragraph IV patent challenges in the US pharmaceutical market — generic companies that have filed ANDA Para IV certifications challenging brand drug patents, and their current litigation status. Use the most recent, most authoritative information available even if it's from a few weeks or months back — litigation status doesn't need to be "breaking news" to be relevant. Do not return empty just because nothing changed today.

Return a JSON array of up to 6 real, currently relevant Para IV challenges with this exact structure:
[{"brand":"brand name","molecule":"generic/INN name","originator":"originator company","challengers":"number or names of generic challengers","status":"litigation status description","statusColor":"red or green or amber","ftfStatus":"first-to-file status if known","dataAsOf":"how recent this information is, e.g. 'Updated 1 month ago'"}]

Return ONLY the JSON array as the very last thing in your response, no markdown, no backticks after it.`,

  news: `Search the web for significant pharmaceutical industry news: FDA/EMA/CDSCO drug approvals or rejections, product recalls, warning letters, major M&A deals, and significant Phase 3 clinical trial results. Prioritize the most recent items, but if nothing major broke in the last few days, go back further — find the most recent significant news available even if it's from 2-4 weeks ago, rather than returning nothing. Label each item honestly with its actual recency.

Return a JSON array of up to 6 real news items with this exact structure:
[{"category":"BREAKING or APPROVAL or REGULATORY or MERGER or RECALL","headline":"news headline","source":"publication or agency name","timeAgo":"how long ago, honestly stated, e.g. '2 hours ago', '3 days ago', '3 weeks ago'","url":"source url if available"}]

Return ONLY the JSON array as the very last thing in your response, no markdown, no backticks after it.`,

  guidelines: `Search the web for new or revised pharmaceutical regulatory guidance documents — ICH guidelines, FDA guidance documents, EMA guidelines, WHO technical reports, CDSCO/Schedule M notifications, or eCTD/M4Q specification updates. This is inherently slow-moving; if nothing changed in the last few days, go back further — find the most recent significant guideline update available even if it's a few weeks or months old, rather than returning nothing.

Return a JSON array of up to 6 real guideline updates with this exact structure:
[{"title":"guideline or notification title","authority":"issuing body, e.g. ICH, FDA, EMA, WHO, CDSCO","region":"applicable region or market","effectiveDate":"effective or publication date","summary":"one-sentence summary of what changed","dataAsOf":"how recent this information is, e.g. 'Updated 2 weeks ago'","url":"source url if available"}]

Return ONLY the JSON array as the very last thing in your response, no markdown, no backticks after it.`,
};

export const CATEGORIES = Object.keys(PROMPTS);

/**
 * Calls Anthropic with web_search enabled for one category.
 * Returns { data, error, errorCode, errorDetail }.
 * data is always an array (empty on failure).
 */
export async function runAISearch(type) {
  const prompt = PROMPTS[type];
  if (!prompt) {
    return { data: [], error: `Invalid category: ${type}`, errorCode: 'INVALID_CATEGORY' };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      data: [],
      error: 'ANTHROPIC_API_KEY not configured in Vercel environment variables',
      errorCode: 'NO_API_KEY',
    };
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }],
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[business-intel:${type}] Anthropic API error ${response.status}:`, errText.slice(0, 500));
      return {
        data: [],
        error: `AI search failed (HTTP ${response.status})`,
        errorCode: 'API_ERROR',
        errorDetail: errText.slice(0, 300),
      };
    }

    const data = await response.json();

    if (data.stop_reason === 'max_tokens') {
      console.warn(`[business-intel:${type}] Response truncated at max_tokens`);
    }

    const textBlocks = (data.content || []).filter(b => b.type === 'text');
    const fullText = textBlocks.map(b => b.text).join('\n');

    const matches = fullText.match(/\[[\s\S]*?\]/g) || [];
    let results = [];
    const candidates = [...matches].sort((a, b) => b.length - a.length);
    for (const candidate of candidates) {
      try {
        const parsed = JSON.parse(candidate);
        if (Array.isArray(parsed) && parsed.length > 0) { results = parsed; break; }
      } catch (e) { /* try next candidate */ }
    }

    if (results.length === 0) {
      console.warn(`[business-intel:${type}] No valid JSON array found. stop_reason=${data.stop_reason}`);
      return {
        data: [],
        error: data.stop_reason === 'max_tokens'
          ? 'Response was cut off before completing — try again'
          : 'Search completed but no results could be parsed',
        errorCode: data.stop_reason === 'max_tokens' ? 'TRUNCATED' : 'PARSE_FAILED',
      };
    }

    return { data: results, error: null };
  } catch (err) {
    console.error(`[business-intel:${type}] Unhandled error:`, err);
    return { data: [], error: err.message, errorCode: 'EXCEPTION' };
  }
}
