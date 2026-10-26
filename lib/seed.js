// Sample content so the app is never empty. All organisations, sponsors and
// employers below are FICTIONAL placeholders - replace with real, verified
// partners before launch.

const day = (n, hour = 9) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(hour, 0, 0, 0);
  return d;
};

const CODE = 'MOH123'; // shared demo check-in code for seeded events

const EVENTS = [
  {
    title: 'Sungai Kinta Clean-up',
    description: 'Join the riverbank clean-up and help sort recyclables. Gloves, bags and lunch provided.',
    category: 'environment',
    organizer: { name: 'Gerak Hijau Perak', type: 'NGO', verified: true },
    district: 'Ipoh', venue: 'Taman Rekreasi Sungai Kinta', startsAt: day(3, 8), durationHrs: 4,
    points: 40, slots: 40, tags: ['event-planning', 'photography'],
  },
  {
    title: 'Digitise the Village Office Files',
    description: 'Help a village office scan, name and organise paper records into a simple cloud folder system.',
    category: 'digital',
    organizer: { name: 'Pejabat Penghulu Mukim (demo)', type: 'PBT', verified: true },
    district: 'Seri Iskandar', venue: 'Balai Raya Seri Iskandar', startsAt: day(5, 9), durationHrs: 5,
    points: 60, slots: 12, tags: ['coding', 'data-entry', 'admin'],
  },
  {
    title: 'Flood Relief Packing Centre',
    description: 'Pack and load food and hygiene kits for flood-prone kampungs. First-aid trained students welcome.',
    category: 'disaster',
    organizer: { name: 'Sukarelawan Banjir Kinta', type: 'NGO', verified: true },
    district: 'Batu Gajah', venue: 'Dewan Orang Ramai Batu Gajah', startsAt: day(2, 10), durationHrs: 4,
    points: 50, slots: 30, tags: ['first-aid', 'driving', 'admin'],
  },
  {
    title: 'Kem Literasi Anak Kampar',
    description: 'Run reading and storytelling stations for primary school children from low-income families.',
    category: 'education',
    organizer: { name: 'Rumah Harapan Kampar', type: 'NGO', verified: true },
    district: 'Kampar', venue: 'SK Kampar Hilir', startsAt: day(8, 8), durationHrs: 6,
    points: 70, slots: 25, tags: ['teaching', 'speaking', 'writing'],
    skillsCustom: ['Storytelling', 'Bahasa Inggeris'],
    // Demo of optional screening. Owned by the demo student "Nurul Aina" so you can review applicants.
    owner: 1,
    screening: {
      enabled: true,
      questions: ['Kenapa anda mahu menyertai kem ini?', 'Adakah anda pernah bekerja dengan kanak-kanak? Ceritakan.'],
      rounds: [{ name: 'Temu duga ringkas', teamsLink: 'https://teams.microsoft.com/l/meetup-join/demo-round-1' }],
    },
  },
  {
    title: 'Community Repair Day: Playground & Surau',
    description: 'Repaint, fix swings and patch up shared facilities with the taman residents committee.',
    category: 'community',
    organizer: { name: 'Jawatankuasa Taman Desa Bota', type: 'Community', verified: false },
    district: 'Bota', venue: 'Taman Desa Bota', startsAt: day(6, 8), durationHrs: 5,
    points: 55, slots: 20, tags: ['repairs', 'design'],
  },
  {
    title: 'Free Health Screening Assistants',
    description: 'Assist nurses with registration, queue flow and BMI/blood-pressure stations at a community screening.',
    category: 'health',
    organizer: { name: 'Klinik Komuniti Manjung (demo)', type: 'PBT', verified: true },
    district: 'Manjung', venue: 'Dewan Seri Manjung', startsAt: day(10, 8), durationHrs: 5,
    points: 60, slots: 15, tags: ['first-aid', 'admin', 'speaking'],
  },
  {
    title: 'Heritage Trail Photo Walk',
    description: 'Document old shophouses and street food heritage in Ipoh for a community archive and exhibition.',
    category: 'culture',
    organizer: { name: 'Kelab Warisan Ipoh', type: 'Community', verified: true },
    district: 'Ipoh', venue: 'Ipoh Old Town', startsAt: day(12, 15), durationHrs: 3,
    points: 35, slots: 20, tags: ['photography', 'writing', 'social-media'],
  },
  {
    title: 'SME Go-Digital Clinic',
    description: 'Set up Google Business Profiles and simple online menus for small food stalls and shops.',
    category: 'digital',
    organizer: { name: 'Kelab Digital Perak', type: 'Community', verified: true },
    district: 'Ipoh', venue: 'Ipoh Co-working Hub', startsAt: day(14, 9), durationHrs: 4,
    points: 55, slots: 16, tags: ['coding', 'social-media', 'design'],
  },
  {
    title: 'Coastal Mangrove Planting',
    description: 'Plant mangrove saplings with local fishermen. Boat transfer provided from the jetty.',
    category: 'environment',
    organizer: { name: 'Persatuan Nelayan Lumut (demo)', type: 'Community', verified: true },
    district: 'Manjung', venue: 'Jeti Lumut', startsAt: day(16, 7), durationHrs: 5,
    points: 65, slots: 30, tags: ['driving', 'photography'],
  },
];

