import * as THREE from 'three';
import { SoundManager } from '../audio/SoundManager';
import { PlanetConfig, PlanetId, PLANETS } from '../data/planets';
import { getGlowTexture, getPlanetTexture, getSaturnRingTexture } from '../graphics/textures';
import { GameState } from '../state/GameState';
import { GameScene } from './SceneTypes';

interface OrreryNode {
  planet: PlanetConfig;
  orbitGroup: THREE.Group;
  planetGroup: THREE.Group;
  mesh: THREE.Mesh;
  hitSphere: THREE.Mesh;
  reticle: THREE.Mesh;
  pipMeshes: THREE.Mesh[];
  angle: number;
}

export class OrreryScene implements GameScene {
  public readonly scene = new THREE.Scene();
  public readonly camera: THREE.PerspectiveCamera;

  private nodes: OrreryNode[] = [];
  private sunGroup = new THREE.Group();
  private starPoints!: THREE.Points;
  private warpStreaks!: THREE.Points;
  private hoveredId: PlanetId | null = null;
  private warpingTo: PlanetId | null = null;
  private warpProgress = 0;

  private raycaster = new THREE.Raycaster();
  private hitMeshes: THREE.Mesh[] = [];
  private defaultCamPos = new THREE.Vector3(0, 21.5, 29.5);

  private onHoverChange?: (planet: PlanetConfig | null) => void;
  private onWarpComplete?: (planetId: PlanetId) => void;

  constructor(
    private state: GameState,
    private sound: SoundManager,
    callbacks?: {
      onHoverChange?: (planet: PlanetConfig | null) => void;
      onWarpComplete?: (planetId: PlanetId) => void;
    },
  ) {
    this.onHoverChange = callbacks?.onHoverChange;
    this.onWarpComplete = callbacks?.onWarpComplete;

    this.camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.1, 260);
    this.camera.position.copy(this.defaultCamPos);
    this.camera.lookAt(0, 0, 0);

    this.scene.background = new THREE.Color('#040714');
    const ambient = new THREE.AmbientLight(0x6d82b5, 0.85);
    const sunLight = new THREE.PointLight(0xffe1a6, 3.2, 95, 0.5);
    this.scene.add(ambient, sunLight);

