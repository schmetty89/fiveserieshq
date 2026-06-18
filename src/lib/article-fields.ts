// Lean structured fields for the technical article submit form (guide content),
// keyed by section value. Composed into the existing `body` text on submit.

export type GuideSection = 'maintenance' | 'performance' | 'diagnosis'

export interface GuideField {
  key: string
  label: string
  type: 'text' | 'textarea' | 'select'
  options?: string[]
  placeholder?: string
  /** textarea where each non-empty line becomes a bullet in the composed body */
  list?: boolean
}

export const GUIDE_FIELDS: Record<GuideSection, GuideField[]> = {
  maintenance: [
    { key: 'difficulty', label: 'Difficulty', type: 'select', options: ['Beginner', 'Intermediate', 'Advanced'] },
    { key: 'time', label: 'Estimated time', type: 'text', placeholder: 'e.g. 2 hours' },
    { key: 'tools', label: 'Tools needed', type: 'textarea', list: true, placeholder: 'One per line' },
    { key: 'parts', label: 'Parts & part numbers', type: 'textarea', list: true, placeholder: 'One per line, e.g. Oil filter — 11427566327' },
    { key: 'procedure', label: 'Procedure', type: 'textarea', placeholder: 'Step-by-step instructions' },
    { key: 'tips', label: 'Tips & notes', type: 'textarea', placeholder: 'Optional' },
  ],
  performance: [
    { key: 'parts', label: 'Parts required', type: 'textarea', list: true, placeholder: 'One per line' },
    { key: 'coding', label: 'Coding / programming', type: 'text', placeholder: 'e.g. Bimmercode — enable folding mirrors' },
    { key: 'difficulty', label: 'Difficulty', type: 'select', options: ['Beginner', 'Intermediate', 'Advanced'] },
    { key: 'cost', label: 'Estimated cost', type: 'text', placeholder: 'e.g. $1,200' },
    { key: 'procedure', label: 'Procedure', type: 'textarea', placeholder: 'Step-by-step instructions' },
    { key: 'notes', label: 'Notes & warnings', type: 'textarea', placeholder: 'Optional — warranty, emissions, reversibility' },
  ],
  diagnosis: [
    { key: 'symptoms', label: 'Symptoms', type: 'textarea', list: true, placeholder: 'One per line' },
    { key: 'codes', label: 'Fault codes / DTCs', type: 'textarea', list: true, placeholder: 'One per line, e.g. 2A82 — VANOS' },
    { key: 'steps', label: 'Diagnostic steps', type: 'textarea', placeholder: 'How to diagnose it' },
    { key: 'cause', label: 'Likely cause', type: 'textarea' },
    { key: 'fix', label: 'Fix / resolution', type: 'textarea' },
    { key: 'tools', label: 'Tools / software', type: 'text', placeholder: 'e.g. ISTA, Bimmercode, INPA' },
  ],
}

/** Compose the structured field values into a clean, readable plain-text body. */
export function composeGuideBody(section: GuideSection, values: Record<string, string>): string {
  const fields = GUIDE_FIELDS[section] ?? []
  const blocks: string[] = []
  for (const f of fields) {
    const raw = (values[f.key] ?? '').trim()
    if (!raw) continue
    if (f.list) {
      const lines = raw
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)
        .map((l) => `- ${l}`)
      blocks.push(`${f.label}:\n${lines.join('\n')}`)
    } else {
      blocks.push(`${f.label}:\n${raw}`)
    }
  }
  return blocks.join('\n\n')
}
