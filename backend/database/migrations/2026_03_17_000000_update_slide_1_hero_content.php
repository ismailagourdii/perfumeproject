<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('slides')->where('id', 1)->update([
            'title' => "L'Art du Parfum Marocain",
            'title_ar' => 'فن العطر المغربي',
            'subtitle' => "Découvrez notre collection exclusive de parfums d'exception.",
            'subtitle_ar' => 'اكتشف مجموعتنا الحصرية من العطور الاستثنائية',
            'button1_text' => 'Découvrir',
            'button1_link' => '/catalogue',
            'button1_text_ar' => 'اكتشف',
            'button2_text' => 'Composer mon pack',
            'button2_link' => '/pack-builder',
            'button2_text_ar' => 'ركّب طقمك',
            'badge_text' => 'NOUVEAUTÉ • EXCLUSIF',
            'badge_ar' => 'حصري • جديد',
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        // no-op: previous content was test data
    }
};
