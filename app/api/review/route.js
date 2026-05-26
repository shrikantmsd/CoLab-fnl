// Server-side proxy for Claude API — keeps API key secret
export async function POST(request) {
  try {
    const { messages, max_tokens, system } = await request.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return Response.json({
        content: [{ type: 'text', text: JSON.stringify({
          score: 0,
          verdict: 'ERROR',
          summary: 'ANTHROPIC_API_KEY is not configured in Vercel environment variables. Go to Vercel → Settings → Environment Variables → add ANTHROPIC_API_KEY.',
          sections: [],
          issues: [],
          recommendations: ['Configure the ANTHROPIC_API_KEY environment variable in Vercel.']
        })}]
      });
    }

    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: max_tokens || 4000,
        ...(system ? { system } : {}),
        messages: messages,
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      console.error('Anthropic API error:', resp.status, errText);
      return Response.json({
        content: [{ type: 'text', text: JSON.stringify({
          score: 0,
          verdict: 'ERROR',
          summary: `API returned ${resp.status}: ${errText.slice(0, 200)}`,
          sections: [],
          issues: [],
          recommendations: ['Check API key and try again.']
        })}]
      });
    }

    const data = await resp.json();
    return Response.json(data);

  } catch (err) {
    console.error('Review proxy error:', err);
    return Response.json({
      content: [{ type: 'text', text: JSON.stringify({
        score: 0,
        verdict: 'ERROR',
        summary: 'Server error: ' + (err.message || 'Unknown error'),
        sections: [],
        issues: [],
        recommendations: ['Try again later.']
      })}]
    });
  }
}
