import * as THREE from 'three';
import { FishSpecies } from '../data/fish';
import { SpaceRelic } from '../data/relics';
import { FishSize } from '../state/GameState';
import { getFishPatternTexture, getGlowTexture } from './textures';

export interface FishInstance {
  group: THREE.Group;
  species: FishSpecies;
  update: (dt: number, elapsed: number, energy?: number) => void;
}

export interface FishVisualOptions {
  size?: FishSize;
  isStarlight?: boolean;
}

const SIZE_MULT: Record<FishSize, number> = {
  tiny: 0.76,
  regular: 1.0,
  jumbo: 1.34,
};

function addRefinedEyes(parent: THREE.Group, x: number, y: number, z: number, radius: number, glowHex: string): void {
  const eyeGeo = new THREE.SphereGeometry(radius, 10, 10);
  const eyeMat = new THREE.MeshStandardMaterial({
    color: 0x0b1220,
    emissive: new THREE.Color(glowHex),
    emissiveIntensity: 0.45,
    roughness: 0.15,
    metalness: 0.3,
  });
  const left = new THREE.Mesh(eyeGeo, eyeMat);
  left.position.set(x, y, z);
  const right = new THREE.Mesh(eyeGeo, eyeMat);
  right.position.set(-x, y, z);
  parent.add(left, right);
}

function addGlowOrb(parent: THREE.Group, pos: THREE.Vector3, color: string, size: number, opacity = 0.65): THREE.Sprite {
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: getGlowTexture(),
      color: new THREE.Color(color),
      transparent: true,
      opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  sprite.position.copy(pos);
  sprite.scale.set(size, size, 1);
  parent.add(sprite);
  return sprite;
}

/**
 * Creates a sculpted, graceful 3D creature oriented facing +Z (nose at +Z, tail at -Z).
 */
