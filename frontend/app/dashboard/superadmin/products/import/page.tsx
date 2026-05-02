'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api, { API_SUPER_ADMIN } from '@/lib/api';
import { spacing, typography } from '@/lib/design-tokens';
import { Button } from '@/components/ui/Button';

const API_BASE = `${API_SUPER_ADMIN}/products/import`;

type Step = 1 | 2 | 3;

interface PreviewRow {
  index: number;
  data: Record<string, string>;
  status: 'valid' | 'image_missing' | 'error';
  message?: string;
}

interface Summary {
  valid: number;
  imageMissing: number;
  errors: number;
}

export default function SuperadminProductsImportPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<{ rows: PreviewRow[]; summary: Summary } | null>(null);
  const [importResult, setImportResult] = useState<{ imported: number; imported_rows: { index: number; name: string }[]; failed: { index: number; message: string; data: Record<string, string> }[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadTemplate = async () => {
    try {
      const res = await api.get<Blob>(`${API_BASE}/template`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'modele-produits.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError('Impossible de télécharger le modèle');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setCsvFile(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (file.name.endsWith('.csv') || file.type === 'text/csv')) {
      setCsvFile(file);
    }
  };

  const handleAnalyze = async () => {
    if (!csvFile) return;
    setLoading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('file', csvFile);
      const res = await api.post<{ rows: PreviewRow[]; summary: Summary }>(`${API_BASE}/preview`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setCsvPreview({ rows: res.data.rows ?? [], summary: res.data.summary ?? { valid: 0, imageMissing: 0, errors: 0 } });
      setStep(2);
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Erreur lors de l\'analyse');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!csvFile) return;
    setLoading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('file', csvFile);
      const res = await api.post<{ imported: number; imported_rows: { index: number; name: string }[]; failed: { index: number; message: string; data: Record<string, string> }[] }>(API_BASE, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImportResult({
        imported: res.data.imported ?? 0,
        imported_rows: res.data.imported_rows ?? [],
        failed: res.data.failed ?? [],
      });
      setStep(3);
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Erreur lors de l\'import');
    } finally {
      setLoading(false);
    }
  };

  const statusBadge = (row: PreviewRow) => {
    if (row.status === 'valid') return <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 12, backgroundColor: 'var(--color-success)', color: '#fff' }}>✅ Valide</span>;
    if (row.status === 'image_missing') return <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 12, backgroundColor: 'orange', color: '#fff' }}>⚠️ Image introuvable</span>;
    return <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 12, backgroundColor: 'var(--color-error)', color: '#fff' }}>❌ Erreur</span>;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[4], maxWidth: 960, margin: '0 auto' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
        <Link href="/dashboard/superadmin/products" style={{ color: 'var(--color-muted)', fontSize: 14, textDecoration: 'none' }}>← Produits</Link>
        <h1 style={{ margin: 0, fontFamily: typography.fontDisplay, fontSize: 24 }}>Importer des produits (CSV)</h1>
      </header>

      {error && (
        <div style={{ padding: spacing[3], borderRadius: 8, backgroundColor: 'rgba(200, 74, 58, 0.15)', border: '1px solid var(--color-error)', color: 'var(--color-error)', fontSize: 14 }}>
          {error}
        </div>
      )}

      {step === 1 && (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
            <Button onClick={handleDownloadTemplate} variant="secondary">Télécharger le modèle CSV</Button>
            <div
              style={{
                padding: spacing[4],
                borderRadius: 12,
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface2)',
                fontSize: 13,
                color: 'var(--color-muted)',
                lineHeight: 1.6,
              }}
            >
              <strong style={{ color: 'var(--color-text)' }}>Colonnes du CSV</strong>
              <br />
              Requises : <code>nom</code>, <code>categorie</code>, <code>prix_20ml</code>, <code>prix_50ml</code>
              <br />
              Optionnelles : <code>nom_ar</code>, <code>description</code>, <code>description_ar</code>, <code>notes_tete</code>, <code>notes_coeur</code>, <code>notes_fond</code>, <code>notes_tete_ar</code>, <code>notes_coeur_ar</code>, <code>notes_fond_ar</code>, <code>intensite</code>, <code>intensite_ar</code>, <code>stock_20ml</code>, <code>stock_50ml</code>
              <br />
              Image : le nom de fichier doit exister dans la Médiathèque (ex. <code>atlas-oud.jpg</code>).
            </div>
            <div
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              style={{
                padding: 40,
                borderRadius: 12,
                border: `2px dashed ${dragOver ? 'var(--color-gold)' : 'var(--color-border)'}`,
                backgroundColor: dragOver ? 'var(--color-surface)' : 'var(--color-surface2)',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'border-color 0.2s, background-color 0.2s',
              }}
            >
              <input ref={fileInputRef} type="file" accept=".csv,text/csv" onChange={handleFileSelect} style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' }} aria-hidden />
              {csvFile ? (
                <span style={{ color: 'var(--color-text)', fontSize: 14 }}>Fichier : {csvFile.name}</span>
              ) : (
                <span style={{ color: 'var(--color-muted)', fontSize: 14 }}>Glissez un fichier CSV ici ou cliquer pour sélectionner</span>
              )}
            </div>
            <Button onClick={handleAnalyze} loading={loading} disabled={!csvFile}>Analyser le fichier</Button>
          </div>
        </>
      )}

      {step === 2 && csvPreview && (
        <>
          <div style={{ padding: spacing[2], borderRadius: 8, backgroundColor: 'var(--color-surface2)', border: '1px solid var(--color-border)', fontSize: 14, color: 'var(--color-text)' }}>
            {csvPreview.summary.valid} produits valides • {csvPreview.summary.imageMissing} sans image • {csvPreview.summary.errors} erreurs
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                  <th style={{ textAlign: 'left', padding: 8 }}>#</th>
                  <th style={{ textAlign: 'left', padding: 8 }}>Nom</th>
                  <th style={{ textAlign: 'left', padding: 8 }}>Nom AR</th>
                  <th style={{ textAlign: 'left', padding: 8 }}>Catégorie</th>
                  <th style={{ textAlign: 'left', padding: 8 }}>Prix 20ml</th>
                  <th style={{ textAlign: 'left', padding: 8 }}>Prix 50ml</th>
                  <th style={{ textAlign: 'left', padding: 8 }}>Image</th>
                  <th style={{ textAlign: 'left', padding: 8 }}>Statut</th>
                </tr>
              </thead>
              <tbody>
                {csvPreview.rows.map((row) => (
                  <tr key={row.index} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: 8 }}>{row.index}</td>
                    <td style={{ padding: 8 }}>{row.data.nom ?? '—'}</td>
                    <td style={{ padding: 8 }}>{row.data.nom_ar ?? '—'}</td>
                    <td style={{ padding: 8 }}>{row.data.categorie ?? '—'}</td>
                    <td style={{ padding: 8 }}>{row.data.prix_20ml ?? '—'}</td>
                    <td style={{ padding: 8 }}>{row.data.prix_50ml ?? '—'}</td>
                    <td style={{ padding: 8 }}>{row.data.image ?? '—'}</td>
                    <td style={{ padding: 8 }}>{statusBadge(row)} {row.message && <span style={{ marginLeft: 4, color: 'var(--color-muted)', fontSize: 12 }}>{row.message}</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ display: 'flex', gap: spacing[2] }}>
            <Button variant="ghost" onClick={() => setStep(1)}>Corriger les erreurs</Button>
            <Button onClick={handleImport} loading={loading} disabled={csvPreview.summary.valid === 0}>
              Importer {csvPreview.summary.valid} produits
            </Button>
          </div>
        </>
      )}

      {step === 3 && importResult && (
        <>
          {importResult.imported > 0 && (
            <div style={{ padding: spacing[4], borderRadius: 12, border: '1px solid var(--color-success)', backgroundColor: 'rgba(74, 140, 92, 0.1)', color: 'var(--color-text)' }}>
              <p style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>✅ {importResult.imported} produits importés avec succès</p>
              <ul style={{ marginTop: spacing[2], marginBottom: 0, paddingLeft: 20 }}>
                {importResult.imported_rows.map((r) => (
                  <li key={r.index}>{r.name}</li>
                ))}
              </ul>
            </div>
          )}
          {importResult.failed.length > 0 && (
            <div style={{ padding: spacing[3], borderRadius: 12, border: '1px solid var(--color-error)', backgroundColor: 'rgba(200, 74, 58, 0.1)', fontSize: 13, color: 'var(--color-text)' }}>
              <p style={{ margin: 0, fontWeight: 600 }}>Lignes en échec :</p>
              <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                {importResult.failed.map((f) => (
                  <li key={f.index}>Ligne {f.index} : {f.message}</li>
                ))}
              </ul>
            </div>
          )}
          <Link href="/dashboard/superadmin/products" style={{ textDecoration: 'none' }}>
            <Button>Voir les produits</Button>
          </Link>
        </>
      )}
    </div>
  );
}
