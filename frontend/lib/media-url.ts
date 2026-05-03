/**
 * Racine publique du backend Laravel (sans `/api`, sans slash final).
 * Définir `NEXT_PUBLIC_API_URL` (ex. http://localhost:8000 en local, URL HTTPS en production).
 */
export function getPublicApiBaseUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '').trim();
  return raw.replace(/\/api\/?$/i, '').replace(/\/+$/, '');
}

/**
 * URL absolue vers un fichier servi sous `/storage/...` (disque `storage/app/public` de Laravel).
 * @param path - ex. `products/xyz.png`, `banners/abc.jpg`, ou `storage/products/...`, `/storage/...`
 */
export function getImageUrl(path: string): string {
  const base = getPublicApiBaseUrl();
  if (!path?.trim()) return '';
  const t = path.trim();
  if (/^https?:\/\//i.test(t)) return t;
  if (!base) return '';
  const noLead = t.replace(/^\/+/, '');
  const relative = noLead.replace(/^storage\//, '');
  return `${base}/storage/${relative}`;
}

/**
 * Valeur utilisable en `src` pour `<img>` / `next/image` : URL API, chemin `/storage/...`, ou blob/data.
 * Réécrit les URL absolues dont le chemin commence par `/storage/` vers `NEXT_PUBLIC_API_URL`.
 */
export function resolveMediaSrc(raw: string | null | undefined): string {
  if (raw == null) return '';
  const s = String(raw).trim();
  if (!s) return '';
  if (s.startsWith('blob:') || s.startsWith('data:')) return s;
  if (/^https?:\/\//i.test(s)) {
    try {
      const u = new URL(s);
      if (u.pathname.startsWith('/storage/')) {
        const base = getPublicApiBaseUrl();
        if (base) return `${base}${u.pathname}${u.search}`;
      }
    } catch {
      /* ignore */
    }
    return s;
  }
  return getImageUrl(s);
}
