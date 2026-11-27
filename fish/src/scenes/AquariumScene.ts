import * as THREE from 'three';
import { SoundManager } from '../audio/SoundManager';
import { FishSpecies } from '../data/fish';
import { PlanetId, PLANET_MAP } from '../data/planets';
import { RELIC_MAP } from '../data/relics';
import { createFishMesh, createRelicMesh, FishInstance } from '../graphics/FishFactory';
import { getCausticTexture, getGlowTexture } from '../graphics/textures';
import { GameState } from '../state/GameState';
import { GameScene } from './SceneTypes';

interface TankFish {
  instance: FishInstance;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  target: THREE.Vector3;
  retargetTimer: number;
  hitSphere: THREE.Mesh;
}

interface FoodMote {
  mesh: THREE.Mesh;
  velY: number;
  alive: boolean;
}

interface TankBubble {
  mesh: THREE.Mesh;
  speed: number;
  baseX: number;
  baseZ: number;
  isJet?: boolean;
}

export class AquariumScene implements GameScene {
  public readonly scene = new THREE.Scene();
  public readonly camera: THREE.PerspectiveCamera;

  private tankFish: TankFish[] = [];
  private hitMeshes: THREE.Mesh[] = [];
  private relicGroup = new THREE.Group();
  private milestoneDecorGroup = new THREE.Group();
  private foodMotes: FoodMote[] = [];
  private bubbles: TankBubble[] = [];
  private jetBubbles: TankBubble[] = [];
  private causticMat!: THREE.MeshBasicMaterial;
  private causticTex: THREE.CanvasTexture;
  private hemiLight: THREE.HemisphereLight;
  private tankLight: THREE.PointLight;
  private selectRing: THREE.Mesh;

  // Light-Chime pulse ring
  private chimeWave!: THREE.Mesh;
  private chimeTimer = 0;
  private bubbleJetTimer = 0;

  private selectedFish: FishSpecies | null = null;
  private filterPlanet: PlanetId | 'all' = 'all';

  private orbitYaw = 0;
  private orbitPitch = 0.08;
  private dragging = false;
  private movedWhileDown = false;
  private lastX = 0;
  private lastY = 0;
  private raycaster = new THREE.Raycaster();

  private onSelectFish?: (species: FishSpecies | null) => void;

  constructor(
    private state: GameState,
    private sound: SoundManager,
    onSelectFish?: (species: FishSpecies | null) => void,
  ) {
    this.onSelectFish = onSelectFish;
    this.camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.1, 140);
    this.camera.position.set(0, 1.8, 12.2);
    this.camera.lookAt(0, 0.8, 0);

    this.scene.background = new THREE.Color('#071324');
    this.hemiLight = new THREE.HemisphereLight(0x8ae8ff, 0x162c44, 1.35);
    const keyLight = new THREE.DirectionalLight(0xfff1d6, 1.35);
    keyLight.position.set(6, 12, 10);
    this.tankLight = new THREE.PointLight(0x70ecff, 2.0, 26);
    this.tankLight.position.set(0, 5.2, 2);
    this.scene.add(this.hemiLight, keyLight, this.tankLight);

    this.causticTex = getCausticTexture();
    this.buildObservatoryTank();

    this.scene.add(this.relicGroup, this.milestoneDecorGroup);

