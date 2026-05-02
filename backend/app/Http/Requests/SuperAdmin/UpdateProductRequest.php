<?php

namespace App\Http\Requests\SuperAdmin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $productId = $this->route('product')?->id;

        return [
            'name' => ['required', 'string', 'max:255'],
            'name_ar' => ['nullable', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:products,slug,' . ($productId ?? 'NULL')],
            'category' => ['nullable', 'string', 'max:50'],
            'description' => ['nullable', 'string'],
            'description_ar' => ['nullable', 'string'],
            'notes_ar' => ['nullable'],
            'intensity_ar' => ['nullable', 'string', 'max:100'],
            'price_20ml' => ['nullable', 'numeric', 'min:0'],
            'price_50ml' => ['nullable', 'numeric', 'min:0'],
            'price20ml' => ['nullable', 'numeric', 'min:0'],
            'price50ml' => ['nullable', 'numeric', 'min:0'],
            'stock_20ml' => ['nullable', 'integer', 'min:0'],
            'stock_50ml' => ['nullable', 'integer', 'min:0'],
            'notes' => ['nullable'],
            'intensity' => ['nullable', 'string', 'max:50'],
            'active' => ['nullable', 'boolean'],
            'image' => ['nullable', 'image', 'max:2048'],
        ];
    }
}
