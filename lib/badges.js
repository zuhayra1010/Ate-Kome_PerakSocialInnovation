// Micro-credential definitions. A badge is earned automatically by the rules
// below. "Verified by agency" is a separate flag a partner (e.g. a state
// agency) must set - the app never claims verification on its own.

export const BADGE_DEFS = [
  {
    key: 'first-step',
    title: 'First Step',
    icon: '🌱',
    desc: 'Completed your first volunteer activity',
    check: (s) => s.checkins >= 1,
  },
  {
    key: 'helping-hand',
    title: 'Helping Hand',
    icon: '🙌',
    desc: 'Completed 5 volunteer activities',
    check: (s) => s.checkins >= 5,
  },
  {
    key: 'crisis-management',
    title: 'Crisis Management',
    icon: '🛟',
    desc: 'Completed 2 disaster relief activities',
    check: (s) => (s.byCategory.disaster || 0) >= 2,
  },
  {
    key: 'sme-digitalization',
    title: 'SME Digitalization',
    icon: '💻',
    desc: 'Completed 2 digital activities',
    check: (s) => (s.byCategory.digital || 0) >= 2,
  },
  {
    key: 'green-warrior',
    title: 'Green Warrior',
    icon: '🌿',
    desc: 'Completed 2 environment activities',
    check: (s) => (s.byCategory.environment || 0) >= 2,
  },
  {
    key: 'community-leader',
    title: 'Community Leader',
    icon: '🏅',
    desc: 'Organised an event that had 5+ checked-in volunteers',
    check: (s) => s.bestOrganisedTurnout >= 5,
  },
  {
    key: 'road-buddy',
    title: 'Road Buddy',
    icon: '🚗',
    desc: 'Gave rides through Moh Tumpang! to 3 passengers',
    check: (s) => s.passengersCarried >= 3,
  },
  {
    key: 'streak-star',
    title: 'Streak Star',
    icon: '🔥',
    desc: 'Volunteered 3 weeks in a row',
    check: (s) => s.streak >= 3,
  },
];

export const badgeDef = (key) => BADGE_DEFS.find((b) => b.key === key);
