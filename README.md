# Delhi Safe Route — 3D City Safety Navigator

> **Hackathon Submission**: A dark data-panel 3D pedestrian navigation platform for Central Delhi, featuring real-time solar shade & heat-stress calculations for daytime cooling, multi-signal personal safety routing for nighttime transit, and interactive environmental feature layers.

---

## 1. Project Summary

**Delhi Safe Route** is an interactive, photorealistic 3D web application designed to empower pedestrians navigating the urban fabric of Delhi. Built with a high-contrast dark data-panel aesthetic inspired by **Shadeway**, it features two distinct, manually toggled routing modes tailored to urban environmental realities:

- **Day Mode (Sun-Aware & Heat Stress Routing)**: Calculates live astronomical solar geometry (azimuth and altitude) using SunCalc at Delhi's coordinates (`28.6315° N, 77.2197° E`). It evaluates building shadows, tree canopy coverage, and Connaught Place’s heritage Georgian covered colonnades (*verandahs*), presenting an ambient and "feels-like" heat stress readout (`41°C` / `106°F`) to steer walkers along the coolest corridor.
- **Night Mode (Personal Safety Routing)**: Optimizes for personal safety (especially for women and solo commuters) by evaluating street illumination (OSM `lit=yes/no` and high-mast LED infrastructure), foot-traffic vitality, active police anchors, and a calibrated incident risk grid. It steers travelers along well-lit radial boulevards and away from isolated alleys or unlit rail underpasses, with a headline 0–100 Safety Index.

---

## 2. UI & Design System (Shadeway Dark Data-Panel Style)

- **Base Theme**: Deep charcoal & near-black ground (`#0c0e11`, `#12151a`) with crisp 1px borders (`#242832`), high-contrast white typography, and zero glassmorphism blurs.
- **Accent 1 (Primary & Safety-Good)**: Vibrant lime-green (`#bbf451`) for wordmarks, primary CTAs, origin pins, and positive metrics.
- **Accent 2 (Day Heat Stress Scale)**: Orange (`#f97316`) to Red (`#ef4444`) dynamically colored based on radiant heat exposure.
- **Accent 3 (Night Safety Scale)**: Green (Safe) → Amber (Caution) → Red (Vulnerable) applied per-segment along candidate routes.
- **Color-Coded POI Dot Layers**:
  - 🌲 **Tree Canopies** (Mint `#4ade80`): Neem and Jamun canopies on Janpath, KG Marg, and Central Park.
  - 💧 **Public Water Fountains** (Teal `#2dd4bf`): NDMC chilled drinking kiosks and metro passenger dispensers.
  - ❄️ **Cooling Centers** (Cyan `#38bdf8`): Subterranean Palika Bazaar AC Concourse, Mandi House cultural libraries, and British Council reading atriums.
  - 🛡️ **Safety Anchors** (Soft Blue `#60a5fa`): Connaught Place Police Station, Barakhamba PS, Parliament St PS, DMRC CISF Helpdesk.

---

## 3. Key Feature Layers

### 3.1 24-Hour Solar & Safety Timeline Scrubber
- Full-width dark strip along the bottom with large lime-green **LEAVING AT** readout.
- Interactive SVG area graph visualizing the 24-hour solar elevation curve (0–24h) with a draggable/clickable scrubber.
- Adjusting the departure time live-recomputes solar angles, shadow lengths, heat stress, and candidate routes.

### 3.2 "What the Walk Feels Like" Results Panel
- **Big Headline Metric**:
  - Day mode: Feels-like temperature (e.g. `41°C` / `106°F` in heat-stress orange/red).
  - Night mode: Composite safety score (e.g. `94 / 100` in calm lime-green).
- **One-Line Human Summary**: Contextual narrative of heat stress or nighttime visibility.
- **Candidate Route Rows**: Left-bordered slim rows for *Fastest Way*, *Coolest Way (Colonnade)*, and *Safest Way (Lit Arterials)*.
- **Trade-Off Insight**: Explicit trade-off explanation (e.g. `+3 min walking for +52% continuous colonnade shade`).
- **The Walk (Turn-by-Turn)**: Step-by-step navigation with directional tags (`GO`, `TRN`, `METRO`, `ARR`) and contextual sunlight/lighting notes (e.g. *"Georgian verandah stays shaded until 17:15"* / *"High-mast LED avenue for 380m"*).

### 3.3 Custom Route Trade-Off Control
- Segmented buttons (`Fastest` / `Balanced` / `Coolest & Safest`) allowing travelers to explicitly balance physical distance against maximum shade or maximum lighting.

### 3.4 Shaded & Safe Transit Connections
- Automatic detection of proximity to metro portals (Rajiv Chowk Metro Gates 1-8, Mandi House Metro) with covered walkway and CISF security flags.

### 3.5 Community Feedback Narrative (For Hackathon Judges)
- Integrated "About this data" modal detailing how ongoing real-time municipal street-light verification and tree inventory updates will be crowd-validated through commuter partnerships with local women and student transit associations.

---

## 4. Multi-Criteria Path Scoring Formulas

### Day Mode: Shade Percentage & Feels-Like Temperature
$$\text{Shade Factor} = \begin{cases} 
98\% & \text{if covered Georgian colonnade (CP verandah)} \\
\max(65\%, \text{base}) + 18\% & \text{if tree-canopied boulevard} \\
20\% + \left(\frac{\Delta\theta}{90^\circ}\right) \times \min\left(65, \frac{22}{\tan(\alpha_{\text{sun}})}\right) & \text{otherwise}
\end{cases}$$

$$\text{Feels-Like Temp} = T_{\text{ambient}} + \sin(\alpha_{\text{sun}}) \cdot (1 - \text{Shade Ratio}) \cdot 6.5^\circ\text{C} - (\text{Shade Ratio} \cdot 2.5^\circ\text{C})$$

### Night Mode: 4-Signal Composite Safety Index (0–100)
$$\text{Safety Index} = 0.40 \times S_{\text{lighting}} + 0.35 \times S_{\text{incident\_safety}} + 0.15 \times S_{\text{foot\_traffic}} + 0.10 \times S_{\text{police\_proximity}}$$

---

## 5. Quick Start & Development

```bash
# Navigate to directory
cd delhi-safe-route

# Install dependencies
npm install

# Run automated tests (Vitest)
npm test

# Launch development server
npm run dev

# Build production bundle
npm run build
```

Open `http://localhost:5173/` in your browser.
A working public Mapbox token is pre-configured out-of-the-box. Custom tokens can also be entered via the Settings button in the top navigation bar.
