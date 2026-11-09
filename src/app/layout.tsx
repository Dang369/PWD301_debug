import type { Metadata } from 'next';
import './globals.css';
import GlobalNavBar from '@/components/fnb/GlobalNavBar';

export const metadata: Metadata = {
  title: 'CyberNet Gaming Lounge - F&B System & KDS',
  description: 'Hệ thống gọi món và màn hình bếp KDS Cyber Gaming Lounge',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#030712] text-slate-100 min-h-screen antialiased select-none flex flex-col font-sans">
        <GlobalNavBar />
        <div className="flex-1 flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}