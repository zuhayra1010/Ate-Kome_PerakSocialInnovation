'use client';
import { useState } from 'react';
import { useApi } from '@/lib/client';
import { Empty, ErrorBox, Skeletons } from '@/components/ui';
import { OfferRide, RideCard } from '@/components/Carpool';

export default function Tumpang() {
  const rides = useApi('/carpools');
  const me = useApi('/me');
  const [offer, setOffer] = useState(false);
  const joined = (me.data?.myEvents || []).filter((e) => e.status === 'joined' && new Date(e.startsAt) > new Date());
  const refresh = () => Promise.all([rides.reload(), me.reload()]);
  const mine = rides.data?.rides.filter((r) => r.isDriver || r.booked) || [];
  const others = rides.data?.rides.filter((r) => !r.isDriver && !r.booked) || [];

  return (
    <>
      <header className="page-head"><div><h1>Moh Tumpang!</h1><p className="sub">Kongsi kenderaan ke lokasi aktiviti</p></div><button className="btn sm" onClick={() => setOffer(true)}>+ Tawar</button></header>
      {rides.loading ? <Skeletons /> : rides.error ? <ErrorBox msg={rides.error} retry={rides.reload} /> : (
        <div className="stack">
          {mine.length > 0 && <><div className="sec" style={{ margin: '4px 0 0' }}><h2>Tumpangan saya</h2></div>{mine.map((r) => <RideCard key={r.id} r={r} showEvent onChange={refresh} />)}</>}
          <div className="sec" style={{ margin: '12px 0 0' }}><h2>Tersedia</h2></div>
          {others.length === 0 ? <Empty icon="🚗">Belum ada tumpangan. Sertai aktiviti dan jadi pemandu pertama!</Empty> : others.map((r) => <RideCard key={r.id} r={r} showEvent onChange={refresh} />)}
          <p className="sub">Untuk tempah kerusi, anda perlu sertai aktiviti itu dahulu. Pemandu dapat +10 mata bila check-in dengan sekurang-kurangnya 1 penumpang.</p>
        </div>
      )}
      {offer && <OfferRide events={joined} onClose={() => setOffer(false)} onDone={refresh} />}
    </>
  );
}
