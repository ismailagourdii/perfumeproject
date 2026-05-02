'use client';

import React, { useEffect, useState } from 'react';
import api, { API_SUPER_ADMIN } from '@/lib/api';
import { spacing, typography } from '@/lib/design-tokens';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface SettingsData {
  packPricing: Record<string, number>;
  delivery: Record<string, number>;
  payment: Record<string, unknown>;
  site: Record<string, string>;
  footer: Record<string, unknown>;
}

const sectionStyle: React.CSSProperties = {
  backgroundColor: 'var(--color-surface2)',
  borderRadius: 16,
  border: '1px solid var(--color-border)',
  padding: spacing[4],
  display: 'flex',
  flexDirection: 'column',
  gap: spacing[3],
};

export default function SuperadminSettingsPage() {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Local form state
  const [packPricing, setPackPricing] = useState<Record<string, string>>({});
  const [delivery, setDelivery] = useState<Record<string, string>>({});
  const [payment, setPayment] = useState<Record<string, string | boolean>>({});
  const [site, setSite] = useState<Record<string, string>>({});
  const [uploadingCollection, setUploadingCollection] = useState<'homme' | 'femme' | null>(null);

  useEffect(() => {
    api
      .get<{ data: SettingsData }>(`${API_SUPER_ADMIN}/settings`)
      .then((res) => {
        const d = res.data?.data;
        if (d) {
          setSettings(d);
          setPackPricing(
            Object.fromEntries(Object.entries(d.packPricing).map(([k, v]) => [k, String(v)]))
          );
          setDelivery(
            Object.fromEntries(Object.entries(d.delivery).map(([k, v]) => [k, String(v)]))
          );
          setPayment(d.payment as Record<string, string | boolean>);
          setSite(d.site as Record<string, string>);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const payload = {
        packPricing: Object.fromEntries(
          Object.entries(packPricing).map(([k, v]) => [k, Number(v)])
        ),
        delivery: Object.fromEntries(
          Object.entries(delivery).map(([k, v]) => [k, Number(v)])
        ),
        payment,
        site,
      };
      const res = await api.put<{ data: SettingsData }>(`${API_SUPER_ADMIN}/settings`, payload);
      const d = res.data?.data;
      if (d) setSettings(d);
      setMessage('Paramètres enregistrés avec succès.');
    } catch {
      setMessage('Erreur lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  };

  const handleCollectionImageUpload = async (
    file: File,
    key: 'collection_homme_image' | 'collection_femme_image',
    label: 'homme' | 'femme',
  ) => {
    setUploadingCollection(label);
    setMessage('');
    try {
      const fd = new FormData();
      fd.append('files[]', file);
      const res = await api.post<{ files?: Array<{ url?: string }> }>(
        `${API_SUPER_ADMIN}/media/upload`,
        fd,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );
      const uploadedUrl = String(res.data?.files?.[0]?.url ?? '').trim();
      if (!uploadedUrl) {
        throw new Error('Upload failed');
      }
      setSite((prev) => ({ ...prev, [key]: uploadedUrl }));
      setMessage(`Image collection ${label} mise à jour. N'oubliez pas d'enregistrer.`);
    } catch {
      setMessage(`Erreur upload image collection ${label}.`);
    } finally {
      setUploadingCollection(null);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: spacing[6], color: 'var(--color-muted)', fontSize: 14 }}>
        Chargement des paramètres…
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[4] }}>
      <header>
        <h1 style={{ margin: 0, fontFamily: typography.fontDisplay, fontSize: 28 }}>
          Paramètres
        </h1>
        <p
          style={{
            marginTop: spacing[1],
            marginBottom: 0,
            color: 'var(--color-muted)',
            fontSize: 13,
          }}
        >
          Configuration générale de la boutique.
        </p>
      </header>

      {message && (
        <div
          style={{
            padding: `${spacing[2]}px ${spacing[3]}px`,
            borderRadius: 8,
            backgroundColor: message.includes('succès')
              ? 'rgba(34,197,94,0.1)'
              : 'rgba(239,68,68,0.1)',
            color: message.includes('succès') ? '#22c55e' : '#ef4444',
            fontSize: 13,
          }}
        >
          {message}
        </div>
      )}

      {/* Pack Pricing */}
      <section style={sectionStyle}>
        <h2
          style={{
            margin: 0,
            fontFamily: typography.fontDisplay,
            fontSize: 20,
            color: 'var(--color-text)',
          }}
        >
          Tarifs Packs
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: spacing[3],
          }}
        >
          <Input
            label="Duo 20ml (MAD)"
            type="number"
            value={packPricing.duo_20ml_price ?? ''}
            onChange={(e) =>
              setPackPricing((p) => ({ ...p, duo_20ml_price: e.target.value }))
            }
          />
          <Input
            label="Duo 50ml (MAD)"
            type="number"
            value={packPricing.duo_50ml_price ?? ''}
            onChange={(e) =>
              setPackPricing((p) => ({ ...p, duo_50ml_price: e.target.value }))
            }
          />
          <Input
            label="Trio 20ml (MAD)"
            type="number"
            value={packPricing.trio_20ml_price ?? ''}
            onChange={(e) =>
              setPackPricing((p) => ({ ...p, trio_20ml_price: e.target.value }))
            }
          />
          <Input
            label="Trio 50ml (MAD)"
            type="number"
            value={packPricing.trio_50ml_price ?? ''}
            onChange={(e) =>
              setPackPricing((p) => ({ ...p, trio_50ml_price: e.target.value }))
            }
          />
          <Input
            label="Remise Duo (%)"
            type="number"
            value={packPricing.duo_discount_percent ?? ''}
            onChange={(e) =>
              setPackPricing((p) => ({ ...p, duo_discount_percent: e.target.value }))
            }
          />
          <Input
            label="Remise Trio (%)"
            type="number"
            value={packPricing.trio_discount_percent ?? ''}
            onChange={(e) =>
              setPackPricing((p) => ({ ...p, trio_discount_percent: e.target.value }))
            }
          />
        </div>
      </section>

      {/* Delivery */}
      <section style={sectionStyle}>
        <h2
          style={{
            margin: 0,
            fontFamily: typography.fontDisplay,
            fontSize: 20,
            color: 'var(--color-text)',
          }}
        >
          Livraison
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: spacing[3],
          }}
        >
          <Input
            label="Seuil livraison gratuite (MAD)"
            type="number"
            value={delivery.free_delivery_threshold ?? ''}
            onChange={(e) =>
              setDelivery((p) => ({ ...p, free_delivery_threshold: e.target.value }))
            }
          />
          <Input
            label="Montant minimum commande (MAD)"
            type="number"
            value={delivery.min_order_amount ?? ''}
            onChange={(e) =>
              setDelivery((p) => ({ ...p, min_order_amount: e.target.value }))
            }
          />
        </div>
      </section>

      {/* Payment */}
      <section style={sectionStyle}>
        <h2
          style={{
            margin: 0,
            fontFamily: typography.fontDisplay,
            fontSize: 20,
            color: 'var(--color-text)',
          }}
        >
          Paiement
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing[2],
              color: 'var(--color-text)',
              fontSize: 14,
            }}
          >
            <input
              type="checkbox"
              checked={payment.cod_enabled === true || payment.cod_enabled === 'true'}
              onChange={(e) =>
                setPayment((p) => ({ ...p, cod_enabled: e.target.checked }))
              }
            />
            Paiement à la livraison (COD)
          </label>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing[2],
              color: 'var(--color-text)',
              fontSize: 14,
            }}
          >
            <input
              type="checkbox"
              checked={
                payment.virement_enabled === true ||
                payment.virement_enabled === 'true'
              }
              onChange={(e) =>
                setPayment((p) => ({ ...p, virement_enabled: e.target.checked }))
              }
            />
            Virement bancaire
          </label>
          <Input
            label="Nom de la banque"
            value={String(payment.virement_bank_name ?? '')}
            onChange={(e) =>
              setPayment((p) => ({ ...p, virement_bank_name: e.target.value }))
            }
          />
          <Input
            label="RIB"
            value={String(payment.virement_rib ?? '')}
            onChange={(e) =>
              setPayment((p) => ({ ...p, virement_rib: e.target.value }))
            }
          />
          <Input
            label="Titulaire du compte"
            value={String(payment.virement_account_holder ?? '')}
            onChange={(e) =>
              setPayment((p) => ({
                ...p,
                virement_account_holder: e.target.value,
              }))
            }
          />
        </div>
      </section>

      {/* Site */}
      <section style={sectionStyle}>
        <h2
          style={{
            margin: 0,
            fontFamily: typography.fontDisplay,
            fontSize: 20,
            color: 'var(--color-text)',
          }}
        >
          Informations du site
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: spacing[3],
          }}
        >
          <Input
            label="Nom du site"
            value={site.site_name ?? ''}
            onChange={(e) => setSite((p) => ({ ...p, site_name: e.target.value }))}
          />
          <Input
            label="Email de contact"
            value={site.contact_email ?? ''}
            onChange={(e) =>
              setSite((p) => ({ ...p, contact_email: e.target.value }))
            }
          />
          <Input
            label="Téléphone"
            value={site.contact_phone ?? ''}
            onChange={(e) =>
              setSite((p) => ({ ...p, contact_phone: e.target.value }))
            }
          />
          <Input
            label="Adresse"
            value={site.contact_address ?? ''}
            onChange={(e) =>
              setSite((p) => ({ ...p, contact_address: e.target.value }))
            }
          />
        </div>
      </section>

      {/* Accueil */}
      <section style={sectionStyle}>
        <h2
          style={{
            margin: 0,
            fontFamily: typography.fontDisplay,
            fontSize: 20,
            color: 'var(--color-text)',
          }}
        >
          Accueil
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing[3] }}>
          <div
            style={{
              border: '1px solid var(--color-border)',
              borderRadius: 12,
              padding: spacing[3],
              backgroundColor: 'var(--color-surface)',
              display: 'flex',
              flexDirection: 'column',
              gap: spacing[2],
            }}
          >
            <div style={{ fontSize: 13, color: 'var(--color-text)', fontWeight: 600 }}>
              Image collection Homme
            </div>
            {site.collection_homme_image ? (
              <img
                src={site.collection_homme_image}
                alt=""
                style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8 }}
              />
            ) : null}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                void handleCollectionImageUpload(file, 'collection_homme_image', 'homme');
                e.currentTarget.value = '';
              }}
              disabled={uploadingCollection !== null}
            />
          </div>
          <div
            style={{
              border: '1px solid var(--color-border)',
              borderRadius: 12,
              padding: spacing[3],
              backgroundColor: 'var(--color-surface)',
              display: 'flex',
              flexDirection: 'column',
              gap: spacing[2],
            }}
          >
            <div style={{ fontSize: 13, color: 'var(--color-text)', fontWeight: 600 }}>
              Image collection Femme
            </div>
            {site.collection_femme_image ? (
              <img
                src={site.collection_femme_image}
                alt=""
                style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8 }}
              />
            ) : null}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                void handleCollectionImageUpload(file, 'collection_femme_image', 'femme');
                e.currentTarget.value = '';
              }}
              disabled={uploadingCollection !== null}
            />
          </div>
        </div>
        {uploadingCollection ? (
          <p style={{ margin: 0, color: 'var(--color-muted)', fontSize: 12 }}>
            Téléversement image collection {uploadingCollection}…
          </p>
        ) : null}
      </section>

      <div
        style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: spacing[2] }}
      >
        <Button loading={saving} onClick={handleSave}>
          Enregistrer les paramètres
        </Button>
      </div>
    </div>
  );
}
