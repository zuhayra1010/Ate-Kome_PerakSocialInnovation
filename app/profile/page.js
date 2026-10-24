'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, downloadPdf, linkedinAddUrl, setUid, useApi } from '@/lib/client';
import { COURSES, DISTRICTS, TAGS, UNIVERSITIES } from '@/lib/constants';
import { fmtDate, initials } from '@/lib/format';
import { ErrorBox, Sheet, Skeletons } from '@/components/ui';
import { useToast } from '@/components/AppShell';

function EditSheet({ user, onClose, onSaved }) {
  const toast = useToast();
  const [f, setF] = useState({ name: user.name, university: user.university, course: user.course, district: user.district, skills: user.skills, bio: user.bio, linkedinUrl: user.linkedinUrl });
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));
  const save = async (e) => {
    e.preventDefault();
    try { await api('/me', { method: 'PATCH', body: f }); toast('Profil dikemas kini'); await onSaved(); onClose(); } catch (err) { toast(err.message, true); }
  };
  return (
    <Sheet title="Edit profil" onClose={onClose}>
      <form className="stack" onSubmit={save}>
        <label className="f">Nama<input className="in" value={f.name} onChange={(e) => set('name', e.target.value)} /></label>
        <label className="f">Institusi<select className="in" value={f.university} onChange={(e) => set('university', e.target.value)}>{UNIVERSITIES.map((u) => <option key={u}>{u}</option>)}</select></label>
        <label className="f">Bidang<select className="in" value={f.course} onChange={(e) => set('course', e.target.value)}>{Object.keys(COURSES).map((c) => <option key={c}>{c}</option>)}</select></label>
        <label className="f">Daerah<select className="in" value={f.district} onChange={(e) => set('district', e.target.value)}><option value="">-</option>{DISTRICTS.map((d) => <option key={d}>{d}</option>)}</select></label>
        <div className="f"><span>Kemahiran</span><div className="row wrap" style={{ marginTop: 6 }}>{Object.entries(TAGS).map(([k, v]) => <button type="button" key={k} className={'chip' + (f.skills.includes(k) ? ' on' : '')} onClick={() => set('skills', f.skills.includes(k) ? f.skills.filter((s) => s !== k) : [...f.skills, k])}>{v}</button>)}</div></div>
        <label className="f">Bio ringkas<textarea className="in" maxLength={240} value={f.bio} onChange={(e) => set('bio', e.target.value)} /></label>
        <label className="f">LinkedIn<input className="in" inputMode="url" value={f.linkedinUrl} onChange={(e) => set('linkedinUrl', e.target.value)} /></label>
        <button className="btn block">Simpan</button>
      </form>
    </Sheet>
  );
}

