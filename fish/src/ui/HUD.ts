import { SoundManager } from '../audio/SoundManager';
import { FISH_MAP, FishSpecies, getFishForPlanet, ScienceBadge } from '../data/fish';
import { LureId, LURES } from '../data/lures';
import { MILESTONES } from '../data/milestones';
import { RESEARCH_MISSIONS } from '../data/missions';
import { PlanetConfig, PlanetId, PLANETS, PLANET_MAP } from '../data/planets';
import { getQuizForSpecies } from '../data/quizzes';
import { SPACE_RELICS } from '../data/relics';
import { FishingHudSnapshot } from '../scenes/FishingScene';
import { FishSize, GameMode, GameState } from '../state/GameState';
import { getMissionIcon, getScienceBadgeSvg, ICONS } from './Icons';

export interface HudCallbacks {
  onStartPlay: () => void;
  onSwitchMode: (mode: GameMode) => void;
  onCollectDiscovery: () => void;
  onSelectLure: (lure: LureId) => void;
  onToggleEvent: () => void;
  onTriggerScanner: () => void;
  onFeedAquarium: () => void;
  onBubbleJet: () => void;
  onLightChime: () => void;
  onFilterAquarium: (filter: PlanetId | 'all') => void;
  onWarpToPlanet: (planetId: PlanetId) => void;
}

const SIZE_LABEL: Record<FishSize, string> = {
  tiny: 'Tiny',
  regular: 'Regular',
  jumbo: 'Jumbo',
};

export class HUD {
  private root: HTMLElement;
  private guideOpen = false;
  private guidePlanet: PlanetId = 'earth';
  private guideSelectedFish: FishSpecies | null = null;

  private activeQuizFishId: string | null = null;
  private quizFeedback: string | null = null;

  private fishingSnap: FishingHudSnapshot = {
    phase: 'IDLE',
    reelProgress: 0,
    tugState: 'CALM',
    inHotspot: false,
    spaceEventActive: false,
    scannerActive: false,
    hasCastOnce: false,
    discoveredFish: null,
    discoveredSize: 'regular',
    discoveredStarlight: false,
    isNewDiscovery: false,
    discoveredRelic: null,
  };
  private orreryHover: PlanetConfig | null = null;
  private aquariumSelected: FishSpecies | null = null;
  private aquariumFilter: PlanetId | 'all' = 'all';

  private topLeftPill!: HTMLButtonElement;
  private missionPill!: HTMLDivElement;
  private toastEl!: HTMLDivElement;
  private navFishingBtn!: HTMLButtonElement;
  private navOrreryBtn!: HTMLButtonElement;
  private navAquariumBtn!: HTMLButtonElement;
  private navGuideBtn!: HTMLButtonElement;
  private navMuteBtn!: HTMLButtonElement;
  private aquariumBadge!: HTMLSpanElement;

  private startOverlay!: HTMLDivElement;
  private fishingStageEl!: HTMLDivElement;
  private orreryStageEl!: HTMLDivElement;
  private aquariumStageEl!: HTMLDivElement;
  private guideOverlayEl!: HTMLDivElement;

  constructor(
    root: HTMLElement,
    private state: GameState,
    private sound: SoundManager,
    private callbacks: HudCallbacks,
  ) {
    this.root = root;
    this.guidePlanet = this.state.currentPlanet;
    this.buildShell();
    this.state.subscribe(() => this.render());
    this.render();
  }