    this.buildStarfield();
    this.buildSun();
    this.buildOrbitsAndPlanets();
    this.buildWarpStreaks();
  }

  public setCallbacks(
    onHoverChange: (planet: PlanetConfig | null) => void,
    onWarpComplete: (planetId: PlanetId) => void,
  ): void {
    this.onHoverChange = onHoverChange;
    this.onWarpComplete = onWarpComplete;
  }

  private buildStarfield(): void {
    const count = 700;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 60 + Math.random() * 60;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.cos(phi);
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.starPoints = new THREE.Points(
      geo,
      new THREE.PointsMaterial({
        color: 0xffffff,
        size: 1.1,
        map: getGlowTexture(),
        transparent: true,
        opacity: 0.78,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    this.scene.add(this.starPoints);
  }

  private buildSun(): void {
    const core = new THREE.Mesh(
      new THREE.SphereGeometry(1.7, 28, 20),
      new THREE.MeshBasicMaterial({ color: 0xffd77a }),
    );
    const corona = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: getGlowTexture(),
        color: 0xffb347,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    corona.scale.set(7.5, 7.5, 1);
    this.sunGroup.add(core, corona);
    this.scene.add(this.sunGroup);
  }

  private buildOrbitsAndPlanets(): void {
    const brassRingMat = new THREE.MeshBasicMaterial({
      color: 0xd6a656,
      transparent: true,
      opacity: 0.28,
      side: THREE.DoubleSide,
    });

    for (const planet of PLANETS) {
      const orbitRing = new THREE.Mesh(
        new THREE.RingGeometry(planet.orbitRadius - 0.035, planet.orbitRadius + 0.035, 96),
        brassRingMat,
      );
      orbitRing.rotation.x = Math.PI / 2;
      this.scene.add(orbitRing);

      const orbitGroup = new THREE.Group();
      this.scene.add(orbitGroup);

      const planetGroup = new THREE.Group();
      orbitGroup.add(planetGroup);

      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(planet.planetRadius, 24, 18),
        new THREE.MeshStandardMaterial({
          map: getPlanetTexture(planet.id),
          roughness: 0.55,
          metalness: 0.1,
          emissive: new THREE.Color(planet.planetColor),
          emissiveIntensity: 0.22,
          transparent: Boolean(planet.isSecret),
          opacity: 1,
        }),
      );
      planetGroup.add(mesh);

      if (planet.hasRings) {
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(planet.planetRadius * 1.32, planet.planetRadius * 2.1, 36),
          new THREE.MeshBasicMaterial({
            map: getSaturnRingTexture(),
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.78,
            depthWrite: false,
          }),
        );
        ring.rotation.x = Math.PI / 2.4;
        planetGroup.add(ring);
      }

      const hitSphere = new THREE.Mesh(
        new THREE.SphereGeometry(Math.max(1.25, planet.planetRadius * 2.15), 12, 10),
        new THREE.MeshBasicMaterial({ visible: false }),
      );
      hitSphere.userData.planetId = planet.id;
      planetGroup.add(hitSphere);
      this.hitMeshes.push(hitSphere);

      const reticle = new THREE.Mesh(
        new THREE.TorusGeometry(planet.planetRadius * 1.65, 0.04, 8, 36),
        new THREE.MeshBasicMaterial({ color: 0xffe07d, transparent: true, opacity: 0.9 }),
      );
      reticle.rotation.x = Math.PI / 2.2;
      reticle.visible = false;
      planetGroup.add(reticle);

      const pipMeshes: THREE.Mesh[] = [];
      for (let i = 0; i < 4; i++) {
        const pip = new THREE.Mesh(
          new THREE.SphereGeometry(0.11, 8, 8),
          new THREE.MeshBasicMaterial({ color: 0x3b4d6b }),
        );
        pip.position.set((i - 1.5) * 0.34, -planet.planetRadius - 0.55, 0);
        planetGroup.add(pip);
        pipMeshes.push(pip);
      }

      this.nodes.push({
        planet,
        orbitGroup,
        planetGroup,
        mesh,
        hitSphere,
        reticle,
        pipMeshes,
        angle: planet.initialAngle,
      });
    }
  }

  private buildWarpStreaks(): void {
    const count = 220;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 1.5 + Math.random() * 14;
      pos[i * 3] = Math.cos(a) * r;
      pos[i * 3 + 1] = Math.sin(a) * r;
      pos[i * 3 + 2] = -Math.random() * 45;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.warpStreaks = new THREE.Points(
      geo,
      new THREE.PointsMaterial({
        color: 0xaaf7ff,
        size: 0.55,
        map: getGlowTexture(),
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    this.warpStreaks.visible = false;
    this.scene.add(this.warpStreaks);
  }

  private refreshStateVisuals(): void {
    const plutoUnlocked = this.state.isPlutoUnlocked();
    for (const node of this.nodes) {
      const mat = node.mesh.material as THREE.MeshStandardMaterial;
      if (node.planet.isSecret) {
        mat.opacity = plutoUnlocked ? 1.0 : 0.42;
        mat.emissive.set(plutoUnlocked ? node.planet.planetColor : '#5e4ca8');
      }
      const caughtCount = this.state.getCaughtCountForPlanet(node.planet.id);
      node.pipMeshes.forEach((pip, idx) => {
        pip.visible = !node.planet.isSecret || plutoUnlocked;
        const pmat = pip.material as THREE.MeshBasicMaterial;
        pmat.color.set(idx < caughtCount ? '#7cf7c9' : '#2a3954');
      });
    }
  }

  public enter(): void {
    this.warpingTo = null;
    this.warpProgress = 0;
    this.warpStreaks.visible = false;
    this.camera.position.copy(this.defaultCamPos);
    this.camera.lookAt(0, 0, 0);
    this.hoveredId = this.state.currentPlanet;
    this.refreshStateVisuals();
    this.onHoverChange?.(PLANETS.find((p) => p.id === this.state.currentPlanet) ?? null);
  }

  public exit(): void {
    this.warpingTo = null;
    this.warpStreaks.visible = false;
  }

  public resize(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  private pickPlanet(ndcX: number, ndcY: number): PlanetId | null {
    this.raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), this.camera);
    const hits = this.raycaster.intersectObjects(this.hitMeshes, false);
    if (hits.length > 0) {
      return (hits[0].object.userData.planetId as PlanetId) ?? null;
    }
    return null;
  }

  public onPointerMove(ndcX: number, ndcY: number): void {
    if (this.warpingTo) return;
    const picked = this.pickPlanet(ndcX, ndcY);
    if (picked !== this.hoveredId) {
      this.hoveredId = picked;
      const cfg = picked ? PLANETS.find((p) => p.id === picked) ?? null : null;
      this.onHoverChange?.(cfg);
      document.body.style.cursor = picked ? 'pointer' : 'default';
    }
  }

  public onPointerDown(ndcX: number, ndcY: number): void {
    if (this.warpingTo) return;
    const picked = this.pickPlanet(ndcX, ndcY);
    if (picked) {
      if (picked === 'pluto' && !this.state.isPlutoUnlocked()) {
        this.hoveredId = 'pluto';
        this.onHoverChange?.(PLANETS.find((p) => p.id === 'pluto') ?? null);
        this.sound.playAmberWarn();
        return;
      }
      this.startWarpTo(picked);
    }
  }

  public startWarpTo(planetId: PlanetId): void {
    if (planetId === 'pluto' && !this.state.isPlutoUnlocked()) {
      this.sound.playAmberWarn();
      return;
    }
    this.warpingTo = planetId;
    this.warpProgress = 0;
    this.warpStreaks.visible = true;
    document.body.style.cursor = 'default';
    this.sound.playWarp();
  }

  public update(dt: number, elapsed: number): void {
    this.starPoints.rotation.y = elapsed * 0.008;
    this.sunGroup.rotation.y = elapsed * 0.25;

    for (const node of this.nodes) {
      if (!this.warpingTo) {
        node.angle += node.planet.orbitSpeed * dt * 0.55;
      }
      const x = Math.cos(node.angle) * node.planet.orbitRadius;
      const z = Math.sin(node.angle) * node.planet.orbitRadius;
      node.planetGroup.position.set(x, 0, z);
      node.mesh.rotation.y += dt * 0.4;

      const isHovered = this.hoveredId === node.planet.id;
      const isCurrent = this.state.currentPlanet === node.planet.id;
      node.reticle.visible = isHovered || isCurrent || (Boolean(node.planet.isSecret) && !this.state.isPlutoUnlocked());
      node.reticle.rotation.z = elapsed * 1.4;
      const targetScale = isHovered ? 1.24 : 1.0;
      node.mesh.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), dt * 8);
    }

    if (this.warpingTo) {
      this.warpProgress = Math.min(1, this.warpProgress + dt / 1.15);
      const targetNode = this.nodes.find((n) => n.planet.id === this.warpingTo)!;
      const worldPos = new THREE.Vector3();
      targetNode.planetGroup.getWorldPosition(worldPos);

      this.camera.position.lerpVectors(
        this.defaultCamPos,
        worldPos.clone().add(new THREE.Vector3(0, 0.8, 2.2)),
        this.warpProgress * this.warpProgress,
      );
      this.camera.lookAt(worldPos);

      const attr = this.warpStreaks.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < attr.count; i++) {
        let z = attr.getZ(i) + dt * 55;
        if (z > 5) z = -45;
        attr.setZ(i, z);
      }
      attr.needsUpdate = true;
      this.warpStreaks.position.copy(this.camera.position);
      this.warpStreaks.lookAt(worldPos);

      if (this.warpProgress >= 1) {
        const dest = this.warpingTo;
        this.warpingTo = null;
        this.warpStreaks.visible = false;
        this.onWarpComplete?.(dest);
      }
    }
  }
}