export default function Profile() {
  const { data, loading, error, reload } = useApi('/me');
  const router = useRouter();
  const toast = useToast();
  const [edit, setEdit] = useState(false);
  const [busy, setBusy] = useState(false);
  if (loading) return <div className="stack" style={{ paddingTop: 40 }}><Skeletons /></div>;
  if (error) return <ErrorBox msg={error} retry={reload} />;
  const { user, level, badges, locked, stats, rating, myEvents } = data;
  const done = myEvents.filter((e) => e.status === 'checked_in');
  const pdf = async (path, filename) => { setBusy(true); try { await downloadPdf(path, { filename }); } catch (e) { toast(e.message, true); } finally { setBusy(false); } };

  return (
    <>
      <header className="page-head"><h1>Profil</h1><button className="btn ghost sm" onClick={() => setEdit(true)}>Edit</button></header>
      <section className="card row">
        <div className="avatar" aria-hidden>{initials(user.name)}</div>
        <div className="grow"><b style={{ fontSize: 18 }}>{user.name}</b><p className="sub">{user.course}</p><p className="sub">{user.university}</p>
          <div className="row wrap" style={{ marginTop: 6 }}><span className="tag" style={{ background: level.color, color: 'var(--ink)' }}>{level.name}</span>{rating.count > 0 && <span className="tag">★ {rating.avg} ({rating.count})</span>}</div></div>
      </section>
      {user.bio && <p className="sub" style={{ margin: '10px 4px' }}>{user.bio}</p>}
      <div className="row wrap" style={{ margin: '10px 0' }}>{user.skills.map((s) => <span key={s} className="chip">{TAGS[s] || s}</span>)}{user.skills.length === 0 && <span className="sub">Tambah kemahiran untuk Smart Match yang lebih tepat.</span>}</div>

      <div className="row" style={{ gap: 10, alignItems: 'stretch' }}>
        {[[user.lifetimePoints, 'Jumlah mata'], [stats.checkins, 'Aktiviti'], [user.streak, 'Minggu streak']].map(([n, l]) => <div key={l} className="card grow" style={{ textAlign: 'center', padding: 12 }}><b style={{ fontSize: 22 }}>{n}</b><p className="sub">{l}</p></div>)}
      </div>

      <div className="sec"><h2>🏅 Lencana kemahiran</h2></div>
      <div className="badge-grid">
        {badges.map((b) => <div key={b.key} className="badge"><span className="em">{b.icon}</span>{b.title}<p className="sub" style={{ fontWeight: 500 }}>{b.verifiedByAgency ? '✔ Disahkan agensi' : 'Menunggu pengesahan'}</p></div>)}
        {locked.map((b) => <div key={b.key} className="badge locked" title={b.desc}><span className="em">{b.icon}</span>{b.title}</div>)}
      </div>
      {locked.length > 0 && <p className="sub" style={{ marginTop: 8 }}>Sentuh lencana kelabu untuk lihat syarat. Lencana disahkan agensi akan ditanda apabila rakan kongsi rasmi mengesahkannya.</p>}

      <div className="sec"><h2>📄 Resume pintar</h2></div>
      <div className="card stack">
        <p className="sub">Rekod kokurikulum, lencana dan penarafan anda dalam satu PDF.</p>
        <button className="btn block" disabled={busy} onClick={() => pdf('/resume', 'moh-siswa-resume.pdf')}>Muat turun resume (PDF)</button>
        {user.linkedinUrl ? <a className="btn soft block" href={user.linkedinUrl} target="_blank" rel="noopener noreferrer">Buka LinkedIn saya</a> : <button className="btn soft block" onClick={() => setEdit(true)}>Pautkan LinkedIn</button>}
        {badges.length > 0 && (
          <div className="stack" style={{ gap: 6 }}>
            <b>Tambah lencana ke LinkedIn</b>
            {badges.map((b) => <a key={b.key} className="btn ghost sm" href={linkedinAddUrl(b.title, b.earnedAt)} target="_blank" rel="noopener noreferrer">{b.icon} {b.title} → LinkedIn</a>)}
            <p className="sub">Borang “Licences &amp; certifications” LinkedIn dibuka siap diisi. Anda semak dan simpan sendiri.</p>
          </div>
        )}
      </div>

      <div className="sec"><h2>Aktiviti selesai</h2></div>
      <div className="stack">
        {done.length === 0 && <p className="sub">Belum ada. <Link href="/feed" style={{ color: 'var(--primary-strong)' }}>Mulakan di sini</Link></p>}
        {done.map((e) => <div key={e.id} className="card row between"><div><b>{e.title}</b><p className="sub">{fmtDate(e.startsAt)} · {e.district}</p></div><button className="btn soft sm" onClick={() => pdf(`/certificate?eventId=${e.id}`, 'sijil.pdf')}>Sijil</button></div>)}
      </div>

      <div className="row wrap" style={{ marginTop: 22 }}>
        <Link href="/organise" className="btn soft sm">📣 Anjur program</Link>
        <Link href="/wallet" className="btn soft sm">🎁 Dompet</Link>
        <button className="btn danger sm" onClick={() => { setUid(''); router.replace('/welcome'); }}>Log keluar</button>
      </div>
      {edit && <EditSheet user={user} onClose={() => setEdit(false)} onSaved={reload} />}
    </>
  );
}
