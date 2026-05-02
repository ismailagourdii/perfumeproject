'use client';

import React, { useEffect, useMemo, useState } from 'react';
import api, { API_SUPER_ADMIN } from '@/lib/api';
import { spacing, typography } from '@/lib/design-tokens';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';

type CollectionKey = 'homme' | 'femme' | 'mixte';

interface CollectionItem {
  id: number;
  key: CollectionKey;
  title_fr: string | null;
  title_ar: string | null;
  subtitle_fr: string | null;
  subtitle_ar: string | null;
  link: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
}

interface MediaFile {
  filename: string;
  url: string;
  size: number;
}

const emptyForm = {
  key: 'homme' as CollectionKey,
  title_fr: '',
  title_ar: '',
  subtitle_fr: '',
  subtitle_ar: '',
  link: '/catalogue',
  image_url: '',
  is_active: true,
  sort_order: 0,
};

export default function SuperadminCollectionsPage() {
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CollectionItem | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaSearch, setMediaSearch] = useState('');

  const filteredMedia = useMemo(() => {
    const q = mediaSearch.trim().toLowerCase();
    if (!q) return mediaFiles;
    return mediaFiles.filter((f) => f.filename.toLowerCase().includes(q) || f.url.toLowerCase().includes(q));
  }, [mediaFiles, mediaSearch]);

  useEffect(() => {
    loadCollections();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  function normalizeCollection(raw: Record<string, unknown>): CollectionItem {
    return {
      id: Number(raw.id ?? 0),
      key: (String(raw.key ?? 'homme') as CollectionKey),
      title_fr: String(raw.title_fr ?? raw.title ?? '') || null,
      title_ar: String(raw.title_ar ?? '') || null,
      subtitle_fr: String(raw.subtitle_fr ?? raw.subtitle ?? '') || null,
      subtitle_ar: String(raw.subtitle_ar ?? '') || null,
      link: String(raw.link ?? '/catalogue') || null,
      image_url: String(raw.image_url ?? '') || null,
      sort_order: Number(raw.sort_order ?? raw.position ?? 0),
      is_active: !!raw.is_active,
    };
  }

  function loadCollections() {
    api
      .get<{ data?: Array<Record<string, unknown>>; collections?: Array<Record<string, unknown>> }>(`${API_SUPER_ADMIN}/collections`)
      .then((res) => {
        const list = res.data?.data ?? res.data?.collections ?? [];
        setCollections(Array.isArray(list) ? list.map(normalizeCollection) : []);
      })
      .catch(() => setCollections([]))
      .finally(() => setLoading(false));
  }

  function openCreate() {
    setEditing(null);
    setForm({ ...emptyForm, sort_order: collections.length });
    setSaveError(null);
    setModalOpen(true);
  }

  function openEdit(item: CollectionItem) {
    setEditing(item);
    setSaveError(null);
    setForm({
      key: item.key,
      title_fr: item.title_fr ?? '',
      title_ar: item.title_ar ?? '',
      subtitle_fr: item.subtitle_fr ?? '',
      subtitle_ar: item.subtitle_ar ?? '',
      link: item.link ?? '/catalogue',
      image_url: item.image_url ?? '',
      is_active: !!item.is_active,
      sort_order: item.sort_order ?? 0,
    });
    setModalOpen(true);
  }

  async function loadMediaFiles() {
    setMediaLoading(true);
    try {
      const res = await api.get<{ files: MediaFile[] }>(`${API_SUPER_ADMIN}/media`);
      setMediaFiles(res.data?.files ?? []);
    } catch {
      setMediaFiles([]);
    } finally {
      setMediaLoading(false);
    }
  }

  async function saveCollection() {
    setSaving(true);
    setSaveError(null);
    const payload = {
      key: form.key,
      title_fr: form.title_fr,
      title_ar: form.title_ar || null,
      subtitle_fr: form.subtitle_fr || null,
      subtitle_ar: form.subtitle_ar || null,
      link: form.link || '/catalogue',
      image_url: form.image_url || null,
      is_active: form.is_active,
      sort_order: Number(form.sort_order || 0),
    };
    try {
      if (editing) {
        await api.put(`${API_SUPER_ADMIN}/collections/${editing.id}`, payload);
        setToast('Collection mise à jour.');
      } else {
        await api.post(`${API_SUPER_ADMIN}/collections`, payload);
        setToast('Collection créée.');
      }
      setModalOpen(false);
      loadCollections();
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
      const msg = ax?.response?.data?.message || (ax?.response?.data?.errors ? Object.values(ax.response.data.errors).flat().join(' ') : null) || 'Erreur';
      setSaveError(msg);
    } finally {
      setSaving(false);
    }
  }

  async function deleteCollection(id: number) {
    try {
      await api.delete(`${API_SUPER_ADMIN}/collections/${id}`);
      setCollections((prev) => prev.filter((x) => x.id !== id));
      setDeleteConfirm(null);
      setToast('Collection supprimée.');
    } catch {
      setDeleteConfirm(null);
      setToast('Suppression impossible.');
    }
  }

  async function toggleActive(item: CollectionItem) {
    try {
      await api.put(`${API_SUPER_ADMIN}/collections/${item.id}`, { is_active: !item.is_active });
      setCollections((prev) => prev.map((x) => (x.id === item.id ? { ...x, is_active: !x.is_active } : x)));
    } catch {}
  }

  async function reorderTo(next: CollectionItem[]) {
    setCollections(next);
    try {
      await api.post(`${API_SUPER_ADMIN}/collections/reorder`, {
        collections: next.map((x, index) => ({ id: x.id, sort_order: index })),
      });
      setToast('Ordre sauvegardé.');
    } catch {
      loadCollections();
    }
  }

  async function moveUp(index: number) {
    if (index <= 0) return;
    const next = [...collections];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    await reorderTo(next);
  }

  async function moveDown(index: number) {
    if (index >= collections.length - 1) return;
    const next = [...collections];
    [next[index + 1], next[index]] = [next[index], next[index + 1]];
    await reorderTo(next);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[4] }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: spacing[2] }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: typography.fontDisplay, fontSize: 28 }}>Collections</h1>
          <p style={{ marginTop: spacing[1], marginBottom: 0, color: 'var(--color-muted)', fontSize: 13 }}>
            Gérer les univers homme/femme/mixte affichés sur l&apos;accueil.
          </p>
        </div>
        <Button onClick={openCreate}>Ajouter une collection</Button>
      </header>

      {toast && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', padding: `${spacing[2]}px ${spacing[4]}px`, borderRadius: 8, backgroundColor: 'var(--color-surface2)', border: '1px solid var(--color-gold)', color: 'var(--color-text)', fontSize: 14, zIndex: 9999, boxShadow: 'var(--shadow-soft)' }}>
          {toast}
        </div>
      )}

      {loading ? (
        <p style={{ color: 'var(--color-muted)' }}>Chargement…</p>
      ) : collections.length === 0 ? (
        <p style={{ color: 'var(--color-muted)', padding: spacing[5], textAlign: 'center' }}>Aucune collection. Cliquez sur « Ajouter une collection ».</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
          {collections.map((item, index) => (
            <div
              key={item.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '140px 110px minmax(200px, 1fr) 90px 90px auto',
                alignItems: 'center',
                gap: spacing[3],
                padding: spacing[3],
                borderRadius: 12,
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface2)',
              }}
            >
              <div style={{ width: 120, height: 70, borderRadius: 8, overflow: 'hidden', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                {item.image_url ? (
                  <img src={item.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-muted)', fontSize: 12 }}>—</div>
                )}
              </div>

              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 999, border: '1px solid var(--color-gold)', color: 'var(--color-gold)', fontSize: 12, fontWeight: 600, padding: '4px 10px', textTransform: 'uppercase', width: 'fit-content' }}>
                {item.key}
              </div>

              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{item.title_fr || 'Sans titre'}</div>
                {item.title_ar && (
                  <div style={{ fontSize: 12, color: 'var(--color-muted)', direction: 'rtl', textAlign: 'right' }}>{item.title_ar}</div>
                )}
                <div style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 4 }}>ordre: {item.sort_order}</div>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <input type="checkbox" checked={!!item.is_active} onChange={() => toggleActive(item)} />
                <span style={{ fontSize: 12 }}>Actif</span>
              </label>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Button size="sm" variant="ghost" onClick={() => moveUp(index)} disabled={index === 0}>↑</Button>
                <Button size="sm" variant="ghost" onClick={() => moveDown(index)} disabled={index === collections.length - 1}>↓</Button>
              </div>

              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <Button size="sm" variant="secondary" onClick={() => openEdit(item)}>Éditer</Button>
                {deleteConfirm === item.id ? (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <Button size="sm" variant="ghost" onClick={() => setDeleteConfirm(null)}>Non</Button>
                    <Button size="sm" onClick={() => deleteCollection(item.id)} style={{ backgroundColor: 'var(--color-error)', borderColor: 'var(--color-error)' }}>Oui</Button>
                  </div>
                ) : (
                  <Button size="sm" variant="ghost" onClick={() => setDeleteConfirm(item.id)}>Supprimer</Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Modifier la collection' : 'Ajouter une collection'} size="lg">
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3], maxHeight: '80vh', overflowY: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: spacing[3] }}>
            <div>
              <label style={{ display: 'block', marginBottom: spacing[1], fontSize: 13, color: 'var(--color-muted)' }}>Clé</label>
              <select
                value={form.key}
                onChange={(e) => setForm((p) => ({ ...p, key: e.target.value as CollectionKey }))}
                style={{
                  width: '100%',
                  padding: `${spacing[2]}px ${spacing[3]}px`,
                  borderRadius: 10,
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface2)',
                  color: 'var(--color-text)',
                  fontFamily: typography.fontBody,
                }}
              >
                <option value="homme">homme</option>
                <option value="femme">femme</option>
                <option value="mixte">mixte</option>
              </select>
            </div>
            <Input
              label="Lien"
              value={form.link}
              onChange={(e) => setForm((p) => ({ ...p, link: e.target.value }))}
              placeholder="/catalogue"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: spacing[3] }}>
            <Input
              label="Titre FR"
              value={form.title_fr}
              onChange={(e) => setForm((p) => ({ ...p, title_fr: e.target.value }))}
            />
            <Input
              label="Titre AR"
              value={form.title_ar}
              onChange={(e) => setForm((p) => ({ ...p, title_ar: e.target.value }))}
              style={{ direction: 'rtl' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: spacing[3] }}>
            <Input
              label="Sous-titre FR"
              value={form.subtitle_fr}
              onChange={(e) => setForm((p) => ({ ...p, subtitle_fr: e.target.value }))}
            />
            <Input
              label="Sous-titre AR"
              value={form.subtitle_ar}
              onChange={(e) => setForm((p) => ({ ...p, subtitle_ar: e.target.value }))}
              style={{ direction: 'rtl' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
            <span style={{ fontSize: 13, color: 'var(--color-muted)' }}>Image</span>
            {form.image_url ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3], padding: spacing[2], borderRadius: 12, border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface2)' }}>
                <div style={{ width: 130, height: 76, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
                  <img src={form.image_url} alt="Aperçu" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0, fontSize: 12, color: 'var(--color-muted)', wordBreak: 'break-all' }}>{form.image_url}</div>
                <Button size="sm" variant="ghost" onClick={() => setForm((p) => ({ ...p, image_url: '' }))}>Supprimer</Button>
              </div>
            ) : (
              <div style={{ padding: spacing[4], borderRadius: 12, border: '1px dashed var(--color-border)', color: 'var(--color-muted)', textAlign: 'center' }}>
                Aucune image sélectionnée
              </div>
            )}
            <Button
              variant="secondary"
              onClick={() => {
                setMediaPickerOpen(true);
                loadMediaFiles();
              }}
            >
              Choisir depuis médiathèque
            </Button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: spacing[3], alignItems: 'end' }}>
            <Input
              label="Sort order"
              type="number"
              value={String(form.sort_order)}
              onChange={(e) => setForm((p) => ({ ...p, sort_order: Number(e.target.value || 0) }))}
            />
            <label style={{ display: 'flex', alignItems: 'center', gap: spacing[2], height: 42 }}>
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))} />
              <span>Actif</span>
            </label>
          </div>

          {saveError && <p style={{ margin: 0, fontSize: 13, color: 'var(--color-error)' }}>{saveError}</p>}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: spacing[2] }}>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Annuler</Button>
            <Button loading={saving} onClick={saveCollection}>Enregistrer</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={mediaPickerOpen} onClose={() => setMediaPickerOpen(false)} title="Médiathèque" size="lg">
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3], maxHeight: '70vh', overflowY: 'auto' }}>
          <Input
            label="Rechercher"
            value={mediaSearch}
            onChange={(e) => setMediaSearch(e.target.value)}
            placeholder="Nom du fichier..."
          />
          {mediaLoading ? (
            <p style={{ color: 'var(--color-muted)', margin: 0 }}>Chargement…</p>
          ) : filteredMedia.length === 0 ? (
            <p style={{ color: 'var(--color-muted)', margin: 0 }}>Aucun média trouvé.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: spacing[3] }}>
              {filteredMedia.map((file) => (
                <button
                  key={file.filename}
                  type="button"
                  onClick={() => {
                    setForm((p) => ({ ...p, image_url: file.url }));
                    setMediaPickerOpen(false);
                  }}
                  style={{
                    border: '1px solid var(--color-border)',
                    borderRadius: 10,
                    backgroundColor: 'var(--color-surface2)',
                    padding: 8,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ width: '100%', aspectRatio: '16/10', borderRadius: 8, overflow: 'hidden', backgroundColor: 'var(--color-surface)' }}>
                    <img src={file.url} alt={file.filename} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--color-muted)', marginTop: 6, wordBreak: 'break-word' }}>{file.filename}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
