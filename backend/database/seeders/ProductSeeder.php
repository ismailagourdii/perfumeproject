<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            [
                'name' => 'Atlas Oud', 'slug' => 'atlas-oud', 'description' => 'Oud profond et raffiné, inspiré des montagnes de l\'Atlas.',
                'category' => 'homme', 'size_ml' => '20', 'base_price_mad' => 290,
                'price_20ml' => 149, 'price_50ml' => 290, 'price_20ml_mad' => 149, 'price_50ml_mad' => 290,
                'intensity' => 'intense',
                'notes' => json_encode(['top' => ['Bergamote', 'Safran'], 'heart' => ['Oud', 'Rose'], 'base' => ['Ambre', 'Santal']]),
            ],
            [
                'name' => 'Marrakech Nuit', 'slug' => 'marrakech-nuit', 'description' => 'Oriental épicé aux accords mystérieux de la médina.',
                'category' => 'mixte', 'size_ml' => '20', 'base_price_mad' => 270,
                'price_20ml' => 139, 'price_50ml' => 270, 'price_20ml_mad' => 139, 'price_50ml_mad' => 270,
                'intensity' => 'modéré',
                'notes' => json_encode(['top' => ['Poivre noir', 'Cardamome'], 'heart' => ['Jasmin', 'Encens'], 'base' => ['Patchouli', 'Musc']]),
            ],
            [
                'name' => 'Casablanca Musc', 'slug' => 'casablanca-musc', 'description' => 'Musc lumineux et aérien, pour une élégance naturelle.',
                'category' => 'femme', 'size_ml' => '20', 'base_price_mad' => 230,
                'price_20ml' => 119, 'price_50ml' => 230, 'price_20ml_mad' => 119, 'price_50ml_mad' => 230,
                'intensity' => 'léger',
                'notes' => json_encode(['top' => ['Fleur d\'oranger', 'Poire'], 'heart' => ['Musc blanc', 'Iris'], 'base' => ['Cèdre', 'Vanille']]),
            ],
            [
                'name' => 'Sahara Rose', 'slug' => 'sahara-rose', 'description' => 'Rose veloutée du désert, douce et envoûtante.',
                'category' => 'femme', 'size_ml' => '20', 'base_price_mad' => 260,
                'price_20ml' => 129, 'price_50ml' => 260, 'price_20ml_mad' => 129, 'price_50ml_mad' => 260,
                'intensity' => 'modéré',
                'notes' => json_encode(['top' => ['Rose de Damas', 'Litchi'], 'heart' => ['Pivoine', 'Framboise'], 'base' => ['Oud blanc', 'Ambre']]),
            ],
        ];
        foreach ($products as $p) {
            Product::firstOrCreate(['slug' => $p['slug']], array_merge($p, ['is_active' => true]));
        }
    }
}
