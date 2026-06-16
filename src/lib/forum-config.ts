import { Generation } from '@/types'

export const GEN_SUBFORUM_CATS = [
  {
    id: 'engine',
    name: 'Engine',
    icon: '⚙️',
    desc: 'Engine-specific discussion, by engine code',
  },
  {
    id: 'drivetrain',
    name: 'Drivetrain',
    icon: '🔩',
    desc: 'Transmission, driveshaft, differential, clutch',
  },
  {
    id: 'suspension',
    name: 'Wheels, tires, suspension & brakes',
    icon: '🔧',
    desc: 'Coilovers, alignment, wheels, tires, brakes, steering',
  },
  {
    id: 'electrical',
    name: 'Electrical systems',
    icon: '⚡',
    desc: 'DME, coding, lighting, sensors, CAN bus',
  },
  {
    id: 'general',
    name: 'General discussion',
    icon: '💬',
    desc: 'Ownership stories, questions, community chat',
  },
  {
    id: 'marketplace',
    name: 'Marketplace',
    icon: '🏷️',
    desc: 'Buy and sell parts and cars',
  },
] as const

export type GenCategory = typeof GEN_SUBFORUM_CATS[number]['id']

// ── Engine subforums (nested under the Engine category, per generation) ──
export interface EngineSubforum {
  id: string
  code: string
  models: string
}

export const GENERATION_ENGINES: Record<Generation, EngineSubforum[]> = {
  E34: [
    { id: 'm20', code: 'M20', models: '525i/525e (early)' },
    { id: 'm30', code: 'M30', models: '525i/528i/535i/M5' },
    { id: 's38', code: 'S38', models: 'M5 (later)' },
    { id: 'm50-m51', code: 'M50/M51', models: '525td/525tds (diesel)' },
  ],
  E39: [
    { id: 'm52-m54', code: 'M52/M54', models: '520i/523i/525i/528i/530i' },
    { id: 'm62', code: 'M62', models: '540i' },
    { id: 's62', code: 'S62', models: 'M5' },
    { id: 'm47-m57', code: 'M47/M57', models: '520d/525d/530d (diesel)' },
  ],
  E60: [
    { id: 'n52-n53', code: 'N52/N53', models: '523i/525i/528i/530i' },
    { id: 'n54', code: 'N54', models: '535i' },
    { id: 'n62', code: 'N62', models: '545i/550i' },
    { id: 's85', code: 'S85', models: 'M5' },
    { id: 'm57', code: 'M57', models: '530d/535d (diesel)' },
  ],
  F10: [
    { id: 'n20', code: 'N20', models: '528i' },
    { id: 'n55', code: 'N55', models: '535i' },
    { id: 'n63', code: 'N63', models: '550i' },
    { id: 's63', code: 'S63', models: 'M5' },
    { id: 'n57', code: 'N57', models: '530d/535d (diesel)' },
  ],
  G30: [
    { id: 'b46-b48', code: 'B46/B48', models: '530i/530e' },
    { id: 'b58', code: 'B58', models: '540i' },
    { id: 's63', code: 'S63', models: 'M550i/M5' },
    { id: 'b47-b57', code: 'B47/B57', models: '520d/530d/540d (diesel)' },
  ],
}

// ── Transmission subforums (nested under Drivetrain, grouped by type) ──
export interface TransmissionSubforum {
  id: string
  code: string
  models: string
  type: 'manual' | 'automatic'
}

