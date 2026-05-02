<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;

class Setting extends Model
{
    /** @use HasFactory<\Database\Factories\SettingFactory> */
    use HasFactory;

    protected $fillable = [
        'group',
        'key',
        'value',
        'type',
        'label',
    ];

    protected function casts(): array
    {
        return [
            'value' => 'string',
        ];
    }

    public static function getValue(string $key, ?string $default = null): ?string
    {
        return static::query()->where('key', $key)->value('value') ?? $default;
    }
}
