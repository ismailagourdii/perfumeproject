<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    /** @use HasFactory<\Database\Factories\ProductFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'name_ar',
        'slug',
        'description',
        'description_ar',
        'notes',
        'notes_ar',
        'intensity',
        'intensity_ar',
        'category',
        'size_ml',
        'base_price_mad',
        'price_20ml_mad',
        'price_50ml_mad',
        'price_20ml',
        'price_50ml',
        'image_path',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'notes' => 'array',
            'notes_ar' => 'array',
            'price_20ml' => 'float',
            'price_50ml' => 'float',
        ];
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }
}
