<?php

namespace App\Http\Controllers\Api\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Page;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PageController extends Controller
{
    public function index(): JsonResponse
    {
        $pages = Page::query()
            ->orderBy('position')
            ->orderBy('id')
            ->get()
            ->map(fn (Page $p) => $this->format($p));

        return response()->json([
            'success' => true,
            'data' => $pages,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'title_ar' => ['nullable', 'string', 'max:500'],
            'slug' => ['nullable', 'string', 'max:255'],
            'content' => ['nullable', 'string'],
            'content_ar' => ['nullable', 'string'],
            'meta_title' => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string', 'max:500'],
            'status' => ['nullable', 'string', 'in:draft,published'],
            'show_in_footer' => ['nullable', 'boolean'],
            'show_in_navbar' => ['nullable', 'boolean'],
            'position' => ['nullable', 'integer', 'min:0'],
        ]);

        $slugBase = isset($validated['slug']) && $validated['slug'] !== ''
            ? \Illuminate\Support\Str::slug($validated['slug'])
            : $validated['title'];
        $slug = Page::makeSlugUnique($slugBase);

        $page = Page::create([
            'title' => $validated['title'],
            'title_ar' => $validated['title_ar'] ?? null,
            'slug' => $slug,
            'content' => $validated['content'] ?? null,
            'content_ar' => $validated['content_ar'] ?? null,
            'meta_title' => $validated['meta_title'] ?? null,
            'meta_description' => $validated['meta_description'] ?? null,
            'status' => $validated['status'] ?? 'draft',
            'show_in_footer' => $request->boolean('show_in_footer', false),
            'show_in_navbar' => $request->boolean('show_in_navbar', false),
            'position' => (int) ($validated['position'] ?? Page::max('position') + 1),
        ]);

        return response()->json([
            'success' => true,
            'data' => $this->format($page),
        ], 201);
    }

    public function update(Request $request, Page $page): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['nullable', 'string', 'max:255'],
            'title_ar' => ['nullable', 'string', 'max:500'],
            'slug' => ['nullable', 'string', 'max:255'],
            'content' => ['nullable', 'string'],
            'content_ar' => ['nullable', 'string'],
            'meta_title' => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string', 'max:500'],
            'status' => ['nullable', 'string', 'in:draft,published'],
            'show_in_footer' => ['nullable', 'boolean'],
            'show_in_navbar' => ['nullable', 'boolean'],
            'position' => ['nullable', 'integer', 'min:0'],
        ]);

        if (array_key_exists('title', $validated)) {
            $page->title = $validated['title'];
        }
        if (array_key_exists('title_ar', $validated)) {
            $page->title_ar = $validated['title_ar'];
        }
        if (array_key_exists('slug', $validated) && $validated['slug'] !== '') {
            $page->slug = Page::makeSlugUnique(\Illuminate\Support\Str::slug($validated['slug']), $page->id);
        }
        if (array_key_exists('content', $validated)) {
            $page->content = $validated['content'];
        }
        if (array_key_exists('content_ar', $validated)) {
            $page->content_ar = $validated['content_ar'];
        }
        if (array_key_exists('meta_title', $validated)) {
            $page->meta_title = $validated['meta_title'];
        }
        if (array_key_exists('meta_description', $validated)) {
            $page->meta_description = $validated['meta_description'];
        }
        if (array_key_exists('status', $validated)) {
            $page->status = $validated['status'];
        }
        if (array_key_exists('show_in_footer', $validated)) {
            $page->show_in_footer = (bool) $validated['show_in_footer'];
        }
        if (array_key_exists('show_in_navbar', $validated)) {
            $page->show_in_navbar = (bool) $validated['show_in_navbar'];
        }
        if (array_key_exists('position', $validated)) {
            $page->position = (int) $validated['position'];
        }

        $page->save();

        return response()->json([
            'success' => true,
            'data' => $this->format($page),
        ]);
    }

    public function destroy(Page $page): JsonResponse
    {
        $page->delete();
        return response()->json(null, 204);
    }

    private function format(Page $page): array
    {
        return [
            'id' => $page->id,
            'title' => $page->title,
            'title_ar' => $page->title_ar,
            'slug' => $page->slug,
            'content' => $page->content,
            'content_ar' => $page->content_ar,
            'meta_title' => $page->meta_title,
            'meta_description' => $page->meta_description,
            'status' => $page->status,
            'show_in_footer' => $page->show_in_footer,
            'show_in_navbar' => $page->show_in_navbar,
            'position' => $page->position,
        ];
    }
}
