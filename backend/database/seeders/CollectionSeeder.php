<?php

namespace Database\Seeders;

use App\Models\Collection;
use Illuminate\Database\Seeder;

class CollectionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Collection::updateOrCreate(
            ['key' => 'homme'],
            [
                'title_fr' => 'Homme',
                'title_ar' => 'رجال',
                'subtitle_fr' => 'Découvrez notre collection',
                'subtitle_ar' => 'اكتشف مجموعتنا',
                'image' => '',
                'link' => '/catalogue?gender=homme',
                'sort_order' => 1,
                'is_active' => true,
            ]
        );

        Collection::updateOrCreate(
            ['key' => 'femme'],
            [
                'title_fr' => 'Femme',
                'title_ar' => 'نساء',
                'subtitle_fr' => 'Découvrez notre collection',
                'subtitle_ar' => 'اكتشف مجموعتنا',
                'image' => '',
                'link' => '/catalogue?gender=femme',
                'sort_order' => 2,
                'is_active' => true,
            ]
        );
    }
}
