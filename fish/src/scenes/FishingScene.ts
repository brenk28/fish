import * as THREE from 'three';
import { SoundManager } from '../audio/SoundManager';
import { FishSpecies, getFishForPlanet } from '../data/fish';
import { LURE_MAP } from '../data/lures';
import { PlanetConfig, PLANET_MAP } from '../data/planets';
import { SpaceRelic } from '../data/relics';
import { createFishMesh, createRelicMesh, FishInstance } from '../graphics/FishFactory';
import { SkyDome } from '../graphics/SkyDome';
import { getGlowTexture } from '../graphics/textures';
import { WaterSurface } from '../graphics/WaterSurface';
import { CatchOutcome, FishSize, GameState } from '../state/GameState';
import { GameScene } from './SceneTypes';

export type FishingPhase =
  | 'IDLE'
  | 'CASTING'
  | 'WAITING'
  | 'BITE'
  | 'REELING'
  | 'LEAPING'
  | 'DISCOVERY';

export type TugState = 'CALM' | 'DARTING';

export interface FishingHudSnapshot {
  phase: FishingPhase;
  reelProgress: number;
  tugState: TugState;
  inHotspot: boolean;
  spaceEventActive: boolean;
  scannerActive: boolean;
  hasCastOnce: boolean;
  discoveredFish: FishSpecies | null;
  discoveredSize: FishSize;
  discoveredStarlight: boolean;
  isNewDiscovery: boolean;
  discoveredRelic: SpaceRelic | null;
}

interface ShadowFish {
  group: THREE.Group;
  species: FishSpecies;
  glow: THREE.Sprite;
  scanRing: THREE.Mesh;
  center: THREE.Vector3;
  angle: number;
  radius: number;
  speed: number;
  y: number;
}

export class FishingScene implements GameScene {
  public readonly scene = new THREE.Scene();
  public readonly camera: THREE.PerspectiveCamera;

  private skyDome = new SkyDome();
  private water = new WaterSurface();
  private coastGroup = new THREE.Group();
  private pierGroup = new THREE.Group();
  private pierPostOrbs: THREE.Mesh[] = [];
  private rodPivot = new THREE.Group();
  private rodShaftMat!: THREE.MeshStandardMaterial;
  private rodTipAnchor = new THREE.Object3D();

  private bobberGroup = new THREE.Group();
  private bobberSphereMat!: THREE.MeshStandardMaterial;
  private bobberRingMat!: THREE.MeshBasicMaterial;
  private bobberGlow!: THREE.Sprite;
  private aimReticle!: THREE.Mesh;
  private lineMesh!: THREE.Line;
  private lineMat!: THREE.LineBasicMaterial;
  private discoveryBubbleGroup = new THREE.Group();
  private ambientMotes!: THREE.Points;
  private ambientMotesMat!: THREE.PointsMaterial;

  // Sparkling water hotspot
  private hotspotGroup = new THREE.Group();
  private hotspotActive = false;
  private hotspotPos = new THREE.Vector3(0, 0.08, -10);
  private hotspotTimer = 5.0;

  // Aqua Scanner Lens wave
  private scannerWave!: THREE.Mesh;
  private scannerTimer = 0;

  private hemiLight: THREE.HemisphereLight;
  private sunLight: THREE.DirectionalLight;
  private rimLight: THREE.PointLight;

  private shadowFish: ShadowFish[] = [];
  private activeShadowIndex = 0;
  private caughtFishInstance: FishInstance | null = null;
  private caughtRelicMesh: THREE.Group | null = null;

  private pendingOutcome: CatchOutcome | null = null;
  private currentSpecies: FishSpecies | null = null;
  private currentSize: FishSize = 'regular';
  private currentStarlight = false;
  private currentRelic: SpaceRelic | null = null;
  private isNewSpecies = false;

  private phase: FishingPhase = 'IDLE';
  private phaseTime = 0;
  private waitTargetTime = 2.6;
  private nextNibbleTime = 1.1;
  private nibblesDone = 0;
  private reelProgress = 0;
  private tugState: TugState = 'CALM';
  private tugTimer = 2.0;
  private dartsRemaining = 0;

  private inHotspot = false;
  private spaceEventActive = false;
  private hasCastOnce = false;
  private warpArriveTimer = 0;

  private pointerDown = false;
  private spaceDown = false;
  private draggingDiscovery = false;
  private lastDragX = 0;
  private lastDragY = 0;
  private discoverySpinY = 0.5;
  private discoverySpinX = 0.08;

  private aimTarget = new THREE.Vector3(0, 0, -9.5);
  private castStartPos = new THREE.Vector3();
  private castTargetPos = new THREE.Vector3(0, 0, -9.5);
  private bobberPos = new THREE.Vector3(0, 0, -9.5);
  private leapStartPos = new THREE.Vector3();

  private raycaster = new THREE.Raycaster();
  private waterPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

  private onHudChange?: (snapshot: FishingHudSnapshot) => void;

  constructor(
    private state: GameState,
    private sound: SoundManager,
    onHudChange?: (snapshot: FishingHudSnapshot) => void,
  ) {
    this.onHudChange = onHudChange;
    this.camera = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.1, 220);
    this.camera.position.set(0, 3.3, 5.4);
    this.camera.lookAt(0, 0.7, -9);

    this.hemiLight = new THREE.HemisphereLight(0x9be0ff, 0x1a3852, 1.15);
    this.sunLight = new THREE.DirectionalLight(0xffe6ba, 1.6);
    this.sunLight.position.set(-14, 22, -16);
    this.rimLight = new THREE.PointLight(0x7beeff, 1.5, 22);
    this.rimLight.position.set(0, 2.4, 2.2);
    this.scene.add(this.hemiLight, this.sunLight, this.rimLight);

