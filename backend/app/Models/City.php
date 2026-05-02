<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;

class City extends Model
{
    /** @use HasFactory<\Database\Factories\CityFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'delivery_fee_mad',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'delivery_fee_mad' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }
}
