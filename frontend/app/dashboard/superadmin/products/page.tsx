'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import api, { API_SUPER_ADMIN } from '@/lib/api';
import { spacing, typography } from '@/lib/design-tokens';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { resolveMediaSrc } from '@/lib/media-url';

function formatMAD(v: number | undefined | null) {
  return `${Number(v ?? 0).toLocaleString('fr-MA')} MAD`;
}

function slugFromName(name: string): string {
  return String(name ?? '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

interface ProductForm {
  name: string;
  name_ar: string;
  category: string;
  description: string;
  description_ar: string;
  price20ml: string | number;
  price50ml: string | number;
  stock20ml: string | number;
  stock50ml: string | number;
  notesTop: string;
  notesHeart: string;
  notesBase: string;
  notes_top_ar: string;
  notes_heart_ar: string;
  notes_base_ar: string;
  intensity: string;
  intensity_ar: string;
  active: boolean;
  imageFile: File | null;
  imagePreview: string | null;
}

const emptyForm: ProductForm = {
  name: '',
  name_ar: '',
  category: '',
  description: '',
  description_ar: '',
  price20ml: '',
  price50ml: '',
  stock20ml: '',
  stock50ml: '',
  notesTop: '',
  notesHeart: '',
  notesBase: '',
  notes_top_ar: '',
  notes_heart_ar: '',
  notes_base_ar: '',
  intensity: '',
  intensity_ar: '',
  active: true,
  imageFile: null,
  imagePreview: null,
};

export default function SuperadminProductsPage() {
  const [products, setProducts] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [modalLangTab, setModalLangTab] = useState<'fr' | 'ar'>('fr');
  const [dragOver, setDragOver] = useState(false);
  const [zoneHover, setZoneHover] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const zoneActive = dragOver || zoneHover;

  const slug = useMemo(() => slugFromName(form.name), [form.name]);

  useEffect(() => {
    api
      .get<{ products?: Array<Record<string, unknown>> }>(`${API_SUPER_ADMIN}/products`)
      .then((res) => setProducts(res.data?.products ?? []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  function openCreate() {
    setEditing(null);
    setForm({ ...emptyForm });
    setModalLangTab('fr');
    setModalOpen(true);
  }

  function openEdit(p: Record<string, unknown>) {
    setEditing(p);
    const notes = (p.notes as { top?: string[]; heart?: string[]; base?: string[] }) ?? {};
    const notesAr = (p.notes_ar as { top?: string[]; heart?: string[]; base?: string[] }) ?? {};
    setForm({
      name: String(p.name ?? ''),
      name_ar: String((p as { name_ar?: string }).name_ar ?? ''),
      category: String(p.category ?? ''),
      description: String(p.description ?? ''),
      description_ar: String((p as { description_ar?: string }).description_ar ?? ''),
      price20ml: Number(p.price20ml) || '',
      price50ml: Number(p.price50ml) || '',
      stock20ml: Number(p.stock_20ml ?? p.stock20ml) || '',
      stock50ml: Number(p.stock_50ml ?? p.stock50ml) || '',
      notesTop: Array.isArray(notes.top) ? notes.top.join(', ') : '',
      notesHeart: Array.isArray(notes.heart) ? notes.heart.join(', ') : '',
      notesBase: Array.isArray(notes.base) ? notes.base.join(', ') : '',
      notes_top_ar: Array.isArray(notesAr.top) ? notesAr.top.join(', ') : '',
      notes_heart_ar: Array.isArray(notesAr.heart) ? notesAr.heart.join(', ') : '',
      notes_base_ar: Array.isArray(notesAr.base) ? notesAr.base.join(', ') : '',
      intensity: String(p.intensity ?? ''),
      intensity_ar: String((p as { intensity_ar?: string }).intensity_ar ?? ''),
      active: !!p.active,
      imageFile: null,
      imagePreview: p.imageUrl ? String(p.imageUrl) : null,
    });
    setModalLangTab('fr');
    setModalOpen(true);
  }

  function onNameChange(name: string) {
    setForm((prev) => ({ ...prev, name }));
  }

  function setImageFile(file: File | null) {
    if (!file) return;
    setForm((prev) => {
      if (prev.imageFile && prev.imagePreview) URL.revokeObjectURL(prev.imagePreview);
      return {
        ...prev,
        imageFile: file,
        imagePreview: URL.createObjectURL(file),
      };
    });
  }

  function onImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setImageFile(file);
    e.target.value = '';
  }

  function handleImageDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file?.type.startsWith('image/')) setImageFile(file);
  }

  function clearImagePreview() {
    setForm((prev) => {
      if (prev.imageFile && prev.imagePreview) URL.revokeObjectURL(prev.imagePreview);
      return { ...prev, imageFile: null, imagePreview: prev.imageFile ? null : prev.imagePreview };
    });
  }

  async function saveProduct() {
    setSaving(true);
    try {
      const notes = {
        top: form.notesTop.split(',').map((s) => s.trim()).filter(Boolean),
        heart: form.notesHeart.split(',').map((s) => s.trim()).filter(Boolean),
        base: form.notesBase.split(',').map((s) => s.trim()).filter(Boolean),
      };
      const notes_ar = {
        top: form.notes_top_ar.split(',').map((s) => s.trim()).filter(Boolean),
        heart: form.notes_heart_ar.split(',').map((s) => s.trim()).filter(Boolean),
        base: form.notes_base_ar.split(',').map((s) => s.trim()).filter(Boolean),
      };
      const payload = {
        name: form.name,
        name_ar: form.name_ar || undefined,
        slug: slug || slugFromName(form.name),
        category: form.category,
        description: form.description,
        description_ar: form.description_ar || undefined,
        notes_ar: notes_ar.top.length || notes_ar.heart.length || notes_ar.base.length ? notes_ar : undefined,
        intensity_ar: form.intensity_ar || undefined,
        price20ml: form.price20ml === '' ? undefined : Number(form.price20ml),
        price50ml: form.price50ml === '' ? undefined : Number(form.price50ml),
        stock_20ml: form.stock20ml === '' ? undefined : Number(form.stock20ml),
        stock_50ml: form.stock50ml === '' ? undefined : Number(form.stock50ml),
        notes,
        intensity: form.intensity || undefined,
        active: form.active,
      };

      if (form.imageFile) {
        const fd = new FormData();
        fd.append('name', payload.name);
        if (payload.name_ar != null) fd.append('name_ar', payload.name_ar);
        fd.append('slug', payload.slug || '');
        if (payload.category != null) fd.append('category', payload.category);
        if (payload.description != null) fd.append('description', payload.description);
        if (payload.description_ar != null) fd.append('description_ar', payload.description_ar);
        if (payload.notes_ar != null) fd.append('notes_ar', JSON.stringify(payload.notes_ar));
        if (payload.intensity_ar != null) fd.append('intensity_ar', payload.intensity_ar);
        if (payload.price20ml != null) fd.append('price20ml', String(payload.price20ml));
        if (payload.price50ml != null) fd.append('price50ml', String(payload.price50ml));
        if (payload.stock_20ml != null) fd.append('stock_20ml', String(payload.stock_20ml));
        if (payload.stock_50ml != null) fd.append('stock_50ml', String(payload.stock_50ml));
        fd.append('notes', JSON.stringify(notes));
        if (payload.intensity != null) fd.append('intensity', payload.intensity);
        fd.append('active', payload.active ? '1' : '0');
        fd.append('image', form.imageFile);

        if (editing?.id) {
          const res = await api.put(`${API_SUPER_ADMIN}/products/${editing.id}`, fd);
          setProducts((prev) =>
            prev.map((p) => (p.id === editing.id ? ((res.data as Record<string, unknown>)?.product as Record<string, unknown>) ?? p : p))
          );
        } else {
          const res = await api.post(`${API_SUPER_ADMIN}/products`, fd);
          const created = (res.data as Record<string, unknown>)?.product ?? res.data;
          setProducts((prev) => [created as Record<string, unknown>, ...prev]);
        }
      } else {
        if (editing?.id) {
          const res = await api.put(`${API_SUPER_ADMIN}/products/${editing.id}`, payload);
          setProducts((prev) =>
            prev.map((p) => (p.id === editing.id ? ((res.data as Record<string, unknown>)?.product as Record<string, unknown>) ?? p : p))
          );
        } else {
          const res = await api.post(`${API_SUPER_ADMIN}/products`, payload);
          const created = (res.data as Record<string, unknown>)?.product ?? res.data;
          setProducts((prev) => [created as Record<string, unknown>, ...prev]);
        }
      }
      setModalOpen(false);
      clearImagePreview();
    } catch (error) {
      // Ne pas laisser remonter l'erreur Axios jusqu'au boundary React
      // pour éviter l'écran rouge Next.js. On logge et on affiche un message simple.
      // eslint-disable-next-line no-console
      console.error('Erreur lors de lenregistrement du produit', error);
      if (typeof window !== 'undefined') {
        window.alert("Impossible d'enregistrer le produit. Vérifiez les champs obligatoires (nom, image) puis réessayez.");
      }
    } finally {
      setSaving(false);
    }
  }

  async function deleteProduct(id: unknown) {
    try {
      await api.delete(`${API_SUPER_ADMIN}/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      // ignore
    }
  }

  async function toggleActive(p: Record<string, unknown>) {
    const next = !p.active;
    try {
      await api.put(`${API_SUPER_ADMIN}/products/${p.id}`, { active: next });
      setProducts((prev) =>
        prev.map((x) => (x.id === p.id ? { ...x, active: next } : x))
      );
    } catch {
      // ignore
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[4] }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: spacing[3] }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: typography.fontDisplay, fontSize: 28 }}>Produits</h1>
          <p style={{ marginTop: spacing[1], marginBottom: 0, color: 'var(--color-muted)', fontSize: 13 }}>
            Catalogue et stocks.
          </p>
        </div>
        <div style={{ display: 'flex', gap: spacing[2] }}>
          <Link href="/dashboard/superadmin/products/import" style={{ textDecoration: 'none' }}>
            <Button variant="secondary">Importer CSV</Button>
          </Link>
          <Button onClick={openCreate}>Ajouter un produit</Button>
        </div>
      </header>

      <section
        style={{
          backgroundColor: 'var(--color-surface2)',
          borderRadius: 16,
          border: '1px solid var(--color-border)',
          padding: spacing[3],
          overflowX: 'auto',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', color: 'var(--color-muted)' }}>
              <th style={{ paddingBottom: spacing[2] }}>Image</th>
              <th style={{ paddingBottom: spacing[2] }}>Nom</th>
              <th style={{ paddingBottom: spacing[2] }}>Catégorie</th>
              <th style={{ paddingBottom: spacing[2] }}>Prix 20ml</th>
              <th style={{ paddingBottom: spacing[2] }}>Prix 50ml</th>
              <th style={{ paddingBottom: spacing[2] }}>Stock 20ml</th>
              <th style={{ paddingBottom: spacing[2] }}>Stock 50ml</th>
              <th style={{ paddingBottom: spacing[2] }}>Actif</th>
              <th style={{ paddingBottom: spacing[2] }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={String(p.id)} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <td style={{ padding: `${spacing[2]}px 0` }}>
                  {p.imageUrl ? (
                    <img
                      src={resolveMediaSrc(String(p.imageUrl))}
                      alt=""
                      style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: 'var(--color-surface)' }} />
                  )}
                </td>
                <td style={{ padding: `${spacing[2]}px 0` }}>{String(p.name ?? '')}</td>
                <td style={{ padding: `${spacing[2]}px 0` }}>{String(p.category ?? '')}</td>
                <td style={{ padding: `${spacing[2]}px 0` }}>{formatMAD(p.price20ml as number)}</td>
                <td style={{ padding: `${spacing[2]}px 0` }}>{formatMAD(p.price50ml as number)}</td>
                <td style={{ padding: `${spacing[2]}px 0` }}>{String(p.stock_20ml ?? p.stock20ml ?? 0)}</td>
                <td style={{ padding: `${spacing[2]}px 0` }}>{String(p.stock_50ml ?? p.stock50ml ?? 0)}</td>
                <td style={{ padding: `${spacing[2]}px 0` }}>
                  <input
                    type="checkbox"
                    checked={!!p.active}
                    onChange={() => toggleActive(p)}
                  />
                </td>
                <td style={{ padding: `${spacing[2]}px 0` }}>
                  <Button size="sm" variant="secondary" onClick={() => openEdit(p)}>Éditer</Button>
                  {' '}
                  <Button size="sm" variant="ghost" onClick={() => deleteProduct(p.id)}>Supprimer</Button>
                </td>
              </tr>
            ))}
            {!loading && products.length === 0 && (
              <tr>
                <td colSpan={9} style={{ paddingTop: spacing[3], color: 'var(--color-muted)' }}>
                  Aucun produit.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <Modal
        isOpen={modalOpen}
        onClose={() => {
          clearImagePreview();
          setModalOpen(false);
        }}
        title={editing ? 'Modifier le produit' : 'Ajouter un produit'}
        size="lg"
      >
        <div
          style={{
            maxHeight: '80vh',
            overflowY: 'auto',
            paddingRight: spacing[2],
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: spacing[4],
              color: 'var(--color-text)',
            }}
          >
            {/* Language tab switcher */}
            <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--color-border)' }}>
              <button
                type="button"
                onClick={() => setModalLangTab('fr')}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderBottom: modalLangTab === 'fr' ? '2px solid var(--color-gold)' : '2px solid transparent',
                  background: 'none',
                  color: modalLangTab === 'fr' ? 'var(--color-gold)' : 'var(--color-muted)',
                  fontFamily: typography.fontBody,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                🇫🇷 Français
              </button>
              <button
                type="button"
                onClick={() => setModalLangTab('ar')}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderBottom: modalLangTab === 'ar' ? '2px solid var(--color-gold)' : '2px solid transparent',
                  background: 'none',
                  color: modalLangTab === 'ar' ? 'var(--color-gold)' : 'var(--color-muted)',
                  fontFamily: typography.fontBody,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                🇲🇦 العربية
              </button>
            </div>

            {modalLangTab === 'fr' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
                <Input
                  label="Nom"
                  value={form.name}
                  onChange={(e) => onNameChange(e.target.value)}
                />
                <label style={{ display: 'flex', flexDirection: 'column', gap: spacing[1], fontFamily: typography.fontBody }}>
                  <span style={{ fontSize: 13, color: 'var(--color-muted)' }}>Description</span>
                  <textarea
                    rows={4}
                    placeholder="Décrivez ce parfum..."
                    value={form.description}
                    onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                    style={{
                      borderRadius: 8,
                      padding: `${spacing[2]}px ${spacing[3]}px`,
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-surface2)',
                      color: 'var(--color-text)',
                      fontFamily: typography.fontBody,
                      fontSize: 14,
                      resize: 'vertical',
                      minHeight: 80,
                    }}
                  />
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing[3] }}>
                  <Input label="Notes de tête" placeholder="Bergamote, Citron..." value={form.notesTop} onChange={(e) => setForm((prev) => ({ ...prev, notesTop: e.target.value }))} />
                  <Input label="Notes de cœur" placeholder="Rose, Jasmin..." value={form.notesHeart} onChange={(e) => setForm((prev) => ({ ...prev, notesHeart: e.target.value }))} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing[3] }}>
                  <Input label="Notes de fond" placeholder="Oud, Musc, Santal..." value={form.notesBase} onChange={(e) => setForm((prev) => ({ ...prev, notesBase: e.target.value }))} />
                  <Input label="Intensité" placeholder="Intense • Épicé" value={form.intensity} onChange={(e) => setForm((prev) => ({ ...prev, intensity: e.target.value }))} />
                </div>
              </div>
            )}

            {modalLangTab === 'ar' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3], direction: 'rtl', textAlign: 'right', fontFamily: "'Noto Sans Arabic', sans-serif" }}>
                <Input
                  label="الاسم"
                  value={form.name_ar}
                  onChange={(e) => setForm((prev) => ({ ...prev, name_ar: e.target.value }))}
                  style={{ direction: 'rtl', textAlign: 'right', fontFamily: "'Noto Sans Arabic', sans-serif" }}
                />
                <label style={{ display: 'flex', flexDirection: 'column', gap: spacing[1], fontFamily: "'Noto Sans Arabic', sans-serif" }}>
                  <span style={{ fontSize: 13, color: 'var(--color-muted)' }}>الوصف</span>
                  <textarea
                    rows={4}
                    placeholder="وصف العطر..."
                    value={form.description_ar}
                    onChange={(e) => setForm((prev) => ({ ...prev, description_ar: e.target.value }))}
                    style={{
                      borderRadius: 8,
                      padding: `${spacing[2]}px ${spacing[3]}px`,
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-surface2)',
                      color: 'var(--color-text)',
                      fontFamily: "'Noto Sans Arabic', sans-serif",
                      fontSize: 14,
                      resize: 'vertical',
                      minHeight: 80,
                      direction: 'rtl',
                      textAlign: 'right',
                    }}
                  />
                </label>
                <Input label="نوتات الرأس" placeholder="عود، مسك..." value={form.notes_top_ar} onChange={(e) => setForm((prev) => ({ ...prev, notes_top_ar: e.target.value }))} style={{ direction: 'rtl', textAlign: 'right', fontFamily: "'Noto Sans Arabic', sans-serif" }} />
                <Input label="نوتات القلب" placeholder="ورد، ياسمين..." value={form.notes_heart_ar} onChange={(e) => setForm((prev) => ({ ...prev, notes_heart_ar: e.target.value }))} style={{ direction: 'rtl', textAlign: 'right', fontFamily: "'Noto Sans Arabic', sans-serif" }} />
                <Input label="نوتات القاعدة" placeholder="صندل، عنبر..." value={form.notes_base_ar} onChange={(e) => setForm((prev) => ({ ...prev, notes_base_ar: e.target.value }))} style={{ direction: 'rtl', textAlign: 'right', fontFamily: "'Noto Sans Arabic', sans-serif" }} />
                <Input label="الشدة" value={form.intensity_ar} onChange={(e) => setForm((prev) => ({ ...prev, intensity_ar: e.target.value }))} style={{ direction: 'rtl', textAlign: 'right', fontFamily: "'Noto Sans Arabic', sans-serif" }} />
              </div>
            )}

            {/* Shared fields */}
            <label style={{ display: 'flex', flexDirection: 'column', gap: spacing[1], fontFamily: typography.fontBody }}>
              <span style={{ fontSize: 13, color: 'var(--color-muted)' }}>Slug (auto depuis le nom FR)</span>
              <input
                type="text"
                readOnly
                value={slug}
                style={{
                  borderRadius: 8,
                  padding: `${spacing[2]}px ${spacing[3]}px`,
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface2)',
                  color: 'var(--color-muted)',
                  fontFamily: typography.fontBody,
                  fontSize: 14,
                  cursor: 'not-allowed',
                }}
              />
            </label>
            <Input
              label="Catégorie"
              value={form.category}
              onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
            />
            {/* Photo du produit */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[1], fontFamily: typography.fontBody }}>
              <span style={{ fontSize: 13, color: 'var(--color-muted)' }}>Photo du produit</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={onImageChange}
                style={{
                  position: 'absolute',
                  width: 1,
                  height: 1,
                  opacity: 0,
                  overflow: 'hidden',
                  clip: 'rect(0,0,0,0)',
                  pointerEvents: 'none',
                }}
                aria-hidden
              />
              {form.imagePreview ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing[3],
                    padding: spacing[3],
                    borderRadius: 12,
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface2)',
                  }}
                >
                  <img
                    src={resolveMediaSrc(form.imagePreview)}
                    alt="Aperçu"
                    style={{
                      width: 80,
                      height: 80,
                      objectFit: 'cover',
                      borderRadius: 8,
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 14,
                        color: 'var(--color-text)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {form.imageFile?.name ?? 'Image sélectionnée'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={clearImagePreview}
                    style={{
                      padding: `${spacing[1]}px ${spacing[2]}px`,
                      borderRadius: 8,
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: 'var(--color-error)',
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: 500,
                    }}
                  >
                    × Supprimer
                  </button>
                </div>
              ) : (
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => fileInputRef.current?.click()}
                  onMouseEnter={() => setZoneHover(true)}
                  onMouseLeave={() => setZoneHover(false)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleImageDrop}
                  style={{
                    padding: 32,
                    borderRadius: 12,
                    border: `2px dashed ${zoneActive ? 'var(--color-gold)' : 'rgba(200, 150, 10, 0.4)'}`,
                    backgroundColor: zoneActive ? 'var(--color-surface)' : 'var(--color-surface2)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: spacing[2],
                    transition: 'border-color 0.2s ease, background-color 0.2s ease',
                  }}
                >
                  <span style={{ fontSize: 32 }}>📷</span>
                  <span style={{ fontSize: 14, color: 'var(--color-muted)' }}>
                    Glisser une photo ici
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--color-muted)', opacity: 0.8 }}>
                    ou cliquer pour sélectionner
                  </span>
                </div>
              )}
            </div>

            {/* 2-col: Prix 20ml | Prix 50ml */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing[3] }}>
              <Input
                label="Prix 20ml (MAD)"
                type="number"
                value={String(form.price20ml ?? '')}
                onChange={(e) => setForm((prev) => ({ ...prev, price20ml: e.target.value === '' ? '' : Number(e.target.value) }))}
              />
              <Input
                label="Prix 50ml (MAD)"
                type="number"
                value={String(form.price50ml ?? '')}
                onChange={(e) => setForm((prev) => ({ ...prev, price50ml: e.target.value === '' ? '' : Number(e.target.value) }))}
              />
            </div>
            {/* 2-col: Stock 20ml | Stock 50ml */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing[3] }}>
              <Input
                label="Stock 20ml"
                type="number"
                value={String(form.stock20ml ?? '')}
                onChange={(e) => setForm((prev) => ({ ...prev, stock20ml: e.target.value === '' ? '' : Number(e.target.value) }))}
              />
              <Input
                label="Stock 50ml"
                type="number"
                value={String(form.stock50ml ?? '')}
                onChange={(e) => setForm((prev) => ({ ...prev, stock50ml: e.target.value === '' ? '' : Number(e.target.value) }))}
              />
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: spacing[2], color: 'var(--color-text)' }}>
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm((prev) => ({ ...prev, active: e.target.checked }))}
              />
              <span style={{ fontSize: 14 }}>Actif</span>
            </label>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: spacing[2], paddingTop: spacing[2] }}>
              <Button variant="ghost" onClick={() => setModalOpen(false)}>Annuler</Button>
              <Button loading={saving} onClick={saveProduct}>Enregistrer</Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
