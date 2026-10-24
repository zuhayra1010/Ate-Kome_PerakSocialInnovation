'use client';
import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApi } from '@/lib/client';
import { CATEGORIES, DISTRICTS } from '@/lib/constants';
import { Empty, ErrorBox, EventCard, Skeletons } from '@/components/ui';

function Feed() {
  const sp = useSearchParams();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const [district, setDistrict] = useState('');
  const [sort, setSort] = useState(sp.get('sort') === 'match' ? 'match' : 'date');
  const qs = new URLSearchParams({ sort, ...(q && { q }), ...(cat && { category: cat }), ...(district && { district }) }).toString();
  const { data, loading, error, reload } = useApi('/events?' + qs);

  return (
    <>
      <header className="page-head"><div><h1>Aktiviti</h1><p className="sub">Sukarelawan di seluruh Perak</p></div></header>
      <div className="stack">
        <input className="in" type="search" placeholder="Cari aktiviti atau penganjur" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Cari" />
        <div className="scroll-x" role="group" aria-label="Kategori">
          <button className={'chip' + (!cat ? ' on' : '')} onClick={() => setCat('')}>Semua</button>
          {Object.entries(CATEGORIES).map(([k, v]) => <button key={k} className={'chip' + (cat === k ? ' on' : '')} onClick={() => setCat(cat === k ? '' : k)}>{v.icon} {v.label}</button>)}
        </div>
        <div className="row">
          <select className="in grow" value={district} onChange={(e) => setDistrict(e.target.value)} aria-label="Daerah"><option value="">Semua daerah</option>{DISTRICTS.map((d) => <option key={d}>{d}</option>)}</select>
          <div className="seg" style={{ width: 170 }}>
            <button className={sort === 'date' ? 'on' : ''} onClick={() => setSort('date')}>Tarikh</button>
            <button className={sort === 'match' ? 'on' : ''} onClick={() => setSort('match')}>✨ Padan</button>
          </div>
        </div>
        {loading && !data ? <Skeletons /> : error ? <ErrorBox msg={error} retry={reload} /> : data.events.length === 0 ? <Empty icon="🔍">Tiada aktiviti sepadan. Cuba tukar penapis.</Empty> : data.events.map((e) => <EventCard key={e.id} ev={e} />)}
      </div>
    </>
  );
}

export default function Page() { return <Suspense><Feed /></Suspense>; }