export const GENERATION_TRANSMISSIONS: Record<Generation, TransmissionSubforum[]> = {
  E34: [
    { id: 'getrag-260-5', code: 'Getrag 260/5', models: '520i, 525i', type: 'manual' },
    { id: 'getrag-280-5', code: 'Getrag 280/5', models: '530i, 535i', type: 'manual' },
    { id: 'getrag-420g', code: 'Getrag 420G', models: '540i, M5', type: 'manual' },
    { id: 'zf-4hp22', code: 'ZF 4HP22', models: '520i, 525i', type: 'automatic' },
    { id: 'zf-4hp24', code: 'ZF 4HP24', models: '530i, 535i, 540i', type: 'automatic' },
  ],
  E39: [
    { id: 'getrag-250-5', code: 'Getrag 250/5', models: '520i, 523i, 525i', type: 'manual' },
    { id: 'getrag-420g', code: 'Getrag 420G', models: '528i, 530i', type: 'manual' },
    { id: 'getrag-420g-6', code: 'Getrag 420G/6 6-speed', models: 'M5', type: 'manual' },
    { id: 'zf-5hp18', code: 'ZF 5HP18', models: '520i, 523i, 525i', type: 'automatic' },
    { id: 'zf-5hp24', code: 'ZF 5HP24', models: '528i, 530i, 540i', type: 'automatic' },
  ],
  E60: [
    { id: 'getrag-gs6-37bz', code: 'Getrag GS6-37BZ', models: '525i, 530i', type: 'manual' },
    { id: 'getrag-smg-6-speed-smg', code: 'Getrag SMG 6-speed SMG', models: 'M5', type: 'manual' },
    { id: 'zf-6hp19', code: 'ZF 6HP19', models: '523i, 525i, 530i', type: 'automatic' },
    { id: 'zf-6hp26', code: 'ZF 6HP26', models: '545i, 550i', type: 'automatic' },
  ],
  F10: [
    { id: 'getrag-gs6-45bz', code: 'Getrag GS6-45BZ', models: '528i, 535i', type: 'manual' },
    { id: 'm-dct-7-speed-dual-clutch', code: 'M-DCT 7-speed dual clutch', models: 'M5, M5 Competition', type: 'manual' },
    { id: 'zf-8hp45', code: 'ZF 8HP45', models: '528i, 535i, 550i', type: 'automatic' },
  ],
  G30: [
    { id: 'm-dct-8-speed-m-dct', code: 'M-DCT 8-speed M DCT', models: 'M5, M5 Competition, M5 CS', type: 'manual' },
    { id: 'zf-8hp51', code: 'ZF 8HP51', models: '530i, 540i', type: 'automatic' },
    { id: 'zf-8hp75', code: 'ZF 8HP75', models: 'M550i', type: 'automatic' },
  ],
}

export const REGIONAL_SUBFORUMS = [
  { id: 'northeast-us',   name: 'Northeast US',    flag: '🇺🇸', desc: 'ME, NH, VT, MA, RI, CT, NY, NJ, PA, DE, MD' },
  { id: 'southeast-us',   name: 'Southeast US',    flag: '🇺🇸', desc: 'VA, WV, NC, SC, GA, FL, AL, MS, TN, KY' },
  { id: 'midwest-us',     name: 'Midwest US',      flag: '🇺🇸', desc: 'OH, IN, IL, MI, WI, MN, IA, MO, ND, SD, NE, KS' },
  { id: 'southwest-us',   name: 'Southwest US',    flag: '🇺🇸', desc: 'TX, OK, AR, LA, NM, AZ, CO, UT, NV' },
  { id: 'west-coast-us',  name: 'West Coast US',   flag: '🇺🇸', desc: 'CA, OR, WA, AK, HI, ID, MT, WY' },
  { id: 'eastern-canada', name: 'Eastern Canada',  flag: '🇨🇦', desc: 'ON, QC, NB, NS, PE, NL' },
  { id: 'western-canada', name: 'Western Canada',  flag: '🇨🇦', desc: 'BC, AB, SK, MB, YT, NT, NU' },
] as const

export type RegionalId = typeof REGIONAL_SUBFORUMS[number]['id']

export const GEN_COLORS: Record<Generation, { bg: string; text: string }> = {
  E34: { bg: '#FAECE7', text: '#993C1D' },
  E39: { bg: '#E6F1FB', text: '#185FA5' },
  E60: { bg: '#EEEDFE', text: '#534AB7' },
  F10: { bg: '#E1F5EE', text: '#0F6E56' },
  G30: { bg: '#FAEEDA', text: '#854F0B' },
}
