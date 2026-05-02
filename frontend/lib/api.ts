import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import type {
  CartItem,
  City,
  OrderSummary,
  Perfume,
  ShopSettings,
  User,
} from '@/types/shared-types';

const rawBase =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:8000';
const baseURL = rawBase.replace(/\/api\/?$/, '') + '/api';
const api = axios.create({
  baseURL,
  withCredentials: false,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

api.interceptors.request.use((config) => {
  // FormData : ne pas forcer application/json, sinon Laravel ne parse pas le corps (422).
  if (typeof FormData !== 'undefined' && config.data instanceof FormData && config.headers) {
    const h = config.headers;
    if (typeof h.delete === 'function') {
      h.delete('Content-Type');
    } else {
      delete (h as Record<string, unknown>)['Content-Type'];
    }
  }
  if (typeof window === 'undefined') {
    return config;
  }
  try {
    const authData = localStorage.getItem('scentara_auth');
    if (authData) {
      const parsed = JSON.parse(authData) as { state?: { token?: string }; token?: string };
      const token = parsed?.state?.token ?? parsed?.token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch (e) {
    console.error('Auth token read error:', e);
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = String(error.config?.url ?? '');
      // Échec de connexion : ne pas purger la session ni boucler middleware cookie ↔ login
      if (url.includes('auth/login')) {
        return Promise.reject(error);
      }
      if (typeof window !== 'undefined') {
        try {
          useAuthStore.getState().logout();
        } catch {
          localStorage.removeItem('scentara_auth');
        }
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
}

export interface LoginResponse {
  user: User;
  token: string;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const { data } = await api.post<{ data: LoginResponse }>('/auth/login', { email, password });
  return data.data;
}

export async function logout(): Promise<void> {
  try {
    await api.post('/auth/logout');
  } finally {
    setAuthToken(null);
  }
}

export interface PaginatedPerfumes {
  data: Perfume[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export async function fetchPerfumes(params?: {
  page?: number;
  per_page?: number;
  category?: 'homme' | 'femme' | 'mixte';
}): Promise<PaginatedPerfumes> {
  const response = await api.get<PaginatedPerfumes>('/products', { params });
  return response.data;
}

export async function fetchPerfumeBySlug(slug: string): Promise<{
  perfume: Perfume;
  related: Perfume[];
}> {
  const response = await api.get(`/products/${slug}`);
  return response.data;
}

export async function fetchCities(): Promise<City[]> {
  const response = await api.get<{ cities: City[] }>('/cities');
  return response.data.cities;
}

export async function fetchShopSettings(): Promise<ShopSettings> {
  const response = await api.get<{ settings: ShopSettings }>('/settings/shop');
  return response.data.settings;
}

export interface CreateOrderPayload {
  items: CartItem[];
  city_id: number;
  address_line1: string;
  address_line2?: string;
  customer_name: string;
  customer_phone: string;
  payment_method: 'cod' | 'virement';
}

export async function createOrder(payload: CreateOrderPayload): Promise<OrderSummary> {
  const response = await api.post<{ order: OrderSummary }>('/orders', payload);
  return response.data.order;
}

export async function fetchOrderById(id: string | number): Promise<OrderSummary> {
  const response = await api.get<{ order: OrderSummary }>(`/orders/${id}`);
  return response.data.order;
}

export interface HeroSlide {
  id: number;
  title: string | null;
  title_ar: string | null;
  subtitle: string | null;
  subtitle_ar: string | null;
  badge_text: string | null;
  badge_ar: string | null;
  button1_text: string | null;
  button1_text_ar: string | null;
  button1_link: string | null;
  button2_text: string | null;
  button2_text_ar: string | null;
  button2_link: string | null;
  button1_style: 'filled' | 'outline' | 'ghost';
  image_url: string | null;
  mobile_image_url: string | null;
  position: number;
  duration_ms: number;
  text_color: string;
  overlay_opacity: number;
  text_position: 'left' | 'center' | 'right';
}

export async function fetchSlides(): Promise<HeroSlide[]> {
  const response = await api.get<{ slides: HeroSlide[] }>('/slides');
  return response.data?.slides ?? [];
}

/** Increment view count when a slide is displayed (public, no auth). */
export async function trackSlideView(slideId: number): Promise<void> {
  try {
    await api.post(`/slides/${slideId}/view`);
  } catch {
    // best-effort analytics
  }
}

/** Increment click count when CTA is clicked (public, no auth). */
export async function trackSlideClick(slideId: number, button: 1 | 2): Promise<void> {
  try {
    await api.post(`/slides/${slideId}/click`, { button });
  } catch {
    // best-effort analytics
  }
}

export interface Banner {
  id: number;
  title: string | null;
  title_ar: string | null;
  link: string | null;
  image_url: string | null;
  position: number;
  is_active?: boolean;
}

export async function fetchBanners(): Promise<Banner[]> {
  const response = await api.get<{ banners: Banner[] }>('/banners');
  return response.data?.banners ?? [];
}

export interface PagePublic {
  id: number;
  title: string | null;
  title_ar: string | null;
  slug: string;
  position: number;
}

export interface PageFull {
  id: number;
  title: string;
  title_ar: string | null;
  slug: string;
  content: string | null;
  content_ar: string | null;
  meta_title: string | null;
  meta_description: string | null;
  status: 'draft' | 'published';
  show_in_footer: boolean;
  show_in_navbar: boolean;
  position: number;
}

/** Public: list pages with optional show_in_footer / show_in_navbar. */
export async function fetchPages(params?: { show_in_footer?: boolean; show_in_navbar?: boolean }): Promise<PagePublic[]> {
  const response = await api.get<{ pages: PagePublic[] }>('/pages', { params });
  return response.data?.pages ?? [];
}

/** Public: get one page by slug (published only). */
export async function fetchPageBySlug(slug: string): Promise<{ page: PageFull }> {
  const response = await api.get<{ page: PageFull }>(`/pages/${encodeURIComponent(slug)}`);
  return response.data;
}

// ——— Dashboard API (use NEXT_PUBLIC_API_URL=http://localhost:8000/api or leave default) ———

export async function dashboardGet<T = unknown>(path: string): Promise<T> {
  // api instance already has baseURL ending with /api, so strip any /api prefix
  const url = path.replace(/^\/api\/?/, '/').replace(/^([^/])/, '/$1');
  const { data } = await api.get<T>(url);
  return data as T;
}

export async function dashboardPut<T = unknown>(path: string, body?: unknown): Promise<T> {
  const url = path.replace(/^\/api\/?/, '/').replace(/^([^/])/, '/$1');
  const { data } = await api.put<T>(url, body);
  return data as T;
}

export async function dashboardPost<T = unknown>(path: string, body?: unknown): Promise<T> {
  const url = path.replace(/^\/api\/?/, '/').replace(/^([^/])/, '/$1');
  const { data } = await api.post<T>(url, body);
  return data as T;
}

/** Laravel `api/super-admin/*` routes (hyphen required; matches `php artisan route:list | grep super-admin`). */
export const API_SUPER_ADMIN = '/super-admin';

export default api;
