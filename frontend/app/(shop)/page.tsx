import { fetchPerfumes } from '@/lib/api';
import { HomePageContent } from './HomePageContent';
import type { Perfume } from '@/types/shared-types';

/** Contenu boutique : grille produits, catégories Homme/Femme, nouveautés — voir `HomePageContent.tsx`. */

export default async function HomePage() {
  let allProducts: Perfume[] = [];
  try {
    const res = await fetchPerfumes({ per_page: 12, page: 1 });
    allProducts = res.data ?? [];
  } catch {
    /* build ou SSR sans API (ex. CI, artisan non démarré) */
  }
  const popularProducts = allProducts.slice(0, 4);
  const newProducts = allProducts.slice(4, 8);

  return (
    <HomePageContent
      popularProducts={popularProducts}
      newProducts={newProducts}
    />
  );
}
