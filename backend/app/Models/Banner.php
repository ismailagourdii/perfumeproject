<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Banner extends Model
{
    protected $fillable = [
        'title',
        'title_ar',
        'image_url',
        'link',
        'position',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'position' => 'integer',
            'is_active' => 'boolean',
        ];
    }
}
