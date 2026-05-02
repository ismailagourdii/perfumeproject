<?php

namespace App\Http\Controllers\Api\Shop;

use App\Http\Controllers\Controller;
use App\Models\City;
use Illuminate\Http\JsonResponse;

class CityController extends Controller
{
    /**
     * Liste des villes (pour livraison).
     */
    public function index(): JsonResponse
    {
        $cities = City::where('is_active', true)->orderBy('name')->get();
        $data = $cities->map(fn (City $c) => [
            'id' => $c->id,
            'name' => $c->name,
            'deliveryFee' => (float) $c->delivery_fee_mad,
        ]);
        return response()->json(['cities' => $data]);
    }
}
