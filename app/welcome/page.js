'use client';

import { App, Page, Navbar, Block } from 'konsta/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, setUid } from '@/lib/client';
import { COURSES, DISTRICTS, TAGS, UNIVERSITIES } from '@/lib/constants';
import { useToast } from '@/components/AppShell';

// Put logo here
const Logo = ({ w = 240 }) => <img src="/logo.svg" alt="Moh Siswa!" style={{ width: w, maxWidth: '80%', height: 'auto' }} />;

export default function Welcome() {
  const router = useRouter();
  const toast = useToast();
  const [step, setStep] = useState('splash'); // splash -> form
  const [tab, setTab] = useState('register');
  const [login, setLogin] = useState({ email: '', password: '' });
const submitLogin = async (e) => {
  e.preventDefault(); setBusy(true);
  try { await api('/auth/login', { method: 'POST', body: login }); router.replace('/'); }
  catch (err) { toast(err.message, true); setBusy(false); }
};
  const [demo, setDemo] = useState([]);
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({ name: '', email: '', password: '', university: UNIVERSITIES[1], course: 'Computer Science / IT', district: '', skills: [], linkedinUrl: '' });
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));

  useEffect(() => { api('/users').then((d) => setDemo(d.users)).catch(() => {}); }, []);

  const enter = (id) => { setUid(id); router.replace('/'); };
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try { enter((await api('/users', { method: 'POST', body: f })).user.id); }
    catch (err) { toast(err.message, true); setBusy(false); }
  };
  const toggle = (k) => set('skills', f.skills.includes(k) ? f.skills.filter((s) => s !== k) : [...f.skills, k]);

  if (step === 'splash') {
    return (
      <div style={{ minHeight: '100dvh', display: 'grid', gridTemplateRows: '1fr auto', textAlign: 'center', padding: 'env(safe-area-inset-top) 4px calc(28px + env(safe-area-inset-bottom))' }}>
        <div style={{ display: 'grid', placeItems: 'center', alignContent: 'center', gap: 18 }}>
          <Logo w={280} />
          <h1 style={{ fontSize: 26, letterSpacing: '-.02em', fontWeight: 'var(--heading-weight)' }}>Moh jadi sukarelawan!</h1>
          <p className="sub" style={{ maxWidth: 300, fontSize: 15 }}>Sukarelawan, tajaan, kerja sambilan dan ganjaran negeri untuk siswa IPT Perak.</p>
        </div>
        <div className="stack">
          <button className="btn block" onClick={() => setStep('form')}>Mari Mulakan</button>
                    <button className="btn soft block" onClick={() => { setTab('login'); setStep('form'); }}>Log masuk</button>
          <button className="btn soft block" onClick={() => { setTab('demo'); setStep('form'); }}>Cuba akaun demo</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: 'calc(20px + env(safe-area-inset-top))', paddingBottom: 30 }} className="stack">
      <div className="row between"><button className="btn ghost sm" onClick={() => setStep('splash')}>← Kembali</button><Logo w={120} /></div>
      <nav className="seg" aria-label="Daftar atau demo">
        <button className={tab === 'register' ? 'on' : ''} onClick={() => setTab('register')}>Daftar</button>
        <button className={tab === 'demo' ? 'on' : ''} onClick={() => setTab('demo')}>Akaun demo</button>
      </nav>

      {tab === 'register' ? (
        <form className="card stack" onSubmit={submit}>
          <h2 style={{ fontSize: 18 }}>Daftar (dapat 20 mata percuma)</h2>
          <label className="f">Nama<input className="in" required minLength={2} value={f.name} onChange={(e) => set('name', e.target.value)} autoComplete="name" /></label>
          <label className="f">Emel
  <input className="in" type="email" required autoComplete="email" value={f.email} onChange={(e) => set('email', e.target.value)} />
</label>
<label className="f">Kata laluan (minimum 8 aksara)
  <input className="in" type="password" required minLength={8} autoComplete="new-password" value={f.password} onChange={(e) => set('password', e.target.value)} />
</label>
          <label className="f">Institusi
            <select className="in" value={f.university} onChange={(e) => set('university', e.target.value)}>{UNIVERSITIES.map((u) => <option key={u}>{u}</option>)}</select>
          </label>
          <label className="f">Bidang pengajian
            <select className="in" value={f.course} onChange={(e) => set('course', e.target.value)}>{Object.keys(COURSES).map((c) => <option key={c}>{c}</option>)}</select>
          </label>
          <label className="f">Daerah
            <select className="in" value={f.district} onChange={(e) => set('district', e.target.value)}><option value="">Pilih daerah</option>{DISTRICTS.map((d) => <option key={d}>{d}</option>)}</select>
          </label>
          <div className="f"><span>Kemahiran</span>
            <div className="row wrap" style={{ marginTop: 6 }}>
              {Object.entries(TAGS).map(([k, v]) => <button type="button" key={k} className={'chip' + (f.skills.includes(k) ? ' on' : '')} onClick={() => toggle(k)} aria-pressed={f.skills.includes(k)}>{v}</button>)}
            </div>
          </div>
          <label className="f">LinkedIn (pilihan)<input className="in" inputMode="url" placeholder="linkedin.com/in/nama-anda" value={f.linkedinUrl} onChange={(e) => set('linkedinUrl', e.target.value)} /></label>
          <button className="btn block" disabled={busy}>{busy ? 'Sekejap…' : 'Mula sekarang'}</button>
        </form>
      ) : (
        <div className="card stack">
          <form className="card stack" onSubmit={submitLogin}>
  <h2 style={{ fontSize: 18 }}>Log masuk</h2>
  <label className="f">Emel
    <input className="in" type="email" required autoComplete="email" value={login.email} onChange={(e) => setLogin({ ...login, email: e.target.value })} />
  </label>
  <label className="f">Kata laluan
    <input className="in" type="password" required autoComplete="current-password" value={login.password} onChange={(e) => setLogin({ ...login, password: e.target.value })} />
  </label>
  <button className="btn block" disabled={busy}>{busy ? 'Sekejap…' : 'Log masuk'}</button>
</form>
          <h2 style={{ fontSize: 16 }}>Pilih akaun demo</h2>
          {demo.map((u) => (
            <button key={u.id} className="btn ghost" style={{ justifyContent: 'space-between' }} onClick={() => enter(u.id)}>
              <span>{u.name}</span><span className="sub">{u.course}</span>
            </button>
          ))}
          <p className="sub">Mod demo: log masuk ringkas tanpa kata laluan. Log masuk sebenar (emel/kata laluan) ditambah sebelum pelancaran.</p>
        </div>
      )}
    </div>
  );
}
