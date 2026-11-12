# 🚀 Moh Siswa! — Empowering Perak's Tertiary Youth Ecosystem

> **A mobile-first Progressive Web App (PWA) connecting IPT students in Perak with verified volunteering, community carpooling, micro-credentials, sponsorships, and career-ready opportunities.**

---

## 💡 Problem Statement
University and college (IPT) students in Perak often face fragmented access to community engagement, reliable inter-campus transport, student event sponsorships, and verified part-time gigs. Meanwhile, soft skills and volunteer hours gained outside the lecture hall rarely translate into structured, verifiable proof for future employers.

## 🎯 Our Solution
**Moh Siswa!** centralizes student empowerment into one seamless platform—rewarding civic participation with **Perak Points**, verifying contributions via **micro-credential badges**, streamlining event logistics with **Moh Tumpang!**, and turning student track records into instant **Smart Resumes** and **Auto-Pitch Decks**.

---

## ✨ Key Features

### 🤝 Community & Mobility
* **Volunteer Feed & Smart Match:** Personalized event recommendations based on student interests, skills, and availability.
* **Moh Tumpang! Carpool:** Peer-to-peer ride-sharing built specifically for students traveling to events, programs, and campuses across Perak.
* **Two-Way Community Ratings:** Accountability and trust system between student participants, event organisers, and employers.

### 🏆 Gamification & Career Readiness
* **Perak Point Wallet & Streaks:** Earn points and maintain participation streaks via event check-ins (`STRICT_CHECKIN` supported), redeemable for campus and partner rewards.
* **Micro-Credential Badges:** Verifiable digital badges for leadership, volunteering, and specialized roles—complete with one-click LinkedIn certification export.
* **Smart Resume Export:** Automatically compiles verified volunteer hours, gigs, and badges into a clean, downloadable PDF resume.

### 💼 Student Economy & Organiser Tools
* **Sponsorship Matchmaker:** Connects student clubs and event organisers with relevant corporate and local sponsors.
* **Auto-Pitch Deck PDF Generator:** Generates tailored, ready-to-send sponsorship proposals in seconds using `pdf-lib`.
* **Verified Gigs:** Curated part-time and freelance opportunities tailored to student schedules.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Next.js 14 (App Router, JavaScript), Progressive Web App (PWA) |
| **Backend** | Next.js Route Handlers (`app/api/*`) |
| **Database** | MongoDB & Mongoose (with built-in zero-config In-Memory Demo Fallback) |
| **Document Engine** | `pdf-lib` (Dynamic Resume & Auto-Pitch Deck PDF generation) |
| **Deployment** | Vercel |

---

## ⚡ Quick Start (Demo Mode — Zero Setup)

Judges and testers can run **Moh Siswa!** locally in seconds without configuring a database. When `MONGODB_URI` is omitted, the app automatically runs in **Demo Mode** using pre-seeded in-memory data:

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev
