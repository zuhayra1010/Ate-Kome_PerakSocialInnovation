import { ok, handle, readJson, bad, str, cleanLinkedin } from '@/lib/api';
import { col } from '@/lib/db';
import { COURSES, UNIVERSITIES, DISTRICTS, TAGS } from '@/lib/constants';
import { publicUser } from '@/lib/views';

export const dynamic = 'force-dynamic';

// Demo sign-in list: the sample students only.
export const GET = handle(async () => {
  const users = (await (await col('users')).list({ isSeed: true })).map(publicUser);
  return ok({ users });
});

export const POST = handle(async (req) => {
  const b = await readJson(req);
  const name = str(b.name, 60);
  if (name.length < 2) throw bad('Please enter your name');
  const course = str(b.course, 60);
  if (!(course in COURSES)) throw bad('Pick a course');
  const university = str(b.university, 80);
  if (!UNIVERSITIES.includes(university)) throw bad('Pick your institution');
  const skills = (Array.isArray(b.skills) ? b.skills : []).filter((s) => s in TAGS).slice(0, 8);
  const district = DISTRICTS.includes(b.district) ? b.district : '';
  const user = await (await col('users')).create({
    name, course, university, skills, district,
    bio: str(b.bio, 240), linkedinUrl: cleanLinkedin(b.linkedinUrl),
    points: 20, lifetimePoints: 20, streak: 0, lastCheckinWeek: -1, isSeed: false,
  });
  await (await col('pointtxs')).create({ userId: user.id, amount: 20, kind: 'bonus', reason: 'Welcome bonus', refId: '' });
  return ok({ user: publicUser(user) }, { status: 201 });
});
