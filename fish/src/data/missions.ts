export type MissionCheckType =
  | 'catch_planet'
  | 'catch_lure'
  | 'catch_hotspot'
  | 'catch_event'
  | 'catch_special'
  | 'find_relic'
  | 'feed_tank'
  | 'bubble_tank';

export interface ResearchMission {
  id: string;
  icon: 'rod' | 'deepLure' | 'sparkle' | 'orrery' | 'food' | 'weather' | 'ruler' | 'relic' | 'bubbleJet';
  shortLabel: string;
  checkType: MissionCheckType;
  targetValue?: string;
}

export const RESEARCH_MISSIONS: ResearchMission[] = [
  {
    id: 'm_earth',
    icon: 'rod',
    shortLabel: 'Catch 1 creature on Earth',
    checkType: 'catch_planet',
    targetValue: 'earth',
  },
  {
    id: 'm_deep_lure',
    icon: 'deepLure',
    shortLabel: 'Catch with Deep-Pulse Lure',
    checkType: 'catch_lure',
    targetValue: 'deep',
  },
  {
    id: 'm_hotspot',
    icon: 'sparkle',
    shortLabel: 'Cast into a Sparkling Hotspot',
    checkType: 'catch_hotspot',
  },
  {
    id: 'm_mars',
    icon: 'orrery',
    shortLabel: 'Fly to Mars & catch 1 fish',
    checkType: 'catch_planet',
    targetValue: 'mars',
  },
  {
    id: 'm_feed',
    icon: 'food',
    shortLabel: 'Feed creatures in Aquarium',
    checkType: 'feed_tank',
  },
  {
    id: 'm_event',
    icon: 'weather',
    shortLabel: 'Catch during a Space Event',
    checkType: 'catch_event',
  },
  {
    id: 'm_bubble',
    icon: 'bubbleJet',
    shortLabel: 'Launch Bubble Jet in Aquarium',
    checkType: 'bubble_tank',
  },
  {
    id: 'm_outer',
    icon: 'orrery',
    shortLabel: 'Catch on Europa or Titan',
    checkType: 'catch_planet',
    targetValue: 'europa|titan',
  },
  {
    id: 'm_special',
    icon: 'ruler',
    shortLabel: 'Catch a Jumbo or Starlight fish',
    checkType: 'catch_special',
  },
  {
    id: 'm_relic',
    icon: 'relic',
    shortLabel: 'Reel up a Space Relic',
    checkType: 'find_relic',
  },
];
