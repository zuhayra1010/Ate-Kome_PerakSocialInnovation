'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function OppTabs() {
  const p = usePathname();
  return (
    <nav className="seg" style={{ marginBottom: 14 }} aria-label="Peluang">
      <Link href="/gigs" className={p === '/gigs' ? 'on' : ''}>💼 Kerja sambilan</Link>
      <Link href="/sponsors" className={p === '/sponsors' ? 'on' : ''}>🤝 Tajaan</Link>
    </nav>
  );
}