export function createFishMesh(species: FishSpecies, options: FishVisualOptions = {}): FishInstance {
  const root = new THREE.Group();
  const bodyGroup = new THREE.Group();
  root.add(bodyGroup);

  const isStarlight = Boolean(options.isStarlight);
  const sizeMult = SIZE_MULT[options.size ?? 'regular'];

  const tex = getFishPatternTexture(species.primaryColor, species.secondaryColor, species.pattern);
  const mainMat = new THREE.MeshStandardMaterial({
    map: tex,
    roughness: isStarlight ? 0.2 : 0.34,
    metalness: isStarlight ? 0.38 : 0.16,
    emissive: new THREE.Color(species.glowColor),
    emissiveIntensity: isStarlight ? 0.48 : 0.18,
  });

  const finMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(species.secondaryColor),
    emissive: new THREE.Color(species.glowColor),
    emissiveIntensity: isStarlight ? 0.58 : 0.32,
    roughness: 0.3,
    transparent: true,
    opacity: 0.84,
    side: THREE.DoubleSide,
  });

  const animParts: Array<(t: number, energy: number) => void> = [];

  switch (species.archetype) {
    case 'torpedo': {
      const pts: THREE.Vector2[] = [];
      for (let i = 0; i <= 14; i++) {
        const u = i / 14;
        const z = -0.65 + u * 1.3;
        const r = Math.sin(Math.pow(u, 0.72) * Math.PI) * 0.24;
        pts.push(new THREE.Vector2(Math.max(0.008, r), z));
      }
      const bodyGeo = new THREE.LatheGeometry(pts, 18);
      bodyGeo.rotateX(Math.PI / 2);
      bodyGeo.scale(0.75, 1.1, 1);
      bodyGroup.add(new THREE.Mesh(bodyGeo, mainMat));

      const tailShape = new THREE.Shape();
      tailShape.moveTo(0, 0);
      tailShape.quadraticCurveTo(-0.34, 0.34, -0.45, 0.38);
      tailShape.quadraticCurveTo(-0.24, 0.04, -0.18, 0);
      tailShape.quadraticCurveTo(-0.24, -0.04, -0.45, -0.38);
      tailShape.quadraticCurveTo(-0.34, -0.34, 0, 0);
      const tailGeo = new THREE.ShapeGeometry(tailShape);
      tailGeo.rotateY(Math.PI / 2);
      const tail = new THREE.Mesh(tailGeo, finMat);
      tail.position.set(0, 0, -0.58);
      bodyGroup.add(tail);

      const pecGeo = new THREE.ConeGeometry(0.11, 0.32, 6);
      pecGeo.rotateZ(Math.PI / 2);
      const leftPec = new THREE.Mesh(pecGeo, finMat);
      leftPec.position.set(0.18, -0.05, 0.12);
      leftPec.rotation.y = -0.5;
      const rightPec = new THREE.Mesh(pecGeo, finMat);
      rightPec.position.set(-0.18, -0.05, 0.12);
      rightPec.rotation.y = Math.PI + 0.5;
      bodyGroup.add(leftPec, rightPec);

      const dorsalShape = new THREE.Shape();
      dorsalShape.moveTo(0.25, 0);
      dorsalShape.quadraticCurveTo(0.05, 0.28, -0.32, 0.14);
      dorsalShape.lineTo(-0.22, 0);
      const dorsalGeo = new THREE.ShapeGeometry(dorsalShape);
      dorsalGeo.rotateY(-Math.PI / 2);
      const dorsal = new THREE.Mesh(dorsalGeo, finMat);
      dorsal.position.set(0, 0.18, 0);
      bodyGroup.add(dorsal);

      addRefinedEyes(bodyGroup, 0.13, 0.05, 0.42, 0.036, species.glowColor);
      addGlowOrb(bodyGroup, new THREE.Vector3(0, 0.05, 0.62), species.glowColor, 0.42, 0.55);

      animParts.push((t, energy) => {
        const freq = 4.2 + energy * 4.5;
        tail.rotation.y = Math.sin(t * freq) * (0.28 + energy * 0.18);
        bodyGroup.rotation.y = Math.sin(t * freq - 0.6) * 0.06;
        leftPec.rotation.z = Math.sin(t * 3.0) * 0.22;
        rightPec.rotation.z = -Math.sin(t * 3.0) * 0.22;
      });
      break;
    }

    case 'ray': {
      const wingGeo = new THREE.PlaneGeometry(1.5, 1.1, 10, 6);
      wingGeo.rotateX(-Math.PI / 2);
      const pos = wingGeo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const z = pos.getZ(i);
        const wingTaper = Math.max(0.06, 1.0 - Math.abs(x) * 1.18);
        pos.setZ(i, z * wingTaper - Math.abs(x) * 0.22);
        const dome = Math.exp(-(x * x * 3.5 + z * z * 2.5)) * 0.16;
        pos.setY(i, dome);
      }
      wingGeo.computeVertexNormals();
      const mantleMat = mainMat.clone();
      mantleMat.side = THREE.DoubleSide;
      const mantle = new THREE.Mesh(wingGeo, mantleMat);
      bodyGroup.add(mantle);

      const tailGeo = new THREE.ConeGeometry(0.045, 0.95, 8);
      tailGeo.rotateX(-Math.PI / 2);
      const tail = new THREE.Mesh(tailGeo, finMat);
      tail.position.set(0, 0.02, -0.82);
      bodyGroup.add(tail);

      addRefinedEyes(bodyGroup, 0.16, 0.09, 0.34, 0.032, species.glowColor);
      addGlowOrb(bodyGroup, new THREE.Vector3(0, 0.05, -1.25), species.glowColor, 0.36, 0.65);

      const basePos = wingGeo.attributes.position.array.slice() as Float32Array;
      animParts.push((t, energy) => {
        const p = wingGeo.attributes.position;
        const speed = 2.8 + energy * 2.4;
        for (let i = 0; i < p.count; i++) {
          const bx = basePos[i * 3];
          const by = basePos[i * 3 + 1];
          const bz = basePos[i * 3 + 2];
          const wave = Math.sin(t * speed - Math.abs(bx) * 2.8 + bz * 1.2) * Math.abs(bx) * 0.32;
          p.setY(i, by + wave);
        }
        p.needsUpdate = true;
        tail.rotation.y = Math.sin(t * speed - 1.0) * 0.18;
      });
      break;
    }

    case 'ribbon': {
      const segments: THREE.Group[] = [];
      let parent: THREE.Group = bodyGroup;
      for (let i = 0; i < 6; i++) {
        const segPivot = new THREE.Group();
        segPivot.position.set(0, 0, i === 0 ? 0.45 : -0.25);
        const radius = 0.14 * (1 - i * 0.12);
        const segGeo = new THREE.SphereGeometry(radius, 12, 10);
        segGeo.scale(0.65, 1.15, 1.5);
        segPivot.add(new THREE.Mesh(segGeo, mainMat));

        const crestGeo = new THREE.PlaneGeometry(0.24, 0.22);
        crestGeo.rotateY(Math.PI / 2);
        const crest = new THREE.Mesh(crestGeo, finMat);
        crest.position.set(0, radius * 1.15, 0);
        segPivot.add(crest);

        parent.add(segPivot);
        segments.push(segPivot);
        parent = segPivot;
      }
      addRefinedEyes(segments[0], 0.08, 0.04, 0.11, 0.03, species.glowColor);
      addGlowOrb(segments[0], new THREE.Vector3(0, 0.08, 0.2), species.glowColor, 0.38, 0.55);

      animParts.push((t, energy) => {
        const speed = 3.8 + energy * 3.5;
        segments.forEach((seg, idx) => {
          seg.rotation.y = Math.sin(t * speed - idx * 0.72) * (idx === 0 ? 0.08 : 0.28);
        });
      });
      break;
    }

    case 'jelly': {
      const bellGeo = new THREE.SphereGeometry(0.36, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.58);
      const bellMat = new THREE.MeshStandardMaterial({
        map: tex,
        color: new THREE.Color(species.primaryColor),
        emissive: new THREE.Color(species.glowColor),
        emissiveIntensity: isStarlight ? 0.65 : 0.4,
        roughness: 0.18,
        transparent: true,
        opacity: 0.82,
        side: THREE.DoubleSide,
      });
      const bell = new THREE.Mesh(bellGeo, bellMat);
      bell.rotation.x = Math.PI / 2;
      bell.position.z = 0.12;
      bodyGroup.add(bell);

      const core = new THREE.Mesh(
        new THREE.SphereGeometry(0.16, 12, 10),
        new THREE.MeshBasicMaterial({ color: new THREE.Color(species.glowColor) }),
      );
      core.position.z = 0.12;
      bodyGroup.add(core);
      addGlowOrb(bodyGroup, new THREE.Vector3(0, 0, 0.14), species.glowColor, 0.95, 0.65);

      const tendrils: THREE.Mesh[] = [];
      for (let i = 0; i < 6; i++) {
        const ang = (i / 6) * Math.PI * 2;
        const tGeo = new THREE.CylinderGeometry(0.018, 0.004, 0.75, 6);
        tGeo.rotateX(Math.PI / 2);
        tGeo.translate(0, 0, -0.37);
        const tendril = new THREE.Mesh(tGeo, finMat);
        tendril.position.set(Math.cos(ang) * 0.18, Math.sin(ang) * 0.18, 0.08);
        bodyGroup.add(tendril);
        tendrils.push(tendril);
      }

      animParts.push((t, energy) => {
        const pulse = Math.sin(t * (2.4 + energy * 1.8));
        bell.scale.set(1 + pulse * 0.1, 0.88 - pulse * 0.08, 1 + pulse * 0.1);
        tendrils.forEach((tr, idx) => {
          tr.rotation.y = Math.sin(t * 2.5 + idx) * 0.25;
          tr.rotation.x = Math.cos(t * 2.2 + idx * 0.7) * 0.2;
        });
      });
      break;
    }

    case 'nautilus': {
      const shellGroup = new THREE.Group();
      for (let i = 0; i < 9; i++) {
        const t = i / 8;
        const angle = t * Math.PI * 2.4;
        const radius = 0.07 + t * 0.22;
        const tubeR = 0.045 + t * 0.11;
        const whorl = new THREE.Mesh(new THREE.SphereGeometry(tubeR, 12, 10), mainMat);
        whorl.scale.set(0.75, 1, 1);
        whorl.position.set(0, Math.sin(angle) * radius, Math.cos(angle) * radius);
        shellGroup.add(whorl);
      }
      bodyGroup.add(shellGroup);

      const hood = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 10), finMat);
      hood.position.set(0, -0.05, 0.28);
      bodyGroup.add(hood);
      addRefinedEyes(bodyGroup, 0.11, -0.02, 0.34, 0.034, species.glowColor);
      addGlowOrb(bodyGroup, new THREE.Vector3(0, -0.05, 0.45), species.glowColor, 0.45, 0.5);

      const arms: THREE.Mesh[] = [];
      for (let i = 0; i < 6; i++) {
        const armGeo = new THREE.ConeGeometry(0.024, 0.34, 6);
        armGeo.rotateX(Math.PI / 2);
        armGeo.translate(0, 0, 0.17);
        const arm = new THREE.Mesh(armGeo, finMat);
        const a = (i / 6) * Math.PI * 2;
        arm.position.set(Math.cos(a) * 0.08, -0.08 + Math.sin(a) * 0.08, 0.32);
        bodyGroup.add(arm);
        arms.push(arm);
      }

      animParts.push((t, energy) => {
        bodyGroup.rotation.x = Math.sin(t * 1.8) * 0.08;
        arms.forEach((arm, idx) => {
          arm.rotation.y = Math.sin(t * (3 + energy * 2) + idx) * 0.22;
          arm.rotation.x = Math.cos(t * 2.4 + idx) * 0.18;
        });
      });
      break;
    }

    case 'seahorse': {
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, -0.45, -0.18),
        new THREE.Vector3(0, -0.32, -0.06),
        new THREE.Vector3(0, -0.12, -0.16),
        new THREE.Vector3(0, 0.14, 0.05),
        new THREE.Vector3(0, 0.34, 0.12),
        new THREE.Vector3(0, 0.3, 0.32),
      ]);
      const tubeGeo = new THREE.TubeGeometry(curve, 22, 0.095, 10, false);
      bodyGroup.add(new THREE.Mesh(tubeGeo, mainMat));

      const crown = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.2, 5), finMat);
      crown.position.set(0, 0.44, 0.12);
      bodyGroup.add(crown);

      const backFinGeo = new THREE.PlaneGeometry(0.24, 0.3);
      backFinGeo.rotateY(Math.PI / 2);
      const backFin = new THREE.Mesh(backFinGeo, finMat);
      backFin.position.set(0, 0.05, -0.2);
      bodyGroup.add(backFin);

      addRefinedEyes(bodyGroup, 0.075, 0.35, 0.17, 0.028, species.glowColor);
      addGlowOrb(bodyGroup, new THREE.Vector3(0, 0.48, 0.12), species.glowColor, 0.38, 0.55);

      animParts.push((t, energy) => {
        backFin.rotation.y = Math.sin(t * (9 + energy * 6)) * 0.42;
        bodyGroup.position.y = Math.sin(t * 2.4) * 0.05;
        bodyGroup.rotation.x = Math.sin(t * 1.9) * 0.07;
      });
      break;
    }

    case 'sailfin': {
      const bodyGeo = new THREE.SphereGeometry(0.26, 16, 12);
      bodyGeo.scale(0.55, 1.05, 1.85);
      bodyGroup.add(new THREE.Mesh(bodyGeo, mainMat));

      const topSailShape = new THREE.Shape();
      topSailShape.moveTo(0.2, 0);
      topSailShape.quadraticCurveTo(-0.1, 0.65, -0.58, 0.48);
      topSailShape.quadraticCurveTo(-0.32, 0.15, -0.35, 0);
      const topSailGeo = new THREE.ShapeGeometry(topSailShape);
      topSailGeo.rotateY(-Math.PI / 2);
      const topSail = new THREE.Mesh(topSailGeo, finMat);
      topSail.position.set(0, 0.18, 0);

      const botSail = topSail.clone();
      botSail.scale.y = -0.82;
      botSail.position.set(0, -0.18, 0);

      const veilTailShape = new THREE.Shape();
      veilTailShape.moveTo(0, 0);
      veilTailShape.quadraticCurveTo(-0.42, 0.42, -0.58, 0.36);
      veilTailShape.quadraticCurveTo(-0.28, 0, -0.58, -0.36);
      veilTailShape.quadraticCurveTo(-0.42, -0.42, 0, 0);
      const veilTailGeo = new THREE.ShapeGeometry(veilTailShape);
      veilTailGeo.rotateY(Math.PI / 2);
      const veilTail = new THREE.Mesh(veilTailGeo, finMat);
      veilTail.position.set(0, 0, -0.42);

      bodyGroup.add(topSail, botSail, veilTail);
      addRefinedEyes(bodyGroup, 0.11, 0.06, 0.32, 0.034, species.glowColor);
      addGlowOrb(bodyGroup, new THREE.Vector3(0, 0.46, -0.22), species.glowColor, 0.48, 0.52);

      animParts.push((t, energy) => {
        const freq = 3.5 + energy * 3.2;
        veilTail.rotation.y = Math.sin(t * freq) * 0.32;
        topSail.rotation.z = Math.sin(t * freq * 0.7) * 0.08;
        botSail.rotation.z = -Math.sin(t * freq * 0.7) * 0.08;
      });
      break;
    }
  }

  // Starlight Shimmer variant orbiting sparkles
  if (isStarlight) {
    const sparkles: THREE.Sprite[] = [];
    for (let i = 0; i < 4; i++) {
      const sp = addGlowOrb(root, new THREE.Vector3(), '#fff2a6', 0.42, 0.82);
      sparkles.push(sp);
    }
    animParts.push((t) => {
      sparkles.forEach((sp, i) => {
        const a = t * 2.1 + (i / 4) * Math.PI * 2;
        sp.position.set(Math.cos(a) * 0.65, Math.sin(a * 1.4) * 0.36, Math.sin(a) * 0.65);
      });
    });
  }

  root.scale.setScalar(species.scale * sizeMult);

  return {
    group: root,
    species,
    update: (_dt: number, elapsed: number, energy = 0.35) => {
      for (const fn of animParts) {
        fn(elapsed, energy);
      }
    },
  };
}

