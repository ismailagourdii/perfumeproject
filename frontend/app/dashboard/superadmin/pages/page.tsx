'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import api, { API_SUPER_ADMIN } from '@/lib/api';
import type { PageFull } from '@/lib/api';
import { spacing, typography } from '@/lib/design-tokens';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';

type PageRow = PageFull;

const emptyForm = {
  title: '',
  title_ar: '',
  slug: '',
  slugLocked: true,
  content: '',
  content_ar: '',
  meta_title: '',
  meta_description: '',
  status: 'draft' as 'draft' | 'published',
  show_in_footer: false,
  show_in_navbar: false,
  position: 0,
};

function slugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\u0600-\u06FF-]/g, '');
}

export default function SuperadminPagesPage() {
  const [pages, setPages] = useState<PageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PageRow | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [modalTab, setModalTab] = useState<'fr' | 'ar'>('fr');
  const [contentPreview, setContentPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const contentFrRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    loadPages();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  function loadPages() {
    api
      .get<{ data: PageRow[] }>(`${API_SUPER_ADMIN}/pages`)
      .then((res) => {
        const list = res.data?.data ?? [];
        setPages(Array.isArray(list) ? list : []);
      })
      .catch(() => setPages([]))
      .finally(() => setLoading(false));
  }

  function openCreate() {
    setEditing(null);
    setForm({ ...emptyForm, position: pages.length });
    setModalTab('fr');
    setContentPreview(false);
    setSaveError(null);
    setModalOpen(true);
  }

  function openEdit(page: PageRow) {
    setEditing(page);
    setForm({
      title: page.title ?? '',
      title_ar: page.title_ar ?? '',
      slug: page.slug ?? '',
      slugLocked: false,
      content: page.content ?? '',
      content_ar: page.content_ar ?? '',
      meta_title: page.meta_title ?? '',
      meta_description: page.meta_description ?? '',
      status: page.status ?? 'draft',
      show_in_footer: !!page.show_in_footer,
      show_in_navbar: !!page.show_in_navbar,
      position: page.position ?? 0,
    });
    setModalTab('fr');
    setContentPreview(false);
    setSaveError(null);
    setModalOpen(true);
  }

  const insertAtCursor = useCallback((before: string, after: string = '') => {
    const ta = contentFrRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const text = ta.value;
    const selected = text.slice(start, end);
    const newText = text.slice(0, start) + before + selected + after + text.slice(end);
    setForm((prev) => ({ ...prev, content: newText }));
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 0);
  }, []);

  function wrapTag(tag: string) {
    insertAtCursor(`<${tag}>`, `</${tag}>`);
  }

  function insertLink() {
    const url = window.prompt('URL du lien :');
    if (url == null) return;
    const text = window.prompt('Texte du lien :', 'Lien');
    insertAtCursor(`<a href="${url.replace(/"/g, '&quot;')}">${(text ?? 'Lien').replace(/</g, '&lt;')}</a>`);
  }

  function insertImage() {
    const url = window.prompt('URL de l\'image :');
    if (url == null) return;
    insertAtCursor(`<img src="${url.replace(/"/g, '&quot;')}" alt="" />`);
  }

  function handleTitleChange(title: string) {
    setForm((prev) => {
      const next = { ...prev, title };
      if (prev.slugLocked) next.slug = slugFromTitle(title);
      return next;
    });
  }

  async function save(asDraft: boolean) {
    setSaving(true);
    setSaveError(null);
    const payload = {
      title: form.title,
      title_ar: form.title_ar || null,
      slug: form.slug || undefined,
      content: form.content || null,
      content_ar: form.content_ar || null,
      meta_title: form.meta_title || null,
      meta_description: form.meta_description || null,
      status: asDraft ? 'draft' : 'published',
      show_in_footer: form.show_in_footer,
      show_in_navbar: form.show_in_navbar,
      position: form.position,
    };
    try {
      if (editing) {
        await api.put(`${API_SUPER_ADMIN}/pages/${editing.id}`, payload);
        setToast('Page mise à jour.');
      } else {
        await api.post(`${API_SUPER_ADMIN}/pages`, payload);
        setToast('Page créée.');
      }
      setModalOpen(false);
      loadPages();
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } }).response?.data
        : null;
      const message = msg?.message ?? (msg?.errors ? Object.values(msg.errors).flat().join(' ') : 'Erreur lors de l\'enregistrement.');
      setSaveError(message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: number) {
    try {
      await api.delete(`${API_SUPER_ADMIN}/pages/${id}`);
      setToast('Page supprimée.');
      setDeleteConfirm(null);
      loadPages();
    } catch {
      setToast('Erreur lors de la suppression.');
    }
  }

  if (loading) {
    return <div style={{ color: 'var(--color-muted)' }}>Chargement…</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[4] }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: spacing[2] }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: typography.fontDisplay, fontSize: 28 }}>Pages</h1>
          <p style={{ marginTop: spacing[1], marginBottom: 0, color: 'var(--color-muted)', fontSize: 13 }}>
            Gérer les pages du site (type WordPress).
          </p>
        </div>
        <Button onClick={openCreate}>Nouvelle page</Button>
      </header>

      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            padding: `${spacing[2]}px ${spacing[4]}px`,
            borderRadius: 8,
            backgroundColor: 'var(--color-surface2)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-soft)',
            zIndex: 9999,
            fontSize: 14,
          }}
        >
          {toast}
        </div>
      )}

      <div
        style={{
          overflowX: 'auto',
          borderRadius: 12,
          border: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-surface2)',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
              <th style={{ textAlign: 'left', padding: spacing[2], fontSize: 12, fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase' }}>Titre (FR)</th>
              <th style={{ textAlign: 'left', padding: spacing[2], fontSize: 12, fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase' }}>Slug</th>
              <th style={{ textAlign: 'left', padding: spacing[2], fontSize: 12, fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase' }}>Statut</th>
              <th style={{ textAlign: 'center', padding: spacing[2], fontSize: 12, fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase' }}>Footer</th>
              <th style={{ textAlign: 'center', padding: spacing[2], fontSize: 12, fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase' }}>Navbar</th>
              <th style={{ textAlign: 'right', padding: spacing[2], fontSize: 12, fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((p) => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: spacing[2] }}>
                  <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>{p.title || '—'}</div>
                  {p.title_ar && (
                    <div style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 2, direction: 'rtl' }}>{p.title_ar}</div>
                  )}
                </td>
                <td style={{ padding: spacing[2] }}>
                  <code style={{ color: 'var(--color-gold)', fontFamily: 'monospace', fontSize: 13 }}>/ {p.slug}</code>
                </td>
                <td style={{ padding: spacing[2] }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 500,
                      backgroundColor: p.status === 'published' ? 'rgba(74,140,92,0.2)' : 'var(--color-surface2)',
                      color: p.status === 'published' ? 'var(--color-success)' : 'var(--color-muted)',
                      border: `1px solid ${p.status === 'published' ? 'var(--color-success)' : 'var(--color-border)'}`,
                    }}
                  >
                    {p.status === 'published' ? 'Publié' : 'Brouillon'}
                  </span>
                </td>
                <td style={{ padding: spacing[2], textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={!!p.show_in_footer}
                    onChange={async () => {
                      try {
                        await api.put(`${API_SUPER_ADMIN}/pages/${p.id}`, { show_in_footer: !p.show_in_footer });
                        loadPages();
                      } catch {
                        setToast('Erreur');
                      }
                    }}
                    style={{ cursor: 'pointer' }}
                  />
                </td>
                <td style={{ padding: spacing[2], textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={!!p.show_in_navbar}
                    onChange={async () => {
                      try {
                        await api.put(`${API_SUPER_ADMIN}/pages/${p.id}`, { show_in_navbar: !p.show_in_navbar });
                        loadPages();
                      } catch {
                        setToast('Erreur');
                      }
                    }}
                    style={{ cursor: 'pointer' }}
                  />
                </td>
                <td style={{ padding: spacing[2], textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: spacing[2], justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  <a
                    href={`/pages/${p.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--color-gold)', textDecoration: 'none', fontSize: 18 }}
                    title="Aperçu"
                  >
                    🔗
                  </a>
                  <Button size="sm" variant="secondary" onClick={() => openEdit(p)}>Éditer</Button>
                  {deleteConfirm === p.id ? (
                    <Button size="sm" variant="secondary" onClick={() => remove(p.id)} style={{ color: 'var(--color-error)' }}>Confirmer</Button>
                  ) : (
                    <Button size="sm" variant="ghost" onClick={() => setDeleteConfirm(p.id)} style={{ color: 'var(--color-error)' }}>Supprimer</Button>
                  )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {pages.length === 0 && (
          <div style={{ padding: spacing[6], textAlign: 'center', color: 'var(--color-muted)' }}>
            Aucune page. Cliquez sur « Nouvelle page » pour en créer une.
          </div>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Modifier la page' : 'Nouvelle page'}
        size="fullscreen"
      >
        <div style={{ maxWidth: '90vw', maxHeight: '90vh', overflow: 'auto', padding: spacing[2] }}>
          <div style={{ display: 'flex', gap: spacing[2], marginBottom: spacing[3] }}>
            <button
              type="button"
              onClick={() => setModalTab('fr')}
              style={{
                padding: `${spacing[1]}px ${spacing[3]}px`,
                borderRadius: 8,
                border: `1px solid ${modalTab === 'fr' ? 'var(--color-gold)' : 'var(--color-border)'}`,
                backgroundColor: modalTab === 'fr' ? 'rgba(200,150,10,0.12)' : 'transparent',
                color: modalTab === 'fr' ? 'var(--color-gold)' : 'var(--color-text)',
                fontFamily: typography.fontBody,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              🇫🇷 Français
            </button>
            <button
              type="button"
              onClick={() => setModalTab('ar')}
              style={{
                padding: `${spacing[1]}px ${spacing[3]}px`,
                borderRadius: 8,
                border: `1px solid ${modalTab === 'ar' ? 'var(--color-gold)' : 'var(--color-border)'}`,
                backgroundColor: modalTab === 'ar' ? 'rgba(200,150,10,0.12)' : 'transparent',
                color: modalTab === 'ar' ? 'var(--color-gold)' : 'var(--color-text)',
                fontFamily: typography.fontBody,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              🇲🇦 العربية
            </button>
          </div>

          {modalTab === 'fr' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3], marginBottom: spacing[4] }}>
              <Input
                label="Titre (FR)"
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Titre de la page"
              />
              <div>
                <label style={{ display: 'block', marginBottom: spacing[1], fontSize: 13, color: 'var(--color-muted)' }}>Slug</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value, slugLocked: false }))}
                  placeholder="/slug"
                  style={{
                    width: '100%',
                    padding: `${spacing[1]}px ${spacing[2]}px`,
                    borderRadius: 8,
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface2)',
                    color: 'var(--color-gold)',
                    fontFamily: 'monospace',
                    fontSize: 14,
                  }}
                />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing[1] }}>
                  <label style={{ fontSize: 13, color: 'var(--color-muted)' }}>Contenu (FR)</label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: spacing[2], cursor: 'pointer', fontSize: 13 }}>
                    <input
                      type="checkbox"
                      checked={contentPreview}
                      onChange={(e) => setContentPreview(e.target.checked)}
                    />
                    Aperçu HTML
                  </label>
                </div>
                {!contentPreview ? (
                  <>
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 4,
                        marginBottom: 8,
                        padding: 4,
                        borderRadius: 8,
                        border: '1px solid var(--color-border)',
                        backgroundColor: 'var(--color-surface2)',
                      }}
                    >
                      {(['b', 'i', 'u', 'h1', 'h2', 'h3'] as const).map((tag) => (
                        <button key={tag} type="button" onClick={() => wrapTag(tag)} style={{ padding: '4px 8px', fontSize: 12, border: '1px solid var(--color-border)', borderRadius: 4, background: 'var(--color-surface)', cursor: 'pointer' }}>{tag.toUpperCase()}</button>
                      ))}
                      <button type="button" onClick={() => insertAtCursor('<ul>\n<li>', '</li>\n</ul>')} style={{ padding: '4px 8px', fontSize: 12, border: '1px solid var(--color-border)', borderRadius: 4, background: 'var(--color-surface)', cursor: 'pointer' }}>Liste</button>
                      <button type="button" onClick={insertLink} style={{ padding: '4px 8px', fontSize: 12, border: '1px solid var(--color-border)', borderRadius: 4, background: 'var(--color-surface)', cursor: 'pointer' }}>Lien</button>
                      <button type="button" onClick={insertImage} style={{ padding: '4px 8px', fontSize: 12, border: '1px solid var(--color-border)', borderRadius: 4, background: 'var(--color-surface)', cursor: 'pointer' }}>Image URL</button>
                    </div>
                    <textarea
                      ref={contentFrRef}
                      value={form.content}
                      onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
                      rows={12}
                      style={{
                        width: '100%',
                        padding: spacing[2],
                        borderRadius: 8,
                        border: '1px solid var(--color-border)',
                        backgroundColor: 'var(--color-surface)',
                        color: 'var(--color-text)',
                        fontFamily: 'monospace',
                        fontSize: 13,
                        resize: 'vertical',
                      }}
                      placeholder="<p>Contenu HTML...</p>"
                    />
                  </>
                ) : (
                  <div
                    className="scentara-page-preview"
                    style={{
                      padding: spacing[3],
                      borderRadius: 8,
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-surface)',
                      minHeight: 200,
                      fontSize: 15,
                      lineHeight: 1.6,
                    }}
                    dangerouslySetInnerHTML={{ __html: form.content || '<p><em>Aucun contenu</em></p>' }}
                  />
                )}
              </div>
            </div>
          )}

          {modalTab === 'ar' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3], marginBottom: spacing[4] }}>
              <Input
                label="Titre AR"
                value={form.title_ar}
                onChange={(e) => setForm((prev) => ({ ...prev, title_ar: e.target.value }))}
                placeholder="العنوان"
                style={{ direction: 'rtl' }}
              />
              <div>
                <label style={{ display: 'block', marginBottom: spacing[1], fontSize: 13, color: 'var(--color-muted)' }}>Contenu AR</label>
                <textarea
                  value={form.content_ar}
                  onChange={(e) => setForm((prev) => ({ ...prev, content_ar: e.target.value }))}
                  rows={12}
                  dir="rtl"
                  style={{
                    width: '100%',
                    padding: spacing[2],
                    borderRadius: 8,
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text)',
                    fontFamily: "'Noto Sans Arabic', sans-serif",
                    fontSize: 14,
                    resize: 'vertical',
                  }}
                  placeholder="المحتوى..."
                />
              </div>
            </div>
          )}

          <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: `${spacing[4]}px 0` }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
            <h4 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 600 }}>Options</h4>
            <Input
              label="Meta titre"
              value={form.meta_title}
              onChange={(e) => setForm((prev) => ({ ...prev, meta_title: e.target.value }))}
              placeholder="Titre pour les moteurs de recherche"
            />
            <div>
              <label style={{ display: 'block', marginBottom: spacing[1], fontSize: 13, color: 'var(--color-muted)' }}>Meta description</label>
              <textarea
                value={form.meta_description}
                onChange={(e) => setForm((prev) => ({ ...prev, meta_description: e.target.value }))}
                rows={2}
                style={{
                  width: '100%',
                  padding: spacing[2],
                  borderRadius: 8,
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface2)',
                  color: 'var(--color-text)',
                  fontSize: 14,
                }}
                placeholder="Description pour le SEO"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: spacing[1], fontSize: 13, color: 'var(--color-muted)' }}>Statut</label>
              <select
                value={form.status}
                onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as 'draft' | 'published' }))}
                style={{
                  width: '100%',
                  padding: `${spacing[1]}px ${spacing[2]}px`,
                  borderRadius: 8,
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface2)',
                  color: 'var(--color-text)',
                  fontSize: 14,
                }}
              >
                <option value="draft">Brouillon</option>
                <option value="published">Publié</option>
              </select>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: spacing[2], cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={form.show_in_footer}
                onChange={(e) => setForm((prev) => ({ ...prev, show_in_footer: e.target.checked }))}
              />
              <span>Afficher dans le footer</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: spacing[2], cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={form.show_in_navbar}
                onChange={(e) => setForm((prev) => ({ ...prev, show_in_navbar: e.target.checked }))}
              />
              <span>Afficher dans la navbar</span>
            </label>
            <Input
              label="Position"
              type="number"
              value={String(form.position)}
              onChange={(e) => setForm((prev) => ({ ...prev, position: parseInt(e.target.value, 10) || 0 }))}
            />
          </div>

          {saveError && (
            <div style={{ marginTop: spacing[3], padding: spacing[2], borderRadius: 8, backgroundColor: 'rgba(200,74,58,0.15)', color: 'var(--color-error)', fontSize: 13 }}>
              {saveError}
            </div>
          )}

          <div style={{ display: 'flex', gap: spacing[2], marginTop: spacing[4], flexWrap: 'wrap' }}>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Annuler</Button>
            <Button variant="secondary" loading={saving} onClick={() => save(true)}>Enregistrer comme brouillon</Button>
            <Button loading={saving} onClick={() => save(false)}>Publier</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
