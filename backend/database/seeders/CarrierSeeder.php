<?php

namespace Database\Seeders;

use App\Models\Carrier;
use Illuminate\Database\Seeder;

class CarrierSeeder extends Seeder
{
    public function run(): void
    {
        Carrier::firstOrCreate(
            ['name' => 'Amana'],
            ['base_fee_mad' => 0, 'is_active' => true]
        );
    }
}
