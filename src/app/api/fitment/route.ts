import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  const { generation, wheelWidth, diameter, offset, tireSize } = await req.json()

  if (!generation) {
    return NextResponse.json({ error: 'generation is required' }, { status: 400 })
  }

  // Build a focused, BMW-community-oriented search prompt
  const queryParts: string[] = []
  if (wheelWidth && diameter) queryParts.push(`${wheelWidth}x${diameter}`)
  if (offset) queryParts.push(offset)
  if (tireSize) queryParts.push(tireSize)

  const userQuery = queryParts.length > 0
    ? `BMW ${generation} fitment: ${queryParts.join(' ')}`
    : `BMW ${generation} wheel and tire fitment community recommendations`

  const systemPrompt = `You are a BMW 5 Series fitment expert assistant for FiveSeriesHQ.com — a dedicated BMW 5 Series community site. Your job is to find and summarize community-verified wheel and tire fitment data for the BMW ${generation}.

When given a fitment question, use web search to find real forum threads, community posts, and verified fitment reports from:
- BMW forums (bimmerfest, bimmerpost, r/BMW on Reddit, e39source.com, m5board.com, etc.)
- Wheel fitment sites (wheel-size.com, fitmentindustries.com, stance:works)
- Build threads and gallery posts

Return a structured JSON object with this exact shape:
{
  "confirmedFits": [
    {
      "wheelSpec": "e.g. 18x8.5 ET20",
      "tireSize": "e.g. 225/40R18",
      "suspension": "e.g. stock / H&R / KW V3",
      "clearance": "e.g. no rub / slight inner liner contact at full lock",
      "stance": "e.g. flush / slight poke / tucked",
      "source": "brief source name e.g. bimmerpost thread",
      "notes": "any important notes"
    }
  ],
  "marginalFits": [
    {
      "wheelSpec": "...",
      "tireSize": "...",
      "issue": "what causes the problem",
      "fix": "common fix e.g. roll arch, pull fender, add spacer",
      "source": "..."
    }
  ],
  "popularCombos": [
    { "label": "OEM+ street", "front": "...", "rear": "...", "tire": "...", "why": "brief reason" },
    { "label": "Track / aggressive", "front": "...", "rear": "...", "tire": "...", "why": "..." }
  ],
  "brandsMentioned": ["e.g. BBS", "Apex", "VMR"],
  "communityTips": ["brief tip 1", "brief tip 2"],
  "searchSummary": "1–2 sentence summary of what you found"
}

IMPORTANT: Only return the JSON object — no markdown fences, no preamble, no explanation.
If you find no community data, return an object with empty arrays and a searchSummary explaining that.`

  try {
    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1500,
        system: systemPrompt,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages: [{ role: 'user', content: userQuery }],
      }),
    })

    const data = await anthropicRes.json()

    // Collect all text blocks (web search may produce multiple)
    const fullText = (data.content ?? [])
      .filter((b: { type: string }) => b.type === 'text')
      .map((b: { type: string; text: string }) => b.text)
      .join('')

    // Strip any accidental markdown fences
    const cleaned = fullText.replace(/```json|```/g, '').trim()

    // Find the JSON object in the response
    const jsonStart = cleaned.indexOf('{')
    const jsonEnd = cleaned.lastIndexOf('}')
    if (jsonStart === -1 || jsonEnd === -1) {
      return NextResponse.json({
        confirmedFits: [],
        marginalFits: [],
        popularCombos: [],
        brandsMentioned: [],
        communityTips: [],
        searchSummary: 'Could not parse community data — try a more specific query.',
      })
    }

    const parsed = JSON.parse(cleaned.slice(jsonStart, jsonEnd + 1))
    return NextResponse.json(parsed)
  } catch (err) {
    console.error('Fitment search error:', err)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
