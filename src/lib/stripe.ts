// src/lib/stripe.ts
// Stripe client configuration - server-side only

import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing environment variable: STRIPE_SECRET_KEY');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-02-24.acacia',
  appInfo: {
    name: 'ApexTech Headless Storefront',
    version: '1.0.0',
  },
});
