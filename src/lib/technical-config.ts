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
export type TechSection = 'documents' | 'maintenance' | 'performance'
