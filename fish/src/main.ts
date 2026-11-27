import * as THREE from 'three';
import { SoundManager } from './audio/SoundManager';
import { PLANET_MAP } from './data/planets';
import { AquariumScene } from './scenes/AquariumScene';
import { FishingScene } from './scenes/FishingScene';
import { OrreryScene } from './scenes/OrreryScene';
import { GameScene } from './scenes/SceneTypes';
import { GameMode, GameState } from './state/GameState';
import './style.css';
import { HUD } from './ui/HUD';

const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
const hudRoot = document.getElementById('hud') as HTMLElement;

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  powerPreference: 'high-performance',
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;

const state = new GameState();
const sound = new SoundManager();
sound.setMuted(state.muted);

const fishingScene = new FishingScene(state, sound);
const orreryScene = new OrreryScene(state, sound);
const aquariumScene = new AquariumScene(state, sound);

const scenes: Record<GameMode, GameScene> = {
  fishing: fishingScene,
  orrery: orreryScene,
  aquarium: aquariumScene,
};

const hud = new HUD(hudRoot, state, sound, {
  onStartPlay: () => {
    fishingScene.enter();
  },
  onSwitchMode: (mode) => switchMode(mode),
  onCollectDiscovery: () => fishingScene.collectDiscovery(),
  onSelectLure: (lure) => {
    state.setLure(lure);
    fishingScene.syncLureVisuals();
  },
  onToggleEvent: () => fishingScene.toggleSpaceEvent(),
  onTriggerScanner: () => fishingScene.triggerScanner(),
  onFeedAquarium: () => aquariumScene.dropFood(),
  onBubbleJet: () => aquariumScene.triggerBubbleJet(),
  onLightChime: () => aquariumScene.triggerLightChime(),
  onFilterAquarium: (filter) => aquariumScene.setPlanetFilter(filter),
  onWarpToPlanet: (planetId) => orreryScene.startWarpTo(planetId),
});

fishingScene.setHudCallback((snap) => hud.setFishingSnapshot(snap));
orreryScene.setCallbacks(
  (planet) => hud.setOrreryHover(planet),
  (planetId) => {
    state.setPlanet(planetId);
    fishingScene.applyPlanet(PLANET_MAP[planetId], true);
    switchMode('fishing');
  },
);
aquariumScene.setSelectCallback((species) => hud.setAquariumSelection(species));

let activeScene: GameScene = fishingScene;
activeScene.enter();

function switchMode(mode: GameMode): void {
  if (state.mode === mode) return;
  activeScene.exit();
  state.setMode(mode);
  activeScene = scenes[mode];
  activeScene.resize(window.innerWidth, window.innerHeight);
  activeScene.enter();
  hud.render();
}

let pointerIsDown = false;

function toNdc(e: PointerEvent): [number, number] {
  const rect = canvas.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  return [x, y];
}

canvas.addEventListener('pointermove', (e) => {
  if (!state.hasStarted) return;
  const [x, y] = toNdc(e);
  activeScene.onPointerMove?.(x, y, pointerIsDown);
});

canvas.addEventListener('pointerdown', (e) => {
  if (!state.hasStarted) return;
  pointerIsDown = true;
  const [x, y] = toNdc(e);
  activeScene.onPointerDown?.(x, y);
});

window.addEventListener('pointerup', (e) => {
  if (!pointerIsDown) return;
  pointerIsDown = false;
  const [x, y] = toNdc(e);
  activeScene.onPointerUp?.(x, y);
});

window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
  }
  if (!state.hasStarted) {
    if (e.code === 'Space' || e.code === 'Enter') {
      sound.unlock();
      sound.playClick();
      state.markStarted();
      fishingScene.enter();
      hud.render();
    }
    return;
  }
  if (e.shiftKey && e.code === 'KeyR') {
    state.resetProgress();
    fishingScene.applyPlanet(PLANET_MAP[state.currentPlanet], false);
    aquariumScene.syncFish();
    hud.render();
    return;
  }
  if (e.code === 'Escape') {
    hud.toggleGuide(false);
    return;
  }
  if (state.mode === 'fishing') {
    if (e.code === 'Digit1') {
      sound.playClick();
      state.setLure('sun');
      fishingScene.syncLureVisuals();
      return;
    }
    if (e.code === 'Digit2') {
      sound.playClick();
      state.setLure('deep');
      fishingScene.syncLureVisuals();
      return;
    }
    if (e.code === 'Digit3') {
      sound.playClick();
      state.setLure('sonar');
      fishingScene.syncLureVisuals();
      return;
    }
    if (e.code === 'KeyE') {
      fishingScene.toggleSpaceEvent();
      return;
    }
    if (e.code === 'KeyQ') {
      fishingScene.triggerScanner();
      return;
    }
  }
  activeScene.onKeyDown?.(e.code);
});

window.addEventListener('keyup', (e) => {
  activeScene.onKeyUp?.(e.code);
});

window.addEventListener('resize', () => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  renderer.setSize(w, h);
  activeScene.resize(w, h);
});

const clock = new THREE.Clock();
function animate(): void {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  const elapsed = clock.elapsedTime;
  activeScene.update(dt, elapsed);
  renderer.render(activeScene.scene, activeScene.camera);
}
animate();
