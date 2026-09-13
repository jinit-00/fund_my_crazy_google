import type { RiskGridZone } from '../types';

export const DELHI_RISK_GRID_ZONES: RiskGridZone[] = [
  {
    id: 'zone-inner-circle',
    name: 'Connaught Place Inner Colonnade & Central Park',
    boundary: [
      [77.2165, 28.6340],
      [77.2225, 28.6340],
      [77.2225, 28.6295],
      [77.2165, 28.6295],
      [77.2165, 28.6340]
    ],
    riskFactor: 0.12, // Very low risk
    lightingQuality: 'high',
    isSimulated: false, // Grounded in Delhi Police central district low violent crime & high CCTV density
    notes: '24/7 DMRC CISF patrols, continuous commercial facade illumination, high footfall.'
  },
  {
    id: 'zone-barakhamba',
    name: 'Barakhamba Diplomatic & Banking Corridor',
    boundary: [
      [77.2240, 28.6335],
      [77.2345, 28.6270],
      [77.2330, 28.6240],
      [77.2230, 28.6285],
      [77.2240, 28.6335]
    ],
    riskFactor: 0.10, // Lowest risk
    lightingQuality: 'high',
    isSimulated: false,
    notes: 'Houses Barakhamba Police Station, multinational banks, high-mast LED streetlights every 25m.'
  },
  {
    id: 'zone-janpath',
    name: 'Janpath Promenade & Hotel Corridor',
    boundary: [
      [77.2170, 28.6290],
      [77.2205, 28.6290],
      [77.2205, 28.6215],
      [77.2170, 28.6215],
      [77.2170, 28.6290]
    ],
    riskFactor: 0.15,
    lightingQuality: 'high',
    isSimulated: false,
    notes: 'Touristy artisanal corridor with active street vendors until late evening and tourist police patrol vans.'
  },
  {
    id: 'zone-railway-underpass',
    name: 'Shivaji Bridge & Shankar Market Rear Alleys',
    boundary: [
      [77.2225, 28.6370],
      [77.2285, 28.6370],
      [77.2285, 28.6335],
      [77.2225, 28.6335],
      [77.2225, 28.6370]
    ],
    riskFactor: 0.78, // High risk zone for unlit navigation!
    lightingQuality: 'poor',
    isSimulated: true, // Simulated for hackathon demo to demonstrate avoidance algorithms
    notes: 'Simulated vulnerability zone: Narrow railway underpass, broken street fixtures, and isolated blind spots after 20:00.'
  },
  {
    id: 'zone-block-c-rear',
    name: 'Blocks B & C Rear Service Parking Bays',
    boundary: [
      [77.2190, 28.6355],
      [77.2225, 28.6355],
      [77.2225, 28.6335],
      [77.2190, 28.6335],
      [77.2190, 28.6355]
    ],
    riskFactor: 0.58,
    lightingQuality: 'poor',
    isSimulated: true,
    notes: 'Secondary delivery corridors with parked commercial freight vehicles and sparse lighting.'
  }
];
