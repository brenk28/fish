export type PlanetId = 'earth' | 'mars' | 'europa' | 'titan' | 'enceladus' | 'neptune' | 'pluto';

export type OceanBadgeIcon = 'wave' | 'ice' | 'crystal' | 'flame' | 'cloud';

export interface PlanetScience {
  tempLabel: string;
  tempLevel: 1 | 2 | 3 | 4 | 5;
  gravityLabel: string;
  gravityLevel: 1 | 2 | 3 | 4 | 5;
  oceanType: string;
  oceanIcon: OceanBadgeIcon;
  caption: string;
}

export interface PlanetConfig {
  id: PlanetId;
  name: string;
  subtitle: string;
  orbitRadius: number;
  orbitSpeed: number;
  initialAngle: number;
  planetRadius: number;
  planetColor: string;
  accentColor: string;
  hasRings: boolean;
  isSecret?: boolean;
  eventName: string;
  skyColors: {
    zenith: string;
    mid: string;
    horizon: string;
    starDensity: number;
  };
  waterColors: {
    deep: string;
    shallow: string;
    foam: string;
    specular: string;
    waveHeight: number;
  };
  ambientColor: string;
  sunColor: string;
  fogColor: string;
  fogDensity: number;
  ambientChord: number[];
  science: PlanetScience;
}

export const CORE_PLANET_IDS: PlanetId[] = [
  'earth',
  'mars',
  'europa',
  'titan',
  'enceladus',
  'neptune',
];

