import * as THREE from 'three';
import { PlanetConfig, PlanetId } from '../data/planets';
import { getGlowTexture, getJupiterTexture, getSaturnRingTexture } from './textures';

export class SkyDome {
  public readonly group = new THREE.Group();
  private skyMat: THREE.ShaderMaterial;
  private stars: THREE.Points;
  private starMat: THREE.PointsMaterial;
  private landmarkGroup = new THREE.Group();
  private eventGroup = new THREE.Group();
  private auroraMat: THREE.ShaderMaterial | null = null;
  private geyserSprites: THREE.Sprite[] = [];

  private currentPlanetId: PlanetId = 'earth';
  private eventActive = false;

  // Dynamic event visuals
  private meteorStreaks: THREE.Mesh[] = [];
  private rainPoints: THREE.Points | null = null;
  private eclipseHalo: THREE.Sprite | null = null;
  private cometRibbon: THREE.Mesh | null = null;

  constructor() {
    this.skyMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {
        uZenith: { value: new THREE.Color('#133b6e') },
        uMid: { value: new THREE.Color('#2d7fb8') },
        uHorizon: { value: new THREE.Color('#f7c588') },
      },
      vertexShader: `
        varying vec3 vWorldPos;
        void main() {
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vWorldPos = wp.xyz;
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: `
        uniform vec3 uZenith;
        uniform vec3 uMid;
        uniform vec3 uHorizon;
        varying vec3 vWorldPos;
        void main() {
          float h = clamp(normalize(vWorldPos).y, 0.0, 1.0);
          vec3 col = mix(uHorizon, uMid, smoothstep(0.0, 0.34, h));
          col = mix(col, uZenith, smoothstep(0.28, 0.88, h));
          gl_FragColor = vec4(col, 1.0);
        }
      `,
    });

    const dome = new THREE.Mesh(new THREE.SphereGeometry(120, 32, 20), this.skyMat);
    this.group.add(dome);

    const starCount = 560;
    const positions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 0.92 + 0.06);
      const r = 104;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi);
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1.5,
      map: getGlowTexture(),
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.stars = new THREE.Points(starGeo, this.starMat);
    this.group.add(this.stars, this.landmarkGroup, this.eventGroup);
  }

  public applyPlanet(planet: PlanetConfig): void {
    this.currentPlanetId = planet.id;
    this.skyMat.uniforms.uZenith.value.set(planet.skyColors.zenith);
    this.skyMat.uniforms.uMid.value.set(planet.skyColors.mid);
    this.skyMat.uniforms.uHorizon.value.set(planet.skyColors.horizon);
    this.starMat.opacity = planet.skyColors.starDensity;

    while (this.landmarkGroup.children.length > 0) {
      this.landmarkGroup.remove(this.landmarkGroup.children.pop()!);
    }
    this.auroraMat = null;
    this.geyserSprites = [];

    const glowTex = getGlowTexture();

    if (planet.id === 'earth') {
      const sunHalo = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: glowTex,
          color: 0xffe0a3,
          transparent: true,
          opacity: 0.85,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      );
      sunHalo.position.set(-22, 16, -78);
      sunHalo.scale.set(28, 28, 1);
      this.landmarkGroup.add(sunHalo);
    } else if (planet.id === 'mars') {
      const sunHalo = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: glowTex,
          color: 0xffb380,
          transparent: true,
          opacity: 0.6,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      );
      sunHalo.position.set(18, 20, -78);
      sunHalo.scale.set(18, 18, 1);
      this.landmarkGroup.add(sunHalo);

      const phobos = new THREE.Mesh(
        new THREE.DodecahedronGeometry(1.1, 1),
        new THREE.MeshStandardMaterial({ color: 0xc9a394, roughness: 0.9 }),
      );
      phobos.position.set(-16, 26, -68);
      const deimos = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.6, 1),
        new THREE.MeshStandardMaterial({ color: 0xd9b8a6, roughness: 0.9 }),
      );
      deimos.position.set(26, 33, -72);
      this.landmarkGroup.add(phobos, deimos);
    } else if (planet.id === 'europa') {
      const jupiter = new THREE.Mesh(
        new THREE.SphereGeometry(18, 32, 24),
        new THREE.MeshStandardMaterial({
          map: getJupiterTexture(),
          roughness: 0.75,
          metalness: 0.05,
        }),
      );
      jupiter.position.set(-20, 22, -74);
      jupiter.rotation.z = 0.14;
      this.landmarkGroup.add(jupiter);

      const jupGlow = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: glowTex,
          color: 0xffe4bd,
          transparent: true,
          opacity: 0.28,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      );
      jupGlow.position.copy(jupiter.position);
      jupGlow.scale.set(48, 48, 1);
      this.landmarkGroup.add(jupGlow);
    } else if (planet.id === 'titan' || planet.id === 'enceladus') {
      const isTitan = planet.id === 'titan';
      const saturnGroup = new THREE.Group();
      saturnGroup.position.set(isTitan ? 16 : -14, isTitan ? 24 : 26, -72);
      saturnGroup.rotation.set(0.32, 0.2, -0.28);

      const body = new THREE.Mesh(
        new THREE.SphereGeometry(isTitan ? 9.5 : 11.5, 28, 20),
        new THREE.MeshStandardMaterial({
          color: isTitan ? 0xe6b873 : 0xf0d9a8,
          roughness: 0.7,
        }),
      );
      saturnGroup.add(body);

      const ringGeo = new THREE.RingGeometry(isTitan ? 12.5 : 15, isTitan ? 21 : 25, 48);
      const ringMat = new THREE.MeshBasicMaterial({
        map: getSaturnRingTexture(),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: isTitan ? 0.45 : 0.82,
        depthWrite: false,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      saturnGroup.add(ring);
      this.landmarkGroup.add(saturnGroup);

      if (!isTitan) {
        for (let i = 0; i < 6; i++) {
          const sprite = new THREE.Sprite(
            new THREE.SpriteMaterial({
              map: glowTex,
              color: 0xd1faff,
              transparent: true,
              opacity: 0.28,
              blending: THREE.AdditiveBlending,
              depthWrite: false,
            }),
          );
          sprite.position.set(-28 + i * 11, 4 + (i % 2) * 3, -38 - (i % 3) * 5);
          sprite.scale.set(6, 16, 1);
          this.landmarkGroup.add(sprite);
          this.geyserSprites.push(sprite);
        }
      }
    } else if (planet.id === 'neptune') {
      this.auroraMat = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uColorA: { value: new THREE.Color('#66f7d6') },
          uColorB: { value: new THREE.Color('#8e6bff') },
        },
        vertexShader: `
          uniform float uTime;
          varying vec2 vUv;
          void main() {
            vUv = uv;
            vec3 pos = position;
            pos.z += sin(pos.x * 0.14 + uTime * 0.9) * 3.2;
            pos.y += cos(pos.x * 0.1 + uTime * 0.6) * 1.4;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 uColorA;
          uniform vec3 uColorB;
          varying vec2 vUv;
          void main() {
            float edgeX = sin(vUv.x * 3.14159);
            float edgeY = pow(sin(vUv.y * 3.14159), 1.6);
            vec3 col = mix(uColorA, uColorB, vUv.x);
            gl_FragColor = vec4(col, edgeX * edgeY * 0.45);
          }
        `,
      });
      const auroraGeo = new THREE.PlaneGeometry(90, 18, 36, 4);
      const aurora = new THREE.Mesh(auroraGeo, this.auroraMat);
      aurora.position.set(0, 26, -62);
      aurora.rotation.x = 0.28;
      this.landmarkGroup.add(aurora);
    } else if (planet.id === 'pluto') {
      // Giant close twin moon Charon glowing over the violet Kuiper horizon
      const charon = new THREE.Mesh(
        new THREE.SphereGeometry(9.2, 26, 20),
        new THREE.MeshStandardMaterial({
          color: 0xc2b6cc,
          emissive: 0x3b2852,
          emissiveIntensity: 0.3,
          roughness: 0.78,
        }),
      );
      charon.position.set(16, 20, -68);
      const glow = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: glowTex,
          color: 0xffb8dc,
          transparent: true,
          opacity: 0.35,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      );
      glow.position.copy(charon.position);
      glow.scale.set(28, 28, 1);
      this.landmarkGroup.add(charon, glow);
    }

    this.setSpaceEvent(this.eventActive);
  }

  public setSpaceEvent(active: boolean): void {
    this.eventActive = active;
    while (this.eventGroup.children.length > 0) {
      this.eventGroup.remove(this.eventGroup.children.pop()!);
    }
    this.meteorStreaks = [];
    this.rainPoints = null;
    this.eclipseHalo = null;
    this.cometRibbon = null;

    if (!active) return;

    const glowTex = getGlowTexture();
    const id = this.currentPlanetId;

    if (id === 'mars') {
      // Shooting star meteor streaks
      const streakGeo = new THREE.ConeGeometry(0.18, 4.5, 6);
      streakGeo.rotateZ(-Math.PI / 3);
      const streakMat = new THREE.MeshBasicMaterial({
        color: 0xffdfa3,
        transparent: true,
        opacity: 0.85,
      });
      for (let i = 0; i < 6; i++) {
        const m = new THREE.Mesh(streakGeo, streakMat);
        m.position.set(-30 + i * 12, 22 + (i % 3) * 5, -54 - (i % 2) * 8);
        this.eventGroup.add(m);
        this.meteorStreaks.push(m);
      }
    } else if (id === 'europa') {
      // Glowing Jupiter eclipse ring
      this.eclipseHalo = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: glowTex,
          color: 0x9cf7ff,
          transparent: true,
          opacity: 0.55,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      );
      this.eclipseHalo.position.set(-20, 22, -73);
      this.eclipseHalo.scale.set(60, 60, 1);
      this.eventGroup.add(this.eclipseHalo);
    } else if (id === 'pluto') {
      const cometGeo = new THREE.PlaneGeometry(66, 8, 24, 2);
      const cometMat = new THREE.MeshBasicMaterial({
        color: 0xffb3da,
        transparent: true,
        opacity: 0.32,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      this.cometRibbon = new THREE.Mesh(cometGeo, cometMat);
      this.cometRibbon.position.set(-4, 24, -60);
      this.cometRibbon.rotation.z = 0.24;
      this.eventGroup.add(this.cometRibbon);
    } else {
      // Shimmering falling rain / diamond crystals / sea-fireflies / cryo snow
      const count = 130;
      const pos = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        pos[i * 3] = (Math.random() - 0.5) * 44;
        pos[i * 3 + 1] = 1 + Math.random() * 18;
        pos[i * 3 + 2] = -28 + Math.random() * 26;
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const color =
        id === 'earth'
          ? 0x8effd8
          : id === 'titan'
            ? 0xffd273
            : id === 'enceladus'
              ? 0xe8fbff
              : 0x9ef7ff;
      this.rainPoints = new THREE.Points(
        geo,
        new THREE.PointsMaterial({
          color,
          size: id === 'earth' ? 0.55 : 0.42,
          map: glowTex,
          transparent: true,
          opacity: 0.85,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      );
      this.eventGroup.add(this.rainPoints);
    }
  }

  public update(elapsed: number): void {
    this.stars.rotation.y = elapsed * 0.004;
    if (this.auroraMat) {
      this.auroraMat.uniforms.uTime.value = elapsed;
    }
    const geyserMult = this.eventActive && this.currentPlanetId === 'enceladus' ? 1.55 : 1.0;
    this.geyserSprites.forEach((s, idx) => {
      const pulse = 0.5 + 0.5 * Math.sin(elapsed * 1.3 + idx * 1.4);
      s.material.opacity = (0.16 + pulse * 0.22) * geyserMult;
      s.scale.y = (14 + pulse * 6) * geyserMult;
    });

    if (!this.eventActive) return;

    this.meteorStreaks.forEach((m, idx) => {
      const cycle = ((elapsed * 0.55 + idx * 0.37) % 1);
      m.position.x = -36 + cycle * 72;
      m.position.y = 32 - cycle * 22 + (idx % 3) * 3;
    });

    if (this.eclipseHalo) {
      const s = 54 + Math.sin(elapsed * 2.1) * 7;
      this.eclipseHalo.scale.set(s, s, 1);
    }

    if (this.cometRibbon) {
      this.cometRibbon.position.y = 24 + Math.sin(elapsed * 1.2) * 1.5;
    }

    if (this.rainPoints) {
      const attr = this.rainPoints.geometry.attributes.position as THREE.BufferAttribute;
      const isFirefly = this.currentPlanetId === 'earth';
      for (let i = 0; i < attr.count; i++) {
        let y = attr.getY(i);
        if (isFirefly) {
          y += Math.sin(elapsed * 1.6 + i) * 0.015;
        } else {
          y -= 0.095;
          if (y < 0.2) y = 18;
        }
        attr.setY(i, y);
      }
      attr.needsUpdate = true;
    }
  }
}
