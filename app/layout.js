import './theme.css'; // <- colours, card style, font size: edit THIS file to restyle the app
import './globals.css';
import AppShell from '@/components/AppShell';

export const metadata = {
  title: 'Moh Siswa!',
  description: 'Sukarelawan, tajaan, kerja sambilan dan ganjaran untuk siswa IPT Perak.',
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, title: 'Moh Siswa!', statusBarStyle: 'default' },
  icons: { icon: '/icon.svg', apple: '/icon.svg' },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#ffffff',
};

/* FONT: to use a Google Font, add at the top of this file:
     import { Poppins } from 'next/font/google';
     const font = Poppins({ subsets: ['latin'], weight: ['400','600','800'], variable: '--font-main' });
   then change <body> to <body className={font.variable}> and in theme.css set
     --font: var(--font-main), system-ui, sans-serif;  */
export default function RootLayout({ children }) {
  return (
    <html lang="ms">
      <body><AppShell>{children}</AppShell></body>
    </html>
  );
}
