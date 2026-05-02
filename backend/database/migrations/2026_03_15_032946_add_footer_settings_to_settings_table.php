<?php

use App\Models\Setting;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('settings', 'label')) {
            Schema::table('settings', function (Blueprint $table) {
                $table->string('label')->nullable()->after('type');
            });
        }

        $footerSettings = [
            ['key' => 'footer_description', 'value' => "Découvrez l'art du parfum marocain.", 'group' => 'footer', 'label' => 'Description'],
            ['key' => 'footer_col1_title', 'value' => 'ENTREPRISE', 'group' => 'footer', 'label' => 'Colonne 1 titre'],
            ['key' => 'footer_col1_links', 'value' => '[{"label":"À propos","url":"/about"},{"label":"Contact","url":"/contact"},{"label":"Packs","url":"/pack-builder"}]', 'group' => 'footer', 'label' => 'Colonne 1 liens'],
            ['key' => 'footer_col2_title', 'value' => 'AIDE & SUPPORT', 'group' => 'footer', 'label' => 'Colonne 2 titre'],
            ['key' => 'footer_col2_links', 'value' => '[{"label":"Livraison","url":"/livraison"},{"label":"FAQ","url":"/faq"}]', 'group' => 'footer', 'label' => 'Colonne 2 liens'],
            ['key' => 'footer_col3_title', 'value' => 'LIENS RAPIDES', 'group' => 'footer', 'label' => 'Colonne 3 titre'],
            ['key' => 'footer_col3_links', 'value' => '[{"label":"Catalogue","url":"/catalogue"},{"label":"Panier","url":"/cart"},{"label":"Connexion","url":"/login"}]', 'group' => 'footer', 'label' => 'Colonne 3 liens'],
            ['key' => 'footer_newsletter_enabled', 'value' => 'true', 'group' => 'footer', 'label' => 'Newsletter activée'],
            ['key' => 'footer_social_facebook', 'value' => '', 'group' => 'footer', 'label' => 'Facebook URL'],
            ['key' => 'footer_social_instagram', 'value' => '', 'group' => 'footer', 'label' => 'Instagram URL'],
            ['key' => 'footer_social_tiktok', 'value' => '', 'group' => 'footer', 'label' => 'TikTok URL'],
            ['key' => 'footer_social_linkedin', 'value' => '', 'group' => 'footer', 'label' => 'LinkedIn URL'],
            ['key' => 'footer_copyright', 'value' => '© 2025 SCENTARA. Tous droits réservés.', 'group' => 'footer', 'label' => 'Copyright'],
        ];

        Setting::where('key', 'footer_description')->update(['value' => "Découvrez l'art du parfum marocain."]);

        foreach ($footerSettings as $row) {
            Setting::firstOrCreate(
                ['key' => $row['key']],
                ['value' => $row['value'], 'group' => $row['group'], 'label' => $row['label'] ?? null, 'type' => 'string']
            );
        }
    }

    public function down(): void
    {
        Setting::where('group', 'footer')->delete();
        if (Schema::hasColumn('settings', 'label')) {
            Schema::table('settings', function (Blueprint $table) {
                $table->dropColumn('label');
            });
        }
    }
};
