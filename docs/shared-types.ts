// Types partagés entre le frontend SCENTARA et le backend.
// Toute nouvelle forme de donnée métier doit être ajoutée ici,
// puis réutilisée via import dans les autres modules.

export type GenderCategory = 'homme' | 'femme' | 'mixte';

export type PerfumeSize = '20ml' | '50ml';

export interface Perfume {
  id: number;
  slug: string;
  name: string;
  category: GenderCategory;
  intensity: 'léger' | 'modéré' | 'intense';
  imageUrl: string;
  description: string;
  notesTop: string[];
  notesHeart: string[];
  notesBase: string[];
  price20ml: number;
  price50ml: number;
}

export type PackType = 'duo' | 'trio';

export interface PackSelectionSlot {
  index: number;
  perfume: Perfume | null;
}

export interface PackBuilderState {
  packType: PackType;
  size: PerfumeSize;
  slots: PackSelectionSlot[];
}

export type CartItemKind = 'single' | 'pack';

export interface CartItemBase {
  id: string;
  kind: CartItemKind;
  quantity: number;
}

export interface SingleCartItem extends CartItemBase {
  kind: 'single';
  perfume: Perfume;
  size: PerfumeSize;
  unitPrice: number;
}

export interface PackCartItem extends CartItemBase {
  kind: 'pack';
  packType: PackType;
  size: PerfumeSize;
  perfumes: Perfume[];
  basePrice: number;
  discountPercentage: number;
  totalPrice: number;
}

export type CartItem = SingleCartItem | PackCartItem;

export interface City {
  id: number;
  name: string;
  deliveryFee: number;
}

export type PaymentMethodCode = 'cod' | 'virement';

export interface PaymentMethod {
  code: PaymentMethodCode;
  label: string;
  description?: string;
}

export interface BankDetails {
  bankName: string;
  iban: string;
  rib: string;
  holder: string;
}

export interface ShopSettings {
  paymentMethods: PaymentMethod[];
  bankDetails?: BankDetails;
}

export interface OrderItem {
  id: number;
  kind: CartItemKind;
  label: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  meta?: Record<string, unknown>;
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderSummary {
  id: number;
  reference: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discountTotal: number;
  total: number;
  city: City;
  addressLine1: string;
  addressLine2?: string;
  customerName: string;
  customerPhone: string;
  paymentMethod: PaymentMethodCode;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'customer';
}

