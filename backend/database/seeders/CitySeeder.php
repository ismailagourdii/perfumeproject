<?php

namespace Database\Seeders;

use App\Models\City;
use Illuminate\Database\Seeder;

class CitySeeder extends Seeder
{
    public function run(): void
    {
        $cities = [
            ['name' => 'Casablanca', 'delivery_fee_mad' => 30],
            ['name' => 'Rabat', 'delivery_fee_mad' => 35],
            ['name' => 'Marrakech', 'delivery_fee_mad' => 45],
            ['name' => 'Fès', 'delivery_fee_mad' => 45],
            ['name' => 'Tanger', 'delivery_fee_mad' => 45],
            ['name' => 'Agadir', 'delivery_fee_mad' => 50],
        ];

        foreach ($cities as $data) {
            City::updateOrCreate(
                ['name' => $data['name']],
                [
                    'delivery_fee_mad' => $data['delivery_fee_mad'],
                    'is_active' => true,
                ],
            );
        }
    }
}
