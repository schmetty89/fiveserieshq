/**
 * Curated fitment database for BMW 5 Series E34–G30
 * Fixed specs: bolt pattern, hub bore, stud size, OEM offsets, OEM tire sizes
 * Community-sourced fitment combos are surfaced via AI search at runtime.
 */

export type Generation = 'E34' | 'E39' | 'E60' | 'F10' | 'G30'
export type BodyStyle = 'Sedan' | 'Touring' | 'M5'

export interface WheelSpec {
  boltPattern: string          // e.g. "5x120"
  hubBore: string              // e.g. "72.6mm"
  studSize: string             // e.g. "M14x1.25"
  centerBoreNote?: string
}

export interface OemFitment {
  width: string                // e.g. "7J"
  diameter: number             // e.g. 16
  offset: string               // e.g. "ET20"
  tireSize: string             // e.g. "225/55R16"
  label: string                // e.g. "Base / Sport line"
}

export interface OffsetRange {
  minStreet: string            // minimum ET for daily street use
  maxFlush: string             // maximum ET before rubbing risk on stock suspension
  sweetSpot: string            // recommended ET for OEM+ look
  notes?: string
}

export interface GenerationFitment {
  generation: Generation
  years: string
  wheelSpec: WheelSpec
  oemFitments: OemFitment[]
  frontOffsetRange: OffsetRange
  rearOffsetRange: OffsetRange
  maxWidthFront: string        // widest commonly fitting width
  maxWidthRear: string
  liptrickClearance?: string   // inner lip clearance note
  bodyStyles: BodyStyle[]
  popularSizes: string[]       // quick-ref community popular sizes
  notes: string[]
}

