'use client';

// src/components/layout/Navbar.tsx
// Fixed top navigation bar — client component for interactivity

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search,
  ShoppingCart,
  GitCompare,
  Menu,
  X,
  Zap,
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useCompareStore } from '@/store/useCompareStore';
import { clsx } from 'clsx';

/* ── Types ────────────────────────────────────────────────── */
interface NavLink {
  label: string;
  href: string;
}

const NAV_LINKS: NavLink[] = [
  { label: 'Products', href: '/products' },
  { label: 'Compare', href: '/compare' },
  { label: 'Deals', href: '/deals' },
];

/* ── Component ────────────────────────────────────────────── */
export function Navbar() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  /* Zustand selectors */
  const cartItemCount = useCartStore((s) => s.getTotalItemsCount());
  const setCartOpen = useCartStore((s) => s.setDrawerOpen);
  const compareCount = useCompareStore((s) => s.getCount());

  const displayCartCount = mounted ? cartItemCount : 0;
  const displayCompareCount = mounted ? compareCount : 0;

  /* Scroll shadow */
  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 4);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  /* Close mobile menu on route change */
  useEffect(() => {
    setIsMobileOpen(false);
    setIsSearchOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === '/products'
      ? pathname.startsWith('/products')
      : pathname === href;

  return (
    <>
      <header
        className={clsx(
          'fixed inset-x-0 top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-shadow duration-200',
          isScrolled && 'shadow-sm'
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">

            {/* ── Logo ── */}
            <Link
              href="/"
              className="flex items-center gap-2 shrink-0 group"
              aria-label="ApexTech Home"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white group-hover:bg-blue-700 transition-colors duration-150">
                <Zap className="h-4 w-4" aria-hidden />
              </span>
              <span className="text-lg font-bold tracking-tight text-slate-900">
                APEX<span className="text-blue-600">TECH</span>
              </span>
            </Link>

            {/* ── Desktop nav links ── */}
            <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
              {NAV_LINKS.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className={clsx(
                    'relative px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-150',
                    isActive(href)
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                  )}
                >
                  {label}
                  {isActive(href) && (
                    <span className="absolute bottom-0 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-blue-600" />
                  )}
                </Link>
              ))}
            </nav>

            {/* ── Right action icons ── */}
            <div className="flex items-center gap-1">
              {/* Search */}
              <button
                type="button"
                onClick={() => setIsSearchOpen((v) => !v)}
                aria-label="Open search"
                className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                <Search className="h-5 w-5" aria-hidden />
              </button>

              {/* Compare badge */}
              <Link
                href="/compare"
                aria-label={mounted ? `Compare ${displayCompareCount} products` : 'Compare products'}
                className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                <GitCompare className="h-5 w-5" aria-hidden />
                {displayCompareCount > 0 && (
                  <span
                    className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white"
                    aria-hidden
                  >
                    {displayCompareCount}
                  </span>
                )}
              </Link>

              {/* Cart badge */}
              <button
                type="button"
                onClick={() => setCartOpen(true)}
                aria-label={`Open cart — ${displayCartCount} item${displayCartCount !== 1 ? 's' : ''}`}
                className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                <ShoppingCart className="h-5 w-5" aria-hidden />
                {displayCartCount > 0 && (
                  <span
                    className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white"
                    aria-hidden
                  >
                    {displayCartCount > 99 ? '99+' : displayCartCount}
                  </span>
                )}
              </button>

              {/* Mobile hamburger */}
              <button
                type="button"
                onClick={() => setIsMobileOpen((v) => !v)}
                aria-label={isMobileOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMobileOpen}
                aria-controls="mobile-menu"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 md:hidden"
              >
                {isMobileOpen ? (
                  <X className="h-5 w-5" aria-hidden />
                ) : (
                  <Menu className="h-5 w-5" aria-hidden />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ── Inline search bar (expands below nav) ── */}
        {isSearchOpen && (
          <div className="border-t border-slate-100 bg-white px-4 py-3 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
                <input
                  type="search"
                  placeholder="Search laptops, GPUs, workstations…"
                  autoFocus
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 py-2.5 pl-9 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ── Mobile menu ── */}
      {isMobileOpen && (
        <div
          id="mobile-menu"
          className="fixed inset-x-0 top-16 z-40 border-b border-slate-200 bg-white shadow-lg md:hidden"
        >
          <nav className="mx-auto max-w-7xl px-4 py-3" aria-label="Mobile navigation">
            {NAV_LINKS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className={clsx(
                  'flex items-center rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                  isActive(href)
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                )}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      )}

      {/* Mobile menu backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/20 md:hidden"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden
        />
      )}
    </>
  );
}