const SPONSORS = [
  { name: 'Kopi Kinta Roasters', industry: 'F&B', district: 'Ipoh', bio: 'Local coffee roaster that supports youth and community events with drinks and cash.', supports: ['cash', 'food'], budgetRange: 'RM300 - RM2,000', focus: ['community', 'culture'], contactEmail: 'sponsor@kopikinta.example.com', verified: true },
  { name: 'Perak TechWorks Sdn Bhd', industry: 'Technology', district: 'Seri Iskandar', bio: 'IT services firm funding digital and coding events for students.', supports: ['cash', 'merchandise', 'venue'], budgetRange: 'RM1,000 - RM8,000', focus: ['digital', 'education'], contactEmail: 'csr@perektech.example.com', verified: true },
  { name: 'Lembah Hijau Nursery', industry: 'Agriculture', district: 'Taiping', bio: 'Supplies saplings and gardening tools for environment projects.', supports: ['in-kind'], budgetRange: 'In-kind up to RM1,500', focus: ['environment'], contactEmail: 'hello@lembahhijau.example.com', verified: true },
  { name: 'Mesra Print & Merch', industry: 'Printing', district: 'Ipoh', bio: 'Prints banners, shirts and certificates at sponsor rates for student programs.', supports: ['merchandise', 'in-kind'], budgetRange: 'In-kind up to RM2,000', focus: ['community', 'education', 'culture'], contactEmail: 'team@mesraprint.example.com', verified: true },
  { name: 'Warung Seri Makmur', industry: 'F&B', district: 'Seri Iskandar', bio: 'Family restaurant happy to sponsor food packs for volunteer events.', supports: ['food'], budgetRange: 'Food for up to 100 pax', focus: ['community', 'disaster', 'health'], contactEmail: 'warung@serimakmur.example.com', verified: false },
  { name: 'Anjung Mutiara Hotel', industry: 'Hospitality', district: 'Manjung', bio: 'Offers function rooms and small cash sponsorships for tourism-linked events.', supports: ['venue', 'cash'], budgetRange: 'RM500 - RM3,000', focus: ['culture', 'education'], contactEmail: 'events@anjungmutiara.example.com', verified: true },
];