export const FITMENT_DB: Record<Generation, GenerationFitment> = {
  E34: {
    generation: 'E34',
    years: '1988–1996',
    wheelSpec: {
      boltPattern: '5×120',
      hubBore: '72.6mm',
      studSize: 'M12×1.5',
      centerBoreNote: 'Hub-centric rings strongly recommended for aftermarket wheels',
    },
    oemFitments: [
      { width: '6.5J', diameter: 15, offset: 'ET20', tireSize: '205/65R15', label: 'Base (520i / 525i)' },
      { width: '7J',   diameter: 16, offset: 'ET20', tireSize: '225/55R16', label: 'Sport line' },
      { width: '7.5J', diameter: 17, offset: 'ET20', tireSize: '235/45R17', label: 'M5 (S38)' },
    ],
    frontOffsetRange: {
      minStreet: 'ET15',
      maxFlush: 'ET30',
      sweetSpot: 'ET20',
      notes: 'Low ET on wide wheels risks inner CV contact; verify clearance with spacers',
    },
    rearOffsetRange: {
      minStreet: 'ET15',
      maxFlush: 'ET28',
      sweetSpot: 'ET18',
    },
    maxWidthFront: '8.5J',
    maxWidthRear: '9.5J',
    bodyStyles: ['Sedan', 'Touring', 'M5'],
    popularSizes: [
      '17×8 ET20 / 225/45R17',
      '17×8.5 ET18 / 225/40R17',
      '18×8 ET20 / 225/40R18',
      '18×9 ET18 / 245/35R18',
    ],
    notes: [
      'E34 uses M12×1.5 studs — lighter than later 5 Series; verify lug nut seat type (ball-seat vs. cone)',
      'Pre-facelift (1988–1992) and facelift (1992–1996) share the same hub spec',
      'M5 uses wider rear fenders — an extra ~10mm of clearance each side',
      'Touring models share the same wheel spec as the sedan',
    ],
  },

  E39: {
    generation: 'E39',
    years: '1995–2003',
    wheelSpec: {
      boltPattern: '5×120',
      hubBore: '72.6mm',
      studSize: 'M14×1.25',
      centerBoreNote: 'Upgraded to M14 studs vs. E34; do not mix lug nut sizes',
    },
    oemFitments: [
      { width: '7J',   diameter: 15, offset: 'ET20', tireSize: '205/65R15', label: 'Base (520i / 523i)' },
      { width: '7.5J', diameter: 16, offset: 'ET20', tireSize: '225/55R16', label: 'Standard Sport' },
      { width: '7.5J', diameter: 17, offset: 'ET20', tireSize: '235/45R17', label: '530i / 540i Sport' },
      { width: '8J',   diameter: 18, offset: 'ET24', tireSize: '245/40R18', label: 'M5 (S62 V8) — front' },
      { width: '9J',   diameter: 18, offset: 'ET24', tireSize: '275/35R18', label: 'M5 (S62 V8) — rear' },
    ],
    frontOffsetRange: {
      minStreet: 'ET15',
      maxFlush: 'ET35',
      sweetSpot: 'ET22',
      notes: 'ET20–ET25 is the community sweet spot for the OEM+ look without rubbing',
    },
    rearOffsetRange: {
      minStreet: 'ET12',
      maxFlush: 'ET30',
      sweetSpot: 'ET18',
    },
    maxWidthFront: '9J',
    maxWidthRear: '10J',
    liptrickClearance: 'Inner lip to strut at front: ~20mm on stock suspension; plan accordingly with coilovers',
    bodyStyles: ['Sedan', 'Touring', 'M5'],
    popularSizes: [
      '17×8.5 ET20 / 225/45R17',
      '18×8.5 ET20 / 225/40R18',
      '18×8.5 ET20 / 245/35R18 (staggered rear)',
      '19×8.5 ET22 / 235/35R19',
      '19×9.5 ET22 / 265/30R19 (M5-style stagger)',
    ],
    notes: [
      'E39 is among the most forgiving 5 Series for fitment — generous fender lip clearance',
      'M5 uses wider rear bodywork with ~10mm additional clearance per side',
      'Touring wagon shares sedan hub spec; slightly tighter inner fender clearance at the rear',
      'Staggered setups are popular: 8.5J front / 9.5J or 10J rear',
    ],
  },

  E60: {
    generation: 'E60',
    years: '2003–2010',
    wheelSpec: {
      boltPattern: '5×120',
      hubBore: '72.6mm',
      studSize: 'M14×1.25',
    },
    oemFitments: [
      { width: '7J',   diameter: 16, offset: 'ET20', tireSize: '205/60R16', label: 'Base (520i)' },
      { width: '7.5J', diameter: 17, offset: 'ET20', tireSize: '225/50R17', label: 'Standard Sport' },
      { width: '8J',   diameter: 18, offset: 'ET30', tireSize: '245/45R18', label: '530i / 545i Sport' },
      { width: '8.5J', diameter: 19, offset: 'ET23', tireSize: '245/35R19', label: 'M5 (S85 V10) — front' },
      { width: '9.5J', diameter: 19, offset: 'ET29', tireSize: '285/30R19', label: 'M5 (S85 V10) — rear' },
    ],
    frontOffsetRange: {
      minStreet: 'ET20',
      maxFlush: 'ET40',
      sweetSpot: 'ET30',
      notes: 'E60 front arch is tighter than E39; stay above ET25 for daily use on 8.5J+',
    },
    rearOffsetRange: {
      minStreet: 'ET18',
      maxFlush: 'ET35',
      sweetSpot: 'ET25',
    },
    maxWidthFront: '9J',
    maxWidthRear: '10.5J',
    bodyStyles: ['Sedan', 'Touring', 'M5'],
    popularSizes: [
      '18×8.5 ET30 / 245/40R18',
      '19×8.5 ET30 / 245/35R19',
      '19×9 ET30 / 255/35R19',
      '20×8.5 ET35 / 245/30R20',
    ],
    notes: [
      'E60 M5 has uniquely wide rear arches — 285 rear tires fit stock',
      'The E60 fender arch is tighter at the front — more conservative ET needed vs E39',
      'E61 Touring has slightly more inner clearance at rear than the sedan',
      'DTC / DSC sensors on rear brakes — verify caliper clearance with aggressive spoke wheels',
    ],
  },

  F10: {
    generation: 'F10',
    years: '2010–2017',
    wheelSpec: {
      boltPattern: '5×120',
      hubBore: '72.6mm',
      studSize: 'M14×1.25',
      centerBoreNote: 'F10 uses the same 5×120 / 72.6mm spec but pay attention to ball-seat lug nuts (not cone)',
    },
    oemFitments: [
      { width: '7.5J', diameter: 17, offset: 'ET27', tireSize: '225/55R17', label: 'Base (520i / 528i)' },
      { width: '8J',   diameter: 18, offset: 'ET30', tireSize: '245/45R18', label: 'Standard Sport' },
      { width: '8.5J', diameter: 19, offset: 'ET25', tireSize: '245/35R19', label: '535i / 550i Sport' },
      { width: '8.5J', diameter: 19, offset: 'ET25', tireSize: '245/35R19', label: 'M5 front' },
      { width: '9.5J', diameter: 19, offset: 'ET37', tireSize: '265/35R19', label: 'M5 rear' },
    ],
    frontOffsetRange: {
      minStreet: 'ET22',
      maxFlush: 'ET42',
      sweetSpot: 'ET30',
      notes: 'F10 has a tighter front inner arch; 8.5J+ at ET25 or lower risks inner CV contact at lock',
    },
    rearOffsetRange: {
      minStreet: 'ET20',
      maxFlush: 'ET40',
      sweetSpot: 'ET30',
    },
    maxWidthFront: '9J',
    maxWidthRear: '10J',
    bodyStyles: ['Sedan', 'Touring', 'M5'],
    popularSizes: [
      '18×8.5 ET30 / 245/40R18',
      '19×8.5 ET30 / 245/35R19',
      '19×9 ET32 / 265/35R19',
      '20×8.5 ET35 / 245/30R20',
      '20×9.5 ET35 / 265/30R20 (M5 rear)',
    ],
    notes: [
      'F10 uses ball-seat lug nuts (14mm OEM) — verify aftermarket wheel seat type',
      'Active suspension (EDC) cars: stock ride height; coilover installs may require arch rolling for wide widths',
      'F10 M5 rear width supports 10J comfortably with the M bodywork',
      'F11 Touring shares the same hub spec as the sedan',
    ],
  },

  G30: {
    generation: 'G30',
    years: '2017–present',
    wheelSpec: {
      boltPattern: '5×112',
      hubBore: '66.5mm',
      studSize: 'M14×1.25',
      centerBoreNote: 'IMPORTANT: G30 switched from 5×120 to 5×112 — not backward compatible with earlier 5 Series wheels',
    },
    oemFitments: [
      { width: '7.5J', diameter: 17, offset: 'ET27', tireSize: '225/55R17', label: 'Base (530i)' },
      { width: '8J',   diameter: 18, offset: 'ET30', tireSize: '245/45R18', label: 'Standard Sport' },
      { width: '8.5J', diameter: 19, offset: 'ET25', tireSize: '245/40R19', label: '540i / M Sport' },
      { width: '9J',   diameter: 20, offset: 'ET29', tireSize: '255/35R20', label: 'M550i / Competition' },
      { width: '9.5J', diameter: 20, offset: 'ET37', tireSize: '275/30R20', label: 'M5 Competition rear' },
    ],
    frontOffsetRange: {
      minStreet: 'ET25',
      maxFlush: 'ET45',
      sweetSpot: 'ET35',
      notes: 'G30 EPS system can be sensitive to large offset changes — stick within ±10ET of OEM for daily use',
    },
    rearOffsetRange: {
      minStreet: 'ET25',
      maxFlush: 'ET45',
      sweetSpot: 'ET35',
    },
    maxWidthFront: '9.5J',
    maxWidthRear: '10.5J',
    bodyStyles: ['Sedan', 'Touring', 'M5'],
    popularSizes: [
      '19×9 ET35 / 255/35R19',
      '20×9 ET35 / 255/35R20',
      '20×9.5 ET40 / 265/30R20',
      '21×9 ET35 / 255/30R21 (M Sport bodywork)',
    ],
    notes: [
      'G30 uses 5×112 — completely different from all prior 5 Series generations (5×120)',
      'Hub bore changed to 66.5mm from 72.6mm on earlier cars',
      'TPMS sensors are relearn-programmable but must be updated for new wheel sets',
      'Integral Active Steering (IAS) equipped cars may feel slight steering pull with large offset changes',
      'G30 M5 has wider arches — an extra 10mm each side vs. standard G30',
    ],
  },
}

export function getFitmentByGen(gen: Generation): GenerationFitment {
  return FITMENT_DB[gen]
}

export const GENERATIONS_LIST: Generation[] = ['E34', 'E39', 'E60', 'F10', 'G30']
