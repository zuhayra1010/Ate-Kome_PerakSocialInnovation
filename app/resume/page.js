'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, downloadPdf } from '@/lib/client';
import { Skeletons } from '@/components/ui';
import { useToast } from '@/components/AppShell';

const BLANK = {
  experience: { eventId: '', include: true, title: '', org: '', dates: '', place: '', bullets: [''] },
  certifications: { title: '', issuer: '', date: '', note: '' },
  education: { degree: '', school: '', date: '' },
  involvement: { role: '', org: '', dates: '', bullets: [''] },
  skills: { label: '', items: '' },
};

const Field = ({ label, children }) => <label className="f">{label}{children}</label>;

export default function ResumeForm() {
  const toast = useToast();
  const [r, setR] = useState(null);
  const [fresh, setFresh] = useState([]); // events attended since the last save
  const [profile, setProfile] = useState({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api('/resume/data').then((d) => { setR(d.resume); setFresh(d.newFromEvents); setProfile(d.profile); }).catch((e) => toast(e.message, true));
  }, [toast]);

  if (!r) return <div className="stack" style={{ paddingTop: 40 }}><Skeletons n={3} /></div>;

  const upd = (key, i, patch) => setR((x) => ({ ...x, [key]: x[key].map((it, j) => (j === i ? { ...it, ...patch } : it)) }));
  const add = (key, item = BLANK[key]) => setR((x) => ({ ...x, [key]: [...x[key], structuredClone(item)] }));
  const del = (key, i) => setR((x) => ({ ...x, [key]: x[key].filter((_, j) => j !== i) }));
  const setContact = (k, v) => setR((x) => ({ ...x, contact: { ...x.contact, [k]: v } }));
  // bullets are edited as one textarea, one bullet per line
  const Bullets = ({ k, i, it }) => (
    <Field label="Poin-poin (satu baris = satu poin)">
      <textarea className="in" rows={4} value={it.bullets.join('\n')} onChange={(e) => upd(k, i, { bullets: e.target.value.split('\n') })} />
    </Field>
  );
  const Remove = ({ k, i }) => <button type="button" className="btn danger sm" onClick={() => del(k, i)}>Padam</button>;

  const save = async (thenPdf) => {
    setBusy(true);
    try {
      await api('/resume/data', { method: 'PUT', body: r });
      setFresh([]);
      toast('Resume disimpan');
      if (thenPdf) await downloadPdf('/resume', { filename: 'resume.pdf' });
    } catch (e) { toast(e.message, true); } finally { setBusy(false); }
  };

  return (
    <>
      <header className="page-head"><div><h1>Resume saya</h1><p className="sub">Isi maklumat, pilih pengalaman, muat turun PDF</p></div><Link href="/profile" className="btn ghost sm" style={{ whiteSpace: 'nowrap' }}>← Profil</Link></header>
      <div className="stack">

        <section className="card stack">
          <b>Maklumat hubungan</b>
          <Field label="Lokasi"><input className="in" value={r.contact.location} onChange={(e) => setContact('location', e.target.value)} placeholder="cth. Seri Iskandar, Perak" /></Field>
          <Field label="Emel"><input className="in" type="email" value={r.contact.email} onChange={(e) => setContact('email', e.target.value)} /></Field>
          <Field label="No. telefon"><input className="in" inputMode="tel" value={r.contact.phone} onChange={(e) => setContact('phone', e.target.value)} /></Field>
          <p className="sub">Nama ({profile.name}) dan LinkedIn diambil daripada <Link href="/profile" style={{ color: 'var(--primary-strong)', fontWeight: 700 }}>profil</Link>.</p>
        </section>

        <section className="stack">
          <div className="sec" style={{ margin: '6px 0 0' }}><h2>Pengalaman (sukarelawan &amp; kerja)</h2></div>
          {fresh.length > 0 && (
            <div className="card row between">
              <span>{fresh.length} aktiviti baharu yang anda hadiri</span>
              <button type="button" className="btn soft sm" onClick={() => { setR((x) => ({ ...x, experience: [...fresh, ...x.experience] })); setFresh([]); }}>Tambah</button>
            </div>
          )}
          {r.experience.map((it, i) => (
            <div key={i} className="card stack">
              <div className="row between">
                <label className="row" style={{ gap: 8 }}><input type="checkbox" style={{ width: 20, height: 20 }} checked={it.include} onChange={(e) => upd('experience', i, { include: e.target.checked })} /><b>Masukkan dalam resume</b></label>
                {it.eventId && <span className="tag">🔗 Dari aktiviti</span>}
              </div>
              <Field label="Jawatan / tajuk"><input className="in" value={it.title} onChange={(e) => upd('experience', i, { title: e.target.value })} /></Field>
              <Field label="Organisasi / syarikat"><input className="in" value={it.org} onChange={(e) => upd('experience', i, { org: e.target.value })} /></Field>
              <div className="row">
                <Field label="Tarikh"><input className="in" value={it.dates} onChange={(e) => upd('experience', i, { dates: e.target.value })} placeholder="Jun 2025 - Ogos 2025" /></Field>
                <Field label="Tempat"><input className="in" value={it.place} onChange={(e) => upd('experience', i, { place: e.target.value })} /></Field>
              </div>
              <Bullets k="experience" i={i} it={it} />
              <Remove k="experience" i={i} />
            </div>
          ))}
          <button type="button" className="btn ghost" onClick={() => add('experience')}>+ Tambah pengalaman sendiri</button>
        </section>

        <section className="stack">
          <div className="sec" style={{ margin: '6px 0 0' }}><h2>Pendidikan</h2></div>
          {r.education.map((it, i) => (
            <div key={i} className="card stack">
              <Field label="Ijazah / diploma"><input className="in" value={it.degree} onChange={(e) => upd('education', i, { degree: e.target.value })} /></Field>
              <Field label="Institusi"><input className="in" value={it.school} onChange={(e) => upd('education', i, { school: e.target.value })} /></Field>
              <Field label="Tarikh (cth. Jun 2027)"><input className="in" value={it.date} onChange={(e) => upd('education', i, { date: e.target.value })} /></Field>
              <Remove k="education" i={i} />
            </div>
          ))}
          <button type="button" className="btn ghost" onClick={() => add('education')}>+ Tambah pendidikan</button>
        </section>

        <section className="stack">
          <div className="sec" style={{ margin: '6px 0 0' }}><h2>Sijil</h2></div>
          <p className="sub">Lencana Moh Siswa! anda ditambah secara automatik. Tambah sijil lain di sini.</p>
          {r.certifications.map((it, i) => (
            <div key={i} className="card stack">
              <Field label="Nama sijil"><input className="in" value={it.title} onChange={(e) => upd('certifications', i, { title: e.target.value })} /></Field>
              <div className="row">
                <Field label="Pengeluar"><input className="in" value={it.issuer} onChange={(e) => upd('certifications', i, { issuer: e.target.value })} /></Field>
                <Field label="Tarikh"><input className="in" value={it.date} onChange={(e) => upd('certifications', i, { date: e.target.value })} /></Field>
              </div>
              <Field label="Nota ringkas (pilihan)"><input className="in" value={it.note} onChange={(e) => upd('certifications', i, { note: e.target.value })} /></Field>
              <Remove k="certifications" i={i} />
            </div>
          ))}
          <button type="button" className="btn ghost" onClick={() => add('certifications')}>+ Tambah sijil</button>
        </section>

        <section className="stack">
          <div className="sec" style={{ margin: '6px 0 0' }}><h2>Penglibatan (kelab, persatuan)</h2></div>
          {r.involvement.map((it, i) => (
            <div key={i} className="card stack">
              <Field label="Peranan"><input className="in" value={it.role} onChange={(e) => upd('involvement', i, { role: e.target.value })} placeholder="cth. Ahli jawatankuasa" /></Field>
              <Field label="Kelab / organisasi"><input className="in" value={it.org} onChange={(e) => upd('involvement', i, { org: e.target.value })} /></Field>
              <Field label="Tarikh"><input className="in" value={it.dates} onChange={(e) => upd('involvement', i, { dates: e.target.value })} /></Field>
              <Bullets k="involvement" i={i} it={it} />
              <Remove k="involvement" i={i} />
            </div>
          ))}
          <button type="button" className="btn ghost" onClick={() => add('involvement')}>+ Tambah penglibatan</button>
        </section>

        <section className="stack">
          <div className="sec" style={{ margin: '6px 0 0' }}><h2>Kemahiran</h2></div>
          {r.skills.map((it, i) => (
            <div key={i} className="card stack">
              <Field label="Kategori"><input className="in" value={it.label} onChange={(e) => upd('skills', i, { label: e.target.value })} placeholder="cth. Technical Skills" /></Field>
              <Field label="Senarai (asingkan dengan koma)"><input className="in" value={it.items} onChange={(e) => upd('skills', i, { items: e.target.value })} placeholder="Excel, Canva, Public Speaking" /></Field>
              <Remove k="skills" i={i} />
            </div>
          ))}
          <button type="button" className="btn ghost" onClick={() => add('skills')}>+ Tambah kategori kemahiran</button>
        </section>

        <div className="row" style={{ position: 'sticky', bottom: 'calc(74px + env(safe-area-inset-bottom))', background: 'var(--bg)', padding: '10px 0' }}>
          <button className="btn soft grow" disabled={busy} onClick={() => save(false)}>Simpan</button>
          <button className="btn grow" disabled={busy} onClick={() => save(true)}>Simpan &amp; PDF</button>
        </div>
      </div>
    </>
  );
}