export type LureId = 'sun' | 'deep' | 'sonar';

export interface LureConfig {
  id: LureId;
  name: string;
  shortLabel: string;
  color: string;
  glowColor: string;
  preferredDepth: 'surface' | 'deep' | 'mid';
  hint: string;
}

export const LURES: LureConfig[] = [
  {
    id: 'sun',
    name: 'Sun-Spark Lure',
    shortLabel: 'Sun-Spark',
    color: '#ffd166',
    glowColor: '#ffe79e',
    preferredDepth: 'surface',
    hint: 'Shines near sunlit surface waters',
  },
  {
    id: 'deep',
    name: 'Deep-Pulse Lure',
    shortLabel: 'Deep-Pulse',
    color: '#4cd4ff',
    glowColor: '#8cf0ff',
    preferredDepth: 'deep',
    hint: 'Sinks toward deep abyssal floors',
  },
  {
    id: 'sonar',
    name: 'Sonar-Chime Lure',
    shortLabel: 'Sonar-Chime',
    color: '#b88aff',
    glowColor: '#e0c2ff',
    preferredDepth: 'mid',
    hint: 'Calls shy rare fish & space relics',
  },
];

export const LURE_MAP: Record<LureId, LureConfig> = LURES.reduce(
  (acc, lure) => {
    acc[lure.id] = lure;
    return acc;
  },
  {} as Record<LureId, LureConfig>,
);
