import { PlanetId } from './planets';

export type RelicShape =
  | 'astrolabe'
  | 'wheel'
  | 'lantern'
  | 'compass'
  | 'prism'
  | 'geode'
  | 'heart';

export interface SpaceRelic {
  id: string;
  planetId: PlanetId;
  name: string;
  color: string;
  accentColor: string;
  shape: RelicShape;
  tankPos: [number, number, number];
  caption: string;
}

export const SPACE_RELICS: SpaceRelic[] = [
  {
    id: 'relic_earth_astrolabe',
    planetId: 'earth',
    name: 'Brass Star-Astrolabe',
    color: '#d9a74e',
    accentColor: '#7ceeff',
    shape: 'astrolabe',
    tankPos: [-4.4, -2.0, 1.4],
    caption: 'Sailors long ago used brass star-rings like this to navigate Earth’s oceans by the night sky.',
  },
  {
    id: 'relic_mars_wheel',
    planetId: 'mars',
    name: 'Mini Rover Wheel',
    color: '#c96842',
    accentColor: '#ffd485',
    shape: 'wheel',
    tankPos: [-2.8, -2.05, -1.3],
    caption: 'Real robotic rovers roll across Mars’s red dust on clever springy metal wheels with grip treads.',
  },
  {
    id: 'relic_europa_lantern',
    planetId: 'europa',
    name: 'Ice-Core Lantern',
    color: '#6ec8f0',
    accentColor: '#b3f7ff',
    shape: 'lantern',
    tankPos: [-1.1, -1.95, 1.8],
    caption: 'A crystal probe capsule built to melt through thick moon ice and light up hidden ocean caves.',
  },
  {
    id: 'relic_titan_compass',
    planetId: 'titan',
    name: 'Amber Haze Compass',
    color: '#d99838',
    accentColor: '#fff0a6',
    shape: 'compass',
    tankPos: [1.3, -2.05, -1.6],
    caption: 'A golden instrument tuned to find north through Titan’s thick orange hydrocarbon mist.',
  },
  {
    id: 'relic_enceladus_prism',
    planetId: 'enceladus',
    name: 'Cryo-Geyser Prism',
    color: '#d6f7ff',
    accentColor: '#7df7ff',
    shape: 'prism',
    tankPos: [2.9, -1.9, 1.5],
    caption: 'Frozen water crystals from Enceladus’s geysers split starlight into tiny icy rainbows.',
  },
  {
    id: 'relic_neptune_geode',
    planetId: 'neptune',
    name: 'Diamond Cloud Geode',
    color: '#4e6ef2',
    accentColor: '#66f7d6',
    shape: 'geode',
    tankPos: [4.5, -2.0, -1.1],
    caption: 'A glittering sapphire crystal cluster formed deep inside Neptune’s swirling storm pressure.',
  },
  {
    id: 'relic_pluto_heart',
    planetId: 'pluto',
    name: 'Heart-Glacier Crystal',
    color: '#e6a1be',
    accentColor: '#ffe0ef',
    shape: 'heart',
    tankPos: [0.0, -1.85, -2.1],
    caption: 'A rose-tinted frost gem from Pluto’s bright heart-shaped glacier plain at the edge of the solar system.',
  },
];

export const RELIC_MAP: Record<string, SpaceRelic> = SPACE_RELICS.reduce(
  (acc, r) => {
    acc[r.id] = r;
    return acc;
  },
  {} as Record<string, SpaceRelic>,
);

export function getRelicForPlanet(planetId: PlanetId): SpaceRelic | undefined {
  return SPACE_RELICS.find((r) => r.planetId === planetId);
}
