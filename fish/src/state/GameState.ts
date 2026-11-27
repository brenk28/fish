import { FISH_MAP, FISH_SPECIES, FishSpecies, getFishForPlanet } from '../data/fish';
import { LureId, LURE_MAP } from '../data/lures';
import { MilestoneConfig, MilestoneId, MILESTONES } from '../data/milestones';
import { MissionCheckType, RESEARCH_MISSIONS, ResearchMission } from '../data/missions';
import { CORE_PLANET_IDS, PlanetId, PLANET_MAP } from '../data/planets';
import { getRelicForPlanet, RELIC_MAP, SpaceRelic } from '../data/relics';

export type GameMode = 'fishing' | 'orrery' | 'aquarium';
export type FishSize = 'tiny' | 'regular' | 'jumbo';

export interface CaughtRecord {
  count: number;
  firstCaughtAt: number;
  bestSize: FishSize;
  hasStarlight: boolean;
  quizStar: boolean;
}

export interface CatchOutcomeFish {
  kind: 'fish';
  species: FishSpecies;
  size: FishSize;
  isStarlight: boolean;
}

export interface CatchOutcomeRelic {
  kind: 'relic';
  relic: SpaceRelic;
}

export type CatchOutcome = CatchOutcomeFish | CatchOutcomeRelic;

export interface CelebrationToast {
  title: string;
  subtitle: string;
  icon: string;
}

interface PersistedData {
  currentPlanet: PlanetId;
  caught: Record<string, Partial<CaughtRecord>>;
  muted: boolean;
  activeLure: LureId;
  relics: string[];
  missionIndex: number;
}

const STORAGE_KEY = 'starlight-angler-v1';

const SIZE_RANK: Record<FishSize, number> = {
  tiny: 1,
  regular: 2,
  jumbo: 3,
};

export class GameState {
  public currentPlanet: PlanetId = 'earth';
  public mode: GameMode = 'fishing';
  public caught: Record<string, CaughtRecord> = {};
  public muted = false;
  public hasStarted = false;
  public activeLure: LureId = 'sun';
  public relics: string[] = [];
  public missionIndex = 0;
  public recentToast: CelebrationToast | null = null;

  private toastTimer: number | null = null;
  private listeners = new Set<() => void>();

  constructor() {
    this.load();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(): void {
    for (const fn of this.listeners) {
      fn();
    }
  }

  private load(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<PersistedData>;
      if (parsed.currentPlanet && PLANET_MAP[parsed.currentPlanet]) {
        this.currentPlanet = parsed.currentPlanet;
      }
      if (parsed.caught && typeof parsed.caught === 'object') {
        for (const [id, rec] of Object.entries(parsed.caught)) {
          if (FISH_MAP[id] && rec && typeof rec.count === 'number' && rec.count > 0) {
            const bestSize: FishSize =
              rec.bestSize === 'tiny' || rec.bestSize === 'regular' || rec.bestSize === 'jumbo'
                ? rec.bestSize
                : 'regular';
            this.caught[id] = {
              count: rec.count,
              firstCaughtAt: typeof rec.firstCaughtAt === 'number' ? rec.firstCaughtAt : Date.now(),
              bestSize,
              hasStarlight: Boolean(rec.hasStarlight),
              quizStar: Boolean(rec.quizStar),
            };
          }
        }
      }
      if (typeof parsed.muted === 'boolean') {
        this.muted = parsed.muted;
      }
      if (parsed.activeLure && LURE_MAP[parsed.activeLure]) {
        this.activeLure = parsed.activeLure;
      }
      if (Array.isArray(parsed.relics)) {
        this.relics = parsed.relics.filter((id) => Boolean(RELIC_MAP[id]));
      }
      if (typeof parsed.missionIndex === 'number' && parsed.missionIndex >= 0) {
        this.missionIndex = parsed.missionIndex;
      }
    } catch {
      // Ignore corrupt storage
    }
  }

