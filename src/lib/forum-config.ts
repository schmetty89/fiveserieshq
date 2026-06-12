import { Generation } from '@/types'

export const GEN_SUBFORUM_CATS = [
  {
    id: 'powertrain',
    name: 'Powertrain & drivetrain',
    icon: '⚙️',
    desc: 'Engine, transmission, cooling, fueling, driveline',
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
    id: 'builds',
    name: 'Build showcase',
    icon: '🚗',
    desc: 'Share your project thread',
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
