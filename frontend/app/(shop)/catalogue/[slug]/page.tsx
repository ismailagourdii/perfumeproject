import { fetchPerfumeBySlug } from '@/lib/api';
import { ProductDetailContent } from './ProductDetailContent';

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { perfume, related } = await fetchPerfumeBySlug(slug);

  return <ProductDetailContent perfume={perfume} related={related} />;
}
