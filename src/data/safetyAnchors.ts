import type { SafetyAnchor } from '../types';

export const DELHI_SAFETY_ANCHORS: SafetyAnchor[] = [
  {
    id: 'anchor-cp-police',
    name: 'Delhi Police — Connaught Place Station',
    type: 'police',
    coordinates: [77.2145, 28.6322],
    description: 'Central District police headquarters for Connaught Place. 24/7 active patrol dispatch & women assistance desk.',
    hours: '24 Hours / 7 Days',
    contact: '011-23743300 / 112',
    isVerifiedRealData: true,
    sourceAttribution: 'Delhi Police Official Directory (delhipolice.gov.in) & OSM'
  },
  {
    id: 'anchor-barakhamba-police',
    name: 'Barakhamba Road Police Station',
    type: 'police',
    coordinates: [77.2260, 28.6292],
    description: 'Active police precinct covering Barakhamba corridor, Mandi House boundary, and modern office high-rises.',
    hours: '24 Hours / 7 Days',
    contact: '011-23414000 / 112',
    isVerifiedRealData: true,
    sourceAttribution: 'Delhi Police Official Precinct Database'
  },
  {
    id: 'anchor-parliament-police',
    name: 'Parliament Street Police Station',
    type: 'police',
    coordinates: [77.2148, 28.6231],
    description: 'High-security zone station with constant barricaded surveillance, patrol vans, and emergency quick-reaction teams.',
    hours: '24 Hours / 7 Days',
    contact: '011-23742400 / 112',
    isVerifiedRealData: true,
    sourceAttribution: 'Delhi Police Official Directory'
  },
  {
    id: 'anchor-rajiv-cisf',
    name: 'DMRC Rajiv Chowk CISF Security & Help Desk',
    type: 'metro_security',
    coordinates: [77.2185, 28.6328],
    description: 'Armed CISF paramilitary security personnel with round-the-clock surveillance monitoring 150+ CCTV cameras.',
    hours: '05:30 – 23:45 Daily',
    contact: '155370 (DMRC Helpline)',
    isVerifiedRealData: true,
    sourceAttribution: 'Delhi Metro Rail Corporation Safety Network'
  },
  {
    id: 'anchor-apollo-pharmacy',
    name: 'Apollo 24/7 Pharmacy & Well-Lit Kiosk (E Block)',
    type: 'pharmacy_24h',
    coordinates: [77.2210, 28.6310],
    description: 'Well-illuminated commercial anchor with security guard on duty and continuous nighttime lighting.',
    hours: '24 Hours',
    contact: '1860-500-0101',
    isVerifiedRealData: true,
    sourceAttribution: 'OpenStreetMap amenity=pharmacy & Commercial Registry'
  },
  {
    id: 'anchor-lady-hardinge',
    name: 'Lady Hardinge Medical College & Hospital (Emergency)',
    type: 'hospital',
    coordinates: [77.2120, 28.6345],
    description: 'Premier central public tertiary hospital with illuminated ambulance bays and 24/7 security booth.',
    hours: '24 Hours Emergency',
    contact: '011-23363728',
    isVerifiedRealData: true,
    sourceAttribution: 'National Health Portal & OSM'
  },
  {
    id: 'anchor-mandi-security',
    name: 'Mandi House Metro CISF Emergency Portal',
    type: 'metro_security',
    coordinates: [77.2340, 28.6256],
    description: 'Well-lit intersection outpost with constant CISF guard presence and high-mast intersection lighting.',
    hours: '05:30 – 23:45 Daily',
    contact: '155370',
    isVerifiedRealData: true,
    sourceAttribution: 'DMRC Transit Security Network'
  }
];
