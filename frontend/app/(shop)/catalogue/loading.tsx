export default function CatalogueLoading() {
  return (
    <div
      style={{
        minHeight: '50vh',
        padding: '24px 24px 48px',
        backgroundColor: 'var(--color-bg)',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div className="scentara-skeleton" style={{ height: 32, width: 280, marginBottom: 24 }} />
        <div style={{ display: 'flex', gap: 12, marginBottom: 32, flexWrap: 'wrap' }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="scentara-skeleton" style={{ height: 36, width: 80 }} />
          ))}
        </div>
        <div className="scentara-product-grid">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
            <div key={i} className="scentara-skeleton" style={{ height: 280, borderRadius: 12 }} />
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 40 }}>
          <div className="scentara-skeleton" style={{ height: 40, width: 140 }} />
          <div className="scentara-skeleton" style={{ height: 40, width: 140 }} />
        </div>
      </div>
    </div>
  );
}
