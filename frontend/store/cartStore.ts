import { create } from 'zustand';
import type { CartItem, PerfumeSize } from '@/types/shared-types';

interface CartState {
  items: CartItem[];
  add: (item: CartItem) => void;
  remove: (id: string, size: PerfumeSize) => void;
  updateQty: (id: string, quantity: number, size?: PerfumeSize) => void;
  clear: () => void;
  total: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  add: (item) =>
    set((state) => {
      const image =
        item.kind === 'single'
          ? (item.perfume as { imageUrl?: string }).imageUrl
          : item.perfumes?.[0]
            ? (item.perfumes[0] as { imageUrl?: string }).imageUrl
            : undefined;
      const itemWithImage = { ...item, image };
      const existing = state.items.find((i) => i.id === item.id && i.size === item.size);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.id === item.id && i.size === item.size ? { ...i, quantity: i.quantity + item.quantity } : i,
          ),
        };
      }
      return { items: [...state.items, itemWithImage] };
    }),
  remove: (id, size) =>
    set((state) => ({
      items: state.items.filter((i) => !(i.id === id && i.size === size)),
    })),
  updateQty: (id, quantity, size) =>
    set((state) => ({
      items: state.items.map((i) => {
        if (size !== undefined) {
          return i.id === id && i.size === size ? { ...i, quantity } : i;
        }
        return i.id === id ? { ...i, quantity } : i;
      }),
    })),
  clear: () => set({ items: [] }),
  total: () =>
    get().items.reduce((sum, item) => {
      if (item.kind === 'single') {
        return sum + item.unitPrice * item.quantity;
      }
      return sum + item.totalPrice * item.quantity;
    }, 0),
}));
