'use client';

import React, { useEffect, useState, useRef } from 'react';
import api, { API_SUPER_ADMIN } from '@/lib/api';
import { spacing, typography } from '@/lib/design-tokens';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';

interface Slide {
  id: number;
  position: number;
  image_url?: string;
  mobile_image_url?: string;
  title: string;
  title_ar?: string | null;
  subtitle: string;
  subtitle_ar?: string | null;
  badge_text?: string;
  badge_ar?: string | null;
  button1_text: string;
  button1_text_ar?: string | null;
  button1_link: string;
  button2_text: string;
  button2_text_ar?: string | null;
  button2_link: string;
  button1_style?: string;
  is_active: boolean;
  duration_ms?: number;
  text_color?: string;
  overlay_opacity?: number;
  text_position?: string;
  active_from?: string | null;
  active_until?: string | null;
  view_count?: number;
  click_count?: number;
}

function formatCount(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return String(n);
}

const emptySlideForm = {
  title: '',
  title_ar: '',
  subtitle: '',
  subtitle_ar: '',
  badge_text: '',
  badge_ar: '',
  button1_text: '',
  button1_text_ar: '',
  button1_link: '',
  button2_text: '',
  button2_text_ar: '',
  button2_link: '',
  button1_style: 'filled' as 'filled' | 'outline' | 'ghost',
  active: true,
  duration_ms: 5000,
  text_color: '#ffffff',
  overlay_opacity: 40,
  text_position: 'left' as 'left' | 'center' | 'right',
  active_from: '',
  active_until: '',
  imageFile: null as File | null,
  imagePreview: null as string | null,
  mobileImageFile: null as File | null,
  mobileImagePreview: null as string | null,
};

