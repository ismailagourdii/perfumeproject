'use client';

import { useEffect } from 'react';

export function HydrationVisibility() {
  useEffect(() => {
    document.documentElement.style.visibility = 'visible';
  }, []);
  return null;
}