  private buildShell(): void {
    this.root.innerHTML = `
      <div class="hud-topbar">
        <div class="topbar-left">
          <button class="planet-pill" id="hud-planet-pill" title="Current World"></button>
          <div class="mission-pill" id="hud-mission-pill"></div>
        </div>
        <div class="hud-toast hidden" id="hud-toast"></div>
        <div class="hud-dock">
          <button class="dock-btn" id="btn-mode-fishing" title="Fishing Pier">${ICONS.rod}</button>
          <button class="dock-btn" id="btn-mode-orrery" title="Solar System Map">${ICONS.orrery}</button>
          <button class="dock-btn" id="btn-mode-aquarium" title="Starship Aquarium">
            ${ICONS.aquarium}
            <span class="dock-badge" id="aquarium-count-badge">0</span>
          </button>
          <button class="dock-btn" id="btn-toggle-guide" title="Field Guide">${ICONS.guide}</button>
          <button class="dock-btn" id="btn-toggle-mute" title="Sound">${ICONS.soundOn}</button>
        </div>
      </div>

      <div id="hud-fishing-stage" class="hud-stage"></div>
      <div id="hud-orrery-stage" class="hud-stage"></div>
      <div id="hud-aquarium-stage" class="hud-stage"></div>
      <div id="hud-guide-overlay" class="guide-backdrop hidden"></div>

      <div id="hud-start-overlay" class="start-overlay">
        <div class="start-card">
          <div class="start-emblem">${ICONS.orrery}</div>
          <h1 class="start-title">Starlight Angler</h1>
          <p class="start-sub">Explore the solar system and collect living creatures from alien seas.</p>
          <button class="primary-action-btn" id="btn-start-play">
            <span class="btn-icon">${ICONS.rod}</span>
            <span>Launch Pier</span>
          </button>
        </div>
      </div>
    `;

    this.topLeftPill = this.root.querySelector('#hud-planet-pill')!;
    this.missionPill = this.root.querySelector('#hud-mission-pill')!;
    this.toastEl = this.root.querySelector('#hud-toast')!;
    this.navFishingBtn = this.root.querySelector('#btn-mode-fishing')!;
    this.navOrreryBtn = this.root.querySelector('#btn-mode-orrery')!;
    this.navAquariumBtn = this.root.querySelector('#btn-mode-aquarium')!;
    this.navGuideBtn = this.root.querySelector('#btn-toggle-guide')!;
    this.navMuteBtn = this.root.querySelector('#btn-toggle-mute')!;
    this.aquariumBadge = this.root.querySelector('#aquarium-count-badge')!;

    this.startOverlay = this.root.querySelector('#hud-start-overlay')!;
    this.fishingStageEl = this.root.querySelector('#hud-fishing-stage')!;
    this.orreryStageEl = this.root.querySelector('#hud-orrery-stage')!;
    this.aquariumStageEl = this.root.querySelector('#hud-aquarium-stage')!;
    this.guideOverlayEl = this.root.querySelector('#hud-guide-overlay')!;

    this.topLeftPill.addEventListener('click', () => {
      this.sound.playClick();
      this.guidePlanet = this.state.currentPlanet;
      this.guideSelectedFish = null;
      this.activeQuizFishId = null;
      this.guideOpen = !this.guideOpen;
      this.render();
    });

    this.navFishingBtn.addEventListener('click', () => {
      this.sound.playClick();
      this.guideOpen = false;
      this.callbacks.onSwitchMode('fishing');
    });

    this.navOrreryBtn.addEventListener('click', () => {
      this.sound.playClick();
      this.guideOpen = false;
      this.callbacks.onSwitchMode('orrery');
    });

    this.navAquariumBtn.addEventListener('click', () => {
      this.sound.playClick();
      this.guideOpen = false;
      this.activeQuizFishId = null;
      this.quizFeedback = null;
      this.callbacks.onSwitchMode('aquarium');
    });

    this.navGuideBtn.addEventListener('click', () => {
      this.sound.playClick();
      this.guidePlanet = this.state.currentPlanet;
      this.guideSelectedFish = null;
      this.activeQuizFishId = null;
      this.guideOpen = !this.guideOpen;
      this.render();
    });

    this.navMuteBtn.addEventListener('click', () => {
      this.sound.unlock();
      const nextMuted = !this.state.muted;
      this.state.setMuted(nextMuted);
      this.sound.setMuted(nextMuted);
      if (!nextMuted) this.sound.playClick();
    });

    this.root.querySelector('#btn-start-play')!.addEventListener('click', () => {
      this.sound.unlock();
      this.sound.playClick();
      this.state.markStarted();
      this.callbacks.onStartPlay();
      this.render();
    });
  }

  public setFishingSnapshot(snap: FishingHudSnapshot): void {
    this.fishingSnap = snap;
    if (this.state.mode === 'fishing') {
      this.renderFishingStage();
    }
  }

  public setOrreryHover(planet: PlanetConfig | null): void {
    this.orreryHover = planet;
    if (this.state.mode === 'orrery') {
      this.renderOrreryStage();
    }
  }

  public setAquariumSelection(species: FishSpecies | null): void {
    this.aquariumSelected = species;
    this.activeQuizFishId = null;
    this.quizFeedback = null;
    if (this.state.mode === 'aquarium') {
      this.renderAquariumStage();
    }
  }

  public toggleGuide(open?: boolean): void {
    this.guideOpen = open ?? !this.guideOpen;
    this.render();
  }

