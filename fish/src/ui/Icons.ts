import { ScienceBadgeIcon } from '../data/fish';
import { OceanBadgeIcon } from '../data/planets';

export const ICONS = {
  rod: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M4 20L16 4" />
    <path d="M16 4c2.5 1 3.5 3.2 2.5 5.8-.7 1.8-2 3.2-2 5.2" />
    <circle cx="16.5" cy="17.5" r="2.2" fill="currentColor" stroke="none"/>
  </svg>`,

  orrery: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="4.2" fill="currentColor" fill-opacity="0.25"/>
    <ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(-24 12 12)"/>
    <circle cx="19" cy="9" r="1.4" fill="currentColor" stroke="none"/>
  </svg>`,

  aquarium: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
    <path d="M5 7c0-1.5 3.1-2.5 7-2.5s7 1 7 2.5" />
    <path d="M4.5 8.5C3.5 11.5 4.2 16 7 18.8c1.3 1.2 8.7 1.2 10 0 2.8-2.8 3.5-7.3 2.5-10.3" />
    <path d="M8.5 13.5c1.8-1.4 4.2-1.4 5.5 0l2-1.2v2.4l-2-1.2c-1.3 1.4-3.7 1.4-5.5 0z" fill="currentColor" stroke="none"/>
  </svg>`,

  guide: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 0 4 22z"/>
    <path d="M4 18.5A2.5 2.5 0 0 1 6.5 16H20"/>
    <path d="M12 7.2l1.1 2.2 2.4.3-1.7 1.7.4 2.4-2.2-1.1-2.2 1.1.4-2.4-1.7-1.7 2.4-.3z" fill="currentColor" stroke="none"/>
  </svg>`,

  soundOn: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" fill-opacity="0.25"/>
    <path d="M15.5 8.5a5 5 0 0 1 0 7"/>
    <path d="M18.8 5.8a9 9 0 0 1 0 12.4"/>
  </svg>`,

  soundOff: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" fill-opacity="0.2"/>
    <line x1="22" y1="9" x2="16" y2="15"/>
    <line x1="16" y1="9" x2="22" y2="15"/>
  </svg>`,

  food: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="8" cy="9" r="2.1" fill="currentColor"/>
    <circle cx="15.5" cy="7.5" r="1.7" fill="currentColor"/>
    <circle cx="12" cy="14" r="2.2" fill="currentColor"/>
    <circle cx="17" cy="16" r="1.5" fill="currentColor"/>
    <circle cx="7" cy="16.5" r="1.3" fill="currentColor"/>
  </svg>`,

  close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
    <line x1="6" y1="6" x2="18" y2="18"/>
    <line x1="18" y1="6" x2="6" y2="18"/>
  </svg>`,

  sparkle: `<svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l2.3 6.7L21 11l-6.7 2.3L12 20l-2.3-6.7L3 11l6.7-2.3z"/>
  </svg>`,

  fishSilhouette: `<svg viewBox="0 0 36 22" fill="currentColor">
    <path d="M3 11c4-6 12-7 19-3l7-4v14l-7-4c-7 4-15 3-19-3z"/>
  </svg>`,

  castHint: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none"/>
    <circle cx="12" cy="12" r="6" stroke-dasharray="3 3"/>
    <circle cx="12" cy="12" r="9.5" opacity="0.5"/>
  </svg>`,

  sunLure: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
    <circle cx="12" cy="12" r="4.5" fill="currentColor" fill-opacity="0.35"/>
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.2 2.2M16.9 16.9l2.2 2.2M19.1 4.9l-2.2 2.2M7.1 16.9l-2.2 2.2"/>
  </svg>`,

  deepLure: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 3v14"/>
    <path d="M7 13l5 5 5-5"/>
    <path d="M5 21h14"/>
  </svg>`,

  sonarLure: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
    <circle cx="12" cy="12" r="2.2" fill="currentColor"/>
    <circle cx="12" cy="12" r="6" opacity="0.75"/>
    <circle cx="12" cy="12" r="9.5" stroke-dasharray="3 3" opacity="0.55"/>
  </svg>`,

  weather: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 3l1.6 3.8L17.5 8l-3.9 1.2L12 13l-1.6-3.8L6.5 8l3.9-1.2z" fill="currentColor" fill-opacity="0.3"/>
    <path d="M5 17l3-3M10 20l4-4M16 18l3-3"/>
  </svg>`,

  scanner: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
    <circle cx="11" cy="11" r="6.5"/>
    <path d="M16 16l4.5 4.5"/>
    <path d="M8.5 11h5M11 8.5v5"/>
  </svg>`,

  bubbleJet: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round">
    <circle cx="12" cy="18" r="2.5" fill="currentColor" fill-opacity="0.35"/>
    <circle cx="9" cy="12" r="2" fill="currentColor" fill-opacity="0.3"/>
    <circle cx="15" cy="9" r="2.3" fill="currentColor" fill-opacity="0.35"/>
    <circle cx="11.5" cy="5" r="1.5" fill="currentColor" fill-opacity="0.4"/>
  </svg>`,

  chime: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M9 18V5l10-2v13"/>
    <circle cx="6.5" cy="18" r="2.5" fill="currentColor" fill-opacity="0.35"/>
    <circle cx="16.5" cy="16" r="2.5" fill="currentColor" fill-opacity="0.35"/>
  </svg>`,

  relic: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round">
    <polygon points="12 2 19 8.5 16 21 8 21 5 8.5 12 2" fill="currentColor" fill-opacity="0.25"/>
    <line x1="12" y1="2" x2="12" y2="21"/>
  </svg>`,

  quizStar: `<svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.3l-5.8 3.1 1.1-6.5-4.7-4.6 6.5-.9z"/>
  </svg>`,

  lock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="5" y="11" width="14" height="10" rx="2"/>
    <path d="M8 11V7a4 4 0 0 1 8 0v4"/>
  </svg>`,

  ruler: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M3 15l12-12 6 6-12 12z"/>
    <path d="M7.5 10.5l2 2M10.5 7.5l2 2M13.5 4.5l2 2"/>
  </svg>`,

  trophy: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M6 4h12v5a6 6 0 0 1-12 0V4z" fill="currentColor" fill-opacity="0.25"/>
    <path d="M6 6H3v2a3 3 0 0 0 3 3M18 6h3v2a3 3 0 0 1-3 3"/>
    <path d="M12 15v5M8 20h8"/>
  </svg>`,
};

