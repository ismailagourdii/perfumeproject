<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Collection extends Model
{
    protected $fillable = [
        'key',
        'title_fr',
        'title_ar',
        'subtitle_fr',
        'subtitle_ar',
        'image',
        'link',
        'sort_order',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
            'is_active' => 'boolean',
        ];
    }
}
