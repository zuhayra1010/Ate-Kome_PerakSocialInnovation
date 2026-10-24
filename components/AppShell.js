'use client';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getUid } from '@/lib/client';

const ToastCtx = createContext(() => {});
export const useToast = () => useContext(ToastCtx);

const TABS = [
  { href: '/', icon: '🏠', label: 'Utama' },
  { href: '/feed', icon: '🌿', label: 'Aktiviti' },
  { href: '/tumpang', icon: '🚗', label: 'Tumpang' },
  { href: '/gigs', icon: '💼', label: 'Peluang', also: ['/sponsors'] },
  { href: '/profile', icon: '👤', label: 'Profil' },
];

export default function AppShell({ children }) {
  const path = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState(null);
  const onWelcome = path === '/welcome';

  useEffect(() => {
    if (!getUid() && !onWelcome) router.replace('/welcome');
    else setReady(true);
  }, [path, onWelcome, router]);

  useEffect(() => {
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
  }, []);

  const show = useCallback((msg, err = false) => {
    setToast({ msg, err });
    setTimeout(() => setToast(null), 2800);
  }, []);

  const active = (t) => (t.href === '/' ? path === '/' : path.startsWith(t.href) || (t.also || []).some((p) => path.startsWith(p)));

  return (
    <ToastCtx.Provider value={show}>
      <div className="app">{ready ? children : null}</div>
      {!onWelcome && ready && (
        <nav className="nav" aria-label="Menu utama">
          {TABS.map((t) => (
            <Link key={t.href} href={t.href} className={active(t) ? 'on' : ''} aria-current={active(t) ? 'page' : undefined}>
              <span aria-hidden>{t.icon}</span>
              {t.label}
            </Link>
          ))}
        </nav>
      )}
      {toast && <div className={'toast' + (toast.err ? ' err' : '')} role="status">{toast.msg}</div>}
    </ToastCtx.Provider>
  );
}
