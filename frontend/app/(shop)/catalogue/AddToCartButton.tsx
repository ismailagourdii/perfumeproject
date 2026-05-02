'use client';

import type { Perfume, PerfumeSize } from '@/types/shared-types';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/store/cartStore';

export function AddToCartButton({ perfume, size }: { perfume: Perfume; size: PerfumeSize }) {
  const add = useCartStore((s) => s.add);
  const unitPrice = size === '20ml' ? perfume.price20ml : perfume.price50ml;

  return (
    <Button
      size="sm"
      onClick={() =>
        add({
          id: `single-${perfume.id}-${size}`,
          kind: 'single',
          perfume,
          size,
          unitPrice,
          quantity: 1,
        })
      }
    >
      Ajouter au panier
    </Button>
  );
}