export default function SuperadminSliderPage() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);
  const [form, setForm] = useState(emptySlideForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [zoneHover, setZoneHover] = useState(false);
  const [mobileDragOver, setMobileDragOver] = useState(false);
  const [mobileZoneHover, setMobileZoneHover] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [modalLangTab, setModalLangTab] = useState<'fr' | 'ar'>('fr');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mobileFileInputRef = useRef<HTMLInputElement>(null);

  const zoneActive = dragOver || zoneHover;
  const mobileZoneActive = mobileDragOver || mobileZoneHover;

  useEffect(() => {
    loadSlides();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  function loadSlides() {
    api
      .get<{ slides?: Slide[] }>(`${API_SUPER_ADMIN}/slides`)
      .then((res) => {
        const list = res.data?.slides;
        setSlides(Array.isArray(list) ? list : []);
      })
      .catch(() => setSlides([]))
      .finally(() => setLoading(false));
  }

  function openCreate() {
    setEditingSlide(null);
    setForm({ ...emptySlideForm });
    setSaveError(null);
    setModalLangTab('fr');
    setModalOpen(true);
  }

  function openEdit(slide: Slide) {
    setEditingSlide(slide);
    setSaveError(null);
    setModalLangTab('fr');
    const activeFrom = slide.active_from ? slide.active_from.slice(0, 16) : '';
    const activeUntil = slide.active_until ? slide.active_until.slice(0, 16) : '';
    setForm({
      title: slide.title ?? '',
      title_ar: slide.title_ar ?? '',
      subtitle: slide.subtitle ?? '',
      subtitle_ar: slide.subtitle_ar ?? '',
      badge_text: slide.badge_text ?? '',
      badge_ar: slide.badge_ar ?? '',
      button1_text: slide.button1_text ?? '',
      button1_text_ar: slide.button1_text_ar ?? '',
      button1_link: slide.button1_link ?? '',
      button2_text: slide.button2_text ?? '',
      button2_text_ar: slide.button2_text_ar ?? '',
      button2_link: slide.button2_link ?? '',
      button1_style: (slide.button1_style as 'filled' | 'outline' | 'ghost') || 'filled',
      active: !!slide.is_active,
      duration_ms: slide.duration_ms ?? 5000,
      text_color: slide.text_color ?? '#ffffff',
      overlay_opacity: slide.overlay_opacity ?? 40,
      text_position: (slide.text_position as 'left' | 'center' | 'right') || 'left',
      active_from: activeFrom,
      active_until: activeUntil,
      imageFile: null,
      imagePreview: slide.image_url ? String(slide.image_url) : null,
      mobileImageFile: null,
      mobileImagePreview: slide.mobile_image_url ? String(slide.mobile_image_url) : null,
    });
    setModalOpen(true);
  }

  function setImageFile(file: File | null) {
    if (!file) return;
    setForm((prev) => {
      if (prev.imagePreview && prev.imageFile) URL.revokeObjectURL(prev.imagePreview);
      return {
        ...prev,
        imageFile: file,
        imagePreview: URL.createObjectURL(file),
      };
    });
  }

  function setMobileImageFile(file: File | null) {
    if (!file) return;
    setForm((prev) => {
      if (prev.mobileImagePreview && prev.mobileImageFile) URL.revokeObjectURL(prev.mobileImagePreview);
      return {
        ...prev,
        mobileImageFile: file,
        mobileImagePreview: URL.createObjectURL(file),
      };
    });
  }

  function onImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setImageFile(file);
    e.target.value = '';
  }

  function onMobileImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setMobileImageFile(file);
    e.target.value = '';
  }

  function clearImagePreview() {
    setForm((prev) => {
      if (prev.imageFile && prev.imagePreview) URL.revokeObjectURL(prev.imagePreview);
      return { ...prev, imageFile: null, imagePreview: prev.imageFile ? null : prev.imagePreview };
    });
  }

  function clearMobileImagePreview() {
    setForm((prev) => {
      if (prev.mobileImageFile && prev.mobileImagePreview) URL.revokeObjectURL(prev.mobileImagePreview);
      return { ...prev, mobileImageFile: null, mobileImagePreview: prev.mobileImageFile ? null : prev.mobileImagePreview };
    });
  }

  function handleImageDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file?.type.startsWith('image/')) setImageFile(file);
  }

  function handleMobileImageDrop(e: React.DragEvent) {
    e.preventDefault();
    setMobileDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file?.type.startsWith('image/')) setMobileImageFile(file);
  }

  function appendFormData(fd: FormData) {
    fd.append('title', form.title ?? '');
    fd.append('title_ar', form.title_ar ?? '');
    fd.append('subtitle', form.subtitle ?? '');
    fd.append('subtitle_ar', form.subtitle_ar ?? '');
    fd.append('badge_text', form.badge_text ?? '');
    fd.append('badge_ar', form.badge_ar ?? '');
    fd.append('button1_text', form.button1_text ?? '');
    fd.append('button1_text_ar', form.button1_text_ar ?? '');
    fd.append('button1_link', form.button1_link ?? '');
    fd.append('button2_text', form.button2_text ?? '');
    fd.append('button2_text_ar', form.button2_text_ar ?? '');
    fd.append('button2_link', form.button2_link ?? '');
    fd.append('button1_style', form.button1_style);
    fd.append('is_active', form.active ? '1' : '0');
    fd.append('duration_ms', String(form.duration_ms));
    fd.append('text_color', form.text_color);
    fd.append('overlay_opacity', String(form.overlay_opacity));
    fd.append('text_position', form.text_position);
    if (form.active_from) fd.append('active_from', form.active_from);
    if (form.active_until) fd.append('active_until', form.active_until);
    if (form.imageFile) fd.append('image', form.imageFile);
    if (form.mobileImageFile) fd.append('mobile_image', form.mobileImageFile);
  }

  async function saveSlide() {
    setSaving(true);
    setSaveError(null);
    try {
      const hasFiles = form.imageFile || form.mobileImageFile;
      if (hasFiles) {
        const fd = new FormData();
        appendFormData(fd);
        if (editingSlide?.id) {
          await api.put(`${API_SUPER_ADMIN}/slides/${editingSlide.id}`, fd);
        } else {
          await api.post(`${API_SUPER_ADMIN}/slides`, fd);
        }
      } else {
        const payload = {
          title: form.title ?? '',
          title_ar: form.title_ar ?? '',
          subtitle: form.subtitle ?? '',
          subtitle_ar: form.subtitle_ar ?? '',
          badge_text: form.badge_text ?? '',
          badge_ar: form.badge_ar ?? '',
          button1_text: form.button1_text ?? '',
          button1_text_ar: form.button1_text_ar ?? '',
          button1_link: form.button1_link ?? '',
          button2_text: form.button2_text ?? '',
          button2_text_ar: form.button2_text_ar ?? '',
          button2_link: form.button2_link ?? '',
          button1_style: form.button1_style,
          is_active: form.active,
          duration_ms: form.duration_ms,
          text_color: form.text_color,
          overlay_opacity: form.overlay_opacity,
          text_position: form.text_position,
          active_from: form.active_from || null,
          active_until: form.active_until || null,
        };
        if (editingSlide?.id) {
          await api.put(`${API_SUPER_ADMIN}/slides/${editingSlide.id}`, payload);
        } else {
          await api.post(`${API_SUPER_ADMIN}/slides`, payload);
        }
      }
      loadSlides();
      setModalOpen(false);
      clearImagePreview();
      clearMobileImagePreview();
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
      const data = ax?.response?.data;
      const msg = data?.message || (data?.errors ? Object.values(data.errors).flat().join(' ') : null) || 'Erreur lors de l\'enregistrement';
      setSaveError(msg);
    } finally {
      setSaving(false);
    }
  }

  async function deleteSlide(id: number) {
    try {
      await api.delete(`${API_SUPER_ADMIN}/slides/${id}`);
      setSlides((prev) => prev.filter((s) => s.id !== id));
      setDeleteConfirm(null);
    } catch {
      setDeleteConfirm(null);
    }
  }

  async function toggleActive(slide: Slide) {
    try {
      await api.put(`${API_SUPER_ADMIN}/slides/${slide.id}`, { is_active: !slide.is_active });
      setSlides((prev) =>
        prev.map((s) => (s.id === slide.id ? { ...s, is_active: !s.is_active } : s))
      );
    } catch {
      // ignore
    }
  }

  function handleDragStart(e: React.DragEvent, index: number) {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  async function handleDrop(e: React.DragEvent, dropIndex: number) {
    e.preventDefault();
    const dragIndex = draggedIndex ?? parseInt(e.dataTransfer.getData('text/plain'), 10);
    setDraggedIndex(null);
    if (dragIndex === dropIndex || isNaN(dragIndex)) return;
    const reordered = [...slides];
    const [removed] = reordered.splice(dragIndex, 1);
    reordered.splice(dropIndex, 0, removed);
    setSlides(reordered);
    const slidesPayload = reordered.map((s, i) => ({ id: s.id, position: i }));
    try {
      await api.put(`${API_SUPER_ADMIN}/slides/reorder`, { slides: slidesPayload });
      setToast('Ordre sauvegardé');
    } catch {
      setSlides(slides);
    }
  }

  const textPositionOptions = [
    { value: 'left', label: 'Gauche' },
    { value: 'center', label: 'Centre' },
    { value: 'right', label: 'Droite' },
  ];
  const ctaStyleOptions = [
    { value: 'filled', label: 'Filled' },
    { value: 'outline', label: 'Outline' },
    { value: 'ghost', label: 'Ghost' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[4] }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: spacing[3] }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: typography.fontDisplay, fontSize: 28 }}>Slider Hero</h1>
          <p style={{ marginTop: spacing[1], marginBottom: 0, color: 'var(--color-muted)', fontSize: 13 }}>
            Gérez les slides de la page d&apos;accueil.
          </p>
        </div>
        <Button onClick={openCreate}>Ajouter une slide</Button>
      </header>

      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            padding: `${spacing[2]}px ${spacing[4]}px`,
            borderRadius: 8,
            backgroundColor: 'var(--color-surface2)',
            border: '1px solid var(--color-gold)',
            color: 'var(--color-text)',
            fontSize: 14,
            zIndex: 9999,
            boxShadow: 'var(--shadow-soft)',
          }}
        >
          {toast}
        </div>
      )}

      {loading ? (
        <p style={{ color: 'var(--color-muted)' }}>Chargement…</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e)}
              onDrop={(e) => handleDrop(e, index)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing[3],
                padding: spacing[3],
                borderRadius: 12,
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface2)',
                opacity: draggedIndex === index ? 0.6 : 1,
                cursor: 'grab',
              }}
            >
              <span style={{ color: 'var(--color-muted)', fontSize: 18, cursor: 'grab', userSelect: 'none' }} aria-hidden>≡</span>
              <span style={{ fontSize: 12, color: 'var(--color-muted)', minWidth: 48, flexShrink: 0 }}>#{index + 1}</span>
              <div style={{ width: 64, height: 48, borderRadius: 8, overflow: 'hidden', backgroundColor: 'var(--color-surface)', flexShrink: 0 }}>
                {slide.image_url ? (
                  <img src={String(slide.image_url)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-muted)', fontSize: 12 }}>—</div>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{slide.title || 'Sans titre'}</div>
                {slide.title_ar && (
                  <div style={{ fontSize: 12, color: 'var(--color-muted)', direction: 'rtl', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{slide.title_ar}</div>
                )}
                <div style={{ fontSize: 12, color: 'var(--color-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{slide.subtitle || '—'}</div>
                <div style={{ fontSize: 11, color: 'var(--color-muted)', marginTop: 4 }}>[{slide.button1_text || '—'}] [{slide.button2_text || '—'}]</div>
                <div style={{ fontSize: 11, color: 'var(--color-muted)', marginTop: 4 }}>
                  👁 {formatCount(slide.view_count ?? 0)} vues · 🖱 {formatCount(slide.click_count ?? 0)} clics
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <input type="checkbox" checked={!!slide.is_active} onChange={() => toggleActive(slide)} />
                <span style={{ fontSize: 12 }}>Actif</span>
              </label>
              <Button size="sm" variant="secondary" onClick={() => openEdit(slide)}>Modifier</Button>
              {deleteConfirm === slide.id ? (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 12 }}>Supprimer ?</span>
                  <Button size="sm" variant="ghost" onClick={() => setDeleteConfirm(null)}>Non</Button>
                  <Button size="sm" onClick={() => deleteSlide(slide.id)} style={{ backgroundColor: 'var(--color-error)', borderColor: 'var(--color-error)' }}>Oui</Button>
                </div>
              ) : (
                <Button size="sm" variant="ghost" onClick={() => setDeleteConfirm(slide.id)}>Supprimer</Button>
              )}
            </div>
          ))}
          {slides.length === 0 && (
            <p style={{ color: 'var(--color-muted)', padding: spacing[5], textAlign: 'center' }}>Aucune slide. Cliquez sur « Ajouter une slide ».</p>
          )}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => { clearImagePreview(); clearMobileImagePreview(); setModalOpen(false); }}
        title={editingSlide ? 'Modifier la slide' : 'Ajouter une slide'}
        size="lg"
      >
        <div style={{ maxHeight: '80vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: spacing[4] }}>
          {/* Tabs FR / AR */}
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
              <Input label="Badge (FR)" placeholder="NOUVEAU • EXCLUSIF" value={form.badge_text} onChange={(e) => setForm((p) => ({ ...p, badge_text: e.target.value }))} />
              <Input label="Titre (FR)" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
              <label style={{ display: 'flex', flexDirection: 'column', gap: spacing[1] }}>
                <span style={{ fontSize: 13, color: 'var(--color-muted)' }}>Sous-titre (FR)</span>
                <textarea
                  rows={3}
                  value={form.subtitle}
                  onChange={(e) => setForm((p) => ({ ...p, subtitle: e.target.value }))}
                  style={{ borderRadius: 8, padding: `${spacing[2]}px ${spacing[3]}px`, border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface2)', color: 'var(--color-text)', fontFamily: typography.fontBody, fontSize: 14 }}
                />
              </label>
              <Input label="Bouton 1 texte (FR)" value={form.button1_text} onChange={(e) => setForm((p) => ({ ...p, button1_text: e.target.value }))} />
              <Input label="Bouton 2 texte (FR)" value={form.button2_text} onChange={(e) => setForm((p) => ({ ...p, button2_text: e.target.value }))} />
            </div>
          )}
          {modalLangTab === 'ar' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
              <Input label="البادج (AR)" placeholder="جديد • حصري" value={form.badge_ar} onChange={(e) => setForm((p) => ({ ...p, badge_ar: e.target.value }))} />
              <Input label="العنوان (AR)" placeholder="فن العطر المغربي" value={form.title_ar} onChange={(e) => setForm((p) => ({ ...p, title_ar: e.target.value }))} />
              <label style={{ display: 'flex', flexDirection: 'column', gap: spacing[1] }}>
                <span style={{ fontSize: 13, color: 'var(--color-muted)' }}>الوصف (AR)</span>
                <textarea
                  rows={3}
                  value={form.subtitle_ar}
                  onChange={(e) => setForm((p) => ({ ...p, subtitle_ar: e.target.value }))}
                  placeholder="اكتشف مجموعة من العطور الاستثنائية."
                  style={{ borderRadius: 8, padding: `${spacing[2]}px ${spacing[3]}px`, border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface2)', color: 'var(--color-text)', fontFamily: typography.fontBody, fontSize: 14, direction: 'rtl', textAlign: 'right' }}
                />
              </label>
              <Input label="زر 1 (AR)" placeholder="اكتشف" value={form.button1_text_ar} onChange={(e) => setForm((p) => ({ ...p, button1_text_ar: e.target.value }))} />
              <Input label="زر 2 (AR)" placeholder="اصنع مجموعتي" value={form.button2_text_ar} onChange={(e) => setForm((p) => ({ ...p, button2_text_ar: e.target.value }))} />
            </div>
          )}

          {/* Shared: Image principale */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[1] }}>
            <span style={{ fontSize: 13, color: 'var(--color-muted)' }}>Image</span>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={onImageChange} style={{ position: 'absolute', width: 1, height: 1, opacity: 0, overflow: 'hidden', clip: 'rect(0,0,0,0)', pointerEvents: 'none' }} aria-hidden />
            {form.imagePreview ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3], padding: spacing[2], borderRadius: 12, border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface2)' }}>
                <img src={form.imagePreview} alt="Aperçu" style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 8 }} />
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
                style={{
                  padding: 32, borderRadius: 12, border: `2px dashed ${zoneActive ? 'var(--color-gold)' : 'rgba(200, 150, 10, 0.4)'}`,
                  backgroundColor: zoneActive ? 'var(--color-surface)' : 'var(--color-surface2)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: spacing[2], transition: 'border-color 0.2s ease, background-color 0.2s ease',
                }}
              >
                <span style={{ fontSize: 28 }}>📷</span>
                <span style={{ fontSize: 14, color: 'var(--color-muted)' }}>Glisser une photo ici</span>
                <span style={{ fontSize: 12, color: 'var(--color-muted)', opacity: 0.8 }}>ou cliquer pour sélectionner</span>
              </div>
            )}
          </div>

          {/* Image mobile (optionnel) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[1] }}>
            <span style={{ fontSize: 13, color: 'var(--color-muted)' }}>Image mobile (optionnel)</span>
            <input ref={mobileFileInputRef} type="file" accept="image/*" onChange={onMobileImageChange} style={{ position: 'absolute', width: 1, height: 1, opacity: 0, overflow: 'hidden', clip: 'rect(0,0,0,0)', pointerEvents: 'none' }} aria-hidden />
            {form.mobileImagePreview ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3], padding: spacing[2], borderRadius: 12, border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface2)' }}>
                <img src={form.mobileImagePreview} alt="Aperçu mobile" style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 8 }} />
                <div style={{ flex: 1, fontSize: 13, color: 'var(--color-text)' }}>{form.mobileImageFile?.name ?? 'Image mobile'}</div>
                <button type="button" onClick={clearMobileImagePreview} style={{ padding: '4px 8px', borderRadius: 8, border: 'none', backgroundColor: 'transparent', color: 'var(--color-error)', cursor: 'pointer', fontSize: 13 }}>× Supprimer</button>
              </div>
            ) : (
              <div
                role="button"
                tabIndex={0}
                onClick={() => mobileFileInputRef.current?.click()}
                onMouseEnter={() => setMobileZoneHover(true)}
                onMouseLeave={() => setMobileZoneHover(false)}
                onDragOver={(e) => { e.preventDefault(); setMobileDragOver(true); }}
                onDragLeave={() => setMobileDragOver(false)}
                onDrop={handleMobileImageDrop}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); mobileFileInputRef.current?.click(); } }}
                style={{
                  padding: 24, borderRadius: 12, border: `2px dashed ${mobileZoneActive ? 'var(--color-gold)' : 'rgba(200, 150, 10, 0.4)'}`,
                  backgroundColor: mobileZoneActive ? 'var(--color-surface)' : 'var(--color-surface2)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: spacing[2], transition: 'border-color 0.2s ease, background-color 0.2s ease',
                }}
              >
                <span style={{ fontSize: 24 }}>📱</span>
                <span style={{ fontSize: 13, color: 'var(--color-muted)' }}>Image mobile (si vide, image principale utilisée)</span>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing[3] }}>
            <Input label="Durée d'affichage (ms)" type="number" min={1000} max={60000} step={1000} value={String(form.duration_ms)} onChange={(e) => setForm((p) => ({ ...p, duration_ms: parseInt(e.target.value, 10) || 5000 }))} />
            <label style={{ display: 'flex', flexDirection: 'column', gap: spacing[1] }}>
              <span style={{ fontSize: 13, color: 'var(--color-muted)' }}>Couleur du texte</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="color" value={form.text_color} onChange={(e) => setForm((p) => ({ ...p, text_color: e.target.value }))} style={{ width: 40, height: 36, padding: 0, border: '1px solid var(--color-border)', borderRadius: 8, cursor: 'pointer' }} />
                <span style={{ fontSize: 13, color: 'var(--color-text)' }}>{form.text_color}</span>
              </div>
            </label>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[1] }}>
            <span style={{ fontSize: 13, color: 'var(--color-muted)' }}>Opacité overlay (%)</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <input type="range" min={0} max={100} value={form.overlay_opacity} onChange={(e) => setForm((p) => ({ ...p, overlay_opacity: parseInt(e.target.value, 10) }))} style={{ flex: 1 }} />
              <span style={{ fontSize: 13, color: 'var(--color-text)', minWidth: 32 }}>{form.overlay_opacity}</span>
            </div>
          </div>

          <label style={{ display: 'flex', flexDirection: 'column', gap: spacing[1] }}>
            <span style={{ fontSize: 13, color: 'var(--color-muted)' }}>Position du texte</span>
            <select
              value={form.text_position}
              onChange={(e) => setForm((p) => ({ ...p, text_position: e.target.value as 'left' | 'center' | 'right' }))}
              style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface2)', color: 'var(--color-text)', fontFamily: typography.fontBody, fontSize: 14 }}
            >
              {textPositionOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing[3] }}>
            <Input label="Bouton 1 lien" placeholder="/catalogue" value={form.button1_link} onChange={(e) => setForm((p) => ({ ...p, button1_link: e.target.value }))} />
            <Input label="Bouton 2 lien" placeholder="/pack-builder" value={form.button2_link} onChange={(e) => setForm((p) => ({ ...p, button2_link: e.target.value }))} />
          </div>
          <label style={{ display: 'flex', flexDirection: 'column', gap: spacing[1] }}>
            <span style={{ fontSize: 13, color: 'var(--color-muted)' }}>Style bouton 1</span>
            <select
              value={form.button1_style}
              onChange={(e) => setForm((p) => ({ ...p, button1_style: e.target.value as 'filled' | 'outline' | 'ghost' }))}
              style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface2)', color: 'var(--color-text)', fontFamily: typography.fontBody, fontSize: 14 }}
            >
              {ctaStyleOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing[3] }}>
            <Input label="Afficher à partir du" type="datetime-local" value={form.active_from} onChange={(e) => setForm((p) => ({ ...p, active_from: e.target.value }))} />
            <Input label="Afficher jusqu'au" type="datetime-local" value={form.active_until} onChange={(e) => setForm((p) => ({ ...p, active_until: e.target.value }))} />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
            <input type="checkbox" checked={form.active} onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))} />
            <span>Actif</span>
          </label>

          {saveError && <p style={{ margin: 0, fontSize: 13, color: 'var(--color-error)' }}>{saveError}</p>}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: spacing[2] }}>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Annuler</Button>
            <Button loading={saving} onClick={saveSlide}>Enregistrer</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
