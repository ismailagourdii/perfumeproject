<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    /** @use HasFactory<\Database\Factories\OrderFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'city_id',
        'carrier_id',
        'status',
        'subtotal_mad',
        'shipping_fee_mad',
        'discount_mad',
        'total_mad',
        'receiver_name',
        'receiver_phone',
        'address_line1',
        'address_line2',
        'notes',
        'payment_method',
    ];

    protected function casts(): array
    {
        return [
            'subtotal_mad' => 'integer',
            'shipping_fee_mad' => 'integer',
            'discount_mad' => 'integer',
            'total_mad' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    public function carrier(): BelongsTo
    {
        return $this->belongsTo(Carrier::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
