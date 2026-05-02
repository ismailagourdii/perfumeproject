<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Carrier extends Model
{
    /** @use HasFactory<\Database\Factories\CarrierFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'base_fee_mad',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'base_fee_mad' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }
}
