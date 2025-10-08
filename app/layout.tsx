// Root Layout
// Wraps entire app with providers and global styles

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { TRPCProvider } from '@/lib/trpc/client';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'OGT Map Platform | Original Globe Trotters',
  description: 'Interactive 3D map for digital nomads, expats, and travelers. Discover co-working spaces, cafes, and nomad-friendly locations worldwide.',
  keywords: 'digital nomad, travel, coworking, expat, remote work, 3D map',
  openGraph: {
    title: 'OGT Map Platform',
    description: 'Discover nomad-friendly locations worldwide',
    url: 'https://map.originalglobetrotters.com',
    siteName: 'Original Globe Trotters',
    locale: 'en_US',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/cesium@1.112/Build/Cesium/Widgets/widgets.css"
        />
      </head>
      <body className={inter.className}>
        <TRPCProvider>{children}</TRPCProvider>
      </body>
    </html>
  );
}