  private save(): void {
    try {
      const data: PersistedData = {
        currentPlanet: this.currentPlanet,
        caught: this.caught,
        muted: this.muted,
        activeLure: this.activeLure,
        relics: this.relics,
        missionIndex: this.missionIndex,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Ignore storage quota errors
    }
  }

  public showToast(title: string, subtitle: string, icon: string): void {
    this.recentToast = { title, subtitle, icon };
    if (this.toastTimer !== null) {
      window.clearTimeout(this.toastTimer);
    }
    this.toastTimer = window.setTimeout(() => {
      this.recentToast = null;
      this.toastTimer = null;
      this.emit();
    }, 4400);
    this.emit();
  }

  public setPlanet(planetId: PlanetId): void {
    if (planetId === 'pluto' && !this.isPlutoUnlocked()) return;
    this.currentPlanet = planetId;
    this.save();
    this.emit();
  }

  public setMode(mode: GameMode): void {
    this.mode = mode;
    this.emit();
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
    this.save();
    this.emit();
  }

  public setLure(lure: LureId): void {
    this.activeLure = lure;
    this.save();
    this.emit();
  }

  public markStarted(): void {
    if (!this.hasStarted) {
      this.hasStarted = true;
      this.emit();
    }
  }

  public getCoreWorldsExploredCount(): number {
    return CORE_PLANET_IDS.filter((id) => this.getCaughtCountForPlanet(id) >= 1).length;
  }

  public isPlutoUnlocked(): boolean {
    return this.getCoreWorldsExploredCount() === CORE_PLANET_IDS.length;
  }

  public isMilestoneUnlocked(id: MilestoneId): boolean {
    const m = MILESTONES.find((item) => item.id === id);
    if (!m) return false;
    return this.getTotalCaughtSpecies() >= m.requiredSpecies;
  }

  public recordCatch(
    fishId: string,
    size: FishSize,
    isStarlight: boolean,
  ): {
    isNewSpecies: boolean;
    isNewSizeRecord: boolean;
    isNewStarlight: boolean;
    unlockedMilestone: MilestoneConfig | null;
    unlockedPluto: boolean;
  } {
    const prevTotal = this.getTotalCaughtSpecies();
    const prevPluto = this.isPlutoUnlocked();
    const existing = this.caught[fishId];
    const isNewSpecies = !existing;
    const isNewSizeRecord = Boolean(existing && SIZE_RANK[size] > SIZE_RANK[existing.bestSize]);
    const isNewStarlight = Boolean(isStarlight && !existing?.hasStarlight);

    const bestSize: FishSize =
      existing && SIZE_RANK[existing.bestSize] > SIZE_RANK[size] ? existing.bestSize : size;

    this.caught[fishId] = {
      count: (existing?.count ?? 0) + 1,
      firstCaughtAt: existing?.firstCaughtAt ?? Date.now(),
      bestSize,
      hasStarlight: Boolean(existing?.hasStarlight || isStarlight),
      quizStar: Boolean(existing?.quizStar),
    };

    const nextTotal = this.getTotalCaughtSpecies();
    const unlockedMilestone =
      MILESTONES.find((m) => prevTotal < m.requiredSpecies && nextTotal >= m.requiredSpecies) ?? null;
    const unlockedPluto = !prevPluto && this.isPlutoUnlocked();

    this.save();
    this.emit();

    if (unlockedPluto) {
      this.showToast('Secret World Unlocked!', 'Pluto’s Heart-Glacier Sea is now open on the Orrery!', 'orrery');
    } else if (unlockedMilestone) {
      this.showToast(`Gear Upgrade: ${unlockedMilestone.name}`, unlockedMilestone.rewardText, unlockedMilestone.icon);
    }

    return {
      isNewSpecies,
      isNewSizeRecord,
      isNewStarlight,
      unlockedMilestone,
      unlockedPluto,
    };
  }

  public recordRelic(relicId: string): boolean {
    if (this.relics.includes(relicId)) return false;
    this.relics.push(relicId);
    this.save();
    this.emit();
    return true;
  }

  public hasRelic(relicId: string): boolean {
    return this.relics.includes(relicId);
  }

  public awardQuizStar(fishId: string): void {
    const existing = this.caught[fishId];
    if (!existing || existing.quizStar) return;
    existing.quizStar = true;
    this.save();
    this.emit();
  }

  public getCurrentMission(): ResearchMission | null {
    if (this.missionIndex >= RESEARCH_MISSIONS.length) return null;
    return RESEARCH_MISSIONS[this.missionIndex];
  }

  public notifyActivity(type: MissionCheckType, payload?: string): boolean {
    const mission = this.getCurrentMission();
    if (!mission || mission.checkType !== type) return false;

    if (mission.targetValue) {
      const allowed = mission.targetValue.split('|');
      if (!payload || !allowed.includes(payload)) return false;
    }

    this.missionIndex++;
    this.save();
    this.showToast('Research Goal Complete!', mission.shortLabel, 'trophy');
    this.emit();
    return true;
  }

  public isCaught(fishId: string): boolean {
    return Boolean(this.caught[fishId]);
  }

  public getCatchRecord(fishId: string): CaughtRecord | undefined {
    return this.caught[fishId];
  }

  public getCatchCount(fishId: string): number {
    return this.caught[fishId]?.count ?? 0;
  }

  public getCaughtCountForPlanet(planetId: PlanetId): number {
    return getFishForPlanet(planetId).filter((f) => Boolean(this.caught[f.id])).length;
  }

  public getTotalCaughtSpecies(): number {
    return Object.keys(this.caught).length;
  }

  public getTotalSpeciesCount(): number {
    return FISH_SPECIES.length;
  }

  public getTotalQuizStars(): number {
    return Object.values(this.caught).filter((r) => r.quizStar).length;
  }

  public getAllCaughtSpecies(): FishSpecies[] {
    return FISH_SPECIES.filter((f) => Boolean(this.caught[f.id]));
  }

  public pickCatchOutcome(
    planetId: PlanetId,
    lureId: LureId,
    inHotspot: boolean,
    inEvent: boolean,
  ): CatchOutcome {
    // Check Space Relic drop if planet's relic isn't collected yet
    const planetRelic = getRelicForPlanet(planetId);
    if (planetRelic && !this.hasRelic(planetRelic.id)) {
      const relicChance = (lureId === 'sonar' ? 0.2 : 0.1) + (inHotspot ? 0.1 : 0);
      if (Math.random() < relicChance) {
        return { kind: 'relic', relic: planetRelic };
      }
    }

    const pool = getFishForPlanet(planetId);
    const lure = LURE_MAP[lureId];
    const hasCrown = this.isMilestoneUnlocked('starlight_crown');

    const weights = pool.map((f) => {
      let w = f.rarity === 'common' ? 1.0 : f.rarity === 'uncommon' ? 0.72 : 0.45;
      if (!this.caught[f.id]) w *= 2.3; // Helpful discovery bias for a 6-year-old
      if (f.preferredDepth === lure.preferredDepth) w *= 2.5;
      if (lureId === 'sonar' && f.rarity === 'rare') w *= 1.8;
      if (inHotspot && f.rarity !== 'common') w *= 1.75;
      if (inEvent && f.rarity === 'rare') w *= 1.5;
      return w;
    });

    const totalW = weights.reduce((a, b) => a + b, 0);
    let roll = Math.random() * totalW;
    let species = pool[0];
    for (let i = 0; i < pool.length; i++) {
      roll -= weights[i];
      if (roll <= 0) {
        species = pool[i];
        break;
      }
    }

    // Roll size
    const jumboChance = 0.16 + (inHotspot ? 0.18 : 0) + (hasCrown ? 0.08 : 0);
    const sizeRoll = Math.random();
    const size: FishSize =
      sizeRoll < jumboChance ? 'jumbo' : sizeRoll < jumboChance + 0.24 ? 'tiny' : 'regular';

    // Roll Starlight shimmer variant
    const starlightChance =
      0.08 +
      (lureId === 'sonar' ? 0.08 : 0) +
      (inHotspot ? 0.1 : 0) +
      (inEvent ? 0.14 : 0) +
      (hasCrown ? 0.1 : 0);
    const isStarlight = Math.random() < starlightChance;

    return { kind: 'fish', species, size, isStarlight };
  }

  public resetProgress(): void {
    this.caught = {};
    this.relics = [];
    this.missionIndex = 0;
    this.activeLure = 'sun';
    this.currentPlanet = 'earth';
    this.recentToast = null;
    this.save();
    this.emit();
  }
}
