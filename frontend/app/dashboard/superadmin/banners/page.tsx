'use client';

import React, { useEffect, useState, useRef } from 'react';
import api, { API_SUPER_ADMIN } from '@/lib/api';
import { spacing, typography } from '@/lib/design-tokens';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { resolveMediaSrc } from '@/lib/media-url';

interface Banner {
  id: number;
  position: number;
  image_url?: string | null;
  title: string | null;
  title_ar: string | null;
  link: string | null;
  is_active: boolean;
}

const LINK_SUGGESTIONS = [
  '/catalogue',
  '/pack-builder',
  '/catalogue?category=homme',
  '/catalogue?category=femme',
  '/catalogue?category=mixte',
];

const emptyForm = {
  title: '',
  title_ar: '',
  link: '',
  active: true,
  imageFile: null as File | null,
  imagePreview: null as string | null,
};

export default function SuperadminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [zoneHover, setZoneHover] = useState(false);
  const [modalLangTab, setModalLangTab] = useState<'fr' | 'ar'>('fr');
  const [linkDropdownOpen, setLinkDropdownOpen] = useState(false);
  const draggedIndex = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const zoneActive = dragOver || zoneHover;

  useEffect(() => {
    loadBanners();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  function loadBanners() {
    api
      .get(`${API_SUPER_ADMIN}/banners`)
      .then((res) => {
        console.log('dashboard banners response', res.data);
        const list = res.data?.data ?? res.data?.banners ?? res.data ?? [];
        setBanners(Array.isArray(list) ? list : []);
      })
      .catch(() => setBanners([]))
      .finally(() => setLoading(false));
  }

  function openCreate() {
    setEditing(null);
    setForm({ ...emptyForm });
    setSaveError(null);
    setModalLangTab('fr');
    setModalOpen(true);
  }

  function openEdit(banner: Banner) {
    setEditing(banner);
    setSaveError(null);
    setModalLangTab('fr');
    setForm({
      title: banner.title ?? '',
      title_ar: banner.title_ar ?? '',
      link: banner.link ?? '',
      active: !!banner.is_active,
      imageFile: null,
      imagePreview: banner.image_url ? String(banner.image_url) : null,
    });
    setModalOpen(true);
  }

  function setImageFile(file: File | null) {
    if (!file) return;
    setForm((prev) => {
      if (prev.imagePreview && prev.imageFile) URL.revokeObjectURL(prev.imagePreview);
      return { ...prev, imageFile: file, imagePreview: URL.createObjectURL(file) };
    });
  }

  function clearImagePreview() {
    setForm((prev) => {
      if (prev.imageFile && prev.imagePreview) URL.revokeObjectURL(prev.imagePreview);
      return { ...prev, imageFile: null, imagePreview: prev.imageFile ? null : prev.imagePreview };
    });
  }

  function handleImageDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file?.type.startsWith('image/')) setImageFile(file);
  }

  async function saveBanner() {
    setSaving(true);
    setSaveError(null);
    try {
      if (form.imageFile) {
        const fd = new FormData();
        fd.append('title', form.title);
        fd.append('title_ar', form.title_ar);
        fd.append('link', form.link);
        fd.append('is_active', form.active ? '1' : '0');
        fd.append('image', form.imageFile);
        if (editing) {
          await api.put(`${API_SUPER_ADMIN}/banners/${editing.id}`, fd);
        } else {
          await api.post(`${API_SUPER_ADMIN}/banners`, fd);
        }
      } else {
        const payload = { title: form.title, title_ar: form.title_ar, link: form.link, is_active: form.active };
        if (editing) {
          await api.put(`${API_SUPER_ADMIN}/banners/${editing.id}`, payload);
        } else {
          await api.post(`${API_SUPER_ADMIN}/banners`, payload);
        }
      }
      loadBanners();
      setModalOpen(false);
      clearImagePreview();
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
      const msg = ax?.response?.data?.message || (ax?.response?.data?.errors ? Object.values(ax.response.data.errors).flat().join(' ') : null) || 'Erreur';
      setSaveError(msg);
    } finally {
      setSaving(false);
    }
  }

  async function deleteBanner(id: number) {
    try {
      await api.delete(`${API_SUPER_ADMIN}/banners/${id}`);
      setBanners((p) => p.filter((b) => b.id !== id));
      setDeleteConfirm(null);
    } catch {
      setDeleteConfirm(null);
    }
  }

  async function toggleActive(banner: Banner) {
    try {
      await api.put(`${API_SUPER_ADMIN}/banners/${banner.id}`, { is_active: !banner.is_active });
      setBanners((p) => p.map((b) => (b.id === banner.id ? { ...b, is_active: !b.is_active } : b)));
    } catch {}
  }

  function handleDragStart(_e: React.DragEvent, index: number) {
    draggedIndex.current = index;
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  async function handleDrop(e: React.DragEvent, dropIndex: number) {
    e.preventDefault();
    const dragIndex = draggedIndex.current;
    if (dragIndex == null || dragIndex === dropIndex) return;
    const reordered = [...banners];
    const [removed] = reordered.splice(dragIndex, 1);
    reordered.splice(dropIndex, 0, removed);
    setBanners(reordered);
    draggedIndex.current = null;
    try {
      await api.put(`${API_SUPER_ADMIN}/banners/reorder`, {
        banners: reordered.map((b, i) => ({ id: b.id, position: i })),
      });
      setToast('Ordre sauvegardé');
    } catch {
      setBanners(banners);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[4] }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: spacing[3] }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: typography.fontDisplay, fontSize: 28 }}>Bannières</h1>
          <p style={{ marginTop: spacing[1], marginBottom: 0, color: 'var(--color-muted)', fontSize: 13 }}>
            Bannières de la page d&apos;accueil (grille sous le hero).
          </p>
        </div>
        <Button onClick={openCreate}>Ajouter une bannière</Button>
      </header>

      {toast && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', padding: `${spacing[2]}px ${spacing[4]}px`, borderRadius: 8, backgroundColor: 'var(--color-surface2)', border: '1px solid var(--color-gold)', color: 'var(--color-text)', fontSize: 14, zIndex: 9999, boxShadow: 'var(--shadow-soft)' }}>
          {toast}
        </div>
      )}

      {loading ? (
        <p style={{ color: 'var(--color-muted)' }}>Chargement…</p>
      ) : banners.length === 0 ? (
        <p style={{ color: 'var(--color-muted)', padding: spacing[5], textAlign: 'center' }}>Aucune bannière. Cliquez sur « Ajouter une bannière ».</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing[3],
                padding: spacing[3],
                borderRadius: 12,
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface2)',
                cursor: 'grab',
              }}
            >
              <span style={{ color: 'var(--color-muted)', fontSize: 18, cursor: 'grab', userSelect: 'none' }} aria-hidden>≡</span>
              <div style={{ width: 120, height: 60, borderRadius: 6, overflow: 'hidden', backgroundColor: 'var(--color-surface)', flexShrink: 0 }}>
                {banner.image_url ? (
                  <img src={resolveMediaSrc(String(banner.image_url))} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-muted)', fontSize: 12 }}>—</div>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{banner.title || 'Sans titre'}</div>
                {banner.title_ar && (
                  <div style={{ fontSize: 12, color: 'var(--color-muted)', direction: 'rtl', textAlign: 'right' }}>{banner.title_ar}</div>
                )}
                <div style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 4 }}>{banner.link || '—'}</div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <input type="checkbox" checked={!!banner.is_active} onChange={() => toggleActive(banner)} />
                <span style={{ fontSize: 12 }}>Actif</span>
              </label>
              <Button size="sm" variant="secondary" onClick={() => openEdit(banner)}>Modifier</Button>
              {deleteConfirm === banner.id ? (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 12 }}>Supprimer ?</span>
                  <Button size="sm" variant="ghost" onClick={() => setDeleteConfirm(null)}>Non</Button>
                  <Button size="sm" onClick={() => deleteBanner(banner.id)} style={{ backgroundColor: 'var(--color-error)', borderColor: 'var(--color-error)' }}>Oui</Button>
                </div>
              ) : (
                <Button size="sm" variant="ghost" onClick={() => setDeleteConfirm(banner.id)}>Supprimer</Button>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => { clearImagePreview(); setModalOpen(false); }} title={editing ? 'Modifier la bannière' : 'Ajouter une bannière'} size="lg">
        <div style={{ maxHeight: '80vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: spacing[4] }}>
          <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--color-border)' }}>
            <button type="button" onClick={() => setModalLangTab('fr')} style={{ padding: '10px 20px', border: 'none', borderBottom: modalLangTab === 'fr' ? '2px solid var(--color-gold)' : '2px solid transparent', background: 'none', color: modalLangTab === 'fr' ? 'var(--color-gold)' : 'var(--color-muted)', fontFamily: typography.fontBody, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              🇫🇷 Français
            </button>
            <button type="button" onClick={() => setModalLangTab('ar')} style={{ padding: '10px 20px', border: 'none', borderBottom: modalLangTab === 'ar' ? '2px solid var(--color-gold)' : '2px solid transparent', background: 'none', color: modalLangTab === 'ar' ? 'var(--color-gold)' : 'var(--color-muted)', fontFamily: typography.fontBody, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              🇲🇦 العربية
            </button>
          </div>

          {modalLangTab === 'fr' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
              <Input label="Titre FR" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
              <div style={{ position: 'relative' }}>
                <Input label="Lien" value={form.link} onChange={(e) => setForm((p) => ({ ...p, link: e.target.value }))} onFocus={() => setLinkDropdownOpen(true)} onBlur={() => setTimeout(() => setLinkDropdownOpen(false), 150)} placeholder="/catalogue ou lien personnalisé" />
                {linkDropdownOpen && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, padding: 8, borderRadius: 8, border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface2)', zIndex: 10, maxHeight: 200, overflowY: 'auto' }}>
                    {LINK_SUGGESTIONS.map((s) => (
                      <button key={s} type="button" onMouseDown={(e) => { e.preventDefault(); setForm((p) => ({ ...p, link: s })); setLinkDropdownOpen(false); }} style={{ display: 'block', width: '100%', padding: '8px 12px', textAlign: 'left', border: 'none', background: 'none', color: 'var(--color-text)', fontFamily: typography.fontBody, fontSize: 13, cursor: 'pointer' }}>
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          {modalLangTab === 'ar' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
              <Input label="Titre AR" value={form.title_ar} onChange={(e) => setForm((p) => ({ ...p, title_ar: e.target.value }))} style={{ direction: 'rtl' }} />
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[1] }}>
            <span style={{ fontSize: 13, color: 'var(--color-muted)' }}>Image (format large 16:5)</span>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) setImageFile(f); e.target.value = ''; }} style={{ position: 'absolute', width: 1, height: 1, opacity: 0, overflow: 'hidden', pointerEvents: 'none' }} aria-hidden />
            {form.imagePreview ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3], padding: spacing[2], borderRadius: 12, border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface2)' }}>
                <div style={{ width: 160, height: 50, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
                  <img src={resolveMediaSrc(form.imagePreview)} alt="Aperçu" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ flex: 1, fontSize: 13, color: 'var(--color-text)' }}>{form.imageFile?.name ?? 'Image'}</div>
                <button type="button" onClick={clearImagePreview} style={{ padding: '4px 8px', borderRadius: 8, border: 'none', backgroundColor: 'transparent', color: 'var(--color-error)', cursor: 'pointer', fontSize: 13 }}>× Supprimer</button>
              </div>
            ) : (
              <div
                role="button"
                tabIndex={0}
                onClick={() => fileInputRef.current?.click()}
                onMouseEnter={() => setZoneHover(true)}
                onMouseLeave={() => setZoneHover(false)}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleImageDrop}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click(); } }}
                style={{ padding: 32, borderRadius: 12, border: `2px dashed ${zoneActive ? 'var(--color-gold)' : 'rgba(200, 150, 10, 0.4)'}`, backgroundColor: zoneActive ? 'var(--color-surface)' : 'var(--color-surface2)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: spacing[2], transition: 'border-color 0.2s, background-color 0.2s' }}
              >
                <span style={{ fontSize: 28 }}>📷</span>
                <span style={{ fontSize: 14, color: 'var(--color-muted)' }}>Glisser une image ici (16:5)</span>
                <span style={{ fontSize: 12, color: 'var(--color-muted)', opacity: 0.8 }}>ou cliquer pour sélectionner</span>
              </div>
            )}
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
            <input type="checkbox" checked={form.active} onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))} />
            <span>Actif</span>
          </label>

          {saveError && <p style={{ margin: 0, fontSize: 13, color: 'var(--color-error)' }}>{saveError}</p>}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: spacing[2] }}>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Annuler</Button>
            <Button loading={saving} onClick={saveBanner}>Enregistrer</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
