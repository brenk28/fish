import * as THREE from 'three';
import { PlanetConfig } from '../data/planets';

export class WaterSurface {
  public readonly mesh: THREE.Mesh;
  private material: THREE.ShaderMaterial;
  private rippleIndex = 0;

  constructor() {
    const geo = new THREE.PlaneGeometry(140, 140, 64, 64);
    geo.rotateX(-Math.PI / 2);

    this.material = new THREE.ShaderMaterial({
      transparent: true,
      uniforms: {
        uTime: { value: 0 },
        uWaveHeight: { value: 0.14 },
        uDeepColor: { value: new THREE.Color('#083a5e') },
        uShallowColor: { value: new THREE.Color('#1fa9a8') },
        uFoamColor: { value: new THREE.Color('#d9fbf7') },
        uSpecColor: { value: new THREE.Color('#ffe7b3') },
        uRipples: {
          value: [
            new THREE.Vector4(0, 0, -100, 0),
            new THREE.Vector4(0, 0, -100, 0),
            new THREE.Vector4(0, 0, -100, 0),
            new THREE.Vector4(0, 0, -100, 0),
          ],
        },
      },
      vertexShader: `
        uniform float uTime;
        uniform float uWaveHeight;
        varying vec3 vWorldPos;
        varying float vWave;
        void main() {
          vec3 pos = position;
          float w1 = sin(pos.x * 0.42 + uTime * 1.35) * cos(pos.z * 0.34 + uTime * 1.05);
          float w2 = sin((pos.x * 0.65 - pos.z * 0.55) + uTime * 1.85) * 0.5;
          float h = (w1 + w2) * uWaveHeight;
          pos.y += h;
          vec4 wp = modelMatrix * vec4(pos, 1.0);
          vWorldPos = wp.xyz;
          vWave = h;
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uDeepColor;
        uniform vec3 uShallowColor;
        uniform vec3 uFoamColor;
        uniform vec3 uSpecColor;
        uniform vec4 uRipples[4];
        varying vec3 vWorldPos;
        varying float vWave;

        void main() {
          float dist = length(vWorldPos.xz - vec2(0.0, 2.0));
          float depthT = clamp(dist / 36.0, 0.0, 1.0);
          vec3 baseCol = mix(uShallowColor, uDeepColor, depthT);

          // Gentle stylized Fresnel shimmer
          vec3 viewDir = normalize(cameraPosition - vWorldPos);
          vec3 approxNormal = normalize(vec3(
            sin(vWorldPos.x * 0.8 + uTime * 1.5) * 0.14,
            1.0,
            cos(vWorldPos.z * 0.7 + uTime * 1.2) * 0.14
          ));
          float fresnel = pow(1.0 - max(dot(viewDir, approxNormal), 0.0), 3.0);
          baseCol = mix(baseCol, uSpecColor, fresnel * 0.32);

          // Wave crest highlights
          float crest = smoothstep(0.08, 0.24, vWave);
          baseCol = mix(baseCol, uFoamColor, crest * 0.24);

          // Expanding circular ripples
          float rippleGlow = 0.0;
          for (int i = 0; i < 4; i++) {
            vec4 rp = uRipples[i];
            float age = uTime - rp.z;
            if (age > 0.0 && age < 2.8 && rp.w > 0.0) {
              float d = length(vWorldPos.xz - rp.xy);
              float radius = age * 4.2;
              float ring = exp(-pow((d - radius) * 2.2, 2.0));
              float ring2 = exp(-pow((d - radius * 0.65) * 2.8, 2.0)) * 0.55;
              float fade = (1.0 - age / 2.8) * rp.w;
              rippleGlow += (ring + ring2) * fade;
            }
          }
          baseCol = mix(baseCol, uFoamColor, clamp(rippleGlow, 0.0, 0.9));

          // Soft horizon blend
          float horizonFade = smoothstep(32.0, 68.0, length(vWorldPos.xz));
          baseCol = mix(baseCol, uDeepColor, horizonFade * 0.65);

          gl_FragColor = vec4(baseCol, 0.92);
        }
      `,
    });

    this.mesh = new THREE.Mesh(geo, this.material);
    this.mesh.position.set(0, 0, -18);
  }

  public applyPlanet(planet: PlanetConfig): void {
    this.material.uniforms.uDeepColor.value.set(planet.waterColors.deep);
    this.material.uniforms.uShallowColor.value.set(planet.waterColors.shallow);
    this.material.uniforms.uFoamColor.value.set(planet.waterColors.foam);
    this.material.uniforms.uSpecColor.value.set(planet.waterColors.specular);
    this.material.uniforms.uWaveHeight.value = planet.waterColors.waveHeight;
  }

  public triggerRipple(x: number, z: number, intensity = 1.0): void {
    const arr = this.material.uniforms.uRipples.value as THREE.Vector4[];
    arr[this.rippleIndex].set(x, z, this.material.uniforms.uTime.value, intensity);
    this.rippleIndex = (this.rippleIndex + 1) % 4;
  }

  public update(elapsed: number): void {
    this.material.uniforms.uTime.value = elapsed;
  }
}