  private renderScienceBadge(b: ScienceBadge): string {
    return `
      <span class="sci-badge tone-${b.tone}">
        <span class="sci-icon">${getScienceBadgeSvg(b.icon)}</span>
        <span>${b.label}</span>
      </span>
    `;
  }

  private renderPips(caughtCount: number, total = 4): string {
    let html = '<span class="pips">';
    for (let i = 0; i < total; i++) {
      html += `<span class="pip ${i < caughtCount ? 'filled' : ''}"></span>`;
    }
    return html + '</span>';
  }

  private renderQuizBox(species: FishSpecies): string {
    const q = getQuizForSpecies(species);
    const rec = this.state.getCatchRecord(species.id);
    if (rec?.quizStar) {
      return `<div class="quiz-earned">${ICONS.quizStar} <span>Star Sticker Earned!</span></div>`;
    }
    return `
      <div class="quiz-box">
        <div class="quiz-prompt">${q.prompt}</div>
        <div class="quiz-options">
          ${q.options
            .map(
              (opt, idx) => `
            <button class="quiz-opt-btn" data-quiz-idx="${idx}">
              <span class="quiz-opt-icon" style="${opt.color ? `color:${opt.color}` : ''}">${getScienceBadgeSvg(opt.iconKey)}</span>
              <span>${opt.label}</span>
            </button>
          `,
            )
            .join('')}
        </div>
        ${this.quizFeedback ? `<div class="quiz-feedback">${this.quizFeedback}</div>` : ''}
      </div>
    `;
  }

