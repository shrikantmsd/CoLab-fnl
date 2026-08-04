// Business Development Intelligence API
// Uses Anthropic API with web_search tool to fetch live pharma industry data

const PROMPTS = {
  tenders: `Search for current active international pharmaceutical procurement tenders (WHO, UNICEF Supply Division, USAID, Global Fund, GeM India, national health ministries, UNGM) that are open right now for bidding. Focus on generic pharmaceutical products, APIs, and finished dosage forms.

Return a JSON array of up to 6 real, currently open tenders with this exact structure:
[{"title":"short tender title","authority":"issuing body","country":"country/region","product":"product category","value":"estimated value with currency","deadline":"deadline date","daysLeft":number_of_days_remaining,"category":"therapeutic category","url":"source url if available"}]

Only include tenders that are genuinely open for bidding as of today. Return ONLY the JSON array, no markdown formatting, no explanation, no backticks.`,

  'patent-cliff': `Search for major pharmaceutical brand-name drugs/molecules whose patent protection is expiring in 2026, 2027, or 2028 (patent cliff), creating generic entry opportunities. Focus on high-value blockbuster drugs.

Return a JSON array of up to 6 real molecules with this exact structure:
[{"brand":"brand name","molecule":"generic/INN name","originator":"originator company","market":"primary market (US/EU/etc)","expiryDate":"patent expiry date or year","annualSales":"approximate annual sales value","therapeuticArea":"therapeutic category"}]

Use real, verifiable information. Return ONLY the JSON array, no markdown, no explanation.`,

  'para-iv': `Search for current active Paragraph IV patent challenges in the US pharmaceutical market, where generic companies have filed ANDA Para IV certifications challenging brand drug patents.

Return a JSON array of up to 6 real, current Para IV challenges with this exact structure:
[{"brand":"brand name","molecule":"generic/INN name","originator":"originator company","challengers":"number or names of generic challengers","status":"litigation status description","statusColor":"red or green or amber","ftfStatus":"first-to-file status if known","filingDate":"approximate filing timeframe"}]

Use real, verifiable information from recent Orange Book/FDA data or litigation news. Return ONLY the JSON array, no markdown, no explanation.`,

  news: `Search for the most significant pharmaceutical industry news from the last 3-5 days: FDA/EMA/CDSCO drug approvals or rejections, product recalls, warning letters, major M&A deals, and significant Phase 3 clinical trial results.

Return a JSON array of up to 6 real, current news items with this exact structure:
[{"category":"BREAKING or APPROVAL or REGULATORY or MERGER or RECALL","headline":"news headline","source":"publication or agency name","timeAgo":"how long ago (e.g. 2 hours ago, Today, Yesterday)","url":"source url if available"}]

Use real, current news. Return ONLY the JSON array, no markdown, no explanation.`,
};

export async function POST(request) {
  try {
    const { type } = await request.json();
    const prompt = PROMPTS[type];

    if (!prompt) {
      return Response.json({ error: 'Invalid type. Use: tenders, patent-cliff, para-iv, news' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return Response.json({
        error: 'ANTHROPIC_API_KEY not configured in Vercel environment variables',
        data: [],
      }, { status: 200 });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 2500,
        messages: [{ role: 'user', content: prompt }],
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Anthropic API error:', errText);
      return Response.json({ error: 'AI search failed', data: [] }, { status: 200 });
    }

    const data = await response.json();

    // Extract all text blocks (final answer comes after tool use blocks)
    const textBlocks = (data.content || []).filter(b => b.type === 'text');
    const fullText = textBlocks.map(b => b.text).join('\n');

    // Extract JSON array from the response text
    const jsonMatch = fullText.match(/\[[\s\S]*\]/);
    let results = [];
    if (jsonMatch) {
      try {
        results = JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.error('JSON parse error:', e.message);
      }
    }

    return Response.json({ data: results, type, fetched_at: new Date().toISOString() });
  } catch (err) {
    console.error('business-intel error:', err);
    return Response.json({ error: err.message, data: [] }, { status: 200 });
  }
}
