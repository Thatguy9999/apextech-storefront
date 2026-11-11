// src/app/layout.tsx
// Root layout — server component (metadata, shell HTML, providers)

import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from './providers';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { CompareDock } from '@/components/compare/CompareDock';

/* ── SEO metadata ─────────────────────────────────────────── */
export const metadata: Metadata = {
  title: {
    default: 'ApexTech | Premium Electronics',
    template: '%s | ApexTech',
  },
  description:
    'ApexTech delivers cutting-edge laptops, workstations, GPUs, and accessories ' +
    'engineered for professionals and power users who demand the absolute best.',
  keywords: [
    'premium electronics',
    'laptops',
    'workstations',
    'GPUs',
    'Apple MacBook Pro',
    'ASUS ROG',
    'NVIDIA RTX',
    'ApexTech',
  ],
  authors: [{ name: 'ApexTech', url: 'https://apextech.dev' }],
  creator: 'ApexTech',
  publisher: 'ApexTech',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  ),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: 'ApexTech | Premium Electronics',
    description:
      'Engineered for those who demand more. Shop the finest laptops, GPUs, and workstations.',
    siteName: 'ApexTech',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ApexTech | Premium Electronics',
    description:
      'Engineered for those who demand more. Shop the finest laptops, GPUs, and workstations.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export const viewport: Viewport = {
  themeColor: '#2563EB',
  width: 'device-width',
  initialScale: 1,
};

/* ── Root layout ──────────────────────────────────────────── */
interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-white font-sans antialiased">
        <Providers>
          {/* Fixed top navigation */}
          <Navbar />

          {/* Cart slide-over drawer (portal-rendered, controlled by Zustand) */}
          <CartDrawer />

          {/* Floating compare dock */}
          <CompareDock />

          {/* Page content — padded below fixed navbar */}
          <main className="pt-16">{children}</main>

          {/* Site-wide footer */}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
