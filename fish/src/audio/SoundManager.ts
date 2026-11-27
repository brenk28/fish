import { PlanetId, PLANET_MAP } from '../data/planets';

export class SoundManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private ambientOscs: OscillatorNode[] = [];
  private muted = false;
  private currentPlanet: PlanetId = 'earth';
  private lastReelTick = 0;

  public unlock(): void {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.muted ? 0 : 0.65;
      this.masterGain.connect(this.ctx.destination);
      this.startAmbientBed();
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 0.65, this.ctx.currentTime, 0.08);
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setPlanetAmbience(planetId: PlanetId): void {
    this.currentPlanet = planetId;
    if (!this.ctx || this.ambientOscs.length === 0) return;
    const chord = PLANET_MAP[planetId].ambientChord;
    const now = this.ctx.currentTime;
    this.ambientOscs.forEach((osc, idx) => {
      const targetFreq = chord[idx % chord.length] * 0.5;
      osc.frequency.setTargetAtTime(targetFreq, now, 0.6);
    });
  }

  private startAmbientBed(): void {
    if (!this.ctx || !this.masterGain) return;
    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.value = 0.055;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 420;

    this.ambientGain.connect(filter);
    filter.connect(this.masterGain);

    const chord = PLANET_MAP[this.currentPlanet].ambientChord;
    for (let i = 0; i < 3; i++) {
      const osc = this.ctx.createOscillator();
      osc.type = i === 0 ? 'sine' : 'triangle';
      osc.frequency.value = chord[i] * 0.5;
      const g = this.ctx.createGain();
      g.gain.value = i === 0 ? 0.45 : 0.25;
      osc.connect(g);
      g.connect(this.ambientGain);
      osc.start();
      this.ambientOscs.push(osc);
    }
  }

  private tone(
    freq: number,
    endFreq: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume = 0.2,
    delay = 0,
  ): void {
    if (!this.ctx || !this.masterGain || this.muted) return;
    const now = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (endFreq !== freq) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), now + duration);
    }
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(volume, now + Math.min(0.025, duration * 0.25));
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  public playClick(): void {
    this.unlock();
    this.tone(620, 840, 0.07, 'sine', 0.14);
  }

  public playCast(): void {
    this.unlock();
    this.tone(320, 740, 0.22, 'triangle', 0.16);
  }

  public playSplash(): void {
    if (!this.ctx || !this.masterGain || this.muted) return;
    const now = this.ctx.currentTime;
    this.tone(420, 210, 0.18, 'sine', 0.2);
    this.tone(580, 920, 0.14, 'sine', 0.12, 0.06);

    const bufferSize = Math.floor(this.ctx.sampleRate * 0.22);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(950, now);
    filter.frequency.exponentialRampToValueAtTime(380, now + 0.2);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start(now);
  }

  public playHotspotHit(): void {
    this.tone(587.33, 880, 0.14, 'sine', 0.18, 0);
    this.tone(880, 1174.66, 0.2, 'triangle', 0.16, 0.08);
  }

  public playNibble(): void {
    this.tone(480, 380, 0.09, 'sine', 0.15);
    this.tone(540, 620, 0.08, 'sine', 0.1, 0.08);
  }

  public playBite(): void {
    this.tone(523.25, 523.25, 0.12, 'triangle', 0.22, 0);
    this.tone(659.25, 659.25, 0.12, 'triangle', 0.22, 0.09);
    this.tone(783.99, 1046.5, 0.26, 'sine', 0.24, 0.18);
  }

  public playAmberWarn(): void {
    this.tone(240, 190, 0.14, 'triangle', 0.15, 0);
    this.tone(210, 170, 0.14, 'triangle', 0.13, 0.12);
  }

  public playReelTick(progress: number): void {
    const now = performance.now();
    if (now - this.lastReelTick < 110) return;
    this.lastReelTick = now;
    const base = 360 + progress * 380;
    this.tone(base, base * 1.12, 0.055, 'triangle', 0.09);
  }

  public playCatchFanfare(isNew: boolean): void {
    const notes = isNew
      ? [523.25, 659.25, 783.99, 1046.5, 1318.5]
      : [440, 554.37, 659.25, 880];
    notes.forEach((n, idx) => {
      this.tone(n, n, idx === notes.length - 1 ? 0.55 : 0.16, 'triangle', 0.2, idx * 0.09);
    });
  }

  public playCollect(): void {
    this.tone(523.25, 783.99, 0.18, 'sine', 0.18, 0);
    this.tone(783.99, 1046.5, 0.28, 'sine', 0.18, 0.1);
  }

  public playWarp(): void {
    this.unlock();
    this.tone(180, 640, 0.75, 'sine', 0.18, 0);
    this.tone(270, 960, 0.75, 'triangle', 0.12, 0.08);
  }

  public playFeed(): void {
    this.unlock();
    this.tone(660, 880, 0.09, 'sine', 0.14, 0);
    this.tone(820, 1100, 0.1, 'sine', 0.12, 0.08);
    this.tone(940, 1240, 0.11, 'sine', 0.1, 0.16);
  }

  public playScanner(): void {
    this.unlock();
    this.tone(440, 920, 0.35, 'sine', 0.15, 0);
    this.tone(660, 1320, 0.35, 'sine', 0.1, 0.12);
  }

  public playBubbleJet(): void {
    this.unlock();
    for (let i = 0; i < 6; i++) {
      const f = 340 + i * 115;
      this.tone(f, f * 1.25, 0.09, 'sine', 0.13, i * 0.065);
    }
  }

  public playLightChime(index = 0): void {
    this.unlock();
    const scale = [523.25, 587.33, 659.25, 783.99, 880, 1046.5];
    const freq = scale[index % scale.length];
    this.tone(freq, freq, 0.42, 'sine', 0.15, 0);
  }

  public playQuizWin(): void {
    this.unlock();
    [523.25, 659.25, 783.99, 1046.5].forEach((n, idx) => {
      this.tone(n, n, 0.2, 'triangle', 0.18, idx * 0.07);
    });
  }

  public playMilestone(): void {
    this.unlock();
    [392.0, 493.88, 587.33, 783.99].forEach((n, idx) => {
      this.tone(n, n, 0.36, 'triangle', 0.18, idx * 0.08);
    });
  }
}
