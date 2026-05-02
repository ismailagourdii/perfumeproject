'use client';

import React from 'react';
import { Badge } from '@/components/ui/Badge';
import type { BadgeStatus } from '@/components/ui/Badge';

const statusMap: Record<string, BadgeStatus> = {
  pending: 'pending',
  en_attente: 'pending',
  confirmed: 'confirmed',
  confirme: 'confirmed',
  shipped: 'shipped',
  expedie: 'shipped',
  delivered: 'delivered',
  livre: 'delivered',
  cancelled: 'cancelled',
  annule: 'cancelled',
};

export function OrderStatusBadge({
  status,
  children,
}: {
  status: string;
  children?: React.ReactNode;
}) {
  const normalized = String(status || '').toLowerCase();
  const mapped: BadgeStatus = statusMap[normalized] ?? 'pending';
  return <Badge status={mapped} showDot>{children ?? status}</Badge>;
}