export const PLANETS: PlanetConfig[] = [
  {
    id: 'earth',
    name: 'Earth',
    subtitle: 'Coral Lagoon',
    orbitRadius: 4.4,
    orbitSpeed: 0.24,
    initialAngle: 0.4,
    planetRadius: 0.56,
    planetColor: '#2c88d9',
    accentColor: '#4fd1a5',
    hasRings: false,
    eventName: 'Starlight Sea-Fireflies',
    skyColors: {
      zenith: '#133b6e',
      mid: '#2d7fb8',
      horizon: '#f7c588',
      starDensity: 0.22,
    },
    waterColors: {
      deep: '#083a5e',
      shallow: '#1fa9a8',
      foam: '#d9fbf7',
      specular: '#ffe7b3',
      waveHeight: 0.14,
    },
    ambientColor: '#8ec8eb',
    sunColor: '#ffdfaa',
    fogColor: '#98c4d9',
    fogDensity: 0.008,
    ambientChord: [261.63, 329.63, 392.0, 523.25],
    science: {
      tempLabel: 'Warm (22°C)',
      tempLevel: 5,
      gravityLabel: 'Earth Pull (1.0g)',
      gravityLevel: 4,
      oceanType: 'Saltwater Ocean',
      oceanIcon: 'wave',
      caption: 'Earth sits just the right distance from the Sun for liquid blue oceans to shimmer under golden skies.',
    },
  },
  {
    id: 'mars',
    name: 'Mars',
    subtitle: 'Canyon Ice-Spring',
    orbitRadius: 6.8,
    orbitSpeed: 0.18,
    initialAngle: 2.1,
    planetRadius: 0.44,
    planetColor: '#cf5c36',
    accentColor: '#7be0e8',
    hasRings: false,
    eventName: 'Meteor Shower',
    skyColors: {
      zenith: '#3e2330',
      mid: '#9b4a3e',
      horizon: '#ebb07f',
      starDensity: 0.45,
    },
    waterColors: {
      deep: '#114154',
      shallow: '#3fb5c2',
      foam: '#cdeef2',
      specular: '#ffd1a3',
      waveHeight: 0.09,
    },
    ambientColor: '#c98873',
    sunColor: '#ffc299',
    fogColor: '#b36b54',
    fogDensity: 0.011,
    ambientChord: [220.0, 277.18, 329.63, 440.0],
    science: {
      tempLabel: 'Chilly (-18°C)',
      tempLevel: 3,
      gravityLabel: 'Low Pull (0.38g)',
      gravityLevel: 2,
      oceanType: 'Buried Ice Spring',
      oceanIcon: 'ice',
      caption: 'Long ago Mars held rivers and lakes; today its water sleeps frozen beneath rust-red canyon dust.',
    },
  },
  {
    id: 'europa',
    name: 'Europa',
    subtitle: 'Sub-Ice Abyss',
    orbitRadius: 9.8,
    orbitSpeed: 0.13,
    initialAngle: 4.1,
    planetRadius: 0.58,
    planetColor: '#9bd4eb',
    accentColor: '#e0a96d',
    hasRings: false,
    eventName: 'Jupiter Eclipse Halo',
    skyColors: {
      zenith: '#05091a',
      mid: '#0e2247',
      horizon: '#356d9c',
      starDensity: 0.92,
    },
    waterColors: {
      deep: '#031936',
      shallow: '#14729e',
      foam: '#9bf2ff',
      specular: '#9be7ff',
      waveHeight: 0.12,
    },
    ambientColor: '#6da5d9',
    sunColor: '#d9ecff',
    fogColor: '#133157',
    fogDensity: 0.01,
    ambientChord: [196.0, 246.94, 293.66, 392.0],
    science: {
      tempLabel: 'Freezing (-160°C)',
      tempLevel: 2,
      gravityLabel: 'Feather Pull (0.13g)',
      gravityLevel: 2,
      oceanType: 'Sub-Ice Ocean',
      oceanIcon: 'ice',
      caption: 'Jupiter gently squeezes this icy moon, warming a deep dark ocean hidden under miles of glittering ice.',
    },
  },
  {
    id: 'titan',
    name: 'Titan',
    subtitle: 'Golden Methane Lakes',
    orbitRadius: 12.8,
    orbitSpeed: 0.095,
    initialAngle: 5.5,
    planetRadius: 0.62,
    planetColor: '#d99838',
    accentColor: '#f5d47a',
    hasRings: true,
    eventName: 'Golden Methane Rain',
    skyColors: {
      zenith: '#331d0c',
      mid: '#874f1e',
      horizon: '#e8a854',
      starDensity: 0.35,
    },
    waterColors: {
      deep: '#402607',
      shallow: '#b87a24',
      foam: '#ffdf9e',
      specular: '#ffe7ad',
      waveHeight: 0.07,
    },
    ambientColor: '#d69d56',
    sunColor: '#ffcf80',
    fogColor: '#9c6227',
    fogDensity: 0.012,
    ambientChord: [174.61, 220.0, 261.63, 349.23],
    science: {
      tempLabel: 'Super Cold (-179°C)',
      tempLevel: 1,
      gravityLabel: 'Feather Pull (0.14g)',
      gravityLevel: 2,
      oceanType: 'Methane Lake',
      oceanIcon: 'crystal',
      caption: 'Saturn’s largest moon wears thick golden haze and fills its glassy lakes with chilly liquid methane.',
    },
  },
  {
    id: 'enceladus',
    name: 'Enceladus',
    subtitle: 'Geyser Thermal Vents',
    orbitRadius: 15.8,
    orbitSpeed: 0.075,
    initialAngle: 1.2,
    planetRadius: 0.48,
    planetColor: '#dff5ff',
    accentColor: '#76e8ff',
    hasRings: true,
    eventName: 'Cryo-Geyser Burst',
    skyColors: {
      zenith: '#030612',
      mid: '#0b1830',
      horizon: '#2d577a',
      starDensity: 1.0,
    },
    waterColors: {
      deep: '#072238',
      shallow: '#35a6c7',
      foam: '#ffffff',
      specular: '#d6f9ff',
      waveHeight: 0.16,
    },
    ambientColor: '#9ad5eb',
    sunColor: '#e8f8ff',
    fogColor: '#163552',
    fogDensity: 0.009,
    ambientChord: [293.66, 369.99, 440.0, 587.33],
    science: {
      tempLabel: 'Warm Vents (-198°C ice)',
      tempLevel: 2,
      gravityLabel: 'Tiny Pull (0.01g)',
      gravityLevel: 1,
      oceanType: 'Geyser Vent Sea',
      oceanIcon: 'flame',
      caption: 'Brilliant white ice covers Enceladus, while warm ocean geysers spray sparkling snow plumes into space.',
    },
  },
  {
    id: 'neptune',
    name: 'Neptune',
    subtitle: 'Diamond Cloud-Sea',
    orbitRadius: 19.0,
    orbitSpeed: 0.055,
    initialAngle: 3.1,
    planetRadius: 0.72,
    planetColor: '#3658d9',
    accentColor: '#66f7d6',
    hasRings: false,
    eventName: 'Diamond Crystal Rain',
    skyColors: {
      zenith: '#07061f',
      mid: '#1b1d5e',
      horizon: '#4a43a8',
      starDensity: 0.96,
    },
    waterColors: {
      deep: '#10144a',
      shallow: '#3962c9',
      foam: '#9bfce8',
      specular: '#b2f7ff',
      waveHeight: 0.21,
    },
    ambientColor: '#7e8be6',
    sunColor: '#b5f3ff',
    fogColor: '#1c2059',
    fogDensity: 0.009,
    ambientChord: [246.94, 311.13, 369.99, 493.88],
    science: {
      tempLabel: 'Deep Freeze (-200°C)',
      tempLevel: 1,
      gravityLabel: 'Strong Pull (1.14g)',
      gravityLevel: 5,
      oceanType: 'Crystal Cloud-Sea',
      oceanIcon: 'cloud',
      caption: 'Far at the windy edge of the solar system, swirling sapphire clouds press carbon into glittering crystals.',
    },
  },
  {
    id: 'pluto',
    name: 'Pluto',
    subtitle: 'Heart-Glacier Sea',
    orbitRadius: 22.4,
    orbitSpeed: 0.04,
    initialAngle: 0.85,
    planetRadius: 0.45,
    planetColor: '#d9b5a3',
    accentColor: '#ff9ec7',
    hasRings: false,
    isSecret: true,
    eventName: 'Comet Heart-Glow',
    skyColors: {
      zenith: '#080517',
      mid: '#2b1947',
      horizon: '#bf769b',
      starDensity: 1.0,
    },
    waterColors: {
      deep: '#1a1238',
      shallow: '#6e4b8f',
      foam: '#ffd9eb',
      specular: '#ffbde0',
      waveHeight: 0.1,
    },
    ambientColor: '#d4a1c4',
    sunColor: '#ffe0f0',
    fogColor: '#2d1c47',
    fogDensity: 0.008,
    ambientChord: [329.63, 415.3, 493.88, 659.25],
    science: {
      tempLabel: 'Deep Frost (-229°C)',
      tempLevel: 1,
      gravityLabel: 'Tiny Pull (0.06g)',
      gravityLevel: 1,
      oceanType: 'Nitrogen Ice-Heart Sea',
      oceanIcon: 'ice',
      caption: 'Far out in the icy Kuiper Belt, dwarf planet Pluto wears a giant frozen nitrogen heart and dances with its twin moon Charon.',
    },
  },
];

export const PLANET_MAP: Record<PlanetId, PlanetConfig> = PLANETS.reduce(
  (acc, planet) => {
    acc[planet.id] = planet;
    return acc;
  },
  {} as Record<PlanetId, PlanetConfig>,
);
