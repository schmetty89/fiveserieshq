export const MAINTENANCE_SYSTEMS = [
  { id: 'powertrain',   name: 'Powertrain & drivetrain',          icon: '⚙️', desc: 'Engine, transmission, cooling, fueling, driveline' },
  { id: 'suspension',   name: 'Suspension & brakes',              icon: '🔧', desc: 'Coilovers, springs, brakes, steering, alignment' },
  { id: 'electrical',   name: 'Electrical systems',               icon: '⚡', desc: 'DME, coding, lighting, sensors, CAN bus' },
  { id: 'body',         name: 'Body & interior',                  icon: '🪟', desc: 'Trim, seals, glass, paint, HVAC' },
  { id: 'fuel',         name: 'Fuel & exhaust',                   icon: '🔥', desc: 'Injectors, filters, exhaust, emissions' },
  { id: 'transmission', name: 'Transmission & driveline',         icon: '🔩', desc: 'Gearbox, diff, driveshaft, clutch' },
] as const

export const PERFORMANCE_SYSTEMS = [
  { id: 'engine-perf',     name: 'Engine performance',       icon: '🚀', desc: 'Tunes, intakes, intercoolers, turbos' },
  { id: 'suspension-perf', name: 'Suspension & handling',    icon: '🏁', desc: 'Coilovers, sway bars, bushings, alignment' },
  { id: 'brakes-perf',     name: 'Brake upgrades',           icon: '🛑', desc: 'Big brake kits, pads, fluid, lines' },
  { id: 'exhaust-perf',    name: 'Exhaust & intake',         icon: '💨', desc: 'Downpipes, catbacks, OPF deletes, intakes' },
  { id: 'trans-perf',      name: 'Transmission & diff',      icon: '⚙️', desc: 'Short shifters, LSD, clutch kits' },
  { id: 'ecu',             name: 'ECU & coding',             icon: '💻', desc: 'Flash tunes, BimmerCode, DME unlocks' },
] as const

export const DIAGNOSIS_SYSTEMS = [
  { id: 'dme',              name: 'DME / ECU',          icon: '💻', desc: 'DME faults, flash counters, ECU hardware issues' },
  { id: 'coding',           name: 'BMW Coding',         icon: '🔌', desc: 'BimmerCode, E-sys, NCS Expert, ISTA coding procedures' },
  { id: 'fault-codes',      name: 'Fault codes',        icon: '⚠️', desc: 'DTC references, code meanings, and clearing procedures' },
  { id: 'mechanical-faults',name: 'Mechanical faults',  icon: '🔩', desc: 'Common failure points, diagnosis guides, known issues' },
] as const

export const APPS_SYSTEMS = [
  { id: 'fitment', name: 'Rim fitment tool', icon: '🔧', desc: 'Interactive wheel and tire fitment tool for all 5 Series generations', link: '/technical/fitment' },
] as const

export const DOC_CATEGORIES = [
  'Service manual',
  'Wiring diagram',
  'Engine manual',
  'Transmission manual',
  'Chassis manual',
  'Systems manual',
  'Body manual',
  'Other',
] as const

export type MaintenanceSystem = typeof MAINTENANCE_SYSTEMS[number]['id']
export type PerformanceSystem = typeof PERFORMANCE_SYSTEMS[number]['id']
export type DiagnosisSystem = typeof DIAGNOSIS_SYSTEMS[number]['id']
export type AppsSystem = typeof APPS_SYSTEMS[number]['id']
export type TechSection = 'documents' | 'maintenance' | 'performance' | 'apps' | 'diagnosis'

// ─────────────────────────────────────────────────────────────
// Engine codes by generation (US-market gas engines, incl. M-cars)
// Verified reference data. Used by the guide submit form: maintenance
// guides show only the selected generation's engines; the future
// Mods & Retrofits section can show the full cross-generation list.
// ─────────────────────────────────────────────────────────────

export interface EngineEntry {
  short: string   // family code shown by default, e.g. 'N52'
  full: string    // full code, e.g. 'N52B30'
  model: string   // model badge, e.g. '530i'
  years: string   // production years for this engine in this model
}

export const ENGINES_BY_GENERATION: Record<string, EngineEntry[]> = {
  E39: [
    { short: 'M54',    full: 'M54B25',    model: '525i', years: '2001–2003' },
    { short: 'M52',    full: 'M52B28',    model: '528i', years: '1995–1998' },
    { short: 'M52TU',  full: 'M52TUB28',  model: '528i', years: '1998–2001' },
    { short: 'M54',    full: 'M54B30',    model: '530i', years: '2001–2003' },
    { short: 'M62',    full: 'M62B44',    model: '540i', years: '1997–1998' },
    { short: 'M62TU',  full: 'M62TUB44',  model: '540i', years: '1999–2003' },
    { short: 'S62',    full: 'S62B50',    model: 'M5',   years: '2000–2003' },
  ],
  E60: [
    { short: 'M54',    full: 'M54B25',    model: '525i', years: '2004' },
    { short: 'N52',    full: 'N52B30',    model: '525i', years: '2005–2007' },
    { short: 'N52',    full: 'N52B30',    model: '528i', years: '2008–2010' },
    { short: 'M54',    full: 'M54B30',    model: '530i', years: '2004–2005' },
    { short: 'N52',    full: 'N52B30',    model: '530i', years: '2006–2007' },
    { short: 'N54',    full: 'N54B30',    model: '535i', years: '2008–2010' },
    { short: 'N62',    full: 'N62B44',    model: '545i', years: '2004–2005' },
    { short: 'N62',    full: 'N62B48',    model: '550i', years: '2006–2010' },
    { short: 'S85',    full: 'S85B50',    model: 'M5',   years: '2006–2010' },
  ],
  F10: [
    { short: 'N52',    full: 'N52B30',    model: '528i', years: '2011' },
    { short: 'N20',    full: 'N20B20',    model: '528i', years: '2012–2016' },
    { short: 'N55',    full: 'N55B30',    model: '535i', years: '2011–2016' },
    { short: 'N63',    full: 'N63B44',    model: '550i', years: '2011–2016' },
    { short: 'S63',    full: 'S63B44',    model: 'M5',   years: '2013–2016' },
  ],
  G30: [
    { short: 'B48',    full: 'B48B20',    model: '530i', years: '2017–2023' },
    { short: 'B58',    full: 'B58B30',    model: '540i', years: '2017–2023' },
    { short: 'N63',    full: 'N63B44',    model: '550i', years: '2017–2019' },
    { short: 'S63',    full: 'S63B44',    model: 'M5',   years: '2018–2023' },
  ],
}

// All engines across every generation, for cross-generation use
// (e.g. swap/retrofit guides in the future Mods & Retrofits section).
export const ALL_ENGINES: EngineEntry[] = Object.values(ENGINES_BY_GENERATION).flat()
