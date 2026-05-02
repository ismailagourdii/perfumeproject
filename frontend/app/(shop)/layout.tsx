import { ShopNavbar } from '@/components/shop/ShopNavbar';
import { ShopFooter } from '@/components/shop/ShopFooter';

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ShopNavbar />
      {children}
      <ShopFooter />
    </>
  );
}
