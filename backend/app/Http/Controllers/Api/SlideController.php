<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Slide;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SlideController extends Controller
{
    /**
     * Public endpoint: active slides ordered by position, filtered by schedule.
     */
    public function index(): JsonResponse
    {
        $now = now();

        $slides = Slide::query()
            ->where('is_active', true)
            ->where(function ($q) use ($now) {
                $q->whereNull('active_from')->orWhere('active_from', '<=', $now);
            })
            ->where(function ($q) use ($now) {
                $q->whereNull('active_until')->orWhere('active_until', '>=', $now);
            })
            ->orderBy('position')
            ->orderBy('id')
            ->get()
            ->map(fn (Slide $slide) => $this->formatSlide($slide));

        return response()->json(['slides' => $slides]);
    }

    /**
     * Increment view count when a slide is displayed.
     */
    public function view(Slide $slide): JsonResponse
    {
        $slide->increment('view_count');
        return response()->json(['ok' => true]);
    }

    /**
     * Increment click count when a CTA is clicked. Body: { button: 1|2 }
     */
    public function click(Request $request, Slide $slide): JsonResponse
    {
        $request->validate(['button' => 'required|in:1,2']);
        $slide->increment('click_count');
        return response()->json(['ok' => true]);
    }

    private function formatSlide(Slide $slide): array
    {
        return [
            'id' => $slide->id,
            'title' => $slide->title,
            'title_ar' => $slide->title_ar,
            'subtitle' => $slide->subtitle,
            'subtitle_ar' => $slide->subtitle_ar,
            'badge_text' => $slide->badge_text,
            'badge_ar' => $slide->badge_ar,
            'button1_text' => $slide->button1_text,
            'button1_text_ar' => $slide->button1_text_ar,
            'button1_link' => $slide->button1_link,
            'button2_text' => $slide->button2_text,
            'button2_text_ar' => $slide->button2_text_ar,
            'button2_link' => $slide->button2_link,
            'button1_style' => $slide->button1_style ?? 'filled',
            'image_url' => $slide->image_url ? url($slide->image_url) : null,
            'mobile_image_url' => $slide->mobile_image_url ? url($slide->mobile_image_url) : null,
            'position' => (int) $slide->position,
            'duration_ms' => (int) ($slide->duration_ms ?? 5000),
            'text_color' => $slide->text_color ?? '#ffffff',
            'overlay_opacity' => (int) ($slide->overlay_opacity ?? 40),
            'text_position' => $slide->text_position ?? 'left',
        ];
    }
}
