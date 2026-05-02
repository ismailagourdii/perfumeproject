<?php

namespace App\Http\Controllers\Api\Shop;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * Liste paginée des produits (catalogue public).
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->get('per_page', 12);
        $category = $request->get('category');

        $query = Product::query()->where('is_active', true);

        if ($category && in_array($category, ['homme', 'femme', 'mixte'], true)) {
            $query->where('category', $category);
        }

        $paginator = $query->orderBy('name')->paginate($perPage);

        $data = $paginator->getCollection()->map(fn (Product $p) => $this->formatForFrontend($p));

        return response()->json([
            'data' => $data,
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'last_page' => $paginator->lastPage(),
            ],
        ]);
    }

    /**
     * Détail d'un produit par slug.
     */
    public function show(string $slug): JsonResponse
    {
        $product = Product::where('slug', $slug)->where('is_active', true)->firstOrFail();
        $related = Product::where('is_active', true)->where('id', '!=', $product->id)->inRandomOrder()->limit(4)->get();

        return response()->json([
            'perfume' => $this->formatForFrontend($product),
            'related' => $related->map(fn (Product $p) => $this->formatForFrontend($p)),
        ]);
    }

    private function formatForFrontend(Product $p): array
    {
        $basePrice = (float) ($p->base_price_mad ?? 0);
        $price20 = $p->price_20ml !== null ? (float) $p->price_20ml : ($p->price_20ml_mad !== null ? (float) $p->price_20ml_mad : $basePrice);
        $price50 = $p->price_50ml !== null ? (float) $p->price_50ml : ($p->price_50ml_mad !== null ? (float) $p->price_50ml_mad : $basePrice);

        // Parse French notes from the 'notes' JSON column
        $notesFr = $p->notes;
        $notesFrArray = is_array($notesFr) ? $notesFr : [];
        $notesTopFr = $notesFrArray['top'] ?? [];
        $notesHeartFr = $notesFrArray['heart'] ?? [];
        $notesBaseFr = $notesFrArray['base'] ?? [];

        // Parse Arabic notes from the 'notes_ar' JSON column
        $notesAr = $p->notes_ar;
        $notesArArray = is_array($notesAr) ? $notesAr : [];
        $top = $notesArArray['top'] ?? [];
        $heart = $notesArArray['heart'] ?? [];
        $base = $notesArArray['base'] ?? [];

        return [
            'id' => $p->id,
            'slug' => $p->slug,
            'name' => $p->name,
            'name_ar' => $p->name_ar,
            'category' => $p->category ?? 'mixte',
            'intensity' => $p->intensity ?? 'modéré',
            'intensity_ar' => $p->intensity_ar,
            'imageUrl' => $p->image_path ? url($p->image_path) : '',
            'description' => $p->description ?? '',
            'description_ar' => $p->description_ar,
            'notesTop' => is_array($notesTopFr) ? $notesTopFr : [],
            'notesHeart' => is_array($notesHeartFr) ? $notesHeartFr : [],
            'notesBase' => is_array($notesBaseFr) ? $notesBaseFr : [],
            'notes_ar' => $notesArArray,
            'notesTopAr' => is_array($top) ? $top : [],
            'notesHeartAr' => is_array($heart) ? $heart : [],
            'notesBaseAr' => is_array($base) ? $base : [],
            'price20ml' => $price20,
            'price50ml' => $price50,
        ];
    }
}
