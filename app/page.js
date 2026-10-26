'use client';

import Link from 'next/link';
import { useApi, useCountUp } from '@/lib/client';
import { EventCard, ErrorBox, Ring, Skeletons } from '@/components/ui';
import { fmtDateTime } from '@/lib/format';

export default function Home() {
  const me = useApi('/me');
  const matches = useApi('/matches');
  const apps = useApi('/applications');
  const pts = useCountUp(me.data?.user.points ?? 0);

  if (me.loading) return <div className="stack" style={{ paddingTop: 40 }}><Skeletons n={3} /></div>;
  if (me.error) return <ErrorBox msg={me.error} retry={me.reload} />;
  const { user, level, weekDone } = me.data;
  const next = me.data.myEvents.filter((e) => e.status === 'joined' && new Date(e.startsAt) > new Date(Date.now() - 6 * 3600e3)).sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt))[0];

  return (
    <>
      <header className="page-head">
        <div>
<p className="sub">Salam, siswa!</p>
<h1>{user.name.split(' ')[0]}</h1>
<span className="button flex items-center gap-1"> 
  <img src="/icons/streak.svg" alt="Ikon Streak" className="w-4 h-4" />
  {user.streak} minggu berturut
</span>
</div>
<Link href="/profile" title={level.name}>
  <img 
    src={level.icon} 
    alt={level.name} 
    className="w-12 h-12 hover:scale-105 transition-transform" 
  />
</Link>
</header>

      <section className="card hero" aria-label="Dompet Perak Point">
        <div className="row between">
          <div>
            <p className="sub">Dompet Perak Point</p>
            <p className="big">{pts}</p>
            <p className="sub" style={{ marginTop: 6 }}>{level.next ? `${level.toNext} mata lagi ke ${level.next.name}` : 'Tahap tertinggi '}</p>
          </div>
<Ring pct={level.progress} size={90} stroke={20} color="#eadd72" track="#f3f4f6">
  <b style={{ fontSize: 14 }}>{level.progress}%</b>
</Ring>
        </div>
        <div className="row" style={{ marginTop: 14, position: 'relative', zIndex: 1 }}>
          <Link href="/wallet" className="btn">Tebus ganjaran</Link>
        
        </div>
      </section>

      <section className="card" style={{ marginTop: 12 }}>
        <div className="row">
          <span style={{ fontSize: 26 }} aria-hidden>{weekDone ? '✅' : ''}</span>
          <div className="grow">
            <b>Cabaran minggu ini</b>
            <p className="sub">{weekDone ? 'Siap! Streak anda selamat minggu ini.' : 'Sertai 1 aktiviti minggu ini untuk kekalkan streak dan dapat mata bonus.'}</p>
          </div>
          {!weekDone && <Link href="/feed" className="btn soft sm">Cari</Link>}
        </div>
      </section>

      {apps.data?.applications.some((a) => ['pending', 'interview', 'rejected'].includes(a.status)) && (
        <section style={{ marginTop: 12 }} className="stack" aria-label="Permohonan saya">
          <div className="sec" style={{ margin: '10px 0 0' }}><h2>📝 Permohonan saya</h2></div>
          {apps.data.applications.filter((a) => ['pending', 'interview', 'rejected'].includes(a.status)).map((a) => (
            <Link key={a.id} href={`/feed/${a.eventId}`} className="card row between">
              <div className="grow"><b>{a.eventTitle}</b><p className="sub">{a.status === 'pending' ? 'Menunggu semakan penganjur' : a.status === 'interview' ? `Lulus ke: ${a.stage}` : 'Tidak berjaya · lihat maklum balas'}</p></div>
              <span className={'tag' + (a.status === 'interview' ? ' good' : a.status === 'rejected' ? ' warn' : '')}>{a.status === 'pending' ? '⏳' : a.status === 'interview' ? '🎥' : '💬'}</span>
            </Link>
          ))}
        </section>
      )}

      {next && (
        <section className="sec" style={{ display: 'block' }}>
          <h2 style={{ marginBottom: 8 }}>Seterusnya</h2>
          <Link href={`/feed/${next.id}`} className="card row between">
            <div><b>{next.title}</b><p className="sub">📍 {next.district} · {fmtDateTime(next.startsAt)}</p></div>
            <span className="btn soft sm">Buka</span>
          </Link>
        </section>
      )}

      <div className="sec"><h2> Dipadankan untuk anda</h2><Link href="/feed?sort=match">Lihat semua</Link></div>
      {matches.loading ? <Skeletons n={2} /> : (
        <div className="stack">
          {matches.data?.events.slice(0, 3).map((e) => <EventCard key={e.id} ev={e} />)}
          {matches.data?.events.length === 0 && <p className="sub">Tambah kemahiran dalam profil untuk cadangan yang lebih tepat.</p>}
        </div>
      )}

      {matches.data?.gigs.length > 0 && (
        <>
          <div className="sec flex items-center justify-between">
  {/* Tambah flex, items-center dan gap-2 supaya ikon sejajar dengan teks */}
  <h2 className="flex items-center gap-2">
    Kerja sambilan sesuai
  </h2>
  
  <Link href="/gigs">Semua</Link>
</div>
          <div className="scroll-x">
            {matches.data.gigs.map((g) => (
              <Link key={g.id} href="/gigs" className="card" style={{ width: 230 }}>
                <b>{g.title}</b>
                <p className="sub">{g.employer}</p>
                <p style={{ margin: '6px 0' }}><span className="tag pts">RM{g.payRate}/{g.payUnit === 'hour' ? 'jam' : g.payUnit === 'day' ? 'hari' : 'tugas'}</span></p>
                <p className="reason"> {g.match.reasons[0]}</p>
              </Link>
            ))}
          </div>
        </>
      )}

     <div className="sec"><h2>Pintasan</h2></div>
<div className="row wrap">
  {/* Tambah 'flex items-center gap-2' supaya ikon dan teks sejajar di tengah */}
  <Link href="/organise" className="chip flex items-center gap-2">
    <img src="/icons/anjur.svg" alt="Anjur" className="w-5 h-5" />
    Anjur program
  </Link>
  
  <Link href="/sponsors" className="chip flex items-center gap-2">
    {/* Anda boleh tukar 'kolaborasi.svg' kepada ikon tajaan yang sebenar */}
    <img src="/icons/kolaborasi.svg" alt="Tajaan" className="w-5 h-5" />
    Cari tajaan
  </Link>
  
  <Link href="/tumpang" className="chip flex items-center gap-2">
    <img src="/icons/tumpang.svg" alt="Tumpang" className="w-5 h-5" />
    Moh Tumpang!
  </Link>
  
  <Link href="/profile" className="chip flex items-center gap-2">
    <img src="/icons/resume.svg" alt="Resume" className="w-5 h-5" />
    Resume
  </Link>
</div>
    </>
  );
}