    this.selectRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.85, 0.03, 8, 32),
      new THREE.MeshBasicMaterial({ color: 0xffdf78, transparent: true, opacity: 0.9 }),
    );
    this.selectRing.rotation.x = Math.PI / 2;
    this.selectRing.visible = false;
    this.scene.add(this.selectRing);

    this.chimeWave = new THREE.Mesh(
      new THREE.TorusGeometry(0.6, 0.06, 10, 40),
      new THREE.MeshBasicMaterial({ color: 0xffe485, transparent: true, opacity: 0.85 }),
    );
    this.chimeWave.rotation.x = Math.PI / 2;
    this.chimeWave.position.set(0, 0.7, 0);
    this.chimeWave.visible = false;
    this.scene.add(this.chimeWave);
  }

  public setSelectCallback(cb: (species: FishSpecies | null) => void): void {
    this.onSelectFish = cb;
  }

  private buildObservatoryTank(): void {
    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xd6a656,
      metalness: 0.72,
      roughness: 0.28,
    });
    const sandMat = new THREE.MeshStandardMaterial({
      color: 0x264b66,
      roughness: 0.85,
    });

    const starCount = 340;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPos[i * 3] = (Math.random() - 0.5) * 60;
      starPos[i * 3 + 1] = (Math.random() - 0.5) * 32 + 4;
      starPos[i * 3 + 2] = -14 - Math.random() * 25;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    this.scene.add(
      new THREE.Points(
        starGeo,
        new THREE.PointsMaterial({
          color: 0xffffff,
          size: 0.7,
          map: getGlowTexture(),
          transparent: true,
          opacity: 0.75,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      ),
    );

    const floor = new THREE.Mesh(new THREE.BoxGeometry(13.6, 0.5, 7.2), sandMat);
    floor.position.set(0, -2.55, 0);
    this.scene.add(floor);

    this.causticMat = new THREE.MeshBasicMaterial({
      map: this.causticTex,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const causticPlane = new THREE.Mesh(new THREE.PlaneGeometry(13.2, 6.8), this.causticMat);
    causticPlane.rotation.x = -Math.PI / 2;
    causticPlane.position.set(0, -2.28, 0);
    this.scene.add(causticPlane);

    const bottomFrame = new THREE.Mesh(new THREE.BoxGeometry(14.0, 0.3, 7.6), brassMat);
    bottomFrame.position.set(0, -2.65, 0);
    const topFrame = new THREE.Mesh(new THREE.BoxGeometry(14.0, 0.25, 7.6), brassMat);
    topFrame.position.set(0, 4.45, 0);
    this.scene.add(bottomFrame, topFrame);

    const corners = [
      [-6.85, -3.65],
      [6.85, -3.65],
      [-6.85, 3.65],
      [6.85, 3.65],
    ];
    for (const [cx, cz] of corners) {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 7.2, 12), brassMat);
      col.position.set(cx, 0.9, cz);
      this.scene.add(col);
    }

    const glassBack = new THREE.Mesh(
      new THREE.PlaneGeometry(13.7, 7.0),
      new THREE.MeshBasicMaterial({
        color: 0x16537e,
        transparent: true,
        opacity: 0.28,
        side: THREE.DoubleSide,
      }),
    );
    glassBack.position.set(0, 0.9, -3.65);
    this.scene.add(glassBack);

    const kelpMat = new THREE.MeshStandardMaterial({
      color: 0x3bd4a8,
      emissive: 0x156e5c,
      emissiveIntensity: 0.35,
      roughness: 0.45,
    });
    const coralMat = new THREE.MeshStandardMaterial({
      color: 0xff9466,
      emissive: 0x7a3419,
      emissiveIntensity: 0.3,
      roughness: 0.5,
    });
    for (let i = 0; i < 6; i++) {
      const x = -5.2 + i * 2.1;
      const z = i % 2 === 0 ? -1.8 : 1.3;
      const h = 1.4 + (i % 3) * 0.75;
      const stalk = new THREE.Mesh(new THREE.ConeGeometry(0.24, h, 8), i % 2 === 0 ? kelpMat : coralMat);
      stalk.position.set(x, -2.3 + h * 0.5, z);
      this.scene.add(stalk);
    }

    const bubbleGeo = new THREE.SphereGeometry(0.08, 8, 8);
    const bubbleMat = new THREE.MeshBasicMaterial({
      color: 0xc2f8ff,
      transparent: true,
      opacity: 0.52,
    });
    for (let i = 0; i < 24; i++) {
      const m = new THREE.Mesh(bubbleGeo, bubbleMat);
      const bx = -5.2 + (i % 4) * 3.4 + (Math.random() - 0.5) * 0.5;
      const bz = -1.6 + (i % 3) * 1.4;
      m.position.set(bx, -2.1 + Math.random() * 6.0, bz);
      m.scale.setScalar(0.6 + Math.random() * 0.9);
      this.scene.add(m);
      this.bubbles.push({
        mesh: m,
        speed: 0.75 + Math.random() * 0.65,
        baseX: bx,
        baseZ: bz,
      });
    }

    // Center Bubble Jet pool (hidden until triggered)
    for (let i = 0; i < 28; i++) {
      const m = new THREE.Mesh(bubbleGeo, bubbleMat);
      const bx = (Math.random() - 0.5) * 1.1;
      const bz = (Math.random() - 0.5) * 1.1;
      m.position.set(bx, -2.2 + Math.random() * 5.8, bz);
      m.scale.setScalar(0.8 + Math.random() * 1.1);
      m.visible = false;
      this.scene.add(m);
      this.jetBubbles.push({
        mesh: m,
        speed: 2.6 + Math.random() * 1.4,
        baseX: bx,
        baseZ: bz,
        isJet: true,
      });
    }
  }

  private syncRelicsAndDecor(): void {
    while (this.relicGroup.children.length > 0) {
      this.relicGroup.remove(this.relicGroup.children.pop()!);
    }
    while (this.milestoneDecorGroup.children.length > 0) {
      this.milestoneDecorGroup.remove(this.milestoneDecorGroup.children.pop()!);
    }

    for (const rid of this.state.relics) {
      const relic = RELIC_MAP[rid];
      if (!relic) continue;
      const mesh = createRelicMesh(relic);
      mesh.position.set(...relic.tankPos);
      this.relicGroup.add(mesh);
    }

    if (this.state.isMilestoneUnlocked('coral_arch')) {
      const arch = new THREE.Mesh(
        new THREE.TorusGeometry(2.3, 0.24, 10, 28, Math.PI),
        new THREE.MeshStandardMaterial({
          color: 0xff8a7a,
          emissive: 0x3bd4c2,
          emissiveIntensity: 0.4,
          roughness: 0.35,
        }),
      );
      arch.position.set(0, -2.3, -0.8);
      this.milestoneDecorGroup.add(arch);
    }
  }

  public syncFish(): void {
    for (const tf of this.tankFish) {
      this.scene.remove(tf.instance.group);
    }
    this.tankFish = [];
    this.hitMeshes = [];

    const allCaught = this.state.getAllCaughtSpecies();
    const visible =
      this.filterPlanet === 'all'
        ? allCaught
        : allCaught.filter((f) => f.planetId === this.filterPlanet);

    for (const species of visible) {
      const rec = this.state.getCatchRecord(species.id);
      const instance = createFishMesh(species, {
        size: rec?.bestSize ?? 'regular',
        isStarlight: Boolean(rec?.hasStarlight),
      });
      const yBand =
        species.preferredDepth === 'surface'
          ? 2.2
          : species.preferredDepth === 'mid'
            ? 0.6
            : -1.0;
      const pos = new THREE.Vector3(
        (Math.random() - 0.5) * 9.5,
        yBand + (Math.random() - 0.5) * 0.9,
        (Math.random() - 0.5) * 4.5,
      );
      instance.group.position.copy(pos);

      const hitSphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.95, 8, 8),
        new THREE.MeshBasicMaterial({ visible: false }),
      );
      hitSphere.userData.speciesId = species.id;
      instance.group.add(hitSphere);
      this.hitMeshes.push(hitSphere);

      this.scene.add(instance.group);
      this.tankFish.push({
        instance,
        pos,
        vel: new THREE.Vector3((Math.random() - 0.5) * 1.2, 0, (Math.random() - 0.5) * 1.2),
        target: this.randomTankPoint(species),
        retargetTimer: 2 + Math.random() * 3,
        hitSphere,
      });
    }

    this.syncRelicsAndDecor();

    if (this.selectedFish && !visible.some((f) => f.id === this.selectedFish!.id)) {
      this.selectedFish = null;
      this.selectRing.visible = false;
      this.onSelectFish?.(null);
    }
  }

  private randomTankPoint(species: FishSpecies): THREE.Vector3 {
    const baseY =
      species.preferredDepth === 'surface'
        ? 2.3
        : species.preferredDepth === 'mid'
          ? 0.7
          : -0.9;
    return new THREE.Vector3(
      (Math.random() - 0.5) * 10.2,
      THREE.MathUtils.clamp(baseY + (Math.random() - 0.5) * 1.4, -1.7, 3.3),
      (Math.random() - 0.5) * 4.8,
    );
  }

  public setPlanetFilter(filter: PlanetId | 'all'): void {
    this.filterPlanet = filter;
    if (filter === 'all') {
      this.hemiLight.color.set('#8ae8ff');
      this.tankLight.color.set('#70ecff');
    } else {
      const p = PLANET_MAP[filter];
      this.hemiLight.color.set(p.ambientColor);
      this.tankLight.color.set(p.accentColor);
    }
    this.syncFish();
  }

  public dropFood(): void {
    this.sound.playFeed();
    this.state.notifyActivity('feed_tank');
    const moteGeo = new THREE.SphereGeometry(0.11, 8, 8);
    const moteMat = new THREE.MeshBasicMaterial({ color: 0xffe47a });
    for (let i = 0; i < 8; i++) {
      const m = new THREE.Mesh(moteGeo, moteMat);
      m.position.set((Math.random() - 0.5) * 8.5, 3.9 + Math.random() * 0.4, (Math.random() - 0.5) * 3.8);
      this.scene.add(m);
      this.foodMotes.push({
        mesh: m,
        velY: -0.55 - Math.random() * 0.35,
        alive: true,
      });
    }
  }

  public triggerBubbleJet(): void {
    this.bubbleJetTimer = 5.0;
    this.sound.playBubbleJet();
    this.state.notifyActivity('bubble_tank');
    for (const jb of this.jetBubbles) {
      jb.mesh.visible = true;
    }
  }

  public triggerLightChime(): void {
    this.chimeTimer = 1.6;
    this.chimeWave.visible = true;
    this.chimeWave.scale.setScalar(1);
    const count = Math.min(5, Math.max(1, this.tankFish.length));
    for (let i = 0; i < count; i++) {
      window.setTimeout(() => this.sound.playLightChime(i), i * 110);
    }
  }

  public clearSelection(): void {
    this.selectedFish = null;
    this.selectRing.visible = false;
    this.onSelectFish?.(null);
  }

  public enter(): void {
    this.selectedFish = null;
    this.selectRing.visible = false;
    this.syncFish();
  }

  public exit(): void {
    this.dragging = false;
    document.body.style.cursor = 'default';
  }

  public resize(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  public onPointerDown(ndcX: number, ndcY: number): void {
    this.dragging = true;
    this.movedWhileDown = false;
    this.lastX = ndcX;
    this.lastY = ndcY;
  }

  public onPointerMove(ndcX: number, ndcY: number, isDown: boolean): void {
    if (this.dragging && isDown) {
      const dx = ndcX - this.lastX;
      const dy = ndcY - this.lastY;
      if (Math.abs(dx) + Math.abs(dy) > 0.008) {
        this.movedWhileDown = true;
      }
      this.orbitYaw = THREE.MathUtils.clamp(this.orbitYaw - dx * 1.8, -0.75, 0.75);
      this.orbitPitch = THREE.MathUtils.clamp(this.orbitPitch - dy * 0.9, -0.18, 0.42);
      this.lastX = ndcX;
      this.lastY = ndcY;
      return;
    }

    this.raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), this.camera);
    const hits = this.raycaster.intersectObjects(this.hitMeshes, false);
    document.body.style.cursor = hits.length > 0 ? 'pointer' : 'grab';
  }

  public onPointerUp(ndcX: number, ndcY: number): void {
    const wasClick = !this.movedWhileDown;
    this.dragging = false;
    if (!wasClick) return;

    this.raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), this.camera);
    const hits = this.raycaster.intersectObjects(this.hitMeshes, false);
    if (hits.length > 0) {
      const sid = hits[0].object.userData.speciesId as string;
      const found = this.tankFish.find((t) => t.instance.species.id === sid);
      if (found) {
        this.selectedFish = found.instance.species;
        this.selectRing.visible = true;
        this.sound.playClick();
        this.onSelectFish?.(this.selectedFish);
      }
    } else if (this.selectedFish) {
      this.clearSelection();
    }
  }

  public update(dt: number, elapsed: number): void {
    this.causticTex.offset.x = elapsed * 0.03;
    this.causticTex.offset.y = Math.sin(elapsed * 0.4) * 0.04;

    for (const b of this.bubbles) {
      b.mesh.position.y += b.speed * dt;
      b.mesh.position.x = b.baseX + Math.sin(elapsed * 2.2 + b.baseZ) * 0.12;
      if (b.mesh.position.y > 4.0) {
        b.mesh.position.y = -2.2;
      }
    }

    if (this.bubbleJetTimer > 0) {
      this.bubbleJetTimer = Math.max(0, this.bubbleJetTimer - dt);
      for (const jb of this.jetBubbles) {
        jb.mesh.position.y += jb.speed * dt;
        jb.mesh.position.x = jb.baseX + Math.sin(elapsed * 6 + jb.baseZ) * 0.18;
        if (jb.mesh.position.y > 4.0) jb.mesh.position.y = -2.2;
      }
      if (this.bubbleJetTimer === 0) {
        for (const jb of this.jetBubbles) jb.mesh.visible = false;
      }
    }

    if (this.chimeTimer > 0) {
      this.chimeTimer = Math.max(0, this.chimeTimer - dt);
      const age = 1.6 - this.chimeTimer;
      this.chimeWave.scale.setScalar(1 + age * 6.5);
      (this.chimeWave.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.85 - age * 0.55);
      this.tankLight.intensity = 2.0 + Math.sin(age * 8) * 1.4;
      if (this.chimeTimer === 0) {
        this.chimeWave.visible = false;
        this.tankLight.intensity = 2.0;
      }
    }

    // Gently rotate relics
    this.relicGroup.children.forEach((r, idx) => {
      r.rotation.y = elapsed * 0.55 + idx;
    });

    for (let i = this.foodMotes.length - 1; i >= 0; i--) {
      const m = this.foodMotes[i];
      m.mesh.position.y += m.velY * dt;
      if (m.mesh.position.y < -2.1) {
        m.alive = false;
      }
      if (!m.alive) {
        this.scene.remove(m.mesh);
        this.foodMotes.splice(i, 1);
      }
    }

    for (const tf of this.tankFish) {
      tf.retargetTimer -= dt;

      let nearestFood: FoodMote | null = null;
      let nearestDist = 5.5;
      for (const fm of this.foodMotes) {
        const d = tf.pos.distanceTo(fm.mesh.position);
        if (d < nearestDist) {
          nearestDist = d;
          nearestFood = fm;
        }
      }

      if (nearestFood) {
        tf.target.copy(nearestFood.mesh.position);
        if (nearestDist < 0.55) {
          nearestFood.alive = false;
          this.sound.playNibble();
        }
      } else if (this.bubbleJetTimer > 0 && tf.pos.distanceTo(new THREE.Vector3(0, 1.0, 0)) < 4.5) {
        tf.target.set(Math.sin(elapsed * 2 + tf.pos.z) * 0.8, 3.1, Math.cos(elapsed * 2) * 0.6);
      } else if (tf.retargetTimer <= 0 || tf.pos.distanceTo(tf.target) < 0.75) {
        tf.target.copy(this.randomTankPoint(tf.instance.species));
        tf.retargetTimer = 2.5 + Math.random() * 3.5;
      }

      const desired = new THREE.Vector3().subVectors(tf.target, tf.pos);
      const dist = desired.length();
      if (dist > 0.001) {
        const speed = tf.instance.species.swimSpeed * (nearestFood || this.bubbleJetTimer > 0 ? 2.0 : 1.15);
        desired.normalize().multiplyScalar(speed);
        tf.vel.lerp(desired, Math.min(1, dt * 1.9));
      }

      tf.pos.addScaledVector(tf.vel, dt);
      tf.pos.x = THREE.MathUtils.clamp(tf.pos.x, -5.8, 5.8);
      tf.pos.y = THREE.MathUtils.clamp(tf.pos.y, -1.8, 3.5);
      tf.pos.z = THREE.MathUtils.clamp(tf.pos.z, -2.8, 2.8);
      tf.instance.group.position.copy(tf.pos);

      if (tf.vel.lengthSq() > 0.01) {
        const lookPt = tf.pos.clone().add(tf.vel);
        tf.instance.group.lookAt(lookPt);
      }
      tf.instance.update(dt, elapsed, nearestFood || this.chimeTimer > 0 ? 0.9 : 0.35);

      if (this.selectedFish && tf.instance.species.id === this.selectedFish.id) {
        this.selectRing.position.set(tf.pos.x, tf.pos.y - 0.55, tf.pos.z);
        this.selectRing.rotation.z = elapsed * 1.8;
      }
    }

    const radius = 12.2;
    const camX = Math.sin(this.orbitYaw) * radius;
    const camZ = Math.cos(this.orbitYaw) * radius;
    const camY = 1.6 + this.orbitPitch * 5.0;
    this.camera.position.lerp(new THREE.Vector3(camX, camY, camZ), Math.min(1, dt * 6));
    this.camera.lookAt(0, 0.85, 0);
  }
}
