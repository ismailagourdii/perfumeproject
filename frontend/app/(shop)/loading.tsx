export default function ShopLoading() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg)',
        padding: '24px 24px 48px',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div className="scentara-skeleton" style={{ height: 56, marginBottom: 32, maxWidth: 400 }} />
        <div className="scentara-hero-grid" style={{ marginBottom: 48 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="scentara-skeleton" style={{ height: 48, width: '80%' }} />
            <div className="scentara-skeleton" style={{ height: 24, width: '100%' }} />
            <div className="scentara-skeleton" style={{ height: 24, width: '90%' }} />
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <div className="scentara-skeleton" style={{ height: 44, width: 120 }} />
              <div className="scentara-skeleton" style={{ height: 44, width: 160 }} />
            </div>
          </div>
          <div className="scentara-skeleton" style={{ aspectRatio: '4/5', borderRadius: 20 }} />
        </div>
        <div className="scentara-skeleton" style={{ height: 24, width: 200, marginBottom: 24 }} />
        <div className="scentara-product-grid">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="scentara-skeleton" style={{ height: 280, borderRadius: 12 }} />
          ))}
        </div>
      </div>
    </div>
  );
}
