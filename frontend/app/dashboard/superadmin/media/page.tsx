'use client';

import React, { useEffect, useState, useRef } from 'react';
import api, { API_SUPER_ADMIN } from '@/lib/api';
import { spacing, typography } from '@/lib/design-tokens';
import { Button } from '@/components/ui/Button';
import { resolveMediaSrc } from '@/lib/media-url';

interface MediaFile {
  filename: string;
  url: string;
  size: number;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export default function SuperadminMediaPage() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [toast, setToast] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadFiles();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  function loadFiles() {
    setLoading(true);
    api
      .get<{ files: MediaFile[] }>(`${API_SUPER_ADMIN}/media`)
      .then((res) => setFiles(res.data?.files ?? []))
      .catch(() => setFiles([]))
      .finally(() => setLoading(false));
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files;
    if (!selected?.length) return;
    setUploading(true);
    const total = selected.length;
    let done = 0;
    const progress: Record<string, number> = {};
    Array.from(selected).forEach((file) => {
      progress[file.name] = 0;
    });
    setUploadProgress(progress);

    const uploadOne = (index: number) => {
      if (index >= total) {
        setUploading(false);
        setUploadProgress({});
        loadFiles();
        e.target.value = '';
        return;
      }
      const file = selected[index];
      const fd = new FormData();
      fd.append('files[]', file);
      api
        .post<{ files: MediaFile[] }>(`${API_SUPER_ADMIN}/media/upload`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        .then(() => {
          setUploadProgress((p) => ({ ...p, [file.name]: 100 }));
          done++;
          if (done === total) {
            setUploading(false);
            setUploadProgress({});
            loadFiles();
            setToast('Téléversement terminé');
          }
        })
        .catch(() => {
          setUploadProgress((p) => ({ ...p, [file.name]: -1 }));
          done++;
          if (done === total) {
            setUploading(false);
            setUploadProgress({});
          }
        })
        .finally(() => {
          if (index + 1 < total) uploadOne(index + 1);
        });
    };
    uploadOne(0);
  }

  function copyUrl(url: string) {
    navigator.clipboard.writeText(url).then(() => setToast('Copié !'));
  }

  async function deleteFile(filename: string) {
    try {
      await api.delete(`${API_SUPER_ADMIN}/media/${encodeURIComponent(filename)}`);
      setFiles((prev) => prev.filter((f) => f.filename !== filename));
      setDeleteConfirm(null);
      setToast('Fichier supprimé');
    } catch {
      setDeleteConfirm(null);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[4] }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: spacing[3] }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: typography.fontDisplay, fontSize: 28 }}>Médiathèque</h1>
          <p style={{ marginTop: spacing[1], marginBottom: 0, color: 'var(--color-muted)', fontSize: 13 }}>
            Gestion des images (JPEG, PNG, WebP).
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleFileSelect}
            style={{ position: 'absolute', width: 1, height: 1, opacity: 0, overflow: 'hidden', pointerEvents: 'none' }}
            aria-hidden
          />
          <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            {uploading ? 'Téléversement…' : 'Uploader des images'}
          </Button>
        </div>
      </header>

      {Object.keys(uploadProgress).length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2], padding: spacing[3], backgroundColor: 'var(--color-surface2)', borderRadius: 12, border: '1px solid var(--color-border)' }}>
          {Object.entries(uploadProgress).map(([name, pct]) => (
            <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 13, color: 'var(--color-text)', flex: '0 0 180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
              {pct >= 0 ? <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>{pct === 100 ? 'Terminé' : 'En cours…'}</span> : <span style={{ fontSize: 12, color: 'var(--color-error)' }}>Erreur</span>}
            </div>
          ))}
        </div>
      )}

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
      ) : files.length === 0 ? (
        <p style={{ color: 'var(--color-muted)', padding: spacing[5], textAlign: 'center' }}>
          Aucune image. Commencez par uploader des photos.
        </p>
      ) : (
        <div className="scentara-media-grid" style={{ gap: spacing[4] }}>
          {files.map((file) => (
            <div
              key={file.filename}
              style={{
                borderRadius: 12,
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface2)',
                overflow: 'hidden',
              }}
            >
              <div style={{ aspectRatio: '1', backgroundColor: 'var(--color-surface)', position: 'relative' }}>
                <img
                  src={resolveMediaSrc(file.url)}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
              <div style={{ padding: spacing[2], minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={file.filename}>
                  {file.filename}
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 4 }}>{formatSize(file.size)}</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <Button size="sm" variant="secondary" onClick={() => copyUrl(resolveMediaSrc(file.url))}>
                    Copier URL
                  </Button>
                  {deleteConfirm === file.filename ? (
                    <>
                      <span style={{ fontSize: 12 }}>Supprimer ?</span>
                      <Button size="sm" variant="ghost" onClick={() => setDeleteConfirm(null)}>Non</Button>
                      <Button size="sm" onClick={() => deleteFile(file.filename)} style={{ backgroundColor: 'var(--color-error)', borderColor: 'var(--color-error)' }}>Oui</Button>
                    </>
                  ) : (
                    <Button size="sm" variant="ghost" onClick={() => setDeleteConfirm(file.filename)}>Supprimer</Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
