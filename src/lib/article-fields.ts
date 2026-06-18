// Structured fields for the technical guide submit form, keyed by section value.
// Composed into the existing `body` text on submit.

export type GuideSection = 'maintenance' | 'performance' | 'diagnosis'

export interface ToolGroup {
  category: string
  tools: string[]
}

export interface GuideField {
  key: string
  label: string
  type: 'text' | 'textarea' | 'select' | 'wrench' | 'checklist'
  options?: string[]      // select
  placeholder?: string
  list?: boolean          // textarea -> each non-empty line becomes a bullet
  groups?: ToolGroup[]    // checklist
  allowCustom?: boolean   // checklist -> free-text "Other" entry
}

// Source: community tool list. Used by the Tools checklist.
export const TOOL_GROUPS: ToolGroup[] = [
  { category: 'Ratchets & Drive Tools', tools: ['1/4" Ratchet', '3/8" Ratchet', '1/2" Ratchet', 'Breaker Bar', 'Torque Wrench', 'Extensions', 'Universal Joint / Wobble Adapter', 'Flex Head Ratchet', 'Stubby Ratchet'] },
  { category: 'Metric Sockets', tools: ['6mm', '7mm', '8mm', '9mm', '10mm', '11mm', '12mm', '13mm', '14mm', '15mm', '16mm', '17mm', '18mm', '19mm', '20mm', '21mm', '22mm', '23mm', '24mm', '25mm', '26mm', '27mm', '28mm', '29mm', '30mm', '31mm', '32mm', '33mm', '34mm', '35mm', '36mm'] },
  { category: 'E-Torx Sockets', tools: ['E4', 'E5', 'E6', 'E7', 'E8', 'E10', 'E11', 'E12', 'E14', 'E16', 'E18', 'E20', 'E24'] },
  { category: 'Torx Bits', tools: ['T8', 'T10', 'T15', 'T20', 'T25', 'T27', 'T30', 'T40', 'T45', 'T50', 'T55', 'T60'] },
  { category: 'Hex / Allen Bits', tools: ['3mm', '4mm', '5mm', '6mm', '7mm', '8mm', '10mm', '12mm', '14mm', '17mm'] },
  { category: 'Basic Hand Tools', tools: ['Screwdrivers', 'Pliers', 'Needle Nose Pliers', 'Locking Pliers', 'Trim Removal Tools', 'Pry Bar'] },
  { category: 'BMW / Specialty Tools', tools: ['Pick Set', 'Spark Plug Socket', 'Oxygen Sensor Socket', 'Fan Clutch Wrench', 'Fan Clutch Holding Tool', 'Fuel Line Disconnect Tool', 'Injector Puller', 'Valve Spring Compressor', 'Timing Tool Kit', 'Crankshaft Locking Tool', 'Camshaft Locking Tool', 'VANOS Timing Tool', 'Engine Support Bar', 'Transmission Jack', 'Clutch Alignment Tool', 'Bearing Puller', 'Bearing Press', 'Ball Joint Separator', 'Tie Rod Separator', 'Spring Compressor', 'Cooling System Pressure Tester', 'Vacuum Tester', 'Smoke Tester', 'Compression Tester', 'Leak Down Tester'] },
  { category: 'Lifting Equipment', tools: ['Floor Jack', 'QuickJack', '2-Post Lift', 'Jack Stands', 'Wheel Chocks', 'Engine Hoist'] },
  { category: 'Electrical & Diagnostic Tools', tools: ['Multimeter', 'Battery Charger', 'Power Probe', 'Soldering Iron', 'Heat Gun', 'OBD Scanner', 'ISTA', 'INPA', 'E-Sys', 'BimmerLink', 'BimmerCode'] },
  { category: 'Consumables', tools: ['Brake Cleaner', 'Penetrating Oil', 'Anti-Seize', 'Thread Locker', 'Dielectric Grease', 'Assembly Lube', 'RTV Sealant', 'Zip Ties'] },
]

export const GUIDE_FIELDS: Record<GuideSection, GuideField[]> = {
  maintenance: [
    { key: 'difficulty', label: 'Difficulty', type: 'wrench' },
    { key: 'tools', label: 'Tools needed', type: 'checklist', groups: TOOL_GROUPS, allowCustom: true },
    { key: 'parts', label: 'Parts & part numbers', type: 'textarea', list: true, placeholder: 'One per line, e.g. Oil filter — 11427566327' },
    { key: 'procedure', label: 'Procedure', type: 'textarea', placeholder: 'Step-by-step instructions' },
    { key: 'tips', label: 'Tips & notes', type: 'textarea', placeholder: 'Optional' },
  ],
  performance: [
    { key: 'parts', label: 'Parts required', type: 'textarea', list: true, placeholder: 'One per line' },
    { key: 'tools', label: 'Tools needed', type: 'checklist', groups: TOOL_GROUPS, allowCustom: true },
    { key: 'coding', label: 'Coding / programming', type: 'text', placeholder: 'e.g. Bimmercode — enable folding mirrors' },
    { key: 'difficulty', label: 'Difficulty', type: 'wrench' },
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

type ChecklistValue = { selected?: string[]; custom?: string }

export function composeGuideBody(section: GuideSection, values: Record<string, unknown>): string {
  const fields = GUIDE_FIELDS[section] ?? []
  const blocks: string[] = []
  for (const f of fields) {
    const v = values[f.key]

    if (f.type === 'wrench') {
      const n = Number(v) || 0
      if (n > 0) blocks.push(`${f.label}: ${'🔧'.repeat(n)}`)
      continue
    }

    if (f.type === 'checklist') {
      const cv = (v ?? {}) as ChecklistValue
      const sel = Array.isArray(cv.selected) ? cv.selected : []
      const custom = (cv.custom ?? '').trim()
      if (sel.length === 0 && !custom) continue
      const lines: string[] = []
      for (const g of f.groups ?? []) {
        const inGroup = g.tools.filter((t) => sel.includes(`${g.category}::${t}`))
        if (inGroup.length) lines.push(`${g.category}: ${inGroup.join(', ')}`)
      }
      if (custom) lines.push(`Other: ${custom}`)
      blocks.push(`${f.label}:\n${lines.join('\n')}`)
      continue
    }

    const raw = (v ?? '').toString().trim()
    if (!raw) continue
    if (f.list) {
      const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => `- ${l}`)
      blocks.push(`${f.label}:\n${lines.join('\n')}`)
    } else {
      blocks.push(`${f.label}:\n${raw}`)
    }
  }
  return blocks.join('\n\n')
}