const GIGS = [
  { title: 'Cafe Barista Helper (weekends)', employer: 'Kopi Kinta Roasters', description: 'Weekend shifts at a busy cafe. Training provided.', district: 'Ipoh', nearCampus: 'Near Politeknik Ungku Omar', payRate: 9, payUnit: 'hour', hoursPerWeek: 12, tags: ['cooking', 'social-media'], verified: true },
  { title: 'Social Media Content Assistant', employer: 'Mesra Print & Merch', description: 'Shoot short product videos and schedule posts for a small print shop.', district: 'Ipoh', nearCampus: 'Remote / Ipoh', payRate: 12, payUnit: 'hour', hoursPerWeek: 8, tags: ['social-media', 'photography', 'design', 'writing'], verified: true },
  { title: 'Junior Web Maintenance Helper', employer: 'Perak TechWorks Sdn Bhd', description: 'Update content and fix small bugs on client websites. Flexible hours.', district: 'Seri Iskandar', nearCampus: 'Near UTP / UiTM Seri Iskandar', payRate: 15, payUnit: 'hour', hoursPerWeek: 10, tags: ['coding', 'design'], verified: true },
  { title: 'Primary School Tuition Tutor', employer: 'Pusat Tuisyen Cemerlang (demo)', description: 'Teach Maths and English to Year 4-6 pupils after school.', district: 'Seri Iskandar', nearCampus: 'Bandar Seri Iskandar', payRate: 18, payUnit: 'hour', hoursPerWeek: 6, tags: ['teaching', 'speaking'], verified: true },
  { title: 'Event Day Crew (per event)', employer: 'Anjung Mutiara Hotel', description: 'Registration, ushering and setup crew for hotel events and weddings.', district: 'Manjung', nearCampus: 'Seri Manjung', payRate: 80, payUnit: 'day', hoursPerWeek: 8, tags: ['event-planning', 'admin', 'speaking'], verified: true },
  { title: 'Data Entry for Stock Records', employer: 'Lembah Hijau Nursery', description: 'Update plant stock sheets and invoices in Excel.', district: 'Taiping', nearCampus: 'Taiping', payRate: 10, payUnit: 'hour', hoursPerWeek: 6, tags: ['data-entry', 'admin'], verified: false },
];

const REWARDS = [
  { title: 'RM5 Food Voucher', icon: '/icons/voucher.svg', cost: 100 },
  { title: '20% Bus Ticket', icon: '/icons/tumpang.svg', cost: 150 },
  { title: 'KTM Komuter', icon: '/icons/utama.svg', cost: 200 }
];

const SEED_USERS = [
  { name: 'Aiman Hakim', university: 'Universiti Teknologi PETRONAS (UTP)', course: 'Engineering', skills: ['driving', 'repairs'], district: 'Seri Iskandar' },
  { name: 'Nurul Aina', university: 'UiTM Seri Iskandar', course: 'Business / Accounting', skills: ['social-media', 'event-planning'], district: 'Seri Iskandar' },
  { name: 'Darren Lim', university: 'UTAR Kampar', course: 'Computer Science / IT', skills: ['coding', 'driving'], district: 'Kampar' },
];

export async function runSeed(c) {
  const users = [];
  for (const u of SEED_USERS) {
    users.push(await c('users').create({ ...u, bio: '', linkedinUrl: '', points: 0, lifetimePoints: 0, streak: 0, lastCheckinWeek: -1, isSeed: true }));
  }
  const events = [];
  for (const { owner, ...e } of EVENTS) {
    events.push(await c('events').create({ ...e, checkInCode: CODE, createdBy: owner !== undefined ? users[owner].id : '', participants: [] }));
  }
  for (const s of SPONSORS) await c('sponsors').create(s);
  for (const gg of GIGS) await c('gigs').create({ ...gg, applicants: [] });
  for (const r of REWARDS) await c('rewards').create(r);

  // Sample carpools so Moh Tumpang! is not empty on first launch.
  const carpools = [
    { ev: 0, driver: 0, from: 'UTP, Seri Iskandar', hourOffset: -1, seats: 3, note: 'Meet at UTP Village 5 bus stop. Share petrol RM5.' },
    { ev: 3, driver: 2, from: 'UTAR Kampar (main gate)', hourOffset: -1, seats: 2, note: 'Leaving from the main gate.' },
    { ev: 1, driver: 1, from: 'UiTM Seri Iskandar', hourOffset: 0, seats: 3, note: 'Short ride - 10 minutes.' },
    { ev: 8, driver: 0, from: 'UTP, Seri Iskandar', hourOffset: -2, seats: 4, note: 'Early start - 5:00 AM sharp.' },
  ];
  for (const cp of carpools) {
    const ev = events[cp.ev];
    const d = users[cp.driver];
    await c('carpools').create({
      eventId: ev.id, driverId: d.id, driverName: d.name, from: cp.from,
      departAt: new Date(new Date(ev.startsAt).getTime() + cp.hourOffset * 3600e3 - 3600e3),
      seats: cp.seats, note: cp.note, passengers: [], bonusPaid: false,
    });
  }
}
