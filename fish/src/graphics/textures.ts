import * as THREE from 'three';
import { FishPattern } from '../data/fish';
import { PlanetId, PLANET_MAP } from '../data/planets';

const textureCache = new Map<string, THREE.CanvasTexture>();

export function getGlowTexture(): THREE.CanvasTexture {
  const key = 'glow-radial';
  const existing = textureCache.get(key);
  if (existing) return existing;

  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.28, 'rgba(255,255,255,0.65)');
  grad.addColorStop(0.62, 'rgba(255,255,255,0.16)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(key, tex);
  return tex;
}

export function getFishPatternTexture(
  primary: string,
  secondary: string,
  pattern: FishPattern,
): THREE.CanvasTexture {
  const key = `fish-${primary}-${secondary}-${pattern}`;
  const existing = textureCache.get(key);
  if (existing) return existing;

  const w = 256;
  const h = 128;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  const baseGrad = ctx.createLinearGradient(0, 0, 0, h);
  baseGrad.addColorStop(0, primary);
  baseGrad.addColorStop(0.65, primary);
  baseGrad.addColorStop(1, secondary);
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, w, h);

  ctx.save();
  if (pattern === 'stripes') {
    ctx.fillStyle = secondary;
    ctx.globalAlpha = 0.72;
    for (let i = 0; i < 8; i++) {
      const x = 18 + i * 30;
      ctx.beginPath();
      ctx.ellipse(x, h * 0.45, 7, h * 0.45, 0.22, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (pattern === 'spots') {
    ctx.fillStyle = secondary;
    for (let i = 0; i < 24; i++) {
      const x = ((i * 53) % (w - 20)) + 10;
      const y = ((i * 37) % (h - 24)) + 12;
      const r = 4 + (i % 4) * 2.5;
      ctx.globalAlpha = 0.68;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (pattern === 'iridescent') {
    const sheen = ctx.createLinearGradient(0, 0, w, h);
    sheen.addColorStop(0, secondary);
    sheen.addColorStop(0.5, 'rgba(255,255,255,0.45)');
    sheen.addColorStop(1, secondary);
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = sheen;
    ctx.fillRect(0, h * 0.18, w, h * 0.42);
  } else if (pattern === 'marbled') {
    ctx.strokeStyle = secondary;
    ctx.lineWidth = 4;
    ctx.globalAlpha = 0.58;
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      const y0 = 15 + i * 18;
      ctx.moveTo(0, y0);
      for (let x = 0; x <= w; x += 32) {
        ctx.lineTo(x, y0 + Math.sin(x * 0.05 + i) * 11);
      }
      ctx.stroke();
    }
  } else if (pattern === 'rings') {
    ctx.strokeStyle = secondary;
    ctx.lineWidth = 3.5;
    ctx.globalAlpha = 0.72;
    for (let i = 0; i < 12; i++) {
      const x = 16 + i * 21;
      const y = h * (0.28 + (i % 3) * 0.22);
      ctx.beginPath();
      ctx.arc(x, y, 7 + (i % 2) * 3, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  ctx.restore();

  // Subtle organic scale shimmer
  ctx.globalAlpha = 0.12;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1;
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 16; col++) {
      ctx.beginPath();
      ctx.arc(col * 16 + (row % 2) * 8, row * 22, 8, 0, Math.PI);
      ctx.stroke();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(key, tex);
  return tex;
}

export function getPlanetTexture(planetId: PlanetId): THREE.CanvasTexture {
  const key = `planet-${planetId}`;
  const existing = textureCache.get(key);
  if (existing) return existing;

  const cfg = PLANET_MAP[planetId];
  const w = 256;
  const h = 128;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = cfg.planetColor;
  ctx.fillRect(0, 0, w, h);

  if (planetId === 'earth') {
    ctx.fillStyle = '#3da36b';
    const blobs = [
      [60, 46, 26, 18],
      [140, 52, 34, 24],
      [205, 72, 22, 20],
      [92, 88, 18, 16],
    ];
    for (const [bx, by, rx, ry] of blobs) {
      ctx.beginPath();
      ctx.ellipse(bx, by, rx, ry, 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.ellipse((i * 45 + 20) % w, 25 + (i % 4) * 20, 26, 5, 0.1, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (planetId === 'mars') {
    ctx.fillStyle = '#9c3a22';
    for (let i = 0; i < 12; i++) {
      ctx.beginPath();
      ctx.arc((i * 47) % w, 20 + ((i * 29) % 88), 6 + (i % 5) * 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#f2eae4';
    ctx.fillRect(0, 0, w, 10);
    ctx.fillRect(0, h - 10, w, 10);
  } else if (planetId === 'europa' || planetId === 'enceladus') {
    ctx.strokeStyle = planetId === 'europa' ? '#c97b5d' : '#7acde6';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.65;
    for (let i = 0; i < 14; i++) {
      ctx.beginPath();
      ctx.moveTo((i * 31) % w, 0);
      ctx.lineTo(((i * 67) + 40) % w, h);
      ctx.stroke();
    }
  } else if (planetId === 'pluto') {
    // Creamy rose-ochre surface with Pluto's iconic bright icy heart plain
    ctx.fillStyle = '#a87d76';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#f5e1ea';
    ctx.beginPath();
    ctx.arc(w * 0.48, h * 0.48, 16, 0, Math.PI * 2);
    ctx.arc(w * 0.57, h * 0.48, 16, 0, Math.PI * 2);
    ctx.moveTo(w * 0.41, h * 0.54);
    ctx.lineTo(w * 0.525, h * 0.74);
    ctx.lineTo(w * 0.64, h * 0.54);
    ctx.fill();
  } else {
    // Banded atmospheric look for Titan / Neptune
    for (let y = 0; y < h; y += 8) {
      ctx.fillStyle = y % 16 === 0 ? cfg.accentColor : 'rgba(255,255,255,0.18)';
      ctx.globalAlpha = 0.28;
      ctx.fillRect(0, y, w, 5);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(key, tex);
  return tex;
}

export function getJupiterTexture(): THREE.CanvasTexture {
  const key = 'jupiter-giant';
  const existing = textureCache.get(key);
  if (existing) return existing;

  const w = 256;
  const h = 128;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  const bands = ['#d8b894', '#b8764c', '#ebd4b7', '#9c5a3c', '#e6c39c', '#c98e63', '#f2dfc7', '#a66644'];
  const bandH = h / bands.length;
  bands.forEach((col, i) => {
    ctx.fillStyle = col;
    ctx.fillRect(0, i * bandH, w, bandH + 1);
  });

  // Great Red Spot
  ctx.fillStyle = '#c45b3b';
  ctx.beginPath();
  ctx.ellipse(w * 0.62, h * 0.63, 20, 11, -0.1, 0, Math.PI * 2);
  ctx.fill();

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(key, tex);
  return tex;
}

export function getSaturnRingTexture(): THREE.CanvasTexture {
  const key = 'saturn-ring';
  const existing = textureCache.get(key);
  if (existing) return existing;

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 32;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, 256, 0);
  grad.addColorStop(0, 'rgba(245, 224, 180, 0)');
  grad.addColorStop(0.18, 'rgba(225, 198, 150, 0.72)');
  grad.addColorStop(0.45, 'rgba(248, 232, 198, 0.85)');
  grad.addColorStop(0.55, 'rgba(120, 100, 80, 0.22)');
  grad.addColorStop(0.7, 'rgba(235, 210, 165, 0.78)');
  grad.addColorStop(1, 'rgba(235, 210, 165, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 32);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(key, tex);
  return tex;
}

export function getCausticTexture(): THREE.CanvasTexture {
  const key = 'caustic-web';
  const existing = textureCache.get(key);
  if (existing) return existing;

  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = 'rgba(0,0,0,0)';
  ctx.fillRect(0, 0, size, size);

  ctx.strokeStyle = 'rgba(175, 245, 255, 0.35)';
  ctx.lineWidth = 3;
  for (let i = 0; i < 18; i++) {
    const cx = ((i * 73) % size);
    const cy = ((i * 119) % size);
    const r = 18 + (i % 4) * 12;
    ctx.beginPath();
    ctx.ellipse(cx, cy, r, r * 0.65, i * 0.4, 0, Math.PI * 2);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 2);
  textureCache.set(key, tex);
  return tex;
}
