import type { FeatureCollection, Polygon } from 'geojson';

export const CONNAUGHT_PLACE_3D_BUILDINGS: FeatureCollection<Polygon> = {
  type: 'FeatureCollection',
  features: [
    // --- INNER CIRCLE HERITAGE COLONNADES (Blocks A to F, 14m Georgian Verandahs) ---
    {
      type: 'Feature',
      properties: { name: 'Inner Circle Block A', height: 14, min_height: 0, color: '#252a34' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [77.2166, 28.6328],
          [77.2178, 28.6338],
          [77.2182, 28.6334],
          [77.2170, 28.6324],
          [77.2166, 28.6328],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: { name: 'Inner Circle Block B (Rajiv Chowk)', height: 14, min_height: 0, color: '#252a34' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [77.2182, 28.6335],
          [77.2196, 28.6337],
          [77.2196, 28.6331],
          [77.2182, 28.6329],
          [77.2182, 28.6335],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: { name: 'Inner Circle Block C (Odeon)', height: 14, min_height: 0, color: '#252a34' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [77.2201, 28.6336],
          [77.2212, 28.6329],
          [77.2208, 28.6324],
          [77.2198, 28.6331],
          [77.2201, 28.6336],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: { name: 'Inner Circle Block D', height: 14, min_height: 0, color: '#252a34' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [77.2214, 28.6324],
          [77.2217, 28.6312],
          [77.2211, 28.6312],
          [77.2208, 28.6322],
          [77.2214, 28.6324],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: { name: 'Inner Circle Block E', height: 14, min_height: 0, color: '#252a34' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [77.2215, 28.6308],
          [77.2205, 28.6298],
          [77.2200, 28.6303],
          [77.2210, 28.6311],
          [77.2215, 28.6308],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: { name: 'Inner Circle Block F (Palika Top)', height: 14, min_height: 0, color: '#252a34' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [77.2195, 28.6297],
          [77.2181, 28.6300],
          [77.2183, 28.6306],
          [77.2196, 28.6303],
          [77.2195, 28.6297],
        ]],
      },
    },

    // --- MIDDLE & OUTER CIRCLE HERITAGE BLOCKS (18m) ---
    {
      type: 'Feature',
      properties: { name: 'Outer Circle Block A & CP Police Division', height: 18, min_height: 0, color: '#222630' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [77.2138, 28.6315],
          [77.2152, 28.6330],
          [77.2158, 28.6324],
          [77.2144, 28.6309],
          [77.2138, 28.6315],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: { name: 'Outer Circle Block B (Radial Chelmsford)', height: 18, min_height: 0, color: '#222630' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [77.2162, 28.6348],
          [77.2185, 28.6360],
          [77.2188, 28.6353],
          [77.2166, 28.6342],
          [77.2162, 28.6348],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: { name: 'Outer Circle Block C & Minto Arcade', height: 18, min_height: 0, color: '#222630' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [77.2205, 28.6362],
          [77.2232, 28.6358],
          [77.2228, 28.6350],
          [77.2203, 28.6354],
          [77.2205, 28.6362],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: { name: 'Outer Circle Block E & Shankar Market Link', height: 18, min_height: 0, color: '#222630' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [77.2240, 28.6338],
          [77.2252, 28.6320],
          [77.2245, 28.6316],
          [77.2234, 28.6333],
          [77.2240, 28.6338],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: { name: 'Scindia House (Outer Circle)', height: 22, min_height: 0, color: '#282d38' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [77.2225, 28.6288],
          [77.2240, 28.6292],
          [77.2238, 28.6283],
          [77.2223, 28.6279],
          [77.2225, 28.6288],
        ]],
      },
    },

    // --- HIGH-RISE COMMERCIAL TOWERS (Barakhamba & KG Marg Corridors, 45m - 82m) ---
    {
      type: 'Feature',
      properties: { name: 'Gopaldas Bhawan (Corporate Tower)', height: 76, min_height: 0, color: '#2d3340' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [77.2262, 28.6304],
          [77.2272, 28.6300],
          [77.2268, 28.6293],
          [77.2258, 28.6297],
          [77.2262, 28.6304],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: { name: 'Statesman House (Barakhamba Roundabout)', height: 64, min_height: 0, color: '#303746' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [77.2242, 28.6318],
          [77.2252, 28.6320],
          [77.2254, 28.6312],
          [77.2244, 28.6310],
          [77.2242, 28.6318],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: { name: 'Jeevan Bharati LIC Building (Charles Correa Design)', height: 48, min_height: 0, color: '#2b313d' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [77.2185, 28.6282],
          [77.2202, 28.6283],
          [77.2202, 28.6274],
          [77.2185, 28.6273],
          [77.2185, 28.6282],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: { name: 'Antriksh Bhawan (KG Marg)', height: 78, min_height: 0, color: '#2d3340' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [77.2230, 28.6265],
          [77.2240, 28.6267],
          [77.2238, 28.6258],
          [77.2228, 28.6256],
          [77.2230, 28.6265],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: { name: 'Hindustan Times House', height: 68, min_height: 0, color: '#2e3544' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [77.2222, 28.6254],
          [77.2232, 28.6256],
          [77.2230, 28.6247],
          [77.2220, 28.6245],
          [77.2222, 28.6254],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: { name: 'Palika Kendra (NDMC 21-Story Civic Tower)', height: 84, min_height: 0, color: '#333b4d' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [77.2152, 28.6262],
          [77.2165, 28.6263],
          [77.2164, 28.6252],
          [77.2151, 28.6251],
          [77.2152, 28.6262],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: { name: 'Shankar Market Commercial Arcades', height: 12, min_height: 0, color: '#20232c' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [77.2230, 28.6345],
          [77.2255, 28.6350],
          [77.2253, 28.6342],
          [77.2228, 28.6338],
          [77.2230, 28.6345],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: { name: 'British Council & Cultural Atrium', height: 24, min_height: 0, color: '#262c37' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [77.2220, 28.6238],
          [77.2232, 28.6239],
          [77.2230, 28.6230],
          [77.2218, 28.6229],
          [77.2220, 28.6238],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: { name: 'National School of Drama & Mandi Cultural Hub', height: 26, min_height: 0, color: '#272d38' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [77.2330, 28.6265],
          [77.2345, 28.6266],
          [77.2344, 28.6254],
          [77.2329, 28.6253],
          [77.2330, 28.6265],
        ]],
      },
    },
  ],
};