    this.scene.add(this.skyDome.group);
    this.scene.add(this.water.mesh);
    this.scene.add(this.coastGroup);
    this.buildObservatoryPier();
    this.buildFishingRig();
    this.buildHotspot();
    this.buildScannerWave();
    this.buildDiscoveryBubble();
    this.buildAmbientMotes();

    this.applyPlanet(PLANET_MAP[this.state.currentPlanet], false);
    this.syncGearVisuals();
  }

  public setHudCallback(cb: (snapshot: FishingHudSnapshot) => void): void {
    this.onHudChange = cb;
    this.emitHud();
  }

  private emitHud(): void {
    this.onHudChange?.({
      phase: this.phase,
      reelProgress: this.reelProgress,
      tugState: this.tugState,
      inHotspot: this.inHotspot,
      spaceEventActive: this.spaceEventActive,
      scannerActive: this.scannerTimer > 0,
      hasCastOnce: this.hasCastOnce,
      discoveredFish: this.phase === 'DISCOVERY' ? this.currentSpecies : null,
      discoveredSize: this.currentSize,
      discoveredStarlight: this.currentStarlight,
      isNewDiscovery: this.isNewSpecies,
      discoveredRelic: this.phase === 'DISCOVERY' ? this.currentRelic : null,
    });
  }

  private buildObservatoryPier(): void {
    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xd6a656,
      metalness: 0.72,
      roughness: 0.28,
    });
    const ivoryMat = new THREE.MeshStandardMaterial({
      color: 0xe9eef2,
      metalness: 0.12,
      roughness: 0.45,
    });
    const glowStripMat = new THREE.MeshBasicMaterial({ color: 0x72f2ff });

    const deck = new THREE.Mesh(new THREE.CylinderGeometry(5.6, 5.9, 0.42, 24), ivoryMat);
    deck.position.set(0, 0.55, 5.2);
    this.pierGroup.add(deck);

    const trim = new THREE.Mesh(new THREE.TorusGeometry(5.62, 0.08, 10, 48), brassMat);
    trim.rotation.x = Math.PI / 2;
    trim.position.set(0, 0.76, 5.2);
    this.pierGroup.add(trim);

    const lightStrip = new THREE.Mesh(new THREE.TorusGeometry(5.45, 0.035, 8, 48), glowStripMat);
    lightStrip.rotation.x = Math.PI / 2;
    lightStrip.position.set(0, 0.77, 5.2);
    this.pierGroup.add(lightStrip);

    for (let i = -3; i <= 3; i++) {
      if (Math.abs(i) < 1) continue;
      const ang = i * 0.26;
      const px = Math.sin(ang) * 5.2;
      const pz = 5.2 - Math.cos(ang) * 5.2;
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.07, 0.95, 10), brassMat);
      post.position.set(px, 1.22, pz);
      const orb = new THREE.Mesh(
        new THREE.SphereGeometry(0.09, 10, 10),
        new THREE.MeshBasicMaterial({ color: 0xffe4a3 }),
      );
      orb.position.set(px, 1.72, pz);
      this.pierPostOrbs.push(orb);
      this.pierGroup.add(post, orb);
    }

    const skiff = new THREE.Group();
    const hull = new THREE.Mesh(new THREE.SphereGeometry(0.9, 16, 12), ivoryMat);
    hull.scale.set(0.7, 0.35, 1.65);
    const canopy = new THREE.Mesh(
      new THREE.SphereGeometry(0.42, 14, 10),
      new THREE.MeshStandardMaterial({
        color: 0x5ad8ff,
        emissive: 0x1b6d9e,
        emissiveIntensity: 0.4,
        roughness: 0.15,
        metalness: 0.4,
      }),
    );
    canopy.scale.set(0.85, 0.65, 1.3);
    canopy.position.set(0, 0.24, 0.1);
    const finL = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.06, 0.45), brassMat);
    finL.position.set(-0.55, 0.02, -0.35);
    finL.rotation.z = 0.2;
    const finR = finL.clone();
    finR.position.x = 0.55;
    finR.rotation.z = -0.2;
    skiff.add(hull, canopy, finL, finR);
    skiff.position.set(-4.8, 0.42, -0.8);
    skiff.rotation.y = 0.55;
    this.pierGroup.add(skiff);

    this.scene.add(this.pierGroup);
  }

  private buildFishingRig(): void {
    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xd9a74e,
      metalness: 0.78,
      roughness: 0.25,
    });
    this.rodShaftMat = new THREE.MeshStandardMaterial({
      color: 0x2b3e59,
      metalness: 0.45,
      roughness: 0.3,
    });

    this.rodPivot.position.set(1.25, 1.75, 3.2);
    const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.068, 0.65, 12), brassMat);
    grip.rotation.x = -Math.PI / 3;
    grip.position.set(0, 0.12, -0.22);

    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.042, 2.3, 10), this.rodShaftMat);
    shaft.rotation.x = -Math.PI / 3;
    shaft.position.set(0, 0.68, -1.2);

    const tipOrb = new THREE.Mesh(
      new THREE.SphereGeometry(0.045, 10, 10),
      new THREE.MeshBasicMaterial({ color: 0x8cf6ff }),
    );
    tipOrb.position.set(0, 1.24, -2.18);
    this.rodTipAnchor.position.copy(tipOrb.position);

    this.rodPivot.add(grip, shaft, tipOrb, this.rodTipAnchor);
    this.scene.add(this.rodPivot);

    this.bobberSphereMat = new THREE.MeshStandardMaterial({
      color: 0xffb347,
      emissive: 0xff8c24,
      emissiveIntensity: 0.7,
      roughness: 0.2,
    });
    const bobberSphere = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 12), this.bobberSphereMat);
    this.bobberRingMat = new THREE.MeshBasicMaterial({ color: 0x7df9ff });
    const bobberRing = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.025, 8, 24), this.bobberRingMat);
    bobberRing.rotation.x = Math.PI / 2;
    this.bobberGlow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: getGlowTexture(),
        color: 0x7df9ff,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    this.bobberGlow.scale.set(1.3, 1.3, 1);
    this.bobberGroup.add(bobberSphere, bobberRing, this.bobberGlow);
    this.bobberGroup.visible = false;
    this.scene.add(this.bobberGroup);

    this.aimReticle = new THREE.Mesh(
      new THREE.RingGeometry(0.32, 0.44, 28),
      new THREE.MeshBasicMaterial({
        color: 0x9cf7ff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.55,
      }),
    );
    this.aimReticle.rotation.x = -Math.PI / 2;
    this.aimReticle.position.set(0, 0.08, -9.5);
    this.scene.add(this.aimReticle);

    const linePts: THREE.Vector3[] = [];
    for (let i = 0; i <= 14; i++) linePts.push(new THREE.Vector3());
    const lineGeo = new THREE.BufferGeometry().setFromPoints(linePts);
    this.lineMat = new THREE.LineBasicMaterial({
      color: 0xb0f8ff,
      transparent: true,
      opacity: 0.85,
    });
    this.lineMesh = new THREE.Line(lineGeo, this.lineMat);
    this.lineMesh.visible = false;
    this.scene.add(this.lineMesh);
  }

  private buildHotspot(): void {
    const outerRing = new THREE.Mesh(
      new THREE.RingGeometry(1.1, 1.35, 32),
      new THREE.MeshBasicMaterial({
        color: 0xffe478,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.78,
      }),
    );
    outerRing.rotation.x = -Math.PI / 2;

    const innerRing = new THREE.Mesh(
      new THREE.RingGeometry(0.45, 0.65, 24),
      new THREE.MeshBasicMaterial({
        color: 0x7df9ff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.82,
      }),
    );
    innerRing.rotation.x = -Math.PI / 2;

    const glow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: getGlowTexture(),
        color: 0xffdf78,
        transparent: true,
        opacity: 0.65,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    glow.scale.set(3.4, 3.4, 1);

    this.hotspotGroup.add(outerRing, innerRing, glow);
    this.hotspotGroup.visible = false;
    this.scene.add(this.hotspotGroup);
  }

  private buildScannerWave(): void {
    this.scannerWave = new THREE.Mesh(
      new THREE.RingGeometry(0.8, 1.15, 48),
      new THREE.MeshBasicMaterial({
        color: 0x7cf7ff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8,
      }),
    );
    this.scannerWave.rotation.x = -Math.PI / 2;
    this.scannerWave.position.set(0, 0.14, -9);
    this.scannerWave.visible = false;
    this.scene.add(this.scannerWave);
  }

  private buildDiscoveryBubble(): void {
    const bubble = new THREE.Mesh(
      new THREE.SphereGeometry(1.45, 28, 22),
      new THREE.MeshStandardMaterial({
        color: 0x9ef5ff,
        emissive: 0x2689a8,
        emissiveIntensity: 0.3,
        roughness: 0.08,
        metalness: 0.15,
        transparent: true,
        opacity: 0.26,
        depthWrite: false,
      }),
    );
    const halo = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: getGlowTexture(),
        color: 0x8ff7ff,
        transparent: true,
        opacity: 0.45,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    halo.scale.set(3.8, 3.8, 1);

    const brassRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.48, 0.028, 10, 48),
      new THREE.MeshBasicMaterial({ color: 0xffd578, transparent: true, opacity: 0.65 }),
    );
    brassRing.rotation.x = Math.PI / 2.3;

    this.discoveryBubbleGroup.add(bubble, halo, brassRing);
    this.discoveryBubbleGroup.position.set(0, 2.35, 0.6);
    this.discoveryBubbleGroup.visible = false;
    this.scene.add(this.discoveryBubbleGroup);
  }

  private buildAmbientMotes(): void {
    const count = 90;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 36;
      pos[i * 3 + 1] = 0.5 + Math.random() * 10;
      pos[i * 3 + 2] = -24 + Math.random() * 28;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.ambientMotesMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.28,
      map: getGlowTexture(),
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.ambientMotes = new THREE.Points(geo, this.ambientMotesMat);
    this.scene.add(this.ambientMotes);
  }

  public syncLureVisuals(): void {
    const lure = LURE_MAP[this.state.activeLure];
    this.bobberSphereMat.color.set(lure.color);
    this.bobberSphereMat.emissive.set(lure.color);
    this.bobberGlow.material.color.set(lure.glowColor);
  }

  public syncGearVisuals(): void {
    const hasLongRod = this.state.isMilestoneUnlocked('long_rod');
    const hasCrown = this.state.isMilestoneUnlocked('starlight_crown');
    this.rodShaftMat.color.set(hasLongRod ? 0xd9a74e : 0x2b3e59);
    for (const orb of this.pierPostOrbs) {
      (orb.material as THREE.MeshBasicMaterial).color.set(hasCrown ? 0x7df9ff : 0xffe4a3);
    }
    this.syncLureVisuals();
  }

  public toggleSpaceEvent(): void {
    this.spaceEventActive = !this.spaceEventActive;
    this.skyDome.setSpaceEvent(this.spaceEventActive);
    this.sound.playClick();
    if (this.spaceEventActive) {
      this.water.triggerRipple(0, -10, 1.0);
    }
    this.emitHud();
  }

  public triggerScanner(): void {
    if (!this.state.isMilestoneUnlocked('scanner_lens')) return;
    this.scannerTimer = 7.0;
    this.scannerWave.visible = true;
    this.scannerWave.scale.setScalar(1);
    this.sound.playScanner();
    this.emitHud();
  }

  public applyPlanet(planet: PlanetConfig, withWarpArrive = true): void {
    this.spaceEventActive = false;
    this.skyDome.setSpaceEvent(false);
    this.skyDome.applyPlanet(planet);
    this.water.applyPlanet(planet);
    this.scene.fog = new THREE.FogExp2(planet.fogColor, planet.fogDensity);
    this.hemiLight.color.set(planet.ambientColor);
    this.sunLight.color.set(planet.sunColor);
    this.ambientMotesMat.color.set(planet.accentColor);

    this.rebuildCoastlineProps(planet);
    this.rebuildShadowFish(planet);

    this.hotspotActive = false;
    this.hotspotGroup.visible = false;
    this.hotspotTimer = 4.0;
    this.scannerTimer = 0;
    this.scannerWave.visible = false;

    this.sound.setPlanetAmbience(planet.id);
    if (withWarpArrive) {
      this.warpArriveTimer = 0.7;
    }
    this.resetToIdle();
  }

  private rebuildCoastlineProps(planet: PlanetConfig): void {
    while (this.coastGroup.children.length > 0) {
      this.coastGroup.remove(this.coastGroup.children.pop()!);
    }

    const addCluster = (x: number, z: number, scale: number, seed: number): void => {
      if (planet.id === 'earth') {
        const rockMat = new THREE.MeshStandardMaterial({ color: 0x3b6e6c, roughness: 0.85 });
        const coralMat = new THREE.MeshStandardMaterial({
          color: seed % 2 === 0 ? 0xff7b6b : 0xf5b851,
          emissive: 0x552211,
          emissiveIntensity: 0.2,
          roughness: 0.6,
        });
        const base = new THREE.Mesh(new THREE.DodecahedronGeometry(1.8 * scale, 1), rockMat);
        base.scale.set(1.4, 0.75, 1.2);
        base.position.set(x, 0.1, z);
        const arch = new THREE.Mesh(new THREE.TorusGeometry(1.1 * scale, 0.22 * scale, 8, 16, Math.PI), coralMat);
        arch.position.set(x, 0.65 * scale, z);
        arch.rotation.y = seed * 0.8;
        this.coastGroup.add(base, arch);
      } else if (planet.id === 'mars') {
        const mesaMat = new THREE.MeshStandardMaterial({ color: 0x9e432c, roughness: 0.92 });
        const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.9 * scale, 1.8 * scale, 4.5 * scale, 7), mesaMat);
        spire.position.set(x, 1.6 * scale, z);
        spire.rotation.y = seed;
        this.coastGroup.add(spire);
      } else if (planet.id === 'europa' || planet.id === 'enceladus') {
        const iceMat = new THREE.MeshStandardMaterial({
          color: planet.id === 'europa' ? 0x7fd8f0 : 0xe3f7ff,
          emissive: 0x1a5678,
          emissiveIntensity: 0.25,
          roughness: 0.2,
          transparent: true,
          opacity: 0.86,
        });
        const shard = new THREE.Mesh(new THREE.ConeGeometry(1.3 * scale, 5.2 * scale, 5), iceMat);
        shard.position.set(x, 1.6 * scale, z);
        shard.rotation.z = (seed % 2 === 0 ? 1 : -1) * 0.16;
        shard.rotation.y = seed;
        this.coastGroup.add(shard);
      } else if (planet.id === 'titan') {
        const basaltMat = new THREE.MeshStandardMaterial({ color: 0x3b2618, roughness: 0.78 });
        const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.6 * scale, 1.1 * scale, 5.0 * scale, 6), basaltMat);
        pillar.position.set(x, 1.8 * scale, z);
        this.coastGroup.add(pillar);
      } else if (planet.id === 'neptune' || planet.id === 'pluto') {
        const crystalMat = new THREE.MeshStandardMaterial({
          color: planet.id === 'pluto' ? 0xffb3d9 : 0x66f7d6,
          emissive: planet.id === 'pluto' ? 0x6b285c : 0x2648b8,
          emissiveIntensity: 0.45,
          roughness: 0.15,
          metalness: 0.25,
          transparent: true,
          opacity: 0.82,
        });
        const berg = new THREE.Mesh(new THREE.OctahedronGeometry(1.7 * scale, 0), crystalMat);
        berg.scale.set(1.1, 1.6, 1.1);
        berg.position.set(x, 0.9 * scale, z);
        berg.rotation.y = seed;
        this.coastGroup.add(berg);
      }
    };

    const spots = [
      [-15, -14, 1.2, 1],
      [16, -15, 1.1, 2],
      [-22, -26, 1.6, 3],
      [21, -24, 1.5, 4],
      [-9, -31, 1.3, 5],
      [11, -33, 1.4, 6],
    ];
    for (const [x, z, s, seed] of spots) {
      addCluster(x, z, s, seed);
    }
  }

  private rebuildShadowFish(planet: PlanetConfig): void {
    for (const sf of this.shadowFish) {
      this.scene.remove(sf.group);
    }
    this.shadowFish = [];

    const pool = getFishForPlanet(planet.id);
    const silMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(planet.waterColors.deep).lerp(new THREE.Color(planet.accentColor), 0.35),
      transparent: true,
      opacity: 0.62,
    });

    for (let i = 0; i < 6; i++) {
      const species = pool[i % pool.length];
      const g = new THREE.Group();
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.32, 10, 8), silMat);
      body.scale.set(0.55, 0.45, 1.6);
      const tail = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.4, 4), silMat);
      tail.rotation.x = -Math.PI / 2;
      tail.position.z = -0.6;
      const glow = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: getGlowTexture(),
          color: new THREE.Color(species.glowColor),
          transparent: true,
          opacity: 0.45,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      );
      glow.scale.set(1.2, 1.2, 1);

      const scanRing = new THREE.Mesh(
        new THREE.RingGeometry(0.55, 0.72, 24),
        new THREE.MeshBasicMaterial({
          color: new THREE.Color(species.rarity === 'rare' ? '#ffe078' : '#7cf7ff'),
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.85,
        }),
      );
      scanRing.rotation.x = -Math.PI / 2;
      scanRing.position.y = 0.38;
      scanRing.visible = false;

      g.add(body, tail, glow, scanRing);

      const center = new THREE.Vector3((Math.random() - 0.5) * 14, -0.35, -7 - Math.random() * 11);
      g.position.copy(center);
      this.scene.add(g);
      this.shadowFish.push({
        group: g,
        species,
        glow,
        scanRing,
        center,
        angle: Math.random() * Math.PI * 2,
        radius: 2.2 + Math.random() * 2.5,
        speed: 0.45 + Math.random() * 0.45,
        y: -0.28 - Math.random() * 0.3,
      });
    }
  }

  private resetToIdle(): void {
    this.phase = 'IDLE';
    this.phaseTime = 0;
    this.reelProgress = 0;
    this.tugState = 'CALM';
    this.inHotspot = false;
    this.bobberGroup.visible = false;
    this.lineMesh.visible = false;
    this.aimReticle.visible = true;
    this.discoveryBubbleGroup.visible = false;
    if (this.caughtFishInstance) {
      this.scene.remove(this.caughtFishInstance.group);
      this.caughtFishInstance = null;
    }
    if (this.caughtRelicMesh) {
      this.scene.remove(this.caughtRelicMesh);
      this.caughtRelicMesh = null;
    }
    this.pendingOutcome = null;
    this.currentSpecies = null;
    this.currentRelic = null;
    this.syncGearVisuals();
    this.emitHud();
  }

  public enter(): void {
    const planet = PLANET_MAP[this.state.currentPlanet];
    this.sound.setPlanetAmbience(planet.id);
    this.syncGearVisuals();
    this.emitHud();
  }

  public exit(): void {
    this.pointerDown = false;
    this.spaceDown = false;
    this.draggingDiscovery = false;
  }

  public resize(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  private updateAimFromNdc(ndcX: number, ndcY: number): void {
    this.raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), this.camera);
    const hit = new THREE.Vector3();
    const minZ = this.state.isMilestoneUnlocked('long_rod') ? -24.5 : -19.5;
    if (this.raycaster.ray.intersectPlane(this.waterPlane, hit)) {
      hit.x = THREE.MathUtils.clamp(hit.x, -11.5, 11.5);
      hit.z = THREE.MathUtils.clamp(hit.z, minZ, -3.5);
      hit.y = 0;
      this.aimTarget.copy(hit);
      this.aimReticle.position.set(hit.x, 0.08, hit.z);
    }
  }

  private startCast(): void {
    this.hasCastOnce = true;
    this.phase = 'CASTING';
    this.phaseTime = 0;
    this.reelProgress = 0;
    this.tugState = 'CALM';
    this.inHotspot = false;
    this.aimReticle.visible = false;
    this.rodTipAnchor.getWorldPosition(this.castStartPos);
    this.castTargetPos.copy(this.aimTarget);
    this.bobberPos.copy(this.castStartPos);
    this.bobberGroup.position.copy(this.bobberPos);
    this.bobberGroup.visible = true;
    this.lineMesh.visible = true;
    this.syncLureVisuals();
    this.sound.playCast();
    this.emitHud();
  }

  private triggerHooked(): void {
    this.phase = 'REELING';
    this.phaseTime = 0;
    this.reelProgress = 0.08;
    this.tugState = 'CALM';
    this.tugTimer = 1.15;

    // Pre-roll outcome so rarity drives playful tug-of-war darts
    const outcome = this.state.pickCatchOutcome(
      this.state.currentPlanet,
      this.state.activeLure,
      this.inHotspot,
      this.spaceEventActive,
    );
    this.pendingOutcome = outcome;

    if (outcome.kind === 'fish') {
      const rareBoost = outcome.species.rarity === 'rare' ? 2 : outcome.species.rarity === 'uncommon' ? 1 : 0;
      const sizeBoost = outcome.size === 'jumbo' ? 1 : 0;
      this.dartsRemaining = Math.min(3, rareBoost + sizeBoost);
    } else {
      this.dartsRemaining = 1;
    }

    this.water.triggerRipple(this.bobberPos.x, this.bobberPos.z, 1.1);
    this.sound.playClick();
    this.emitHud();
  }

  public collectDiscovery(): void {
    if (this.phase !== 'DISCOVERY') return;
    this.sound.playCollect();
    this.resetToIdle();
  }

  public onPointerMove(ndcX: number, ndcY: number, isDown: boolean): void {
    if (this.phase === 'IDLE') {
      this.updateAimFromNdc(ndcX, ndcY);
    } else if (this.phase === 'DISCOVERY' && this.draggingDiscovery && isDown) {
      const dx = ndcX - this.lastDragX;
      const dy = ndcY - this.lastDragY;
      this.discoverySpinY += dx * 4.5;
      this.discoverySpinX = THREE.MathUtils.clamp(this.discoverySpinX - dy * 2.5, -0.7, 0.7);
      this.lastDragX = ndcX;
      this.lastDragY = ndcY;
    }
  }

  public onPointerDown(ndcX: number, ndcY: number): void {
    this.sound.unlock();
    this.pointerDown = true;

    if (this.phase === 'IDLE') {
      this.updateAimFromNdc(ndcX, ndcY);
      this.startCast();
    } else if (this.phase === 'BITE') {
      this.triggerHooked();
    } else if (this.phase === 'DISCOVERY') {
      this.draggingDiscovery = true;
      this.lastDragX = ndcX;
      this.lastDragY = ndcY;
    }
  }

  public onPointerUp(): void {
    this.pointerDown = false;
    this.draggingDiscovery = false;
  }

  public onKeyDown(code: string): void {
    if (code !== 'Space') return;
    this.sound.unlock();
    const firstPress = !this.spaceDown;
    this.spaceDown = true;

    if (!firstPress) return;
    if (this.phase === 'IDLE') {
      this.startCast();
    } else if (this.phase === 'BITE') {
      this.triggerHooked();
    } else if (this.phase === 'DISCOVERY' && this.phaseTime > 0.45) {
      this.collectDiscovery();
    }
  }

  public onKeyUp(code: string): void {
    if (code === 'Space') {
      this.spaceDown = false;
    }
  }

  private beginLeapAndCatch(): void {
    this.phase = 'LEAPING';
    this.phaseTime = 0;
    this.tugState = 'CALM';
    this.bobberGroup.visible = false;
    this.lineMesh.visible = false;

    const outcome =
      this.pendingOutcome ??
      this.state.pickCatchOutcome(
        this.state.currentPlanet,
        this.state.activeLure,
        this.inHotspot,
        this.spaceEventActive,
      );

    if (this.caughtFishInstance) {
      this.scene.remove(this.caughtFishInstance.group);
      this.caughtFishInstance = null;
    }
    if (this.caughtRelicMesh) {
      this.scene.remove(this.caughtRelicMesh);
      this.caughtRelicMesh = null;
    }

    this.leapStartPos.copy(this.bobberPos);

    if (outcome.kind === 'relic') {
      this.currentRelic = outcome.relic;
      this.currentSpecies = null;
      this.isNewSpecies = this.state.recordRelic(outcome.relic.id);
      this.caughtRelicMesh = createRelicMesh(outcome.relic);
      this.caughtRelicMesh.position.copy(this.leapStartPos);
      this.caughtRelicMesh.scale.setScalar(1.8);
      this.scene.add(this.caughtRelicMesh);

      this.state.notifyActivity('find_relic');
      this.sound.playMilestone();
    } else {
      this.currentRelic = null;
      this.currentSpecies = outcome.species;
      this.currentSize = outcome.size;
      this.currentStarlight = outcome.isStarlight;

      const res = this.state.recordCatch(outcome.species.id, outcome.size, outcome.isStarlight);
      this.isNewSpecies = res.isNewSpecies;

      this.caughtFishInstance = createFishMesh(outcome.species, {
        size: outcome.size,
        isStarlight: outcome.isStarlight,
      });
      this.caughtFishInstance.group.position.copy(this.leapStartPos);
      this.scene.add(this.caughtFishInstance.group);

      // Notify sequential research missions
      this.state.notifyActivity('catch_planet', this.state.currentPlanet);
      this.state.notifyActivity('catch_lure', this.state.activeLure);
      if (this.inHotspot) this.state.notifyActivity('catch_hotspot');
      if (this.spaceEventActive) this.state.notifyActivity('catch_event');
      if (outcome.size === 'jumbo' || outcome.isStarlight) this.state.notifyActivity('catch_special');

      if (res.unlockedMilestone || res.unlockedPluto) {
        this.sound.playMilestone();
        this.syncGearVisuals();
      } else {
        this.sound.playCatchFanfare(this.isNewSpecies);
      }
    }

    this.water.triggerRipple(this.bobberPos.x, this.bobberPos.z, 1.35);
    this.sound.playSplash();
    this.emitHud();
  }

  public update(dt: number, elapsed: number): void {
    this.phaseTime += dt;
    this.skyDome.update(elapsed);
    this.water.update(elapsed);

    this.ambientMotes.position.y = Math.sin(elapsed * 0.5) * 0.35;
    this.ambientMotes.rotation.y = elapsed * 0.015;

    if (this.warpArriveTimer > 0) {
      this.warpArriveTimer = Math.max(0, this.warpArriveTimer - dt);
    }

    // Sparkling Hotspot lifecycle
    this.hotspotTimer -= dt;
    if (this.hotspotTimer <= 0) {
      this.hotspotActive = !this.hotspotActive;
      this.hotspotGroup.visible = this.hotspotActive;
      if (this.hotspotActive) {
        const minZ = this.state.isMilestoneUnlocked('long_rod') ? -21 : -17;
        this.hotspotPos.set(
          (Math.random() - 0.5) * 14,
          0.09,
          minZ + Math.random() * 10,
        );
        this.hotspotGroup.position.copy(this.hotspotPos);
        this.hotspotTimer = 16.0;
      } else {
        this.hotspotTimer = 8.0;
      }
    }
    if (this.hotspotActive) {
      this.hotspotGroup.rotation.y = elapsed * 1.1;
      const pulse = 1 + Math.sin(elapsed * 4) * 0.08;
      this.hotspotGroup.scale.setScalar(pulse);
    }

    // Aqua Scanner Lens timer
    if (this.scannerTimer > 0) {
      this.scannerTimer = Math.max(0, this.scannerTimer - dt);
      const waveAge = (7.0 - this.scannerTimer) % 1.8;
      this.scannerWave.visible = true;
      this.scannerWave.scale.setScalar(1 + waveAge * 7.5);
      (this.scannerWave.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.75 - waveAge * 0.42);
      if (this.scannerTimer === 0) {
        this.scannerWave.visible = false;
        this.emitHud();
      }
    }

    // Update underwater shadow fish
    for (let i = 0; i < this.shadowFish.length; i++) {
      const sf = this.shadowFish[i];
      sf.scanRing.visible = this.scannerTimer > 0;
      sf.glow.scale.setScalar(this.scannerTimer > 0 ? 1.85 : 1.2);
      if (sf.scanRing.visible) {
        sf.scanRing.rotation.z = elapsed * 2;
      }

      if ((this.phase === 'WAITING' || this.phase === 'BITE') && i === this.activeShadowIndex) {
        const dx = this.bobberPos.x - sf.group.position.x;
        const dz = this.bobberPos.z - sf.group.position.z;
        const dist = Math.hypot(dx, dz);
        if (dist > 0.35) {
          sf.group.position.x += (dx / dist) * dt * 2.6;
          sf.group.position.z += (dz / dist) * dt * 2.6;
          sf.group.rotation.y = Math.atan2(dx, dz);
        }
      } else {
        sf.angle += sf.speed * dt;
        const nx = sf.center.x + Math.cos(sf.angle) * sf.radius;
        const nz = sf.center.z + Math.sin(sf.angle) * sf.radius * 0.7;
        const dx = nx - sf.group.position.x;
        const dz = nz - sf.group.position.z;
        sf.group.position.set(nx, sf.y + Math.sin(elapsed * 2 + i) * 0.06, nz);
        sf.group.rotation.y = Math.atan2(dx, dz);
      }
    }

    // Rod sway & bend
    const aimYaw = -this.aimTarget.x * 0.032;
    const bendTarget =
      this.phase === 'REELING'
        ? (this.tugState === 'DARTING' ? 0.48 : 0.3) + Math.sin(elapsed * 14) * 0.06
        : 0;
    this.rodPivot.rotation.y = THREE.MathUtils.lerp(this.rodPivot.rotation.y, aimYaw, dt * 6);
    this.rodPivot.rotation.x = THREE.MathUtils.lerp(this.rodPivot.rotation.x, -bendTarget, dt * 8);

    // Phase state machine
    if (this.phase === 'IDLE') {
      this.aimReticle.scale.setScalar(1 + Math.sin(elapsed * 4) * 0.08);
    } else if (this.phase === 'CASTING') {
      const t = Math.min(1, this.phaseTime / 0.55);
      this.bobberPos.lerpVectors(this.castStartPos, this.castTargetPos, t);
      this.bobberPos.y += Math.sin(t * Math.PI) * 2.8;
      this.bobberGroup.position.copy(this.bobberPos);
      if (t >= 1) {
        this.bobberPos.y = 0;
        const distToHotspot = Math.hypot(
          this.bobberPos.x - this.hotspotPos.x,
          this.bobberPos.z - this.hotspotPos.z,
        );
        this.inHotspot = this.hotspotActive && distToHotspot < 2.4;
        this.water.triggerRipple(this.bobberPos.x, this.bobberPos.z, this.inHotspot ? 1.5 : 1.15);
        if (this.inHotspot) {
          this.sound.playHotspotHit();
          this.hotspotActive = false;
          this.hotspotGroup.visible = false;
          this.hotspotTimer = 9.0;
        } else {
          this.sound.playSplash();
        }
        this.phase = 'WAITING';
        this.phaseTime = 0;
        this.waitTargetTime = this.inHotspot ? 0.95 : 1.9 + Math.random() * 1.3;
        this.nextNibbleTime = this.inHotspot ? 0.4 : 0.8;
        this.nibblesDone = 0;
        this.activeShadowIndex = Math.floor(Math.random() * this.shadowFish.length);
        this.emitHud();
      }
    } else if (this.phase === 'WAITING') {
      const bobY = Math.sin(elapsed * 3.2) * 0.05;
      this.bobberGroup.position.set(this.bobberPos.x, bobY, this.bobberPos.z);

      if (this.state.activeLure === 'sonar' && Math.random() < dt * 1.2) {
        this.water.triggerRipple(this.bobberPos.x, this.bobberPos.z, 0.5);
      }

      if (this.phaseTime >= this.nextNibbleTime && this.nibblesDone < 2) {
        this.nibblesDone++;
        this.nextNibbleTime = this.phaseTime + (this.inHotspot ? 0.45 : 0.85);
        this.water.triggerRipple(this.bobberPos.x, this.bobberPos.z, 0.65);
        this.bobberGroup.position.y = -0.14;
        this.sound.playNibble();
      }

      if (this.phaseTime >= this.waitTargetTime) {
        this.phase = 'BITE';
        this.phaseTime = 0;
        this.water.triggerRipple(this.bobberPos.x, this.bobberPos.z, 1.3);
        this.sound.playBite();
        this.emitHud();
      }
    } else if (this.phase === 'BITE') {
      const plunge = Math.sin(elapsed * 16) * 0.12 - 0.14;
      this.bobberGroup.position.set(this.bobberPos.x, plunge, this.bobberPos.z);
      this.bobberGlow.scale.setScalar(1.8 + Math.sin(elapsed * 14) * 0.35);
      if (this.phaseTime > 3.8) {
        this.phase = 'WAITING';
        this.phaseTime = 0;
        this.waitTargetTime = 1.8 + Math.random() * 1.0;
        this.nextNibbleTime = 0.7;
        this.nibblesDone = 0;
        this.bobberGlow.scale.set(1.3, 1.3, 1);
        this.emitHud();
      }
    } else if (this.phase === 'REELING') {
      const pulling = this.pointerDown || this.spaceDown;

      // Visual Tug-of-War cadence
      this.tugTimer -= dt;
      if (this.tugState === 'CALM' && this.tugTimer <= 0 && this.dartsRemaining > 0 && this.reelProgress < 0.82) {
        this.tugState = 'DARTING';
        this.tugTimer = 1.05;
        this.dartsRemaining--;
        this.sound.playAmberWarn();
      } else if (this.tugState === 'DARTING') {
        // Letting go calms the fish faster!
        const calmRate = pulling ? 1.0 : 1.7;
        this.tugTimer -= dt * (calmRate - 1.0);
        if (this.tugTimer <= 0) {
          this.tugState = 'CALM';
          this.tugTimer = 1.15;
        }
      }

      if (this.tugState === 'CALM') {
        this.lineMat.color.set(0x8ff9ff);
        this.bobberRingMat.color.set(0x7df9ff);
        if (pulling) {
          this.reelProgress = Math.min(1, this.reelProgress + dt * 0.52);
          this.sound.playReelTick(this.reelProgress);
          if (Math.random() < dt * 4.5) {
            this.water.triggerRipple(this.bobberPos.x, this.bobberPos.z, 0.75);
          }
        } else {
          this.reelProgress = Math.max(0.06, this.reelProgress - dt * 0.05);
        }
      } else {
        // DARTING (Amber): letting go keeps 100% progress safe; holding nudges back gently
        this.lineMat.color.set(0xffb84d);
        this.bobberRingMat.color.set(0xffb84d);
        if (pulling) {
          this.reelProgress = Math.max(0.08, this.reelProgress - dt * 0.08);
        }
        if (Math.random() < dt * 6.0) {
          this.water.triggerRipple(this.bobberPos.x, this.bobberPos.z, 0.95);
        }
      }

      this.bobberPos.x =
        THREE.MathUtils.lerp(this.castTargetPos.x, 0, this.reelProgress * 0.72) +
        Math.sin(elapsed * (this.tugState === 'DARTING' ? 18 : 10)) * (this.tugState === 'DARTING' ? 0.52 : pulling ? 0.32 : 0.1);
      this.bobberPos.z = THREE.MathUtils.lerp(this.castTargetPos.z, -2.8, this.reelProgress);
      this.bobberGroup.position.set(this.bobberPos.x, -0.05 + Math.sin(elapsed * 14) * 0.06, this.bobberPos.z);

      this.emitHud();

      if (this.reelProgress >= 1) {
        this.lineMat.color.set(0xb0f8ff);
        this.beginLeapAndCatch();
      }
    } else if (this.phase === 'LEAPING') {
      const t = Math.min(1, this.phaseTime / 0.85);
      const targetPos = new THREE.Vector3(0, 2.35, 0.6);
      const pos = new THREE.Vector3().lerpVectors(this.leapStartPos, targetPos, t);
      pos.y += Math.sin(t * Math.PI) * 2.2;

      if (this.caughtFishInstance) {
        this.caughtFishInstance.group.position.copy(pos);
        this.caughtFishInstance.group.rotation.y = THREE.MathUtils.lerp(0, 0.65, t);
        this.caughtFishInstance.update(dt, elapsed, 1.0);
      } else if (this.caughtRelicMesh) {
        this.caughtRelicMesh.position.copy(pos);
        this.caughtRelicMesh.rotation.y = elapsed * 2;
      }

      if (t >= 1) {
        this.phase = 'DISCOVERY';
        this.phaseTime = 0;
        this.discoveryBubbleGroup.visible = true;
        this.discoverySpinY = 0.65;
        this.discoverySpinX = 0.08;
        this.emitHud();
      }
    } else if (this.phase === 'DISCOVERY') {
      if (!this.draggingDiscovery) {
        this.discoverySpinY += dt * 0.55;
      }
      const floatY = 2.35 + Math.sin(elapsed * 2.2) * 0.07;
      if (this.caughtFishInstance) {
        this.caughtFishInstance.group.position.set(0, floatY, 0.6);
        this.caughtFishInstance.group.rotation.set(this.discoverySpinX, this.discoverySpinY, 0);
        this.caughtFishInstance.update(dt, elapsed, 0.45);
      } else if (this.caughtRelicMesh) {
        this.caughtRelicMesh.position.set(0, floatY, 0.6);
        this.caughtRelicMesh.rotation.set(this.discoverySpinX, this.discoverySpinY, 0);
      }
      this.discoveryBubbleGroup.rotation.y = elapsed * 0.35;
    }

    if (this.lineMesh.visible) {
      const tipWorld = new THREE.Vector3();
      this.rodTipAnchor.getWorldPosition(tipWorld);
      const endPos = this.bobberGroup.position;
      const mid = new THREE.Vector3().addVectors(tipWorld, endPos).multiplyScalar(0.5);
      mid.y -= this.phase === 'REELING' ? 0.12 : 0.65;

      const attr = this.lineMesh.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i <= 14; i++) {
        const u = i / 14;
        const omt = 1 - u;
        const x = omt * omt * tipWorld.x + 2 * omt * u * mid.x + u * u * endPos.x;
        const y = omt * omt * tipWorld.y + 2 * omt * u * mid.y + u * u * endPos.y;
        const z = omt * omt * tipWorld.z + 2 * omt * u * mid.z + u * u * endPos.z;
        attr.setXYZ(i, x, y, z);
      }
      attr.needsUpdate = true;
    }

    const desiredCamPos =
      this.phase === 'DISCOVERY'
        ? new THREE.Vector3(0, 2.55, 4.15)
        : new THREE.Vector3(0, 3.3 + this.warpArriveTimer * 2.2, 5.4 + this.warpArriveTimer * 3.0);
    const desiredLook =
      this.phase === 'DISCOVERY'
        ? new THREE.Vector3(0, 2.22, 0.6)
        : new THREE.Vector3(0, 0.7, -9);

    this.camera.position.lerp(desiredCamPos, Math.min(1, dt * 5));
    this.camera.lookAt(desiredLook);
  }
}
