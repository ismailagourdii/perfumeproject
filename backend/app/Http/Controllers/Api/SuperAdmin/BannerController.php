<?php

namespace App\Http\Controllers\Api\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class BannerController extends Controller
{
    public function index(): JsonResponse
    {
        $banners = Banner::query()
            ->orderBy('position')
            ->orderBy('id')
            ->get()
            ->map(fn (Banner $b) => $this->format($b));

        return response()->json([
            'success' => true,
            'data' => $banners,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        Log::info('Banner store called', $request->except(['image']));

        try {
            $data = [];
            $data['title'] = $request->input('title', 'Bannière');
            $data['title_ar'] = $request->input('title_ar');
            $data['link'] = $request->input('link', '/catalogue');
            $data['is_active'] = $request->boolean('is_active', true);
            $max = Banner::max('position');
            $data['position'] = ($max !== null ? (int) $max : 0) + 1;

            if ($request->hasFile('image')) {
                $path = $request->file('image')->store('banners', 'public');
                $data['image_url'] = '/storage/' . $path;
            }

            $banner = Banner::create($data);

            return response()->json([
                'success' => true,
                'data' => $this->format($banner),
            ], 201);
        } catch (\Throwable $e) {
            Log::error('Banner store error: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function update(Request $request, Banner $banner): JsonResponse
    {
        $data = $request->validate([
            'title' => ['nullable', 'string', 'max:255'],
            'title_ar' => ['nullable', 'string', 'max:255'],
            'link' => ['nullable', 'string', 'max:500'],
            'position' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
            'image' => ['nullable', 'image', 'max:2048'],
        ]);

        if (array_key_exists('title', $data)) {
            $banner->title = $data['title'];
        }
        if (array_key_exists('title_ar', $data)) {
            $banner->title_ar = $data['title_ar'];
        }
        if (array_key_exists('link', $data)) {
            $banner->link = $data['link'];
        }
        if (array_key_exists('position', $data)) {
            $banner->position = (int) $data['position'];
        }
        if (array_key_exists('is_active', $data)) {
            $banner->is_active = (bool) $data['is_active'];
        }

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('banners', 'public');
            $banner->image_url = '/storage/' . $path;
        }

        $banner->save();

        return response()->json(['banner' => $this->format($banner)]);
    }

    public function destroy(Banner $banner): JsonResponse
    {
        $banner->delete();
        return response()->json(null, 204);
    }

    public function reorder(Request $request): JsonResponse
    {
        $data = $request->validate([
            'banners' => ['required', 'array'],
            'banners.*.id' => ['required', 'integer', 'exists:banners,id'],
            'banners.*.position' => ['required', 'integer', 'min:0'],
        ]);

        foreach ($data['banners'] as $item) {
            Banner::where('id', $item['id'])->update(['position' => $item['position']]);
        }

        $banners = Banner::query()
            ->orderBy('position')
            ->orderBy('id')
            ->get()
            ->map(fn (Banner $b) => $this->format($b));

        return response()->json(['banners' => $banners]);
    }

    private function format(Banner $b): array
    {
        return [
            'id' => $b->id,
            'title' => $b->title,
            'title_ar' => $b->title_ar,
            'link' => $b->link,
            'image_url' => $b->image_url ? url($b->image_url) : null,
            'position' => (int) $b->position,
            'is_active' => (bool) $b->is_active,
        ];
    }
}
