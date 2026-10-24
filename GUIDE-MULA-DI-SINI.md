# Moh Siswa! - Beginner guide (start here)

## A. Where to change things
| I want to change... | Open this file | What to edit |
|---|---|---|
| **Logo** (login page) | `public/logo.svg` | Replace the file with your own SVG. Keep the name `logo.svg`. |
| **App icon** (home screen) | `public/icon.svg` | Replace the same way. |
| **Colours, card look, font size, rounded corners** | `app/theme.css` | Everything is at the top, with comments. Change a value, save. |
| **Font (e.g. Poppins)** | `app/layout.js` + `app/theme.css` | Follow the FONT comment in `layout.js`, then set `--font` in `theme.css`. |
| **Card shape only** | `app/theme.css` | `--card-radius`, `--card-border`, `--card-shadow`, `--card-padding` |
| **Button shape/height** | `app/theme.css` | `--btn-radius`, `--btn-height` |
| **Words on the login page** | `app/welcome/page.js` | Edit the text inside the quotes. |
| **Rewards list / sample data** | `lib/seed.js` | Sample data only. Real data goes in MongoDB later. |

Tip: run `npm run dev`, open http://localhost:3000, edit a file, save: the page updates by itself.

## B. Order to do things (do NOT skip ahead)
1. **Run it on your laptop first** (no MongoDB needed): install Node.js (nodejs.org, LTS) -> open a terminal in the project folder -> `npm install` -> `npm run dev`.
2. **Make it look the way you want** (section A).
3. **Create MongoDB Atlas** (free): mongodb.com/atlas -> create account -> Build a Database -> **M0 Free** -> region Singapore -> Create.
   - *Database Access* -> Add user (username + password, write the password down).
   - *Network Access* -> Add IP -> **Allow access from anywhere** (0.0.0.0/0). Needed so Vercel can connect.
   - *Database* -> Connect -> **Drivers** -> copy the connection string: `mongodb+srv://USER:PASSWORD@cluster0.xxxx.mongodb.net/`. Replace `PASSWORD` with yours.
4. **Test MongoDB on your laptop**: copy `.env.example` to `.env.local`, put `MONGODB_URI=<your string>`, restart `npm run dev`. Open `http://localhost:3000/api/health`; it should say `"mode":"mongodb"`.
5. **Put the code on GitHub**: github.com -> New repository (private) -> upload the project (do NOT upload `node_modules` or `.env.local`).
6. **Deploy on Vercel**: vercel.com -> sign in with GitHub -> Add New Project -> pick your repo -> *Environment Variables*: add `MONGODB_URI` (same string) -> Deploy. Open your link + `/api/health`.
7. After that, every time you push to GitHub, Vercel updates the app by itself.

## C. Before real students use it
- Login is still demo-style (no password). Add real login first.
- Partners, sponsors and rewards in `lib/seed.js` are fictional. Replace with real, verified ones.
- Set `STRICT_CHECKIN=1` in Vercel environment variables.
