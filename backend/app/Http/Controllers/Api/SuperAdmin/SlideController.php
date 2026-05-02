<?php

namespace App\Http\Controllers\Api\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Slide;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SlideController extends Controller
{
    public function index(): JsonResponse
    {
        $slides = Slide::query()
            ->orderBy('position')
            ->orderBy('id')
            ->get()
            ->map(fn (Slide $slide) => $this->formatSlide($slide));

        return response()->json(['slides' => $slides]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => ['nullable', 'string', 'max:255'],
            'title_ar' => ['nullable', 'string', 'max:255'],
            'subtitle' => ['nullable', 'string', 'max:500'],
            'subtitle_ar' => ['nullable', 'string', 'max:1000'],
            'badge_text' => ['nullable', 'string', 'max:100'],
            'badge_ar' => ['nullable', 'string', 'max:100'],
            'button1_text' => ['nullable', 'string', 'max:100'],
            'button1_text_ar' => ['nullable', 'string', 'max:100'],
            'button1_link' => ['nullable', 'string', 'max:500'],
            'button2_text' => ['nullable', 'string', 'max:100'],
            'button2_text_ar' => ['nullable', 'string', 'max:100'],
            'button2_link' => ['nullable', 'string', 'max:500'],
            'button1_style' => ['nullable', 'string', 'in:filled,outline,ghost'],
            'position' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
            'duration_ms' => ['nullable', 'integer', 'min:1000', 'max:60000'],
            'text_color' => ['nullable', 'string', 'max:20'],
            'overlay_opacity' => ['nullable', 'integer', 'min:0', 'max:100'],
            'text_position' => ['nullable', 'string', 'in:left,center,right'],
            'active_from' => ['nullable', 'date'],
            'active_until' => ['nullable', 'date', 'after_or_equal:active_from'],
            'image' => ['nullable', 'image', 'max:2048'],
            'mobile_image' => ['nullable', 'image', 'max:2048'],
        ]);

        $position = isset($data['position']) ? (int) $data['position'] : (Slide::max('position') + 1);
        $slide = new Slide();
        $slide->title = $data['title'] ?? null;
        $slide->title_ar = $data['title_ar'] ?? null;
        $slide->subtitle = $data['subtitle'] ?? null;
        $slide->subtitle_ar = $data['subtitle_ar'] ?? null;
        $slide->badge_text = $data['badge_text'] ?? null;
        $slide->badge_ar = $data['badge_ar'] ?? null;
        $slide->button1_text = $data['button1_text'] ?? null;
        $slide->button1_text_ar = $data['button1_text_ar'] ?? null;
        $slide->button1_link = $data['button1_link'] ?? null;
        $slide->button2_text = $data['button2_text'] ?? null;
        $slide->button2_text_ar = $data['button2_text_ar'] ?? null;
        $slide->button2_link = $data['button2_link'] ?? null;
        $slide->button1_style = $data['button1_style'] ?? 'filled';
        $slide->position = $position;
        $slide->is_active = $data['is_active'] ?? true;
        $slide->duration_ms = (int) ($data['duration_ms'] ?? 5000);
        $slide->text_color = $data['text_color'] ?? '#ffffff';
        $slide->overlay_opacity = (int) ($data['overlay_opacity'] ?? 40);
        $slide->text_position = $data['text_position'] ?? 'left';
        $slide->active_from = isset($data['active_from']) ? $data['active_from'] : null;
        $slide->active_until = isset($data['active_until']) ? $data['active_until'] : null;

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('slides', 'public');
            $slide->image_url = '/storage/' . $path;
        }
        if ($request->hasFile('mobile_image')) {
            $path = $request->file('mobile_image')->store('slides', 'public');
            $slide->mobile_image_url = '/storage/' . $path;
        }

        $slide->save();

        return response()->json(['slide' => $this->formatSlide($slide)], 201);
    }

    public function update(Request $request, Slide $slide): JsonResponse
    {
        $data = $request->validate([
            'title' => ['nullable', 'string', 'max:255'],
            'title_ar' => ['nullable', 'string', 'max:255'],
            'subtitle' => ['nullable', 'string', 'max:500'],
            'subtitle_ar' => ['nullable', 'string', 'max:1000'],
            'badge_text' => ['nullable', 'string', 'max:100'],
            'badge_ar' => ['nullable', 'string', 'max:100'],
            'button1_text' => ['nullable', 'string', 'max:100'],
            'button1_text_ar' => ['nullable', 'string', 'max:100'],
            'button1_link' => ['nullable', 'string', 'max:500'],
            'button2_text' => ['nullable', 'string', 'max:100'],
            'button2_text_ar' => ['nullable', 'string', 'max:100'],
            'button2_link' => ['nullable', 'string', 'max:500'],
            'button1_style' => ['nullable', 'string', 'in:filled,outline,ghost'],
            'position' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
            'duration_ms' => ['nullable', 'integer', 'min:1000', 'max:60000'],
            'text_color' => ['nullable', 'string', 'max:20'],
            'overlay_opacity' => ['nullable', 'integer', 'min:0', 'max:100'],
            'text_position' => ['nullable', 'string', 'in:left,center,right'],
            'active_from' => ['nullable', 'date'],
            'active_until' => ['nullable', 'date'],
            'image' => ['nullable', 'image', 'max:2048'],
            'mobile_image' => ['nullable', 'image', 'max:2048'],
        ]);

        $fillable = [
            'title', 'title_ar', 'subtitle', 'subtitle_ar', 'badge_text', 'badge_ar',
            'button1_text', 'button1_text_ar', 'button1_link', 'button2_text', 'button2_text_ar', 'button2_link', 'button1_style',
            'position', 'is_active', 'duration_ms', 'text_color', 'overlay_opacity', 'text_position',
            'active_from', 'active_until',
        ];
        foreach ($fillable as $key) {
            if (array_key_exists($key, $data)) {
                $slide->{$key} = $data[$key];
            }
        }

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('slides', 'public');
            $slide->image_url = '/storage/' . $path;
        }
        if ($request->hasFile('mobile_image')) {
            $path = $request->file('mobile_image')->store('slides', 'public');
            $slide->mobile_image_url = '/storage/' . $path;
        }

        $slide->save();

        return response()->json(['slide' => $this->formatSlide($slide)]);
    }

    public function destroy(Slide $slide): JsonResponse
    {
        $slide->delete();
        return response()->json(null, 204);
    }

    public function reorder(Request $request): JsonResponse
    {
        $data = $request->validate([
            'slides' => ['required', 'array'],
            'slides.*.id' => ['required', 'integer', 'exists:slides,id'],
            'slides.*.position' => ['required', 'integer', 'min:0'],
        ]);

        foreach ($data['slides'] as $item) {
            Slide::where('id', $item['id'])->update(['position' => $item['position']]);
        }

        $slides = Slide::query()
            ->orderBy('position')
            ->orderBy('id')
            ->get()
            ->map(fn (Slide $s) => $this->formatSlide($s));

        return response()->json(['slides' => $slides]);
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
            'is_active' => (bool) $slide->is_active,
            'duration_ms' => (int) ($slide->duration_ms ?? 5000),
            'text_color' => $slide->text_color ?? '#ffffff',
            'overlay_opacity' => (int) ($slide->overlay_opacity ?? 40),
            'text_position' => $slide->text_position ?? 'left',
            'active_from' => $slide->active_from?->toIso8601String(),
            'active_until' => $slide->active_until?->toIso8601String(),
            'view_count' => (int) ($slide->view_count ?? 0),
            'click_count' => (int) ($slide->click_count ?? 0),
        ];
    }
}
