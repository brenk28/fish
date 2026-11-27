import { PlanetId } from './planets';

export type FishArchetype =
  | 'torpedo'
  | 'ray'
  | 'ribbon'
  | 'jelly'
  | 'nautilus'
  | 'seahorse'
  | 'sailfin';

export type FishPattern = 'stripes' | 'spots' | 'iridescent' | 'marbled' | 'rings';

export type ScienceBadgeIcon =
  | 'temp'
  | 'gravity'
  | 'wave'
  | 'ice'
  | 'flame'
  | 'cloud'
  | 'crystal'
  | 'glow'
  | 'fins'
  | 'shell'
  | 'sound';

export interface ScienceBadge {
  icon: ScienceBadgeIcon;
  label: string;
  tone: 'warm' | 'cool' | 'gold' | 'teal' | 'violet';
}

export interface FishSpecies {
  id: string;
  planetId: PlanetId;
  name: string;
  archetype: FishArchetype;
  primaryColor: string;
  secondaryColor: string;
  glowColor: string;
  pattern: FishPattern;
  scale: number;
  swimSpeed: number;
  preferredDepth: 'surface' | 'mid' | 'deep';
  rarity: 'common' | 'uncommon' | 'rare';
  science: {
    tempBadge: ScienceBadge;
    gravityBadge: ScienceBadge;
    habitatBadge: ScienceBadge;
    adaptationBadge: ScienceBadge;
    caption: string;
  };
}

