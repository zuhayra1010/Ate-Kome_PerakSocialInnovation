export const UNIVERSITIES = [
  'Universiti Teknologi PETRONAS (UTP)',
  'UiTM Seri Iskandar',
  'UPSI Tanjong Malim',
  'UTAR Kampar',
  'Politeknik Ungku Omar, Ipoh',
  'Politeknik Sultan Azlan Shah, Behrang',
  'Kolej Komuniti Perak',
  'Other IPT in Perak',
];

export const DISTRICTS = [
  'Ipoh',
  'Seri Iskandar',
  'Bota',
  'Manjung',
  'Taiping',
  'Teluk Intan',
  'Kampar',
  'Batu Gajah',
  'Tanjong Malim',
];

// Unified skill / interest vocabulary used by users, events and gigs.
export const TAGS = {
  coding: 'Coding',
  design: 'Design',
  teaching: 'Teaching',
  photography: 'Photography',
  'social-media': 'Social media',
  'first-aid': 'First aid',
  speaking: 'Public speaking',
  driving: 'Driving',
  cooking: 'Cooking',
  writing: 'Writing',
  repairs: 'Repairs',
  'data-entry': 'Data entry',
  'event-planning': 'Event planning',
  admin: 'Admin',
};

// Course -> skills the course implies (used by Smart Match)
export const COURSES = {
  'Computer Science / IT': ['coding', 'data-entry', 'design'],
  Engineering: ['repairs', 'coding'],
  'Business / Accounting': ['admin', 'social-media', 'event-planning', 'writing'],
  Education: ['teaching', 'speaking', 'writing'],
  'Health / Nursing': ['first-aid', 'teaching'],
  'Arts / Design / Media': ['design', 'photography', 'social-media', 'writing'],
  Science: ['teaching', 'data-entry', 'writing'],
  Other: [],
};

export const CATEGORIES = {
  environment: { label: 'Environment', icon: '🌿' },
  education: { label: 'Education', icon: '📚' },
  community: { label: 'Community', icon: '🤝' },
  digital: { label: 'Digital', icon: '💻' },
  disaster: { label: 'Disaster relief', icon: '🛟' },
  health: { label: 'Health', icon: '❤️' },
  culture: { label: 'Culture', icon: '🎭' },
};

export const RATING_TAGS_ORGANIZER = ['Food provided', 'Clear tasks', 'Well organised', 'Safe environment', 'Friendly team', 'Good communication'];
export const RATING_TAGS_STUDENT = ['Punctual', 'Hardworking', 'Team player', 'Takes initiative', 'Respectful'];

export const LEVELS = [
  { name: 'Bronze', min: 0, color: '#f6cfae' },
  { name: 'Silver', min: 100, color: '#dfe3ee' },
  { name: 'Gold', min: 300, color: '#ffe39a' },
  { name: 'Platinum', min: 600, color: '#d6c9ff' },
];

export function levelFor(lifetimePoints = 0) {
  let idx = 0;
  LEVELS.forEach((l, i) => {
    if (lifetimePoints >= l.min) idx = i;
  });
  const cur = LEVELS[idx];
  const next = LEVELS[idx + 1] || null;
  const progress = next ? Math.round(((lifetimePoints - cur.min) / (next.min - cur.min)) * 100) : 100;
  return { ...cur, next, progress, toNext: next ? next.min - lifetimePoints : 0 };
}