export function getMissionIcon(key: string): string {
  return (ICONS as Record<string, string>)[key] ?? ICONS.sparkle;
}

export function getScienceBadgeSvg(
  icon: ScienceBadgeIcon | OceanBadgeIcon | 'planet',
): string {
  switch (icon) {
    case 'planet':
      return ICONS.orrery;
    case 'temp':
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 14.76V5a2 2 0 0 0-4 0v9.76a4 4 0 1 0 4 0z"/><circle cx="12" cy="17" r="1.6" fill="currentColor" stroke="none"/></svg>`;
    case 'gravity':
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="10" r="5" fill="currentColor" fill-opacity="0.2"/><path d="M12 15v6M9.5 18.5L12 21l2.5-2.5"/></svg>`;
    case 'wave':
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 10c2.5-2 4.5-2 7 0s4.5 2 7 0 4-2 6 0"/><path d="M2 15c2.5-2 4.5-2 7 0s4.5 2 7 0 4-2 6 0"/></svg>`;
    case 'ice':
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><line x1="12" y1="3" x2="12" y2="21"/><line x1="4.2" y1="7.5" x2="19.8" y2="16.5"/><line x1="19.8" y1="7.5" x2="4.2" y2="16.5"/></svg>`;
    case 'flame':
      return `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.5 2.5c1.5 3.2 5 5.4 5 10a5.5 5.5 0 1 1-11 0c0-2.5 1.3-4.6 3-6.1 0 2 1.2 3.1 2.2 3.1-.5-2.3-.2-4.7.8-7z"/></svg>`;
    case 'cloud':
      return `<svg viewBox="0 0 24 24" fill="currentColor" fill-opacity="0.85"><path d="M7 18h10a4 4 0 0 0 .8-7.9A5.5 5.5 0 0 0 7 11a3.5 3.5 0 0 0 0 7z"/></svg>`;
    case 'crystal':
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><polygon points="12 2 19 8.5 16 21 8 21 5 8.5 12 2" fill="currentColor" fill-opacity="0.22"/><line x1="12" y1="2" x2="12" y2="21"/></svg>`;
    case 'glow':
      return ICONS.sparkle;
    case 'fins':
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 17c4-8 10-12 16-11-1 6-5 11-12 13"/><path d="M8 14l6-4"/></svg>`;
    case 'shell':
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 12m-1 0a1 1 0 1 0 2 0a2 2 0 1 0-4 0a4 4 0 1 0 8 0a6 6 0 1 0-12 0a8 8 0 0 0 16 0"/></svg>`;
    case 'sound':
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 12a6 6 0 0 1 12 0"/><path d="M9 12a3 3 0 0 1 6 0"/><circle cx="12" cy="14" r="1.5" fill="currentColor" stroke="none"/></svg>`;
  }
}
