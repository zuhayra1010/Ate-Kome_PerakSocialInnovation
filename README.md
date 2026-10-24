# Moh Siswa!

Mobile-first PWA for IPT students in Perak: volunteer feed, Perak Point wallet, sponsorship matchmaker,
verified gigs, smart resume export, plus Smart Match, Moh Tumpang! carpool, micro-credential badges,
Auto-Pitch Deck PDF and two-way community ratings.

Stack: Next.js 14 (App Router, JS) · MongoDB via Mongoose · pdf-lib · deploys on Vercel.

## Run locally
```bash
npm install
npm run dev          # http://localhost:3000
```
With no `MONGODB_URI` the app runs in **demo mode** (in-memory sample data, resets on restart).

## Use MongoDB + deploy on Vercel
1. Create a free MongoDB Atlas cluster, add a database user, and allow Vercel's IPs (Atlas -> Network Access -> `0.0.0.0/0` for a hackathon demo).
2. Copy `.env.example` to `.env.local` and set `MONGODB_URI`. Sample content is seeded automatically the first time the database is empty.
3. Push to GitHub, import the repo in Vercel, add `MONGODB_URI` (and optionally `MONGODB_DB`, `STRICT_CHECKIN=1`) under Environment Variables, deploy.

## Where things are
- `models/` Mongoose schemas: User, Event, Sponsor, Sponsorship, Gig, Carpool, PointTx, Badge, Reward, Redemption, Rating
- `lib/db.js` one data layer, MongoDB or in-memory · `lib/logic.js` points, streaks, badges, Smart Match · `lib/pdf.js` PDFs
- `app/api/*` route handlers · `app/*` screens (BM interface)

## Before real launch (known gaps)
- **Auth is demo-grade** (browser stores a user id). Replace `requireUser` in `lib/api.js` with NextAuth/Clerk or university SSO.
- **All sponsors, employers, rewards and organisations in `lib/seed.js` are fictional placeholders.** Replace with real, verified partners. Seeded events share the check-in code `MOH123`; real events get a random per-event code.
- **Verification is a flag, not a process.** `verified` (organisers, sponsors, gigs) and `verifiedByAgency` (badges) must be set by an admin / partner agency. Student-created events are unverified and capped at 30 points.
- **LinkedIn**: badges open LinkedIn's prefilled "Add certification" form. A true profile sync needs LinkedIn partner API access.
- Set `STRICT_CHECKIN=1` in production so check-in only works around the event time.
- Premium tier (RevenueCat) is not wired in: the natural fit is unlimited Auto-Pitch Decks and priority sponsor listing.
