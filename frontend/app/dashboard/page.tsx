'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function DashboardIndexPage() {
  const router = useRouter();
  const { role, _hasHydrated } = useAuthStore();

  useEffect(() => {
    if (!_hasHydrated) return;
    if (role === null) {
      router.replace('/login');
      return;
    }
    if (role === 'superadmin') {
      router.replace('/dashboard/superadmin/overview');
      return;
    }
    if (role === 'admin') {
      router.replace('/dashboard/admin/overview');
      return;
    }
    if (role === 'user') {
      router.replace('/dashboard/user/orders');
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- éviter boucle si `router` n’est pas stable
  }, [_hasHydrated, role]);

  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--color-muted)',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      Redirection…
    </div>
  );
}
