import { fetchPerfumes } from '@/lib/api';
import { CatalogueContent } from './CatalogueContent';

type TabKey = 'tous' | 'homme' | 'femme' | 'mixte';

export default async function CataloguePage({
  searchParams,
}: {
  searchParams?: Promise<{ category?: string; size?: string; page?: string }>;
}) {
  const params = await searchParams;
  const category = (params?.category as TabKey) || 'tous';
  const size = (params?.size as '20ml' | '50ml') || '20ml';
  const page = params?.page ? Number(params.page) || 1 : 1;

  const perPage = 12;
  const result = await fetchPerfumes({
    page,
    per_page: perPage,
    category: category === 'tous' ? undefined : category,
  });

  const perfumes = result.data;
  const { current_page, last_page } = result.meta;

  return (
    <CatalogueContent
      perfumes={perfumes}
      current_page={current_page}
      last_page={last_page}
      category={category}
      size={size}
    />
  );
}
