<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Slide extends Model
{
    protected $fillable = [
        'title',
        'title_ar',
        'subtitle',
        'subtitle_ar',
        'badge_text',
        'badge_ar',
        'button1_text',
        'button1_text_ar',
        'button1_link',
        'button2_text',
        'button2_text_ar',
        'button2_link',
        'button1_style',
        'image_url',
        'mobile_image_url',
        'position',
        'is_active',
        'duration_ms',
        'text_color',
        'overlay_opacity',
        'text_position',
        'active_from',
        'active_until',
        'view_count',
        'click_count',
    ];

    protected function casts(): array
    {
        return [
            'position' => 'integer',
            'is_active' => 'boolean',
            'duration_ms' => 'integer',
            'overlay_opacity' => 'integer',
            'view_count' => 'integer',
            'click_count' => 'integer',
            'active_from' => 'datetime',
            'active_until' => 'datetime',
        ];
    }
}
