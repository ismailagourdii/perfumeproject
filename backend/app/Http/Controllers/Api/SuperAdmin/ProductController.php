<?php

namespace App\Http\Controllers\Api\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Http\Requests\SuperAdmin\UpdateProductRequest;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    /**
     * Liste des produits pour le back-office super-admin.
     */
    public function index(): JsonResponse
    {
        $products = Product::query()
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Product $product) => $this->formatForBackoffice($product));

        return response()->json([
            'products' => $products,
        ]);
    }

    /**
     * Création d'un produit.
     */
    public function store(Request $request): JsonResponse
    {
        $data = $this->validatePayload($request);

        $product = new Product();
        $this->fillProductFromPayload($product, $data, $request);
        $product->save();

        return response()->json([
            'product' => $this->formatForBackoffice($product),
        ], 201);
    }

    /**
     * Affichage d'un produit.
     */
    public function show(Product $product): JsonResponse
    {
        return response()->json([
            'product' => $this->formatForBackoffice($product),
        ]);
    }

    /**
     * Mise à jour d'un produit.
     */
    public function update(UpdateProductRequest $request, Product $product): JsonResponse
    {
        if ($request->boolean('only_toggle_active', false) || array_keys($request->all()) === ['active']) {
            $product->update(['is_active' => (bool) $request->get('active', true)]);

            return response()->json([
                'product' => $this->formatForBackoffice($product->fresh()),
            ]);
        }

        $price20 = $request->has('price_20ml') ? $request->input('price_20ml') : $request->input('price20ml');
        $price50 = $request->has('price_50ml') ? $request->input('price_50ml') : $request->input('price50ml');
        $existing20 = $product->price_20ml ?? $product->price_20ml_mad ?? 0;
        $existing50 = $product->price_50ml ?? $product->price_50ml_mad ?? 0;

        $update = [
            'name' => $request->input('name'),
            'name_ar' => $request->input('name_ar'),
            'slug' => $request->input('slug') ?: Str::slug($request->input('name')),
            'category' => $request->input('category'),
            'description' => $request->input('description'),
            'description_ar' => $request->input('description_ar'),
            'notes' => $this->normalizeNotes($request->input('notes')),
            'notes_ar' => $this->normalizeNotesAr($request->input('notes_ar')),
            'intensity_ar' => $request->input('intensity_ar'),
            'intensity' => $request->input('intensity'),
            'is_active' => $request->boolean('active', true),
            'price_20ml' => (isset($price20) && $price20 !== '') ? (float) $price20 : (float) $existing20,
            'price_50ml' => (isset($price50) && $price50 !== '') ? (float) $price50 : (float) $existing50,
        ];

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('products', 'public');
            $update['image_path'] = '/storage/' . $path;
        }

        $product->update($update);

        return response()->json([
            'product' => $this->formatForBackoffice($product->fresh()),
        ]);
    }

    /**
     * Suppression (soft delete) d'un produit.
     */
    public function destroy(Product $product): JsonResponse
    {
        $product->delete();

        return response()->json(null, 204);
    }

    /**
     * Valide les données envoyées depuis le frontend.
     */
    private function validatePayload(Request $request, ?Product $product = null): array
    {
        $productId = $product?->id;

        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'name_ar' => ['nullable', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:products,slug,' . ($productId ?? 'NULL')],
            'category' => ['nullable', 'string', 'max:50'],
            'description' => ['nullable', 'string'],
            'description_ar' => ['nullable', 'string'],
            'notes_ar' => ['nullable'],
            'intensity_ar' => ['nullable', 'string', 'max:100'],
            'price20ml' => ['nullable', 'numeric', 'min:0'],
            'price50ml' => ['nullable', 'numeric', 'min:0'],
            'stock_20ml' => ['nullable', 'integer', 'min:0'],
            'stock_50ml' => ['nullable', 'integer', 'min:0'],
            'notes' => ['nullable'],
            'intensity' => ['nullable', 'string', 'max:50'],
            'active' => ['nullable'],
            'image' => ['nullable', 'image', 'max:2048'],
        ]);
    }

    /**
     * Remplit le modèle Product à partir du payload.
     */
    private function fillProductFromPayload(Product $product, array $data, Request $request): void
    {
        $name = $data['name'];
        $slug = $data['slug'] ?? null;

        if (! $slug) {
            $slug = Str::slug($name);
        }

        $price20 = isset($data['price20ml']) ? (int) round((float) $data['price20ml']) : null;
        $price50 = isset($data['price50ml']) ? (int) round((float) $data['price50ml']) : null;

        $product->name = $name;
        $product->name_ar = $data['name_ar'] ?? null;
        $product->slug = $slug;
        $product->description = $data['description'] ?? null;
        $product->description_ar = $data['description_ar'] ?? null;
        $product->notes = $this->normalizeNotes($data['notes'] ?? null);
        $product->notes_ar = $this->normalizeNotesAr($data['notes_ar'] ?? null);
        $product->intensity = $data['intensity'] ?? null;
        $product->intensity_ar = $data['intensity_ar'] ?? null;
        $product->category = $data['category'] ?? null;
        if ($price20 !== null) {
            $product->price_20ml_mad = $price20;
            $product->price_20ml = (float) $price20;
        }
        if ($price50 !== null) {
            $product->price_50ml_mad = $price50;
            $product->price_50ml = (float) $price50;
        }
        $product->base_price_mad = (int) ($product->price_50ml_mad ?? $product->price_20ml_mad ?? $product->base_price_mad ?? 0);
        if ($price50 !== null || $price20 !== null) {
            $product->size_ml = $price50 !== null ? '50' : '20';
        } elseif ($product->size_ml === null) {
            $product->size_ml = '20';
        }
        $product->is_active = array_key_exists('active', $data)
            ? (bool) $data['active']
            : ($product->is_active ?? true);

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            /** @var string $path */
            $path = $file->store('products', 'public');
            $product->image_path = Storage::url($path);
        }
    }

    /**
     * Normalise notes (peut être string JSON ou array).
     */
    private function normalizeNotes(mixed $value): ?array
    {
        if ($value === null || $value === '') {
            return null;
        }
        if (is_array($value)) {
            return $value;
        }
        if (is_string($value)) {
            $decoded = json_decode($value, true);
            return is_array($decoded) ? $decoded : null;
        }
        return null;
    }

    /**
     * Normalise notes_ar (peut être string JSON ou array).
     */
    private function normalizeNotesAr(mixed $value): ?array
    {
        if ($value === null || $value === '') {
            return null;
        }
        if (is_array($value)) {
            return $value;
        }
        if (is_string($value)) {
            $decoded = json_decode($value, true);
            return is_array($decoded) ? $decoded : null;
        }
        return null;
    }

    /**
     * Formate un produit pour le back-office.
     */
    private function formatForBackoffice(Product $product): array
    {
        $basePrice = (float) ($product->base_price_mad ?? 0);
        $price20 = $product->price_20ml !== null ? (float) $product->price_20ml : ($product->price_20ml_mad !== null ? (float) $product->price_20ml_mad : $basePrice);
        $price50 = $product->price_50ml !== null ? (float) $product->price_50ml : ($product->price_50ml_mad !== null ? (float) $product->price_50ml_mad : $basePrice);
        $notesAr = $product->notes_ar;
        $notesArArray = is_array($notesAr) ? $notesAr : [];

        return [
            'id' => $product->id,
            'name' => $product->name,
            'name_ar' => $product->name_ar,
            'slug' => $product->slug,
            'category' => $product->category,
            'description' => $product->description,
            'description_ar' => $product->description_ar,
            'notes_ar' => $notesArArray,
            'intensity_ar' => $product->intensity_ar,
            'price_20ml' => $price20,
            'price_50ml' => $price50,
            'price20ml' => $price20,
            'price50ml' => $price50,
            'stock_20ml' => 0,
            'stock_50ml' => 0,
            'notes' => is_array($product->notes) ? $product->notes : ['top' => [], 'heart' => [], 'base' => []],
            'intensity' => $product->intensity,
            'active' => (bool) $product->is_active,
            'imageUrl' => $product->image_path ? url($product->image_path) : null,
        ];
    }
}