export function createRelicMesh(relic: SpaceRelic): THREE.Group {
  const group = new THREE.Group();
  const baseMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(relic.color),
    metalness: 0.68,
    roughness: 0.26,
  });
  const glowMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(relic.accentColor),
    emissive: new THREE.Color(relic.accentColor),
    emissiveIntensity: 0.65,
    roughness: 0.18,
  });

  if (relic.shape === 'astrolabe') {
    const r1 = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.04, 10, 28), baseMat);
    const r2 = new THREE.Mesh(new THREE.TorusGeometry(0.31, 0.035, 10, 24), baseMat);
    r2.rotation.y = Math.PI / 3;
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 10), glowMat);
    group.add(r1, r2, core);
  } else if (relic.shape === 'wheel') {
    const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.22, 16), baseMat);
    tire.rotation.z = Math.PI / 2;
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.26, 12), glowMat);
    hub.rotation.z = Math.PI / 2;
    group.add(tire, hub);
  } else if (relic.shape === 'lantern') {
    const capTop = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.18, 6), baseMat);
    capTop.position.y = 0.28;
    const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.38, 8), glowMat);
    const capBot = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.26, 0.12, 6), baseMat);
    capBot.position.y = -0.25;
    group.add(capTop, glass, capBot);
  } else if (relic.shape === 'compass') {
    const dish = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.42, 0.1, 20), baseMat);
    const needle = new THREE.Mesh(new THREE.OctahedronGeometry(0.24, 0), glowMat);
    needle.scale.set(0.35, 0.25, 1.3);
    needle.position.y = 0.1;
    group.add(dish, needle);
  } else if (relic.shape === 'prism' || relic.shape === 'heart') {
    for (let i = 0; i < 3; i++) {
      const shard = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.56 - i * 0.1, 5), glowMat);
      shard.position.set((i - 1) * 0.18, (i === 1 ? 0.1 : 0), 0);
      shard.rotation.z = (i - 1) * -0.28;
      group.add(shard);
    }
  } else {
    // Geode
    const shell = new THREE.Mesh(new THREE.DodecahedronGeometry(0.36, 0), baseMat);
    const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.28, 0), glowMat);
    crystal.position.y = 0.16;
    group.add(shell, crystal);
  }

  addGlowOrb(group, new THREE.Vector3(0, 0.12, 0), relic.accentColor, 1.35, 0.45);
  return group;
}
