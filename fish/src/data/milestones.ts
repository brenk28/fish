export type MilestoneId = 'long_rod' | 'scanner_lens' | 'coral_arch' | 'starlight_crown';

export interface MilestoneConfig {
  id: MilestoneId;
  requiredSpecies: number;
  name: string;
  rewardText: string;
  icon: 'rod' | 'scanner' | 'aquarium' | 'sparkle';
}

export const MILESTONES: MilestoneConfig[] = [
  {
    id: 'long_rod',
    requiredSpecies: 4,
    name: 'Star-Reach Rod',
    rewardText: 'Cast farther into deep outer waters',
    icon: 'rod',
  },
  {
    id: 'scanner_lens',
    requiredSpecies: 8,
    name: 'Aqua Scanner Lens',
    rewardText: 'Reveal glowing underwater silhouettes',
    icon: 'scanner',
  },
  {
    id: 'coral_arch',
    requiredSpecies: 12,
    name: 'Luminous Coral Arch',
    rewardText: 'Grand glowing coral arch added to Aquarium',
    icon: 'aquarium',
  },
  {
    id: 'starlight_crown',
    requiredSpecies: 18,
    name: 'Starlight Crown',
    rewardText: 'Golden pier beacons & more Starlight variants',
    icon: 'sparkle',
  },
];
