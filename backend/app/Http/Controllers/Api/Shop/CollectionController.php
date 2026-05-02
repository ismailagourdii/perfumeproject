<?php

namespace App\Http\Controllers\Api\Shop;

use App\Http\Controllers\Controller;
use App\Models\Collection;
use Illuminate\Http\JsonResponse;

class CollectionController extends Controller
{
    public function index(): JsonResponse
    {
        $collections = Collection::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        return response()->json([
            'data' => $collections,
        ]);
    }
}
