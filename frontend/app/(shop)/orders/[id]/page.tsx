import Link from 'next/link';
import { fetchOrderById } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';
import { spacing, typography } from '@/lib/design-tokens';
import type { OrderSummary } from '@/types/shared-types';

const mapStatusToBadge: Record<OrderSummary['status'], 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'> = {
  pending: 'pending',
  confirmed: 'confirmed',
  shipped: 'shipped',
  delivered: 'delivered',
  cancelled: 'cancelled',
};

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await fetchOrderById(id);

  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg)',
        color: 'var(--color-text)',
        padding: `${spacing[6]}px ${spacing[4]}px ${spacing[6]}px`,
        fontFamily: typography.fontBody,
      }}
    >
      <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: spacing[4] }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', gap: spacing[3], alignItems: 'center' }}>
          <div>
            <p style={{ margin: 0, fontFamily: typography.fontBody, letterSpacing: 0.32, textTransform: 'uppercase', fontSize: 11, color: 'var(--color-muted)' }}>Confirmation</p>
            <h1 style={{ margin: '4px 0 0', fontFamily: typography.fontDisplay, fontSize: 28, letterSpacing: 0.18, textTransform: 'uppercase', color: 'var(--color-text)' }}>
              Commande #{order.reference}
            </h1>
          </div>
          <Badge status={mapStatusToBadge[order.status]} showDot>{order.status}</Badge>
        </header>

        <section
          style={{
            borderRadius: 24,
            border: '1px solid var(--color-border)',
            background: 'linear-gradient(150deg, var(--color-surface2), var(--color-bg))',
            padding: spacing[4],
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)',
            gap: spacing[4],
            color: 'var(--color-text)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
            <h2 style={{ margin: 0, fontFamily: typography.fontBody, fontSize: 14, textTransform: 'uppercase' }}>Vos articles</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
              {order.items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: spacing[2],
                    paddingBottom: spacing[2],
                    borderBottom: '1px solid var(--color-border)',
                  }}
                >
                  <div>
                    <p style={{ margin: 0, fontSize: 14, color: 'var(--color-text)' }}>{item.label}</p>
                    <p style={{ margin: 0, fontSize: 12, color: 'var(--color-muted)' }}>Qté {item.quantity}</p>
                  </div>
                  <p style={{ margin: 0, fontSize: 14, color: 'var(--color-gold-light)' }}>{item.totalPrice.toLocaleString('fr-MA')} MAD</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
            <div>
              <h2 style={{ margin: 0, fontFamily: typography.fontBody, fontSize: 14, textTransform: 'uppercase' }}>Livraison</h2>
              <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--color-text)' }}>
                {order.customerName}<br />
                {order.addressLine1}
                {order.addressLine2 && <><br />{order.addressLine2}</>}
                <br />{order.city.name}<br />
                {order.customerPhone}
              </p>
            </div>
            <div>
              <h2 style={{ margin: 0, fontFamily: typography.fontBody, fontSize: 14, textTransform: 'uppercase' }}>Récapitulatif</h2>
              <div style={{ marginTop: spacing[2], display: 'flex', flexDirection: 'column', gap: spacing[1], fontSize: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Sous-total</span><span>{order.subtotal.toLocaleString('fr-MA')} MAD</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Réductions</span><span>-{order.discountTotal.toLocaleString('fr-MA')} MAD</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Livraison</span><span>{order.deliveryFee.toLocaleString('fr-MA')} MAD</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: spacing[2], marginTop: spacing[1] }}>
                  <span style={{ textTransform: 'uppercase' }}>Total</span>
                  <span style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-gold-light)' }}>{order.total.toLocaleString('fr-MA')} MAD</span>
                </div>
              </div>
            </div>
            <div>
              <h2 style={{ margin: 0, fontFamily: typography.fontBody, fontSize: 14, textTransform: 'uppercase' }}>Paiement</h2>
              <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--color-text)' }}>
                {order.paymentMethod === 'cod'
                  ? 'Paiement à la livraison (espèces). Préparez le montant exact si possible.'
                  : 'Virement bancaire : les instructions complètes vous ont été envoyées par SMS / e-mail.'}
              </p>
            </div>
          </div>
        </section>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing[2] }}>
          <Link href="/catalogue" style={{ fontSize: 13, color: 'var(--color-muted)', textDecoration: 'none' }}>← Retourner au catalogue</Link>
        </div>
      </div>
    </main>
  );
}
