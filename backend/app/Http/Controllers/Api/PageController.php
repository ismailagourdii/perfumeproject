<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Page;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PageController extends Controller
{
    /**
     * List pages (public). Optional filters: show_in_footer, show_in_navbar.
     * Only returns published pages.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Page::query()->where('status', 'published')->orderBy('position')->orderBy('id');

        if ($request->boolean('show_in_footer')) {
            $query->where('show_in_footer', true);
        }
        if ($request->boolean('show_in_navbar')) {
            $query->where('show_in_navbar', true);
        }

        $pages = $query->get()->map(fn (Page $p) => [
            'id' => $p->id,
            'title' => $p->title,
            'title_ar' => $p->title_ar,
            'slug' => $p->slug,
            'position' => $p->position,
        ]);

        return response()->json(['pages' => $pages]);
    }

    /**
     * Get a single page by slug (public). Only published.
     */
    public function show(string $slug): JsonResponse
    {
        $page = Page::query()->where('slug', $slug)->where('status', 'published')->first();

        if (!$page) {
            return response()->json(['message' => 'Page not found'], 404);
        }

        return response()->json([
            'page' => [
                'id' => $page->id,
                'title' => $page->title,
                'title_ar' => $page->title_ar,
                'slug' => $page->slug,
                'content' => $page->content,
                'content_ar' => $page->content_ar,
                'meta_title' => $page->meta_title,
                'meta_description' => $page->meta_description,
            ],
        ]);
    }
}