  private bindQuizEvents(container: HTMLElement, species: FishSpecies, onUpdated: () => void): void {
    const q = getQuizForSpecies(species);
    container.querySelectorAll('.quiz-opt-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number((btn as HTMLElement).dataset.quizIdx);
        if (idx === q.correctIndex) {
          this.state.awardQuizStar(species.id);
          this.sound.playQuizWin();
          this.quizFeedback = null;
          this.activeQuizFishId = null;
        } else {
          this.sound.playAmberWarn();
          this.quizFeedback = 'Not quite — try another answer!';
        }
        onUpdated();
      });
    });
  }

  public render(): void {
    this.startOverlay.classList.toggle('hidden', this.state.hasStarted);

    const planet = PLANET_MAP[this.state.currentPlanet];
    const caughtHere = this.state.getCaughtCountForPlanet(planet.id);
    this.topLeftPill.innerHTML = `
      <span class="planet-dot" style="background:${planet.planetColor}; box-shadow: 0 0 10px ${planet.accentColor}"></span>
      <span class="planet-pill-text">
        <strong>${planet.name}</strong>
        <small>${planet.subtitle}</small>
      </span>
      ${this.renderPips(caughtHere)}
    `;

    // Research Mission pill
    const mission = this.state.getCurrentMission();
    if (!this.state.hasStarted) {
      this.missionPill.classList.add('hidden');
    } else if (mission) {
      this.missionPill.classList.remove('hidden');
      this.missionPill.innerHTML = `
        <span class="mission-icon">${getMissionIcon(mission.icon)}</span>
        <span class="mission-text">${mission.shortLabel}</span>
        <span class="mission-count">${this.state.missionIndex}/${RESEARCH_MISSIONS.length}</span>
      `;
    } else {
      this.missionPill.classList.remove('hidden');
      this.missionPill.innerHTML = `
        <span class="mission-icon">${ICONS.trophy}</span>
        <span class="mission-text">All Research Goals Complete!</span>
      `;
    }

    // Toast banner
    if (this.state.recentToast) {
      this.toastEl.classList.remove('hidden');
      this.toastEl.innerHTML = `
        <span class="toast-icon">${getMissionIcon(this.state.recentToast.icon)}</span>
        <div>
          <strong>${this.state.recentToast.title}</strong>
          <small>${this.state.recentToast.subtitle}</small>
        </div>
      `;
    } else {
      this.toastEl.classList.add('hidden');
    }

    this.navFishingBtn.classList.toggle('active', this.state.mode === 'fishing' && !this.guideOpen);
    this.navOrreryBtn.classList.toggle('active', this.state.mode === 'orrery' && !this.guideOpen);
    this.navAquariumBtn.classList.toggle('active', this.state.mode === 'aquarium' && !this.guideOpen);
    this.navGuideBtn.classList.toggle('active', this.guideOpen);
    this.navMuteBtn.innerHTML = this.state.muted ? ICONS.soundOff : ICONS.soundOn;
    this.navMuteBtn.classList.toggle('muted', this.state.muted);

    const totalCaught = this.state.getTotalCaughtSpecies();
    this.aquariumBadge.textContent = String(totalCaught);
    this.aquariumBadge.classList.toggle('hidden', totalCaught === 0);

    this.fishingStageEl.classList.toggle('hidden', this.state.mode !== 'fishing' || !this.state.hasStarted || this.guideOpen);
    this.orreryStageEl.classList.toggle('hidden', this.state.mode !== 'orrery' || !this.state.hasStarted || this.guideOpen);
    this.aquariumStageEl.classList.toggle('hidden', this.state.mode !== 'aquarium' || !this.state.hasStarted || this.guideOpen);

    if (this.state.mode === 'fishing') this.renderFishingStage();
    if (this.state.mode === 'orrery') this.renderOrreryStage();
    if (this.state.mode === 'aquarium') this.renderAquariumStage();
    this.renderGuide();
  }

  private renderFishingStage(): void {
    const snap = this.fishingSnap;
    const planet = PLANET_MAP[this.state.currentPlanet];
    const hasScanner = this.state.isMilestoneUnlocked('scanner_lens');

    // Bottom-left tool dock (Lures + Space Event + Scanner) shown when not in Discovery card
    const showTools = snap.phase !== 'DISCOVERY';
    const lureButtons = LURES.map((l) => {
      const icon = l.id === 'sun' ? ICONS.sunLure : l.id === 'deep' ? ICONS.deepLure : ICONS.sonarLure;
      const active = this.state.activeLure === l.id;
      return `
        <button class="tool-btn ${active ? 'active' : ''}" data-lure="${l.id}" title="${l.name}: ${l.hint}" style="--tool-col:${l.color}">
          <span class="tool-icon">${icon}</span>
          <span class="tool-label">${l.shortLabel}</span>
        </button>
      `;
    }).join('');

    const toolsHtml = showTools
      ? `
        <div class="fishing-tools">
          <div class="lure-dock">${lureButtons}</div>
          <div class="world-toggles">
            <button class="tool-btn ${snap.spaceEventActive ? 'active' : ''}" id="btn-space-event" title="Toggle ${planet.eventName}" style="--tool-col:${planet.accentColor}">
              <span class="tool-icon">${ICONS.weather}</span>
              <span class="tool-label">${planet.eventName}</span>
            </button>
            ${
              hasScanner
                ? `<button class="tool-btn ${snap.scannerActive ? 'active' : ''}" id="btn-aqua-scanner" title="Aqua Scanner Lens (Q)" style="--tool-col:#7cf7ff">
                    <span class="tool-icon">${ICONS.scanner}</span>
                    <span class="tool-label">Scan</span>
                  </button>`
                : ''
            }
          </div>
        </div>
      `
      : '';

    let centerHtml = '';
    if (snap.phase === 'IDLE' && !snap.hasCastOnce) {
      centerHtml = `
        <div class="hint-pill">
          <span class="hint-icon">${ICONS.castHint}</span>
          <span>Click water or press <strong>Space</strong> to cast</span>
        </div>
      `;
    } else if (snap.phase === 'WAITING' && snap.inHotspot) {
      centerHtml = `
        <div class="hotspot-pill">
          <span class="hint-icon">${ICONS.sparkle}</span>
          <span>Sparkling Hotspot!</span>
        </div>
      `;
    } else if (snap.phase === 'BITE') {
      centerHtml = `
        <div class="bite-cue">
          <span class="bite-pulse">${ICONS.sparkle}</span>
          <span>Click or press <strong>Space</strong>!</span>
        </div>
      `;
    } else if (snap.phase === 'REELING') {
      const pct = Math.round(snap.reelProgress * 100);
      const circ = 2 * Math.PI * 34;
      const offset = circ * (1 - snap.reelProgress);
      const isDarting = snap.tugState === 'DARTING';
      centerHtml = `
        <div class="reel-ring-wrap ${isDarting ? 'darting' : ''}">
          <svg class="reel-svg" viewBox="0 0 84 84">
            <circle cx="42" cy="42" r="34" class="reel-track"/>
            <circle cx="42" cy="42" r="34" class="reel-fill"
              stroke-dasharray="${circ}"
              stroke-dashoffset="${offset}"/>
          </svg>
          <div class="reel-center-icon">${ICONS.fishSilhouette}</div>
          <div class="reel-label">${isDarting ? 'Amber! Let go briefly...' : `Hold Click / Space · ${pct}%`}</div>
        </div>
      `;
    } else if (snap.phase === 'DISCOVERY' && snap.discoveredRelic) {
      const r = snap.discoveredRelic;
      centerHtml = `
        <div class="discovery-card relic-card">
          <div class="discovery-head">
            <span class="new-tag">${ICONS.relic} SPACE RELIC FOUND!</span>
            <h2>${r.name}</h2>
          </div>
          <p class="science-caption">${r.caption}</p>
          <button class="primary-action-btn" id="btn-collect-fish">
            <span class="btn-icon">${ICONS.aquarium}</span>
            <span>Place in Aquarium</span>
          </button>
        </div>
      `;
    } else if (snap.phase === 'DISCOVERY' && snap.discoveredFish) {
      const f = snap.discoveredFish;
      const sizeText = SIZE_LABEL[snap.discoveredSize];
      centerHtml = `
        <div class="discovery-card">
          <div class="discovery-head">
            <div class="tag-row">
              ${snap.isNewDiscovery ? `<span class="new-tag">${ICONS.sparkle} NEW DISCOVERY</span>` : '<span class="repeat-tag">CAUGHT AGAIN</span>'}
              ${snap.discoveredStarlight ? `<span class="starlight-tag">${ICONS.sparkle} STARLIGHT SHIMMER</span>` : ''}
              <span class="size-tag size-${snap.discoveredSize}"><span class="sci-icon">${ICONS.ruler}</span> ${sizeText}</span>
            </div>
            <h2>${f.name}</h2>
          </div>
          <div class="badge-row">
            ${this.renderScienceBadge(f.science.tempBadge)}
            ${this.renderScienceBadge(f.science.gravityBadge)}
            ${this.renderScienceBadge(f.science.habitatBadge)}
            ${this.renderScienceBadge(f.science.adaptationBadge)}
          </div>
          <p class="science-caption">${f.science.caption}</p>
          <button class="primary-action-btn" id="btn-collect-fish">
            <span class="btn-icon">${ICONS.aquarium}</span>
            <span>Send to Aquarium</span>
          </button>
        </div>
      `;
    }

    this.fishingStageEl.innerHTML = toolsHtml + centerHtml;

    this.fishingStageEl.querySelectorAll('[data-lure]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = (btn as HTMLElement).dataset.lure as LureId;
        this.sound.playClick();
        this.callbacks.onSelectLure(id);
      });
    });
    this.fishingStageEl.querySelector('#btn-space-event')?.addEventListener('click', () => {
      this.callbacks.onToggleEvent();
    });
    this.fishingStageEl.querySelector('#btn-aqua-scanner')?.addEventListener('click', () => {
      this.callbacks.onTriggerScanner();
    });
    this.fishingStageEl.querySelector('#btn-collect-fish')?.addEventListener('click', () => {
      this.callbacks.onCollectDiscovery();
    });
  }

  private renderOrreryStage(): void {
    const p = this.orreryHover ?? PLANET_MAP[this.state.currentPlanet];
    const caught = this.state.getCaughtCountForPlanet(p.id);
    const isLocked = Boolean(p.isSecret) && !this.state.isPlutoUnlocked();
    const explored = this.state.getCoreWorldsExploredCount();

    this.orreryStageEl.innerHTML = `
      <div class="orrery-strip">
        <div class="orrery-title-row">
          <span class="planet-dot lg" style="background:${p.planetColor}; box-shadow:0 0 14px ${p.accentColor}"></span>
          <div>
            <h3>${isLocked ? 'Secret World · Pluto' : `${p.name} · `}<span>${isLocked ? 'Locked Orbit' : p.subtitle}</span></h3>
            <p class="orrery-caption">${
              isLocked
                ? `Catch at least 1 creature on all 6 core worlds to unlock Pluto! (${explored}/6 explored)`
                : p.science.caption
            }</p>
          </div>
          <div class="orrery-right">
            ${isLocked ? `<span class="lock-pill">${ICONS.lock} ${explored}/6</span>` : `${this.renderPips(caught)}<button class="warp-btn" id="btn-warp-selected">Fly Here</button>`}
          </div>
        </div>
        ${
          isLocked
            ? ''
            : `<div class="badge-row">
                ${this.renderScienceBadge({ icon: 'temp', label: p.science.tempLabel, tone: p.science.tempLevel >= 4 ? 'warm' : 'cool' })}
                ${this.renderScienceBadge({ icon: 'gravity', label: p.science.gravityLabel, tone: 'gold' })}
                ${this.renderScienceBadge({ icon: p.science.oceanIcon, label: p.science.oceanType, tone: 'teal' })}
              </div>`
        }
      </div>
    `;
    this.orreryStageEl.querySelector('#btn-warp-selected')?.addEventListener('click', () => {
      this.callbacks.onWarpToPlanet(p.id);
    });
  }

  private renderAquariumStage(): void {
    const total = this.state.getTotalCaughtSpecies();
    if (total === 0 && this.state.relics.length === 0) {
      this.aquariumStageEl.innerHTML = `
        <div class="empty-tank-card">
          <div class="empty-icon">${ICONS.aquarium}</div>
          <h3>Your Starlight Aquarium is Ready!</h3>
          <p>Cast your line on any world to collect glowing sea creatures and space relics here.</p>
          <button class="primary-action-btn" id="btn-go-fish">
            <span class="btn-icon">${ICONS.rod}</span>
            <span>Go Fishing</span>
          </button>
        </div>
      `;
      this.aquariumStageEl.querySelector('#btn-go-fish')?.addEventListener('click', () => {
        this.sound.playClick();
        this.callbacks.onSwitchMode('fishing');
      });
      return;
    }

    const filterPills = [
      `<button class="filter-pill ${this.aquariumFilter === 'all' ? 'active' : ''}" data-filter="all">All (${total})</button>`,
      ...PLANETS.filter((pl) => !pl.isSecret || this.state.isPlutoUnlocked()).map((pl) => {
        const c = this.state.getCaughtCountForPlanet(pl.id);
        return `
          <button class="filter-pill ${this.aquariumFilter === pl.id ? 'active' : ''}" data-filter="${pl.id}">
            <span class="planet-dot sm" style="background:${pl.planetColor}"></span>
            <span>${pl.name} (${c}/4)</span>
          </button>
        `;
      }),
    ].join('');

    let inspectHtml = `<div class="tank-tip">Drag to look around · Click any creature to inspect or earn a Star Sticker</div>`;
    if (this.aquariumSelected) {
      const f = this.aquariumSelected;
      const rec = this.state.getCatchRecord(f.id);
      const quizOpen = this.activeQuizFishId === f.id;
      inspectHtml = `
        <div class="tank-inspect-card">
          <div class="inspect-head">
            <h3>${f.name}</h3>
            <span class="inspect-world">${PLANET_MAP[f.planetId].name}</span>
            ${rec ? `<span class="size-tag size-${rec.bestSize}">${SIZE_LABEL[rec.bestSize]}</span>` : ''}
            ${rec?.hasStarlight ? `<span class="starlight-tag">${ICONS.sparkle} Starlight</span>` : ''}
            ${
              rec?.quizStar
                ? `<span class="quiz-star-pill" title="Star Sticker Earned">${ICONS.quizStar}</span>`
                : `<button class="quiz-trigger-btn" id="btn-open-tank-quiz" title="Answer a picture question for a Star Sticker!">${ICONS.quizStar}?</button>`
            }
          </div>
          ${
            quizOpen
              ? this.renderQuizBox(f)
              : `
                <div class="badge-row">
                  ${this.renderScienceBadge(f.science.tempBadge)}
                  ${this.renderScienceBadge(f.science.gravityBadge)}
                  ${this.renderScienceBadge(f.science.habitatBadge)}
                  ${this.renderScienceBadge(f.science.adaptationBadge)}
                </div>
                <p class="science-caption">${f.science.caption}</p>
              `
          }
        </div>
      `;
    }

    this.aquariumStageEl.innerHTML = `
      <div class="aquarium-controls">
        ${inspectHtml}
        <div class="aquarium-bar">
          <div class="filter-row">${filterPills}</div>
          <div class="toy-row">
            <button class="toy-btn feed" id="btn-feed-fish" title="Drop Starlight Food">
              <span class="btn-icon">${ICONS.food}</span>
              <span>Feed</span>
            </button>
            <button class="toy-btn bubble" id="btn-bubble-jet" title="Launch Bubble Jet">
              <span class="btn-icon">${ICONS.bubbleJet}</span>
              <span>Bubbles</span>
            </button>
            <button class="toy-btn chime" id="btn-light-chime" title="Pulse Light Chime">
              <span class="btn-icon">${ICONS.chime}</span>
              <span>Chime</span>
            </button>
          </div>
        </div>
      </div>
    `;

    if (this.aquariumSelected && this.activeQuizFishId === this.aquariumSelected.id) {
      this.bindQuizEvents(this.aquariumStageEl, this.aquariumSelected, () => this.renderAquariumStage());
    }

    this.aquariumStageEl.querySelector('#btn-open-tank-quiz')?.addEventListener('click', () => {
      if (!this.aquariumSelected) return;
      this.sound.playClick();
      this.activeQuizFishId = this.aquariumSelected.id;
      this.quizFeedback = null;
      this.renderAquariumStage();
    });

    this.aquariumStageEl.querySelector('#btn-feed-fish')?.addEventListener('click', () => {
      this.callbacks.onFeedAquarium();
    });
    this.aquariumStageEl.querySelector('#btn-bubble-jet')?.addEventListener('click', () => {
      this.callbacks.onBubbleJet();
    });
    this.aquariumStageEl.querySelector('#btn-light-chime')?.addEventListener('click', () => {
      this.callbacks.onLightChime();
    });

    this.aquariumStageEl.querySelectorAll('.filter-pill').forEach((btn) => {
      btn.addEventListener('click', () => {
        const val = (btn as HTMLElement).dataset.filter as PlanetId | 'all';
        this.aquariumFilter = val;
        this.sound.playClick();
        this.callbacks.onFilterAquarium(val);
        this.renderAquariumStage();
      });
    });
  }

  private renderGuide(): void {
    this.guideOverlayEl.classList.toggle('hidden', !this.guideOpen);
    if (!this.guideOpen) return;

    const plutoUnlocked = this.state.isPlutoUnlocked();
    const p = PLANET_MAP[this.guidePlanet];
    const planetFish = getFishForPlanet(this.guidePlanet);

    const tabs = PLANETS.map((pl) => {
      const c = this.state.getCaughtCountForPlanet(pl.id);
      const locked = Boolean(pl.isSecret) && !plutoUnlocked;
      return `
        <button class="guide-tab ${pl.id === this.guidePlanet ? 'active' : ''} ${locked ? 'locked' : ''}" data-planet="${pl.id}">
          <span class="planet-dot sm" style="background:${pl.planetColor}"></span>
          <span>${pl.name}</span>
          <small>${locked ? '🔒' : `${c}/4`}</small>
        </button>
      `;
    }).join('');

    const cards = planetFish
      .map((f) => {
        const rec = this.state.getCatchRecord(f.id);
        const caught = Boolean(rec);
        const selected = this.guideSelectedFish?.id === f.id;
        return `
          <button class="guide-card ${caught ? 'caught' : 'locked'} ${selected ? 'selected' : ''}" data-fish="${f.id}">
            <div class="guide-fish-icon" style="${caught ? `color:${f.glowColor}; background: radial-gradient(circle, ${f.primaryColor}55, transparent 70%)` : ''}">
              ${ICONS.fishSilhouette}
            </div>
            <div class="guide-card-info">
              <strong>
                ${caught ? f.name : 'Undiscovered'}
                ${rec?.quizStar ? `<span class="inline-star">${ICONS.quizStar}</span>` : ''}
              </strong>
              <small>${
                caught && rec
                  ? `Caught ×${rec.count} · ${SIZE_LABEL[rec.bestSize]}${rec.hasStarlight ? ' · ★ Starlight' : ''}`
                  : f.science.habitatBadge.label
              }</small>
            </div>
          </button>
        `;
      })
      .join('');

    let detail = '';
    if (this.guideSelectedFish && this.state.isCaught(this.guideSelectedFish.id)) {
      const sf = this.guideSelectedFish;
      const rec = this.state.getCatchRecord(sf.id);
      const quizOpen = this.activeQuizFishId === sf.id;
      detail = `
        <div class="guide-detail">
          <div class="guide-detail-head">
            <strong>${sf.name}</strong>
            ${
              rec?.quizStar
                ? `<span class="quiz-star-pill">${ICONS.quizStar} Star Sticker</span>`
                : `<button class="quiz-trigger-btn" id="btn-open-guide-quiz">${ICONS.quizStar}? Picture Quiz</button>`
            }
          </div>
          ${
            quizOpen
              ? this.renderQuizBox(sf)
              : `
                <div class="badge-row">
                  ${this.renderScienceBadge(sf.science.tempBadge)}
                  ${this.renderScienceBadge(sf.science.gravityBadge)}
                  ${this.renderScienceBadge(sf.science.habitatBadge)}
                  ${this.renderScienceBadge(sf.science.adaptationBadge)}
                </div>
                <p class="science-caption">${sf.science.caption}</p>
              `
          }
        </div>
      `;
    }

    const gearHtml = MILESTONES.map((m) => {
      const unlocked = this.state.isMilestoneUnlocked(m.id);
      return `
        <span class="gear-chip ${unlocked ? 'unlocked' : ''}" title="${m.rewardText}">
          <span class="sci-icon">${getMissionIcon(m.icon)}</span>
          <span>${m.name} (${m.requiredSpecies})</span>
        </span>
      `;
    }).join('');

    const relicsHtml = SPACE_RELICS.map((r) => {
      const owned = this.state.hasRelic(r.id);
      return `
        <span class="gear-chip ${owned ? 'unlocked' : ''}" title="${owned ? r.caption : 'Found by fishing on ' + PLANET_MAP[r.planetId].name}">
          <span class="sci-icon" style="${owned ? `color:${r.accentColor}` : ''}">${ICONS.relic}</span>
          <span>${owned ? r.name : '???'}</span>
        </span>
      `;
    }).join('');

    this.guideOverlayEl.innerHTML = `
      <div class="guide-panel">
        <div class="guide-header">
          <div class="guide-title-wrap">
            <span class="guide-icon">${ICONS.guide}</span>
            <h2>Solar Field Guide</h2>
            <span class="guide-total">${this.state.getTotalCaughtSpecies()} / ${this.state.getTotalSpeciesCount()} Species</span>
            <span class="guide-stars">${ICONS.quizStar} ${this.state.getTotalQuizStars()}</span>
          </div>
          <button class="dock-btn close-btn" id="btn-close-guide" title="Close">${ICONS.close}</button>
        </div>

        <div class="guide-tabs">${tabs}</div>

        <div class="guide-planet-strip">
          <div class="badge-row">
            ${this.renderScienceBadge({ icon: 'temp', label: p.science.tempLabel, tone: p.science.tempLevel >= 4 ? 'warm' : 'cool' })}
            ${this.renderScienceBadge({ icon: 'gravity', label: p.science.gravityLabel, tone: 'gold' })}
            ${this.renderScienceBadge({ icon: p.science.oceanIcon, label: p.science.oceanType, tone: 'teal' })}
          </div>
          <p class="science-caption">${p.science.caption}</p>
        </div>

        <div class="guide-grid">${cards}</div>
        ${detail}

        <div class="guide-extras">
          <div class="extras-label">Gear Upgrades</div>
          <div class="extras-row">${gearHtml}</div>
          <div class="extras-label">Space Relics (${this.state.relics.length}/${SPACE_RELICS.length})</div>
          <div class="extras-row">${relicsHtml}</div>
        </div>
      </div>
    `;

    if (this.guideSelectedFish && this.activeQuizFishId === this.guideSelectedFish.id) {
      this.bindQuizEvents(this.guideOverlayEl, this.guideSelectedFish, () => this.renderGuide());
    }

    this.guideOverlayEl.querySelector('#btn-open-guide-quiz')?.addEventListener('click', () => {
      if (!this.guideSelectedFish) return;
      this.sound.playClick();
      this.activeQuizFishId = this.guideSelectedFish.id;
      this.quizFeedback = null;
      this.renderGuide();
    });

    this.guideOverlayEl.querySelector('#btn-close-guide')?.addEventListener('click', () => {
      this.sound.playClick();
      this.guideOpen = false;
      this.activeQuizFishId = null;
      this.render();
    });

    this.guideOverlayEl.querySelectorAll('.guide-tab:not(.locked)').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.sound.playClick();
        this.guidePlanet = (btn as HTMLElement).dataset.planet as PlanetId;
        this.guideSelectedFish = null;
        this.activeQuizFishId = null;
        this.renderGuide();
      });
    });

    this.guideOverlayEl.querySelectorAll('.guide-card.caught').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.sound.playClick();
        const fid = (btn as HTMLElement).dataset.fish!;
        this.guideSelectedFish = FISH_MAP[fid] ?? null;
        this.activeQuizFishId = null;
        this.quizFeedback = null;
        this.renderGuide();
      });
    });
  }
}
