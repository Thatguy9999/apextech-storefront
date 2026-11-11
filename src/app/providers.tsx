'use client';

// src/app/providers.tsx
// Client-side wrapper that initialises Zustand store hydration.
// Keep this thin — it only exists so that persist middleware can
// safely rehydrate localStorage on the client without a mismatch.

import { useEffect } from 'react';
import { useCartStore } from '@/store/useCartStore';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  // Trigger Zustand persist rehydration on first mount.
  // useCartStore.persist.rehydrate() is a no-op if already hydrated,
  // so it is safe to call on every cold boot.
  useEffect(() => {
    // The persist middleware automatically rehydrates from localStorage
    // when the store is first accessed; calling rehydrate() explicitly
    // ensures it fires even before any component reads from the store.
    void useCartStore.persist.rehydrate();
  }, []);

  return <>{children}</>;
}
