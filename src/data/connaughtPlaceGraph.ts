import type { Coordinate } from '../types';

export interface GraphNode {
  id: string;
  name: string;
  coordinates: Coordinate;
  isCovered?: boolean;
}

export interface GraphEdge {
  id: string;
  from: string;
  to: string;
  name: string;
  coordinates: Coordinate[];
  lengthMeters: number;
  isColonnade: boolean;      // 100% shade from colonnade archway
  hasTreeCanopy: boolean;    // high shade from neem & jamun trees
  baseLighting: number;      // 0-100 (OSM lit tag / DTC high-mast)
  incidentSafety: number;    // 0-100 (inverse risk: 100 = lowest risk)
  footTraffic: number;       // 0-100 (commercial frontage, eye-on-the-street)
  isNarrowAlley: boolean;
}

// Key junction nodes across Central Delhi / Connaught Place
export const GRAPH_NODES: Record<string, GraphNode> = {
  'n-central-park': {
    id: 'n-central-park',
    name: 'Central Park (Core Flagpole)',
    coordinates: [77.2197, 28.6315]
  },
  'n-inner-a': {
    id: 'n-inner-a',
    name: 'Inner Circle — Block A (Wenger’s)',
    coordinates: [77.2173, 28.6334],
    isCovered: true
  },
  'n-inner-b': {
    id: 'n-inner-b',
    name: 'Inner Circle — Block B (Rajiv Chowk Gate 2)',
    coordinates: [77.2185, 28.6328],
    isCovered: true
  },
  'n-inner-c': {
    id: 'n-inner-c',
    name: 'Inner Circle — Block C (Odeon)',
    coordinates: [77.2206, 28.6329],
    isCovered: true
  },
  'n-inner-d': {
    id: 'n-inner-d',
    name: 'Inner Circle — Block D',
    coordinates: [77.2215, 28.6318],
    isCovered: true
  },
  'n-inner-e': {
    id: 'n-inner-e',
    name: 'Inner Circle — Block E',
    coordinates: [77.2208, 28.6304],
    isCovered: true
  },
  'n-inner-f': {
    id: 'n-inner-f',
    name: 'Inner Circle — Block F (Palika Bazaar Top)',
    coordinates: [77.2186, 28.6305],
    isCovered: true
  },
  'n-outer-a': {
    id: 'n-outer-a',
    name: 'Outer Circle — Block A (CP Police Station junction)',
    coordinates: [77.2145, 28.6322]
  },
  'n-outer-b': {
    id: 'n-outer-b',
    name: 'Outer Circle — Radial Chelmsford junction',
    coordinates: [77.2178, 28.6358]
  },
  'n-outer-c': {
    id: 'n-outer-c',
    name: 'Outer Circle — Radial Minto Road junction',
    coordinates: [77.2228, 28.6356]
  },
  'n-outer-d': {
    id: 'n-outer-d',
    name: 'Outer Circle — Radial Barakhamba junction',
    coordinates: [77.2245, 28.6325]
  },
  'n-outer-e': {
    id: 'n-outer-e',
    name: 'Outer Circle — Radial KG Marg junction',
    coordinates: [77.2230, 28.6290]
  },
  'n-outer-f': {
    id: 'n-outer-f',
    name: 'Outer Circle — Radial Janpath junction',
    coordinates: [77.2188, 28.6288]
  },
  'n-outer-g': {
    id: 'n-outer-g',
    name: 'Outer Circle — Radial Parliament St junction',
    coordinates: [77.2160, 28.6285]
  },
  'n-outer-h': {
    id: 'n-outer-h',
    name: 'Outer Circle — Radial Baba Kharak Singh junction',
    coordinates: [77.2135, 28.6302]
  },
  // Arterial Extensions
  'n-janpath-market': {
    id: 'n-janpath-market',
    name: 'Janpath Tibetan Market',
    coordinates: [77.2189, 28.6258]
  },
  'n-janpath-tolstoy': {
    id: 'n-janpath-tolstoy',
    name: 'Janpath / Tolstoy Marg Intersection',
    coordinates: [77.2190, 28.6225]
  },
  'n-barakhamba-mid': {
    id: 'n-barakhamba-mid',
    name: 'Barakhamba Road — Gopaldas Towers',
    coordinates: [77.2268, 28.6298]
  },
  'n-mandi-house': {
    id: 'n-mandi-house',
    name: 'Mandi House Circle & Metro',
    coordinates: [77.2340, 28.6256]
  },
  'n-kg-marg-mid': {
    id: 'n-kg-marg-mid',
    name: 'Kasturba Gandhi Marg / British Council',
    coordinates: [77.2225, 28.6235]
  },
  'n-parliament-patel': {
    id: 'n-parliament-patel',
    name: 'Patel Chowk / Parliament St Police Station',
    coordinates: [77.2152, 28.6239]
  },
  'n-bangla-sahib': {
    id: 'n-bangla-sahib',
    name: 'Gurudwara Bangla Sahib Gates',
    coordinates: [77.2090, 28.6264]
  },
  // Isolated / Back-Alley Nodes (Realistic lower lighting & isolation)
  'n-shankar-market': {
    id: 'n-shankar-market',
    name: 'Shankar Market Internal Arcade',
    coordinates: [77.2235, 28.6348]
  },
  'n-shankar-service': {
    id: 'n-shankar-service',
    name: 'Shankar Market Rear Service Alley (Narrow)',
    coordinates: [77.2255, 28.6358]
  },
  'n-shivaji-bridge': {
    id: 'n-shivaji-bridge',
    name: 'Shivaji Bridge Rail Underpass',
    coordinates: [77.2272, 28.6362]
  },
  'n-rear-alley-bc': {
    id: 'n-rear-alley-bc',
    name: 'Rear Service Lane behind Blocks B & C',
    coordinates: [77.2210, 28.6345]
  }
};

