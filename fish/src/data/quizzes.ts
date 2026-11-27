import { FishSpecies } from './fish';
import { PLANET_MAP } from './planets';

export interface QuizOption {
  label: string;
  iconKey: 'temp' | 'gravity' | 'wave' | 'ice' | 'flame' | 'cloud' | 'crystal' | 'glow' | 'fins' | 'shell' | 'sound' | 'planet';
  color?: string;
}

export interface QuizQuestion {
  prompt: string;
  options: QuizOption[];
  correctIndex: number;
}

export function getQuizForSpecies(species: FishSpecies): QuizQuestion {
  const planet = PLANET_MAP[species.planetId];

  // Alternate between world-fact questions and adaptation-fact questions deterministically by id
  const hash = species.id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);

  if (hash % 2 === 0) {
    // World & Ocean match
    const decoys = (Object.values(PLANET_MAP) as typeof planet[])
      .filter((p) => p.id !== planet.id)
      .slice(0, 2);

    const choices: QuizOption[] = [
      { label: planet.name, iconKey: 'planet', color: planet.planetColor },
      { label: decoys[0].name, iconKey: 'planet', color: decoys[0].planetColor },
      { label: decoys[1].name, iconKey: 'planet', color: decoys[1].planetColor },
    ];
    const correctPos = hash % 3;
    const swapped = [...choices];
    [swapped[0], swapped[correctPos]] = [swapped[correctPos], swapped[0]];

    return {
      prompt: `Which world is home to the ${species.name}?`,
      options: swapped,
      correctIndex: correctPos,
    };
  }

  // Adaptation / habitat match
  const adapt = species.science.adaptationBadge;
  const rawDistractors: QuizOption[] = [
    { label: 'Hot Lava Armor', iconKey: 'flame', color: '#ff8a5b' },
    { label: 'Desert Sand Wings', iconKey: 'cloud', color: '#e6b873' },
    { label: 'Solar Sail', iconKey: 'fins', color: '#ffd166' },
    { label: 'Ice Antifreeze', iconKey: 'ice', color: '#7ee8fa' },
  ];
  const distractorPool: QuizOption[] = rawDistractors.filter((d) => d.label !== adapt.label);

  const options: QuizOption[] = [
    { label: adapt.label, iconKey: adapt.icon, color: '#7cf7c9' },
    distractorPool[0],
    distractorPool[1],
  ];
  const correctPos = (hash + 1) % 3;
  [options[0], options[correctPos]] = [options[correctPos], options[0]];

  return {
    prompt: `What special power helps the ${species.name} thrive on ${planet.name}?`,
    options,
    correctIndex: correctPos,
  };
}
