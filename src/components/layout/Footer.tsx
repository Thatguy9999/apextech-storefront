// src/components/layout/Footer.tsx
// Site-wide footer with newsletter subscription — client component

"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Zap, Mail, Twitter, Github, Linkedin, MapPin, Phone, Check } from 'lucide-react';

/* ── Data ─────────────────────────────────────────────────── */
const QUICK_LINKS = [
  { label: 'All Products', href: '/products' },
  { label: 'Laptops', href: '/products?category=laptops' },
  { label: 'Workstations', href: '/products?category=workstations' },
  { label: 'GPUs', href: '/products?category=gpus' },
  { label: 'Accessories', href: '/products?category=accessories' },
  { label: 'Deals', href: '/deals' },
  { label: 'Compare', href: '/compare' },
];

const SUPPORT_LINKS = [
  { label: 'Help Center', href: '/support' },
  { label: 'Shipping Info', href: '/shipping' },
  { label: 'Returns & Refunds', href: '/returns' },
  { label: 'Warranty', href: '/warranty' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
];

const SOCIAL_LINKS = [
  { label: 'Twitter / X', href: 'https://twitter.com/apextech', icon: Twitter },
  { label: 'GitHub', href: 'https://github.com/apextech', icon: Github },
  { label: 'LinkedIn', href: 'https://linkedin.com/company/apextech', icon: Linkedin },
];

/* ── Component ────────────────────────────────────────────── */
export function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="bg-slate-50 border-t border-slate-200" aria-label="Site footer">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* ── Main footer grid ── */}
        <div className="py-16 grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">

          {/* Column 1 — Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 group" aria-label="ApexTech Home">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white group-hover:bg-blue-700 transition-colors duration-150">
                <Zap className="h-5 w-5" aria-hidden />
              </span>
              <span className="text-lg font-bold tracking-tight text-slate-900">
                APEX<span className="text-blue-600">TECH</span>
              </span>
            </Link>

            <p className="mt-4 text-sm leading-relaxed text-slate-500 max-w-xs">
              Engineered for those who demand more. We curate the finest laptops,
              workstations, and GPUs from the world&apos;s leading technology brands.
            </p>

            {/* Social links */}
            <div className="mt-6 flex items-center gap-3">
              {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition-all hover:border-blue-300 hover:text-blue-600 hover:shadow"
                >
                  <Icon className="h-4 w-4" aria-hidden />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2 — Quick Links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-900">
              Shop
            </h3>
            <ul className="mt-4 space-y-2.5">
              {QUICK_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-slate-500 transition-colors hover:text-blue-600"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — Support */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-900">
              Support
            </h3>
            <ul className="mt-4 space-y-2.5">
              {SUPPORT_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-slate-500 transition-colors hover:text-blue-600"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 — Contact & Newsletter */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-900">
              Contact
            </h3>
            <ul className="mt-4 space-y-3">
              <li className="flex items-start gap-3 text-sm text-slate-500">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                <span>
                  1 Infinite Loop, Cupertino
                  <br />
                  CA 95014, USA
                </span>
              </li>
              <li>
                <a
                  href="tel:+18005559876"
                  className="flex items-center gap-3 text-sm text-slate-500 transition-colors hover:text-blue-600"
                >
                  <Phone className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                  +1 (800) 555-9876
                </a>
              </li>
              <li>
                <a
                  href="mailto:hello@apextech.dev"
                  className="flex items-center gap-3 text-sm text-slate-500 transition-colors hover:text-blue-600"
                >
                  <Mail className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                  hello@apextech.dev
                </a>
              </li>
            </ul>

            {/* Newsletter CTA */}
            <div className="mt-8">
              <p className="text-sm font-medium text-slate-900">Stay in the loop</p>
              <p className="mt-1 text-xs text-slate-500">
                New arrivals, exclusive deals, and tech insights.
              </p>
              {subscribed ? (
                <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs font-medium text-emerald-700">
                  <Check className="h-4 w-4" />
                  Thanks for subscribing!
                </div>
              ) : (
                <form
                  className="mt-3 flex gap-2"
                  onSubmit={handleSubscribe}
                >
                  <label htmlFor="footer-email" className="sr-only">Email address</label>
                  <input
                    id="footer-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <button
                    type="submit"
                    className="shrink-0 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
                  >
                    Subscribe
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="border-t border-slate-200 py-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-xs text-slate-500">
            © 2026 ApexTech. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <Link href="/privacy" className="hover:text-slate-600 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-600 transition-colors">Terms</Link>
            <Link href="/cookies" className="hover:text-slate-600 transition-colors">Cookies</Link>
            <span>Built with Next.js 15 &amp; Stripe</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
