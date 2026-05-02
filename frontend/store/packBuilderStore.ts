import { create } from 'zustand';
import type { Perfume, PerfumeSize, PackType } from '@/types/shared-types';

interface Slot {
  index: number;
  perfume: Perfume | null;
}

interface PackBuilderState {
  packType: PackType;
  size: PerfumeSize;
  slots: Slot[];
  setPackType: (type: PackType) => void;
  setSize: (size: PerfumeSize) => void;
  setSlot: (index: number, perfume: Perfume | null) => void;
  reset: () => void;
}

const createInitialState = (): Pick<PackBuilderState, 'packType' | 'size' | 'slots'> => ({
  packType: 'duo',
  size: '20ml',
  slots: [
    { index: 0, perfume: null },
    { index: 1, perfume: null },
  ],
});

export const usePackBuilderStore = create<PackBuilderState>((set) => ({
  ...createInitialState(),
  setPackType: (type) =>
    set((state) => {
      const slotCount = type === 'duo' ? 2 : 3;
      const existing = state.slots.slice(0, slotCount);
      while (existing.length < slotCount) {
        existing.push({ index: existing.length, perfume: null });
      }
      return {
        packType: type,
        slots: existing.map((slot, index) => ({ ...slot, index })),
      };
    }),
  setSize: (size) => set({ size }),
  setSlot: (index, perfume) =>
    set((state) => ({
      slots: state.slots.map((slot) => (slot.index === index ? { ...slot, perfume } : slot)),
    })),
  reset: () => set(createInitialState()),
}));
