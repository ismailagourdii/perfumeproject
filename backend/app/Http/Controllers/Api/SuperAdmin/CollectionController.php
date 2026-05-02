<?php

namespace App\Http\Controllers\Api\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Collection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CollectionController extends Controller
{
    public function index(): JsonResponse
    {
        $collections = Collection::query()
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        return response()->json([
            'data' => $collections,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'key' => ['required', 'string', 'in:homme,femme,mixte'],
            'title_fr' => ['required', 'string', 'max:255'],
            'title_ar' => ['nullable', 'string', 'max:255'],
            'subtitle_fr' => ['nullable', 'string', 'max:255'],
            'subtitle_ar' => ['nullable', 'string', 'max:255'],
            'image' => ['nullable', 'string', 'max:2048'],
            'link' => ['nullable', 'string', 'max:255'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $data['link'] = $data['link'] ?? '/catalogue';
        $data['sort_order'] = $data['sort_order'] ?? ((int) Collection::max('sort_order') + 1);
        $data['is_active'] = $request->boolean('is_active', true);

        $collection = Collection::create($data);

        return response()->json([
            'data' => $collection,
        ], 201);
    }

    public function show(Collection $collection): JsonResponse
    {
        return response()->json([
            'data' => $collection,
        ]);
    }

    public function update(Request $request, Collection $collection): JsonResponse
    {
        $data = $request->validate([
            'key' => ['sometimes', 'string', 'in:homme,femme,mixte'],
            'title_fr' => ['sometimes', 'string', 'max:255'],
            'title_ar' => ['nullable', 'string', 'max:255'],
            'subtitle_fr' => ['nullable', 'string', 'max:255'],
            'subtitle_ar' => ['nullable', 'string', 'max:255'],
            'image' => ['nullable', 'string', 'max:2048'],
            'link' => ['nullable', 'string', 'max:255'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        if (array_key_exists('is_active', $data)) {
            $data['is_active'] = (bool) $data['is_active'];
        }

        $collection->update($data);

        return response()->json([
            'data' => $collection->fresh(),
        ]);
    }

    public function destroy(Collection $collection): JsonResponse
    {
        $collection->delete();

        return response()->noContent();
    }

    public function reorder(Request $request): JsonResponse
    {
        $data = $request->validate([
            '*.id' => ['required', 'integer', 'exists:collections,id'],
            '*.sort_order' => ['required', 'integer', 'min:0'],
        ]);

        foreach ($data as $row) {
            Collection::query()
                ->where('id', $row['id'])
                ->update(['sort_order' => $row['sort_order']]);
        }

        $collections = Collection::query()
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        return response()->json([
            'data' => $collections,
        ]);
    }
}
