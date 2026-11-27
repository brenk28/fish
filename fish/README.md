# Starlight Angler

A free, kid-friendly 3D solar-system fishing and living aquarium game built with **Three.js + TypeScript**, designed for young explorers and tuned to run smoothly in a browser on a **Raspberry Pi 500**.

---

## Overview

Travel across the solar system in a cozy retro-futuristic observatory ship, cast a glowing line into alien seas, learn real planetary and ocean science together through visual badges and short captions, and fill your panoramic 3D starship aquarium with exotic bioluminescent creatures.

### Key Highlights
- **6 Core Worlds + 1 Secret World**:
  - **Earth — Coral Lagoon**: Warm saltwater reef under golden-hour skies.
  - **Mars — Canyon Ice-Spring**: Buried mineral springs beneath rust-red canyon walls and moons Phobos & Deimos.
  - **Europa — Sub-Ice Abyss**: Dark bioluminescent ocean beneath glowing glacier cliffs and giant banded Jupiter.
  - **Titan — Golden Methane Lakes**: Amber atmospheric haze and glassy liquid methane shores beneath ringed Saturn.
  - **Enceladus — Geyser Thermal Vents**: Bright icy ridges, rising cryo-plumes, and warm hydrothermal vents.
  - **Neptune — Diamond Cloud-Sea**: Deep sapphire aurora skies and swirling crystal clouds.
  - **Pluto — Heart-Glacier Sea** *(Secret 7th World)*: Unlocks on the Solar Orrery once you catch at least 1 creature on all 6 core worlds!
- **28 Sculpted 3D Creatures**: 4 unique species per world across 7 articulated 3D silhouettes, plus **Tiny / Regular / Jumbo** sizes and rare sparkling **Starlight Shimmer** variants.
- **Icon-First, Zero-Menu HUD**: Clean corner buttons for **Fishing Pier**, **Solar Orrery**, **Starship Aquarium**, **Solar Field Guide**, and **Sound Mute**.
- **Real Science Made Visual**: Every world and creature displays color-coded **Science Badges** (temperature, gravity, habitat, adaptation) paired with short, parent-and-child read-together captions.

---

## How to Play

### Controls
- **Cast**: Aim over the water with your mouse and **Click** (or press **Space**).
- **Hook**: When the bobber plunges with a sparkle chime, **Click** or press **Space**.
- **Reel In (Tug-of-War)**: Hold **Mouse Button** or **Space** while the ring is **cyan** to reel in. If a rare or large fish darts and turns the ring **amber**, let go briefly to keep your progress safe—the line never snaps!
- **Inspect Catch**: Drag the holographic bubble to spin your 3D creature, read its science badges together, then click **Send to Aquarium** (or press **Space**).

### Lures, Events & Upgrades
- **3 Sci-Fi Lures** (click bottom-left icons or press `1`, `2`, `3`):
  - **Sun-Spark (`1`)**: Attracts sunlit surface creatures.
  - **Deep-Pulse (`2`)**: Sinks down for deep-floor creatures.
  - **Sonar-Chime (`3`)**: Calls shy rare species and **Space Relics**.
- **Sparkling Water Hotspots**: Aim your cast inside glowing golden rings on the water for quick bites and boosted rare/Jumbo odds.
- **Space Events** (sky icon or `E`): Trigger shooting stars on Mars, Jupiter's eclipse halo on Europa, diamond rain on Neptune, cryo-geysers on Enceladus, and more.
- **Gear Upgrades**: Collecting unique species automatically unlocks the **Star-Reach Rod** (4 species), **Aqua Scanner Lens** (`Q` at 8 species to highlight underwater fish), **Luminous Coral Arch** (12 species in the Aquarium), and **Starlight Crown** (18 species).

### Aquarium, Relics & Picture Quizzes
- **Starship Aquarium**: Drag to look around your panoramic glass tank. Drop pellets with **Feed**, launch a **Bubbles** geyser that fish surf, or pulse **Chime** for a musical light wave.
- **Space Relics**: Reel up 7 hidden treasures (like a *Mini Rover Wheel* on Mars or *Brass Star-Astrolabe* on Earth) that automatically decorate your aquarium floor.
- **Picture Quizzes (`★?`)**: Click any creature in the Aquarium or Field Guide and tap **`★?`** to answer a 3-choice visual science question and earn a permanent gold **Star Sticker**.
- **Auto-Save & Reset**: Progress saves automatically in `localStorage`. Parents can press **Shift + R** anytime to start a fresh save.

---

## How to Run Locally

Requirements: [Node.js](https://nodejs.org/) (v18+ recommended).

```bash
git clone <your-repo-url>
cd fish
npm install
npm run dev
```

Open the printed `http://localhost:5173` URL in your browser.

---

## Playing on a Raspberry Pi 500

### Option A: Over Home Wi-Fi
Run `npm run dev` on your PC (Vite binds `--host` automatically) and open the printed `Network` URL (`http://<your-pc-ip>:5173`) in Chromium on the Pi 500.

### Option B: Standalone Offline Mode (Fullscreen App)
1. Build the static bundle:
   ```bash
   npm run build
   ```
2. Copy the generated `dist/` folder and `play-on-pi.sh` to a folder on the Pi 500 (e.g., `~/Games/starlight-angler/`).
3. On the Pi 500, make the script executable and run it:
   ```bash
   chmod +x play-on-pi.sh
   ./play-on-pi.sh
   ```
   This starts a lightweight local Python HTTP server and opens Chromium in fullscreen app mode with zero internet required.

---

## Tech Stack
- **Three.js** + **TypeScript** + **Vite** (`base: './'`)
- Procedural GLSL sky/water shaders, procedural canvas textures, and synthesized **Web Audio API** soundscapes (no external audio, font, or CDN dependencies).

## License
Free for anyone to play, share, and remix under the [MIT License](LICENSE).