// Realistic street network edges with attributes
export const GRAPH_EDGES: GraphEdge[] = [
  // --- INNER CIRCLE COLONNADES (100% Shaded Covered Corridors, Busy, Safe) ---
  {
    id: 'e-colonnade-ab',
    from: 'n-inner-a',
    to: 'n-inner-b',
    name: 'Inner Circle Colonnade (Block A to B)',
    coordinates: [
      [77.2173, 28.6334],
      [77.2179, 28.6331],
      [77.2185, 28.6328]
    ],
    lengthMeters: 140,
    isColonnade: true,
    hasTreeCanopy: false,
    baseLighting: 88,
    incidentSafety: 92,
    footTraffic: 95,
    isNarrowAlley: false
  },
  {
    id: 'e-colonnade-bc',
    from: 'n-inner-b',
    to: 'n-inner-c',
    name: 'Inner Circle Colonnade (Block B to C / Odeon)',
    coordinates: [
      [77.2185, 28.6328],
      [77.2195, 28.6330],
      [77.2206, 28.6329]
    ],
    lengthMeters: 210,
    isColonnade: true,
    hasTreeCanopy: false,
    baseLighting: 89,
    incidentSafety: 94,
    footTraffic: 98,
    isNarrowAlley: false
  },
  {
    id: 'e-colonnade-cd',
    from: 'n-inner-c',
    to: 'n-inner-d',
    name: 'Inner Circle Colonnade (Block C to D)',
    coordinates: [
      [77.2206, 28.6329],
      [77.2212, 28.6324],
      [77.2215, 28.6318]
    ],
    lengthMeters: 150,
    isColonnade: true,
    hasTreeCanopy: false,
    baseLighting: 90,
    incidentSafety: 93,
    footTraffic: 94,
    isNarrowAlley: false
  },
  {
    id: 'e-colonnade-de',
    from: 'n-inner-d',
    to: 'n-inner-e',
    name: 'Inner Circle Colonnade (Block D to E)',
    coordinates: [
      [77.2215, 28.6318],
      [77.2213, 28.6310],
      [77.2208, 28.6304]
    ],
    lengthMeters: 170,
    isColonnade: true,
    hasTreeCanopy: false,
    baseLighting: 88,
    incidentSafety: 92,
    footTraffic: 92,
    isNarrowAlley: false
  },
  {
    id: 'e-colonnade-ef',
    from: 'n-inner-e',
    to: 'n-inner-f',
    name: 'Inner Circle Colonnade (Block E to F / Palika Top)',
    coordinates: [
      [77.2208, 28.6304],
      [77.2198, 28.6303],
      [77.2186, 28.6305]
    ],
    lengthMeters: 220,
    isColonnade: true,
    hasTreeCanopy: false,
    baseLighting: 91,
    incidentSafety: 95,
    footTraffic: 97,
    isNarrowAlley: false
  },
  {
    id: 'e-colonnade-fa',
    from: 'n-inner-f',
    to: 'n-inner-a',
    name: 'Inner Circle Colonnade (Block F to A)',
    coordinates: [
      [77.2186, 28.6305],
      [77.2176, 28.6318],
      [77.2173, 28.6334]
    ],
    lengthMeters: 210,
    isColonnade: true,
    hasTreeCanopy: false,
    baseLighting: 87,
    incidentSafety: 91,
    footTraffic: 90,
    isNarrowAlley: false
  },

  // --- RADIAL SPOKES (Inner to Outer Circles) ---
  {
    id: 'e-spoke-barakhamba',
    from: 'n-inner-d',
    to: 'n-outer-d',
    name: 'Barakhamba Radial Link (Inner to Outer)',
    coordinates: [
      [77.2215, 28.6318],
      [77.2230, 28.6321],
      [77.2245, 28.6325]
    ],
    lengthMeters: 310,
    isColonnade: false,
    hasTreeCanopy: true,
    baseLighting: 96,
    incidentSafety: 95,
    footTraffic: 88,
    isNarrowAlley: false
  },
  {
    id: 'e-spoke-janpath',
    from: 'n-inner-f',
    to: 'n-outer-f',
    name: 'Janpath Radial Boulevard',
    coordinates: [
      [77.2186, 28.6305],
      [77.2187, 28.6296],
      [77.2188, 28.6288]
    ],
    lengthMeters: 190,
    isColonnade: false,
    hasTreeCanopy: true,
    baseLighting: 95,
    incidentSafety: 96,
    footTraffic: 99,
    isNarrowAlley: false
  },
  {
    id: 'e-spoke-kgmarg',
    from: 'n-inner-e',
    to: 'n-outer-e',
    name: 'KG Marg Radial Boulevard',
    coordinates: [
      [77.2208, 28.6304],
      [77.2220, 28.6296],
      [77.2230, 28.6290]
    ],
    lengthMeters: 260,
    isColonnade: false,
    hasTreeCanopy: true,
    baseLighting: 94,
    incidentSafety: 94,
    footTraffic: 86,
    isNarrowAlley: false
  },
  {
    id: 'e-spoke-parliament',
    from: 'n-inner-a',
    to: 'n-outer-g',
    name: 'Parliament Street Spoke',
    coordinates: [
      [77.2173, 28.6334],
      [77.2165, 28.6305],
      [77.2160, 28.6285]
    ],
    lengthMeters: 340,
    isColonnade: false,
    hasTreeCanopy: true,
    baseLighting: 93,
    incidentSafety: 97,
    footTraffic: 82,
    isNarrowAlley: false
  },
  {
    id: 'e-spoke-bangla',
    from: 'n-inner-a',
    to: 'n-outer-h',
    name: 'Baba Kharak Singh Marg Spoke',
    coordinates: [
      [77.2173, 28.6334],
      [77.2155, 28.6315],
      [77.2135, 28.6302]
    ],
    lengthMeters: 380,
    isColonnade: false,
    hasTreeCanopy: true,
    baseLighting: 92,
    incidentSafety: 93,
    footTraffic: 85,
    isNarrowAlley: false
  },

  // --- OUTER CIRCLE (Connaught Circus) ---
  {
    id: 'e-outer-circus-de',
    from: 'n-outer-d',
    to: 'n-outer-e',
    name: 'Outer Circle / Connaught Circus (Barakhamba to KG Marg)',
    coordinates: [
      [77.2245, 28.6325],
      [77.2240, 28.6305],
      [77.2230, 28.6290]
    ],
    lengthMeters: 390,
    isColonnade: true, // Outer Circle also features exterior arcade
    hasTreeCanopy: false,
    baseLighting: 93,
    incidentSafety: 92,
    footTraffic: 89,
    isNarrowAlley: false
  },
  {
    id: 'e-outer-circus-ef',
    from: 'n-outer-e',
    to: 'n-outer-f',
    name: 'Outer Circle (KG Marg to Janpath)',
    coordinates: [
      [77.2230, 28.6290],
      [77.2208, 28.6287],
      [77.2188, 28.6288]
    ],
    lengthMeters: 420,
    isColonnade: true,
    hasTreeCanopy: false,
    baseLighting: 94,
    incidentSafety: 93,
    footTraffic: 91,
    isNarrowAlley: false
  },
  {
    id: 'e-outer-circus-cd',
    from: 'n-outer-c',
    to: 'n-outer-d',
    name: 'Outer Circle (Minto Road to Barakhamba)',
    coordinates: [
      [77.2228, 28.6356],
      [77.2240, 28.6342],
      [77.2245, 28.6325]
    ],
    lengthMeters: 380,
    isColonnade: true,
    hasTreeCanopy: false,
    baseLighting: 89,
    incidentSafety: 87,
    footTraffic: 82,
    isNarrowAlley: false
  },

  // --- ARTERIAL EXTENSIONS (Broad Boulevards with High Illumination) ---
  {
    id: 'e-janpath-avenue',
    from: 'n-outer-f',
    to: 'n-janpath-market',
    name: 'Janpath Main Pedestrian Avenue',
    coordinates: [
      [77.2188, 28.6288],
      [77.2189, 28.6272],
      [77.2189, 28.6258]
    ],
    lengthMeters: 330,
    isColonnade: false,
    hasTreeCanopy: true,
    baseLighting: 97,
    incidentSafety: 96,
    footTraffic: 98,
    isNarrowAlley: false
  },
  {
    id: 'e-janpath-tolstoy',
    from: 'n-janpath-market',
    to: 'n-janpath-tolstoy',
    name: 'Janpath South (Imperial Hotel corridor)',
    coordinates: [
      [77.2189, 28.6258],
      [77.2190, 28.6240],
      [77.2190, 28.6225]
    ],
    lengthMeters: 370,
    isColonnade: false,
    hasTreeCanopy: true,
    baseLighting: 98,
    incidentSafety: 97,
    footTraffic: 90,
    isNarrowAlley: false
  },
  {
    id: 'e-barakhamba-avenue',
    from: 'n-outer-d',
    to: 'n-barakhamba-mid',
    name: 'Barakhamba Road Commercial Boulevard',
    coordinates: [
      [77.2245, 28.6325],
      [77.2258, 28.6310],
      [77.2268, 28.6298]
    ],
    lengthMeters: 360,
    isColonnade: false,
    hasTreeCanopy: true,
    baseLighting: 99,
    incidentSafety: 98, // Passes right by Barakhamba Police Station!
    footTraffic: 85,
    isNarrowAlley: false
  },
  {
    id: 'e-barakhamba-mandi',
    from: 'n-barakhamba-mid',
    to: 'n-mandi-house',
    name: 'Barakhamba to Mandi House Promenade',
    coordinates: [
      [77.2268, 28.6298],
      [77.2300, 28.6276],
      [77.2340, 28.6256]
    ],
    lengthMeters: 740,
    isColonnade: false,
    hasTreeCanopy: true,
    baseLighting: 96,
    incidentSafety: 96,
    footTraffic: 84,
    isNarrowAlley: false
  },
  {
    id: 'e-kgmarg-avenue',
    from: 'n-outer-e',
    to: 'n-kg-marg-mid',
    name: 'Kasturba Gandhi Marg Boulevard',
    coordinates: [
      [77.2230, 28.6290],
      [77.2227, 28.6260],
      [77.2225, 28.6235]
    ],
    lengthMeters: 620,
    isColonnade: false,
    hasTreeCanopy: true,
    baseLighting: 96,
    incidentSafety: 95,
    footTraffic: 82,
    isNarrowAlley: false
  },
  {
    id: 'e-bangla-avenue',
    from: 'n-outer-h',
    to: 'n-bangla-sahib',
    name: 'Baba Kharak Singh Marg Promenade',
    coordinates: [
      [77.2135, 28.6302],
      [77.2110, 28.6280],
      [77.2090, 28.6264]
    ],
    lengthMeters: 610,
    isColonnade: false,
    hasTreeCanopy: true,
    baseLighting: 94,
    incidentSafety: 94,
    footTraffic: 89,
    isNarrowAlley: false
  },

  // --- SECONDARY & SERVICE BACK-LANES (Simulated Low-Light / High-Vulnerability Corridors) ---
  // These create the realistic tension between shortest direct cut-throughs vs safer/shaded boulevards!
  {
    id: 'e-shankar-market-cut',
    from: 'n-outer-c',
    to: 'n-shankar-market',
    name: 'Shankar Market Cut-Through',
    coordinates: [
      [77.2228, 28.6356],
      [77.2232, 28.6352],
      [77.2235, 28.6348]
    ],
    lengthMeters: 110,
    isColonnade: false,
    hasTreeCanopy: false,
    baseLighting: 55,
    incidentSafety: 62,
    footTraffic: 65,
    isNarrowAlley: true
  },
  {
    id: 'e-shankar-service-rear',
    from: 'n-shankar-market',
    to: 'n-shankar-service',
    name: 'Shankar Market Rear Service Lane',
    coordinates: [
      [77.2235, 28.6348],
      [77.2245, 28.6354],
      [77.2255, 28.6358]
    ],
    lengthMeters: 230,
    isColonnade: false,
    hasTreeCanopy: false,
    baseLighting: 28,  // Poor lighting!
    incidentSafety: 34, // High risk at night!
    footTraffic: 15,
    isNarrowAlley: true
  },
  {
    id: 'e-railway-underpass-cut',
    from: 'n-shankar-service',
    to: 'n-shivaji-bridge',
    name: 'Shivaji Rail Underpass Isolated Alley',
    coordinates: [
      [77.2255, 28.6358],
      [77.2265, 28.6360],
      [77.2272, 28.6362]
    ],
    lengthMeters: 190,
    isColonnade: false,
    hasTreeCanopy: false,
    baseLighting: 20,  // Very poor lighting
    incidentSafety: 25, // Unsafe night hotspot
    footTraffic: 10,
    isNarrowAlley: true
  },
  {
    id: 'e-rail-to-barakhamba-back',
    from: 'n-shivaji-bridge',
    to: 'n-barakhamba-mid',
    name: 'Rail-side Industrial Service Path to Barakhamba',
    coordinates: [
      [77.2272, 28.6362],
      [77.2270, 28.6330],
      [77.2268, 28.6298]
    ],
    lengthMeters: 710,
    isColonnade: false,
    hasTreeCanopy: false,
    baseLighting: 32,
    incidentSafety: 38,
    footTraffic: 18,
    isNarrowAlley: true
  },
  {
    id: 'e-rear-alley-odeon',
    from: 'n-inner-c',
    to: 'n-rear-alley-bc',
    name: 'Block C Rear Loading Corridor',
    coordinates: [
      [77.2206, 28.6329],
      [77.2210, 28.6338],
      [77.2210, 28.6345]
    ],
    lengthMeters: 180,
    isColonnade: false,
    hasTreeCanopy: false,
    baseLighting: 35,
    incidentSafety: 45,
    footTraffic: 20,
    isNarrowAlley: true
  },
  {
    id: 'e-rear-alley-to-minto',
    from: 'n-rear-alley-bc',
    to: 'n-outer-c',
    name: 'Rear Alley to Minto Road Connector',
    coordinates: [
      [77.2210, 28.6345],
      [77.2220, 28.6352],
      [77.2228, 28.6356]
    ],
    lengthMeters: 210,
    isColonnade: false,
    hasTreeCanopy: false,
    baseLighting: 40,
    incidentSafety: 48,
    footTraffic: 25,
    isNarrowAlley: true
  }
];
