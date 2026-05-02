<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Page extends Model
{
    protected $fillable = [
        'title',
        'title_ar',
        'slug',
        'content',
        'content_ar',
        'meta_title',
        'meta_description',
        'status',
        'show_in_footer',
        'show_in_navbar',
        'position',
    ];

    protected function casts(): array
    {
        return [
            'show_in_footer' => 'boolean',
            'show_in_navbar' => 'boolean',
            'position' => 'integer',
        ];
    }

    public static function makeSlugUnique(string $title, ?int $excludeId = null): string
    {
        $slug = Str::slug($title);
        $base = $slug;
        $n = 0;
        $query = static::query()->where('slug', $slug);
        if ($excludeId !== null) {
            $query->where('id', '!=', $excludeId);
        }
        while ($query->exists()) {
            $n++;
            $slug = $base . '-' . $n;
            $query = static::query()->where('slug', $slug);
            if ($excludeId !== null) {
                $query->where('id', '!=', $excludeId);
            }
        }
        return $slug;
    }
}
