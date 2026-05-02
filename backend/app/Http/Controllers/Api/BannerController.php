<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Http\JsonResponse;

class BannerController extends Controller
{
    /**
     * Public: active banners for homepage.
     */
    public function index(): JsonResponse
    {
        $banners = Banner::query()
            ->where('is_active', true)
            ->orderBy('position')
            ->orderBy('id')
            ->get()
            ->map(fn (Banner $b) => [
                'id' => $b->id,
                'title' => $b->title,
                'title_ar' => $b->title_ar,
                'link' => $b->link,
                'image_url' => $b->image_url ? url($b->image_url) : null,
                'position' => (int) $b->position,
            ]);

        return response()->json(['banners' => $banners]);
    }
}
