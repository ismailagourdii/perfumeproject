<?php

namespace App\Http\Controllers\Api\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductImportController extends Controller
{
    private const CSV_HEADERS = [
        'nom', 'nom_ar', 'categorie', 'prix_20ml', 'prix_50ml',
        'stock_20ml', 'stock_50ml', 'description', 'description_ar',
        'notes_tete', 'notes_coeur', 'notes_fond',
        'notes_tete_ar', 'notes_coeur_ar', 'notes_fond_ar',
        'intensite', 'intensite_ar', 'image',
    ];

    private const MEDIA_PATH = 'products';

    /**
     * POST /api/super-admin/products/import
     * dry_run=true: return { valid: [...], errors: [...] }
     * dry_run=false: return { imported: N, skipped: N, errors: [...] }
     */
    public function import(Request $request): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt', 'max:10240'],
            'dry_run' => ['nullable', 'boolean'],
        ]);

        $dryRun = $request->boolean('dry_run');
        $rows = $this->parseCsv($request->file('file'));
        $valid = [];
        $errors = [];

        foreach ($rows as $index => $row) {
            $rowNum = $index + 2; // 1-based + header
            $parsed = $this->parseRow($row);
            $rowErrors = $this->validateRow($parsed, $rowNum);

            if (count($rowErrors) > 0) {
                $errors[] = ['row' => $rowNum, 'errors' => $rowErrors];
                continue;
            }

            $imageFound = $this->imageExists($parsed['image'] ?? '');
            if (!empty($parsed['image']) && !$imageFound) {
                $errors[] = ['row' => $rowNum, 'errors' => ['image' => 'File not found in media library']];
                continue;
            }

            $valid[] = array_merge($parsed, ['row' => $rowNum]);
        }

        if ($dryRun) {
            return response()->json(['valid' => $valid, 'errors' => $errors]);
        }

        $imported = 0;
        $skipped = 0;
        $importErrors = [];

        foreach ($valid as $item) {
            $slug = Str::slug($item['nom'] ?? '');
            if (Product::where('slug', $slug)->exists()) {
                $skipped++;
                $importErrors[] = ['row' => $item['row'], 'errors' => ['slug' => 'Product with this name already exists']];
                continue;
            }
            $this->createProductFromRow($item);
            $imported++;
        }

        return response()->json([
            'imported' => $imported,
            'skipped' => $skipped,
            'errors' => array_merge($errors, $importErrors),
        ]);
    }

    /**
     * POST /api/super-admin/products/import/preview
     * Always dry_run style: { rows: [{ ...product data, image_found: bool, errors: [] }] }
     */
    public function preview(Request $request): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt', 'max:10240'],
        ]);

        $rows = $this->parseCsv($request->file('file'));
        $result = [];

        foreach ($rows as $index => $row) {
            $rowNum = $index + 2;
            $parsed = $this->parseRow($row);
            $rowErrors = $this->validateRow($parsed, $rowNum);
            $imageFound = $this->imageExists($parsed['image'] ?? '');
            if (!empty($parsed['image']) && !$imageFound) {
                $rowErrors[] = 'Image file not found in media library';
            }
            $result[] = [
                'row' => $rowNum,
                'data' => $parsed,
                'image_found' => $imageFound,
                'errors' => $rowErrors,
            ];
        }

        return response()->json(['rows' => $result]);
    }

    /**
     * GET /api/super-admin/products/import/template
     * Downloadable CSV with headers + 2 example rows (one FR only, one FR+AR).
     */
    public function template(): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        $headers = self::CSV_HEADERS;
        $example1 = [
            'Rose Éternelle', '', 'Floral', '120', '280',
            '50', '30', 'Une rose captivante.', '',
            'Rose, Bergamote', 'Rose, Jasmin', 'Musk, Vanille',
            '', '', '',
            'Moyenne', '', 'rose-eternelle.jpg',
        ];
        $example2 = [
            'Oud Royal', 'عود ملكي', 'Boisé', '180', '420',
            '20', '15', 'Oud précieux.', 'عود ثمين.',
            'Safran', 'Oud, Rose', 'Bois de santal, Ambre',
            'زعفران', 'عود، ورد', 'خشب الصندل، عنبر',
            'Forte', 'قوي', 'oud-royal.jpg',
        ];

        return response()->streamDownload(function () use ($headers, $example1, $example2) {
            $out = fopen('php://output', 'w');
            fputcsv($out, $headers);
            fputcsv($out, $example1);
            fputcsv($out, $example2);
            fclose($out);
        }, 'products_import_template.csv', [
            'Content-Type' => 'text/csv',
        ]);
    }

    private function parseCsv($file): array
    {
        $path = $file->getRealPath();
        $rows = [];
        $handle = fopen($path, 'r');
        if (!$handle) {
            return [];
        }
        $header = fgetcsv($handle);
        while (($line = fgetcsv($handle)) !== false) {
            $row = [];
            foreach ($header as $i => $col) {
                $row[trim($col)] = $line[$i] ?? '';
            }
            $rows[] = $row;
        }
        fclose($handle);
        return $rows;
    }

    private function parseRow(array $row): array
    {
        $notesTete = isset($row['notes_tete']) ? array_map('trim', explode(',', $row['notes_tete'])) : [];
        $notesCoeur = isset($row['notes_coeur']) ? array_map('trim', explode(',', $row['notes_coeur'])) : [];
        $notesFond = isset($row['notes_fond']) ? array_map('trim', explode(',', $row['notes_fond'])) : [];
        $notesTeteAr = isset($row['notes_tete_ar']) ? array_map('trim', explode(',', $row['notes_tete_ar'])) : [];
        $notesCoeurAr = isset($row['notes_coeur_ar']) ? array_map('trim', explode(',', $row['notes_coeur_ar'])) : [];
        $notesFondAr = isset($row['notes_fond_ar']) ? array_map('trim', explode(',', $row['notes_fond_ar'])) : [];

        return [
            'nom' => trim($row['nom'] ?? ''),
            'nom_ar' => trim($row['nom_ar'] ?? ''),
            'categorie' => trim($row['categorie'] ?? ''),
            'prix_20ml' => $this->numericOrNull($row['prix_20ml'] ?? null),
            'prix_50ml' => $this->numericOrNull($row['prix_50ml'] ?? null),
            'stock_20ml' => (int) ($row['stock_20ml'] ?? 0),
            'stock_50ml' => (int) ($row['stock_50ml'] ?? 0),
            'description' => trim($row['description'] ?? ''),
            'description_ar' => trim($row['description_ar'] ?? ''),
            'notes' => [
                'top' => array_values(array_filter($notesTete)),
                'heart' => array_values(array_filter($notesCoeur)),
                'base' => array_values(array_filter($notesFond)),
            ],
            'notes_ar' => [
                'top' => array_values(array_filter($notesTeteAr)),
                'heart' => array_values(array_filter($notesCoeurAr)),
                'base' => array_values(array_filter($notesFondAr)),
            ],
            'intensite' => trim($row['intensite'] ?? ''),
            'intensite_ar' => trim($row['intensite_ar'] ?? ''),
            'image' => trim($row['image'] ?? ''),
        ];
    }

    private function numericOrNull($value): ?float
    {
        if ($value === null || $value === '') {
            return null;
        }
        return is_numeric($value) ? (float) $value : null;
    }

    private function validateRow(array $parsed, int $rowNum): array
    {
        $errors = [];
        if (empty($parsed['nom'])) {
            $errors[] = 'nom is required';
        }
        $prix20 = $parsed['prix_20ml'] ?? null;
        $prix50 = $parsed['prix_50ml'] ?? null;
        if (($prix20 === null || $prix20 < 0) && ($prix50 === null || $prix50 < 0)) {
            $errors[] = 'At least one of prix_20ml or prix_50ml must be a positive number';
        }
        if ($prix20 !== null && $prix20 < 0) {
            $errors[] = 'prix_20ml must be >= 0';
        }
        if ($prix50 !== null && $prix50 < 0) {
            $errors[] = 'prix_50ml must be >= 0';
        }
        return $errors;
    }

    private function imageExists(string $filename): bool
    {
        if ($filename === '') {
            return true;
        }
        $filename = basename($filename);
        return Storage::disk('public')->exists(self::MEDIA_PATH . '/' . $filename);
    }

    private function createProductFromRow(array $item): void
    {
        $nom = $item['nom'];
        $slug = Str::slug($item['nom']);
        $prix20 = $item['prix_20ml'];
        $prix50 = $item['prix_50ml'];
        $basePrice = $prix50 !== null && $prix50 > 0 ? (int) round($prix50) : (int) round($prix20 ?? 0);
        $sizeMl = ($prix50 !== null && $prix50 > 0) ? '50' : '20';

        $imagePath = null;
        if (!empty($item['image'])) {
            $filename = basename($item['image']);
            if (Storage::disk('public')->exists(self::MEDIA_PATH . '/' . $filename)) {
                $imagePath = '/storage/' . self::MEDIA_PATH . '/' . $filename;
            }
        }

        Product::create([
            'name' => $nom,
            'name_ar' => $item['nom_ar'] ?: null,
            'slug' => $slug,
            'category' => $item['categorie'] ?: null,
            'size_ml' => $sizeMl,
            'base_price_mad' => $basePrice,
            'description' => $item['description'] ?: null,
            'description_ar' => $item['description_ar'] ?: null,
            'notes' => $item['notes'],
            'notes_ar' => $item['notes_ar'],
            'intensity' => $item['intensite'] ?: null,
            'intensity_ar' => $item['intensite_ar'] ?: null,
            'image_path' => $imagePath,
            'is_active' => true,
        ]);
    }
}
