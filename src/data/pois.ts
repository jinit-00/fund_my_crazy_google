import type { POIItem } from '../types';
import { DELHI_WATER_HUTS } from './waterHuts';

export { DELHI_WATER_HUTS };

export const DELHI_BASE_POIS: POIItem[] = [
  // --- PUBLIC WATER FOUNTAINS & HYDRATION POINTS (Teal) ---
  {
    id: 'water-central-park',
    name: 'Central Park Hydration Station',
    type: 'water',
    coordinates: [77.2195, 28.6318],
    description: 'Municipal chilled drinking water kiosk with RO filtration',
    details: 'Free public access, active 06:00 – 21:00'
  },
  {
    id: 'water-rajiv-chowk',
    name: 'Rajiv Chowk Metro Gate 2 Water Point',
    type: 'water',
    coordinates: [77.2187, 28.6326],
    description: 'DMRC station entrance drinking water fountain',
    details: 'Chilled RO water dispenser'
  },
  {
    id: 'water-palika-bazaar',
    name: 'Palika Underground Concourse Water Kiosk',
    type: 'water',
    coordinates: [77.2191, 28.6306],
    description: 'Public drinking fountain in underground air-conditioned transit hall',
    details: 'Indoor temperature controlled'
  },
  {
    id: 'water-janpath-market',
    name: 'Janpath Handicrafts Water Pavilion',
    type: 'water',
    coordinates: [77.2189, 28.6260],
    description: 'Pedestrian market municipal water stall',
    details: 'Maintained by NDMC'
  },
  {
    id: 'water-mandi-house',
    name: 'Mandi House Metro Drinking Water Facility',
    type: 'water',
    coordinates: [77.2338, 28.6258],
    description: 'Metro interchange passenger drinking water kiosk',
    details: 'Accessible 05:30 – 23:30'
  },

  // --- COOLING CENTERS & CLIMATE SHELTERS (Cyan) ---
  // Dual-purpose: Day cooling refuge + Night staffed safety shelter!
  {
    id: 'cooling-palika',
    name: 'Palika Bazaar Subterranean AC Concourse',
    type: 'cooling_center',
    coordinates: [77.2193, 28.6310],
    description: 'Central subterranean air-conditioned civic mall. Day: 24°C thermal refuge. Night: staffed security shelter.',
    details: 'Capacity: 500+ people • Full HVAC • Restrooms • NDMC security'
  },
  {
    id: 'cooling-rajiv-transit',
    name: 'Rajiv Chowk Transit Concourse (Underground)',
    type: 'cooling_center',
    coordinates: [77.2185, 28.6328],
    description: 'Massive climate-controlled underground passenger transit hub.',
    details: 'CISF 24/7 security • High ventilation • Emergency first-aid post'
  },
  {
    id: 'cooling-british-council',
    name: 'British Council AC Library & Public Foyer',
    type: 'cooling_center',
    coordinates: [77.2225, 28.6235],
    description: 'Civic cultural library with chilled public atrium and water stations.',
    details: 'Open during peak heat hours (10:00 – 19:00)'
  },
  {
    id: 'cooling-sahitya-akademi',
    name: 'Sahitya Akademi & Rabindra Bhavan AC Foyer',
    type: 'cooling_center',
    coordinates: [77.2336, 28.6252],
    description: 'National cultural institution with quiet air-conditioned reading halls.',
    details: 'Free public access for respite during extreme heat alerts'
  },

  // --- SAFETY ANCHORS (Soft Blue) ---
  {
    id: 'anchor-cp-police',
    name: 'Delhi Police — Connaught Place Station',
    type: 'safety_anchor',
    coordinates: [77.2145, 28.6322],
    description: 'Central District police headquarters. 24/7 patrol dispatch & women assistance desk.',
    details: '24/7 Armed Presence • Helpline: 112'
  },
  {
    id: 'anchor-barakhamba-police',
    name: 'Barakhamba Road Police Station',
    type: 'safety_anchor',
    coordinates: [77.2260, 28.6292],
    description: 'Precinct covering Barakhamba corporate corridor and Mandi House boundary.',
    details: '24/7 Patrol • Tel: 011-23414000'
  },
  {
    id: 'anchor-parliament-police',
    name: 'Parliament Street Police Precinct',
    type: 'safety_anchor',
    coordinates: [77.2148, 28.6231],
    description: 'High-security zone station with constant barricaded surveillance and quick-reaction teams.',
    details: 'High Security • Tel: 011-23742400'
  },
  {
    id: 'anchor-apollo-pharmacy',
    name: 'Apollo 24/7 Pharmacy & Security Post',
    type: 'safety_anchor',
    coordinates: [77.2210, 28.6310],
    description: 'Well-lit commercial anchor on E Block with continuous lighting and security guard on duty.',
    details: 'Open 24 Hours • Well Illuminated'
  },
  {
    id: 'anchor-mandi-security',
    name: 'Mandi House Metro CISF Emergency Post',
    type: 'safety_anchor',
    coordinates: [77.2340, 28.6256],
    description: 'Well-lit intersection outpost with constant CISF guard presence.',
    details: 'CISF Security Desk'
  }
];

export const DELHI_POIS: POIItem[] = [...DELHI_BASE_POIS, ...DELHI_WATER_HUTS];