export const FISH_SPECIES: FishSpecies[] = [
  // ================= EARTH (4) =================
  {
    id: 'earth_sunburst_sailfin',
    planetId: 'earth',
    name: 'Sunburst Sailfin',
    archetype: 'sailfin',
    primaryColor: '#ff8a3d',
    secondaryColor: '#ffe066',
    glowColor: '#ffbe55',
    pattern: 'stripes',
    scale: 1.0,
    swimSpeed: 1.05,
    preferredDepth: 'surface',
    rarity: 'common',
    science: {
      tempBadge: { icon: 'temp', label: 'Warm Reef', tone: 'warm' },
      gravityBadge: { icon: 'gravity', label: 'Earth 1.0g', tone: 'gold' },
      habitatBadge: { icon: 'wave', label: 'Sunlit Shallows', tone: 'teal' },
      adaptationBadge: { icon: 'fins', label: 'Solar Sail', tone: 'warm' },
      caption: 'Its wide golden sail catches warm sunlight in shallow coral lagoons. Bright stripes help it hide among shimmering reef shadows.',
    },
  },
  {
    id: 'earth_azure_manta',
    planetId: 'earth',
    name: 'Azure Lagoon Ray',
    archetype: 'ray',
    primaryColor: '#1d7ec2',
    secondaryColor: '#7ef2e4',
    glowColor: '#5ee7ff',
    pattern: 'spots',
    scale: 1.15,
    swimSpeed: 0.9,
    preferredDepth: 'mid',
    rarity: 'common',
    science: {
      tempBadge: { icon: 'temp', label: 'Warm Sea', tone: 'warm' },
      gravityBadge: { icon: 'gravity', label: 'Earth 1.0g', tone: 'gold' },
      habitatBadge: { icon: 'wave', label: 'Coral Sand', tone: 'teal' },
      adaptationBadge: { icon: 'fins', label: 'Gliding Wings', tone: 'teal' },
      caption: 'Like underwater bird wings, its wide fins push smoothly through dense saltwater. Pale spots mimic ripples of sunlight on the sandy floor.',
    },
  },
  {
    id: 'earth_emerald_seadragon',
    planetId: 'earth',
    name: 'Emerald Kelp-Crown',
    archetype: 'seahorse',
    primaryColor: '#2eb872',
    secondaryColor: '#b7f587',
    glowColor: '#8affb1',
    pattern: 'marbled',
    scale: 0.95,
    swimSpeed: 0.72,
    preferredDepth: 'mid',
    rarity: 'uncommon',
    science: {
      tempBadge: { icon: 'temp', label: 'Mild Current', tone: 'teal' },
      gravityBadge: { icon: 'gravity', label: 'Earth 1.0g', tone: 'gold' },
      habitatBadge: { icon: 'wave', label: 'Kelp Forest', tone: 'teal' },
      adaptationBadge: { icon: 'fins', label: 'Leaf Camouflage', tone: 'teal' },
      caption: 'Its curled tail anchors around swaying sea-grass while tiny back fins flutter fast. Leafy patterns blend right into sunlit kelp fronds.',
    },
  },
  {
    id: 'earth_prism_nautilus',
    planetId: 'earth',
    name: 'Prism Nautilus',
    archetype: 'nautilus',
    primaryColor: '#f2b880',
    secondaryColor: '#5c80bc',
    glowColor: '#9be7ff',
    pattern: 'rings',
    scale: 1.0,
    swimSpeed: 0.75,
    preferredDepth: 'deep',
    rarity: 'rare',
    science: {
      tempBadge: { icon: 'temp', label: 'Cool Deep', tone: 'cool' },
      gravityBadge: { icon: 'gravity', label: 'Earth 1.0g', tone: 'gold' },
      habitatBadge: { icon: 'wave', label: 'Reef Drop-off', tone: 'cool' },
      adaptationBadge: { icon: 'shell', label: 'Air-Chamber Shell', tone: 'gold' },
      caption: 'Its spiral shell holds tiny gas rooms that fill or empty to float up or dive deep. Ancient nautilus cousins have lived in Earth’s seas for millions of years!',
    },
  },

  // ================= MARS (4) =================
  {
    id: 'mars_canyon_dart',
    planetId: 'mars',
    name: 'Rust-Canyon Dart',
    archetype: 'torpedo',
    primaryColor: '#d9623b',
    secondaryColor: '#6be5f0',
    glowColor: '#73f4ff',
    pattern: 'stripes',
    scale: 0.95,
    swimSpeed: 1.25,
    preferredDepth: 'surface',
    rarity: 'common',
    science: {
      tempBadge: { icon: 'temp', label: 'Chilly Spring', tone: 'warm' },
      gravityBadge: { icon: 'gravity', label: 'Low-G 0.38g', tone: 'gold' },
      habitatBadge: { icon: 'ice', label: 'Canyon Pool', tone: 'cool' },
      adaptationBadge: { icon: 'fins', label: 'Quick Tail', tone: 'warm' },
      caption: 'In Mars’s lighter gravity, water splashes softly in slow arcs. This swift swimmer darts through mineral springs carved inside red canyon cliffs.',
    },
  },
  {
    id: 'mars_hematite_ribbon',
    planetId: 'mars',
    name: 'Hematite Ribbon-Eel',
    archetype: 'ribbon',
    primaryColor: '#a83c32',
    secondaryColor: '#f4b860',
    glowColor: '#ffae52',
    pattern: 'iridescent',
    scale: 1.05,
    swimSpeed: 0.95,
    preferredDepth: 'mid',
    rarity: 'common',
    science: {
      tempBadge: { icon: 'temp', label: 'Cold Rock', tone: 'cool' },
      gravityBadge: { icon: 'gravity', label: 'Low-G 0.38g', tone: 'gold' },
      habitatBadge: { icon: 'ice', label: 'Red Crevice', tone: 'warm' },
      adaptationBadge: { icon: 'sound', label: 'Silt Whiskers', tone: 'gold' },
      caption: 'Iron-rich dust turns Martian rocks rusty red and feeds sparkling minerals into buried springs. Long ribbons glide effortlessly through narrow stone tunnels.',
    },
  },
  {
    id: 'mars_frost_spire_horse',
    planetId: 'mars',
    name: 'Frost-Spire Seahorse',
    archetype: 'seahorse',
    primaryColor: '#75c9d4',
    secondaryColor: '#e89974',
    glowColor: '#a6f9ff',
    pattern: 'spots',
    scale: 1.0,
    swimSpeed: 0.75,
    preferredDepth: 'mid',
    rarity: 'uncommon',
    science: {
      tempBadge: { icon: 'temp', label: 'Sub-Zero Brine', tone: 'cool' },
      gravityBadge: { icon: 'gravity', label: 'Low-G 0.38g', tone: 'gold' },
      habitatBadge: { icon: 'ice', label: 'Salty Ice Cave', tone: 'cool' },
      adaptationBadge: { icon: 'crystal', label: 'Salt Antifreeze', tone: 'teal' },
      caption: 'Extra-salty Martian spring water stays liquid even below freezing! Natural antifreeze keeps this delicate seahorse cozy in icy caverns.',
    },
  },
  {
    id: 'mars_dustlight_jelly',
    planetId: 'mars',
    name: 'Dustlight Lantern-Bell',
    archetype: 'jelly',
    primaryColor: '#ff9666',
    secondaryColor: '#7df5ff',
    glowColor: '#ffc278',
    pattern: 'iridescent',
    scale: 1.05,
    swimSpeed: 0.65,
    preferredDepth: 'deep',
    rarity: 'rare',
    science: {
      tempBadge: { icon: 'temp', label: 'Cold Depth', tone: 'cool' },
      gravityBadge: { icon: 'gravity', label: 'Low-G 0.38g', tone: 'gold' },
      habitatBadge: { icon: 'ice', label: 'Underground Well', tone: 'cool' },
      adaptationBadge: { icon: 'glow', label: 'Beacon Pulse', tone: 'warm' },
      caption: 'Deep beneath Mars’s dusty surface, sunlight cannot reach at all. This gentle jelly pulses warm amber light like an underwater lantern.',
    },
  },

  // ================= EUROPA (4) =================
  {
    id: 'europa_glacier_ray',
    planetId: 'europa',
    name: 'Glacier Velvet Ray',
    archetype: 'ray',
    primaryColor: '#1f579c',
    secondaryColor: '#88f3ff',
    glowColor: '#75f0ff',
    pattern: 'marbled',
    scale: 1.15,
    swimSpeed: 0.88,
    preferredDepth: 'surface',
    rarity: 'common',
    science: {
      tempBadge: { icon: 'temp', label: 'Icy Roof', tone: 'cool' },
      gravityBadge: { icon: 'gravity', label: 'Feather 0.13g', tone: 'teal' },
      habitatBadge: { icon: 'ice', label: 'Ice Ceiling', tone: 'cool' },
      adaptationBadge: { icon: 'fins', label: 'Slow-Motion Glide', tone: 'teal' },
      caption: 'Europa’s ocean hides under a frozen shell thicker than a mountain! In gentle gravity, this ray glides slowly beneath glowing turquoise ice.',
    },
  },
  {
    id: 'europa_starlight_lantern',
    planetId: 'europa',
    name: 'Starlight Anglerfin',
    archetype: 'torpedo',
    primaryColor: '#183066',
    secondaryColor: '#56e8d8',
    glowColor: '#7dffea',
    pattern: 'spots',
    scale: 1.0,
    swimSpeed: 1.05,
    preferredDepth: 'mid',
    rarity: 'common',
    science: {
      tempBadge: { icon: 'temp', label: 'Cold Abyss', tone: 'cool' },
      gravityBadge: { icon: 'gravity', label: 'Feather 0.13g', tone: 'teal' },
      habitatBadge: { icon: 'ice', label: 'Dark Sea', tone: 'cool' },
      adaptationBadge: { icon: 'glow', label: 'Bioluminescence', tone: 'teal' },
      caption: 'Just like deep-sea fish on Earth, Europa’s creatures make their own cold blue-green light to see and talk in pitch-black water.',
    },
  },
  {
    id: 'europa_tidal_ribbon',
    planetId: 'europa',
    name: 'Tidal Aurora Wyrm',
    archetype: 'ribbon',
    primaryColor: '#3d85c6',
    secondaryColor: '#b5f8ff',
    glowColor: '#82d8ff',
    pattern: 'stripes',
    scale: 1.1,
    swimSpeed: 1.0,
    preferredDepth: 'mid',
    rarity: 'uncommon',
    science: {
      tempBadge: { icon: 'temp', label: 'Tidal Current', tone: 'cool' },
      gravityBadge: { icon: 'gravity', label: 'Feather 0.13g', tone: 'teal' },
      habitatBadge: { icon: 'wave', label: 'Deep Current', tone: 'cool' },
      adaptationBadge: { icon: 'sound', label: 'Current Sensors', tone: 'teal' },
      caption: 'Giant Jupiter’s gravity tugs Europa’s ocean back and forth in huge tides. This ribbon swimmer rides those silent underwater rivers.',
    },
  },
  {
    id: 'europa_cryo_jelly',
    planetId: 'europa',
    name: 'Cryo-Crown Jelly',
    archetype: 'jelly',
    primaryColor: '#5b4cd4',
    secondaryColor: '#9efcff',
    glowColor: '#9cf6ff',
    pattern: 'rings',
    scale: 1.1,
    swimSpeed: 0.62,
    preferredDepth: 'deep',
    rarity: 'rare',
    science: {
      tempBadge: { icon: 'temp', label: 'Near-Freezing', tone: 'cool' },
      gravityBadge: { icon: 'gravity', label: 'Feather 0.13g', tone: 'teal' },
      habitatBadge: { icon: 'ice', label: 'Abyssal Floor', tone: 'violet' },
      adaptationBadge: { icon: 'glow', label: 'Aurora Bell', tone: 'violet' },
      caption: 'Its crystal-clear bell is packed with natural sugar-shields so ice needles never form inside. Tiny electric sparkles dance along its tendrils.',
    },
  },

  // ================= TITAN (4) =================
  {
    id: 'titan_amber_sailfin',
    planetId: 'titan',
    name: 'Amber Mist Sailfin',
    archetype: 'sailfin',
    primaryColor: '#d98a2b',
    secondaryColor: '#ffe28a',
    glowColor: '#ffd466',
    pattern: 'marbled',
    scale: 1.05,
    swimSpeed: 0.92,
    preferredDepth: 'surface',
    rarity: 'common',
    science: {
      tempBadge: { icon: 'temp', label: 'Ultra Cold -179°C', tone: 'warm' },
      gravityBadge: { icon: 'gravity', label: 'Feather 0.14g', tone: 'gold' },
      habitatBadge: { icon: 'crystal', label: 'Methane Lake', tone: 'warm' },
      adaptationBadge: { icon: 'fins', label: 'Light-Oil Fins', tone: 'gold' },
      caption: 'Titan’s lakes are made of liquid methane instead of water—much lighter and super cold! Wide ribbed fins give it extra push.',
    },
  },
  {
    id: 'titan_dune_nautilus',
    planetId: 'titan',
    name: 'Saffron Shell-Spinner',
    archetype: 'nautilus',
    primaryColor: '#b56328',
    secondaryColor: '#f7d070',
    glowColor: '#ffbe59',
    pattern: 'rings',
    scale: 1.0,
    swimSpeed: 0.74,
    preferredDepth: 'mid',
    rarity: 'common',
    science: {
      tempBadge: { icon: 'temp', label: 'Cryo Hydrocarbon', tone: 'warm' },
      gravityBadge: { icon: 'gravity', label: 'Feather 0.14g', tone: 'gold' },
      habitatBadge: { icon: 'crystal', label: 'Golden Shore', tone: 'warm' },
      adaptationBadge: { icon: 'shell', label: 'Wax-Armor Shell', tone: 'gold' },
      caption: 'At minus 179°C, ordinary water ice is as hard as granite rock! This nautilus grows an organic amber shell tough as stone.',
    },
  },
  {
    id: 'titan_copper_ray',
    planetId: 'titan',
    name: 'Copper Haze-Glider',
    archetype: 'ray',
    primaryColor: '#9c4e1a',
    secondaryColor: '#ffb95e',
    glowColor: '#ffe07d',
    pattern: 'spots',
    scale: 1.15,
    swimSpeed: 0.85,
    preferredDepth: 'mid',
    rarity: 'uncommon',
    science: {
      tempBadge: { icon: 'temp', label: 'Liquid Methane', tone: 'warm' },
      gravityBadge: { icon: 'gravity', label: 'Feather 0.14g', tone: 'gold' },
      habitatBadge: { icon: 'crystal', label: 'Misty Basin', tone: 'warm' },
      adaptationBadge: { icon: 'sound', label: 'Sonar Whiskers', tone: 'gold' },
      caption: 'Because Titan’s orange sky lets in dim twilight, this glider uses gentle sound clicks to map the lake floor like a bat or dolphin.',
    },
  },
  {
    id: 'titan_solstice_ribbon',
    planetId: 'titan',
    name: 'Solstice Gold-Ribbon',
    archetype: 'ribbon',
    primaryColor: '#e8a838',
    secondaryColor: '#fff2b2',
    glowColor: '#ffe985',
    pattern: 'iridescent',
    scale: 1.1,
    swimSpeed: 0.98,
    preferredDepth: 'deep',
    rarity: 'rare',
    science: {
      tempBadge: { icon: 'temp', label: 'Deep Methane', tone: 'warm' },
      gravityBadge: { icon: 'gravity', label: 'Feather 0.14g', tone: 'gold' },
      habitatBadge: { icon: 'crystal', label: 'Mirror Depths', tone: 'gold' },
      adaptationBadge: { icon: 'glow', label: 'Golden Spark', tone: 'gold' },
      caption: 'Saturn’s giant rings shine faintly through Titan’s amber clouds above. This rare ribbon shimmers like spun gold through the calm methane sea.',
    },
  },

  // ================= ENCELADUS (4) =================
  {
    id: 'enceladus_plume_dart',
    planetId: 'enceladus',
    name: 'Geyser Plume-Dart',
    archetype: 'torpedo',
    primaryColor: '#8ad8f0',
    secondaryColor: '#ffffff',
    glowColor: '#b3f5ff',
    pattern: 'stripes',
    scale: 0.95,
    swimSpeed: 1.2,
    preferredDepth: 'surface',
    rarity: 'common',
    science: {
      tempBadge: { icon: 'temp', label: 'Warm Plume', tone: 'teal' },
      gravityBadge: { icon: 'gravity', label: 'Tiny 0.01g', tone: 'teal' },
      habitatBadge: { icon: 'flame', label: 'Ice Geyser', tone: 'teal' },
      adaptationBadge: { icon: 'fins', label: 'Jet-Stream Tail', tone: 'teal' },
      caption: 'Enceladus’s gravity is so tiny you could leap several stories high! This nimble dart surfs warm bubbling water jets shooting toward space.',
    },
  },
  {
    id: 'enceladus_vent_sailfin',
    planetId: 'enceladus',
    name: 'Thermal Vent Fanfin',
    archetype: 'sailfin',
    primaryColor: '#3a9db5',
    secondaryColor: '#ffb870',
    glowColor: '#ffd699',
    pattern: 'marbled',
    scale: 1.05,
    swimSpeed: 0.9,
    preferredDepth: 'deep',
    rarity: 'common',
    science: {
      tempBadge: { icon: 'temp', label: 'Hot Vent Floor', tone: 'warm' },
      gravityBadge: { icon: 'gravity', label: 'Tiny 0.01g', tone: 'teal' },
      habitatBadge: { icon: 'flame', label: 'Hydrothermal Vent', tone: 'warm' },
      adaptationBadge: { icon: 'fins', label: 'Warmth Gatherer', tone: 'warm' },
      caption: 'Even though the surface is frozen solid, hot rock chimneys on the ocean floor warm up cozy oasis pools—just like Earth’s deep sea vents!',
    },
  },
  {
    id: 'enceladus_snow_seahorse',
    planetId: 'enceladus',
    name: 'Snowflake Crest-Horse',
    archetype: 'seahorse',
    primaryColor: '#d9f6ff',
    secondaryColor: '#72c2e8',
    glowColor: '#d6fbff',
    pattern: 'spots',
    scale: 1.0,
    swimSpeed: 0.72,
    preferredDepth: 'mid',
    rarity: 'uncommon',
    science: {
      tempBadge: { icon: 'temp', label: 'Icy Crystal', tone: 'cool' },
      gravityBadge: { icon: 'gravity', label: 'Tiny 0.01g', tone: 'teal' },
      habitatBadge: { icon: 'ice', label: 'Tiger Stripes', tone: 'cool' },
      adaptationBadge: { icon: 'crystal', label: 'Frost Crown', tone: 'teal' },
      caption: 'Fresh white ice snows softly back onto Enceladus from its geysers, making it the brightest, shiniest moon in our solar system.',
    },
  },
  {
    id: 'enceladus_ring_jelly',
    planetId: 'enceladus',
    name: 'Ringlight Prism-Bell',
    archetype: 'jelly',
    primaryColor: '#7ee8fa',
    secondaryColor: '#e8d4ff',
    glowColor: '#c2f7ff',
    pattern: 'iridescent',
    scale: 1.1,
    swimSpeed: 0.65,
    preferredDepth: 'mid',
    rarity: 'rare',
    science: {
      tempBadge: { icon: 'temp', label: 'Crisp Vent Mix', tone: 'cool' },
      gravityBadge: { icon: 'gravity', label: 'Tiny 0.01g', tone: 'teal' },
      habitatBadge: { icon: 'flame', label: 'Mineral Cloud', tone: 'violet' },
      adaptationBadge: { icon: 'glow', label: 'Star-Ring Glow', tone: 'teal' },
      caption: 'Did you know Enceladus’s icy spray actually helps build Saturn’s outer E-ring? This drifting jelly sparkles with those very same ice crystals.',
    },
  },

  // ================= NEPTUNE (4) =================
  {
    id: 'neptune_aurora_ribbon',
    planetId: 'neptune',
    name: 'Aurora Cloud-Weaver',
    archetype: 'ribbon',
    primaryColor: '#3658d9',
    secondaryColor: '#66f7d6',
    glowColor: '#6effe0',
    pattern: 'iridescent',
    scale: 1.15,
    swimSpeed: 1.1,
    preferredDepth: 'surface',
    rarity: 'common',
    science: {
      tempBadge: { icon: 'temp', label: 'Deep Freeze -200°C', tone: 'cool' },
      gravityBadge: { icon: 'gravity', label: 'Strong 1.14g', tone: 'violet' },
      habitatBadge: { icon: 'cloud', label: 'Aurora Clouds', tone: 'violet' },
      adaptationBadge: { icon: 'glow', label: 'Electric Shimmer', tone: 'teal' },
      caption: 'Neptune’s strong pull and wild winds whip high clouds faster than jet planes. This ribbon weaves glowing teal trails right through the storm mist.',
    },
  },
  {
    id: 'neptune_diamond_nautilus',
    planetId: 'neptune',
    name: 'Diamond-Crest Nautilus',
    archetype: 'nautilus',
    primaryColor: '#4e6ef2',
    secondaryColor: '#b8f2ff',
    glowColor: '#a6e9ff',
    pattern: 'rings',
    scale: 1.05,
    swimSpeed: 0.8,
    preferredDepth: 'deep',
    rarity: 'common',
    science: {
      tempBadge: { icon: 'temp', label: 'Crushing Cold', tone: 'cool' },
      gravityBadge: { icon: 'gravity', label: 'Strong 1.14g', tone: 'violet' },
      habitatBadge: { icon: 'cloud', label: 'Crystal Depth', tone: 'violet' },
      adaptationBadge: { icon: 'shell', label: 'Diamond Armor', tone: 'teal' },
      caption: 'Scientists think tiny diamonds actually rain down deep inside Neptune! This nautilus weaves sparkling crystal plates into its spiral home.',
    },
  },
  {
    id: 'neptune_cobalt_ray',
    planetId: 'neptune',
    name: 'Cobalt Storm-Manta',
    archetype: 'ray',
    primaryColor: '#2539a8',
    secondaryColor: '#8d7dff',
    glowColor: '#9e91ff',
    pattern: 'spots',
    scale: 1.2,
    swimSpeed: 1.0,
    preferredDepth: 'mid',
    rarity: 'uncommon',
    science: {
      tempBadge: { icon: 'temp', label: 'Storm Front', tone: 'cool' },
      gravityBadge: { icon: 'gravity', label: 'Strong 1.14g', tone: 'violet' },
      habitatBadge: { icon: 'cloud', label: 'Sapphire Sky-Sea', tone: 'violet' },
      adaptationBadge: { icon: 'fins', label: 'Heavy-G Wings', tone: 'violet' },
      caption: 'With gravity slightly stronger than Earth’s, this mighty manta grows muscular wings to soar effortlessly through thick cobalt cloud-seas.',
    },
  },
  {
    id: 'neptune_triton_sailfin',
    planetId: 'neptune',
    name: 'Triton Comet-Sailfin',
    archetype: 'sailfin',
    primaryColor: '#6444c9',
    secondaryColor: '#66f7d6',
    glowColor: '#85ffea',
    pattern: 'stripes',
    scale: 1.1,
    swimSpeed: 1.05,
    preferredDepth: 'deep',
    rarity: 'rare',
    science: {
      tempBadge: { icon: 'temp', label: 'Outer Rim', tone: 'cool' },
      gravityBadge: { icon: 'gravity', label: 'Strong 1.14g', tone: 'violet' },
      habitatBadge: { icon: 'cloud', label: 'Twilight Reef', tone: 'violet' },
      adaptationBadge: { icon: 'glow', label: 'Star-Lantern Fin', tone: 'teal' },
      caption: 'Sunlight at Neptune is 900 times dimmer than on Earth! Its tall luminous sail glows like a comet tail in the deep indigo twilight.',
    },
  },

  // ================= PLUTO (SECRET 7TH WORLD - 4) =================
  {
    id: 'pluto_heart_seraph',
    planetId: 'pluto',
    name: 'Heart-Frost Seraph',
    archetype: 'sailfin',
    primaryColor: '#d98fb3',
    secondaryColor: '#ffe0f0',
    glowColor: '#ffb5db',
    pattern: 'marbled',
    scale: 1.08,
    swimSpeed: 0.92,
    preferredDepth: 'surface',
    rarity: 'common',
    science: {
      tempBadge: { icon: 'temp', label: 'Frost -229°C', tone: 'cool' },
      gravityBadge: { icon: 'gravity', label: 'Tiny 0.06g', tone: 'violet' },
      habitatBadge: { icon: 'ice', label: 'Heart Glacier', tone: 'violet' },
      adaptationBadge: { icon: 'fins', label: 'Frost-Silk Sail', tone: 'warm' },
      caption: 'Named for Pluto’s huge icy heart plain, its rose-pink sails catch the faint starlight of the distant Kuiper Belt.',
    },
  },
  {
    id: 'pluto_charon_ray',
    planetId: 'pluto',
    name: 'Charon Twin-Ray',
    archetype: 'ray',
    primaryColor: '#7a5fa8',
    secondaryColor: '#f7c8e0',
    glowColor: '#d4b3ff',
    pattern: 'spots',
    scale: 1.15,
    swimSpeed: 0.88,
    preferredDepth: 'mid',
    rarity: 'common',
    science: {
      tempBadge: { icon: 'temp', label: 'Nitrogen Pool', tone: 'cool' },
      gravityBadge: { icon: 'gravity', label: 'Tiny 0.06g', tone: 'violet' },
      habitatBadge: { icon: 'ice', label: 'Moonlit Ice', tone: 'violet' },
      adaptationBadge: { icon: 'fins', label: 'Feather Wings', tone: 'teal' },
      caption: 'Pluto’s moon Charon is half as wide as Pluto itself! They always face each other like dancing partners while this ray glides below.',
    },
  },
  {
    id: 'pluto_kuiper_wyrm',
    planetId: 'pluto',
    name: 'Kuiper Comet-Wyrm',
    archetype: 'ribbon',
    primaryColor: '#563987',
    secondaryColor: '#9bf2ff',
    glowColor: '#b8e8ff',
    pattern: 'iridescent',
    scale: 1.12,
    swimSpeed: 1.05,
    preferredDepth: 'mid',
    rarity: 'uncommon',
    science: {
      tempBadge: { icon: 'temp', label: 'Kuiper Chill', tone: 'cool' },
      gravityBadge: { icon: 'gravity', label: 'Tiny 0.06g', tone: 'violet' },
      habitatBadge: { icon: 'crystal', label: 'Comet Halo', tone: 'violet' },
      adaptationBadge: { icon: 'glow', label: 'Comet Tail', tone: 'teal' },
      caption: 'Pluto orbits among thousands of icy comet worlds! This shimmering ribbon trails icy sparkles like a miniature comet.',
    },
  },
  {
    id: 'pluto_dwarf_nautilus',
    planetId: 'pluto',
    name: 'Dwarf-Star Nautilus',
    archetype: 'nautilus',
    primaryColor: '#c97da8',
    secondaryColor: '#ffd485',
    glowColor: '#ffe3a8',
    pattern: 'rings',
    scale: 1.05,
    swimSpeed: 0.72,
    preferredDepth: 'deep',
    rarity: 'rare',
    science: {
      tempBadge: { icon: 'temp', label: 'Sub-Ice Core', tone: 'cool' },
      gravityBadge: { icon: 'gravity', label: 'Tiny 0.06g', tone: 'violet' },
      habitatBadge: { icon: 'ice', label: 'Deep Mantle', tone: 'violet' },
      adaptationBadge: { icon: 'shell', label: 'Star-Gem Shell', tone: 'gold' },
      caption: 'Scientists discovered clues that a slushy ocean may still warm Pluto deep underground—home to this rare jewel-shelled nautilus.',
    },
  },
];

export const FISH_MAP: Record<string, FishSpecies> = FISH_SPECIES.reduce(
  (acc, f) => {
    acc[f.id] = f;
    return acc;
  },
  {} as Record<string, FishSpecies>,
);

export function getFishForPlanet(planetId: PlanetId): FishSpecies[] {
  return FISH_SPECIES.filter((f) => f.planetId === planetId);
}
