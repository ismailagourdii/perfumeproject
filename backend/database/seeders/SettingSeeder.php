<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            ['group' => 'payment', 'key' => 'cod_enabled', 'value' => 'true', 'type' => 'string'],
            ['group' => 'payment', 'key' => 'virement_enabled', 'value' => 'true', 'type' => 'string'],
            ['group' => 'payment', 'key' => 'virement_bank_name', 'value' => 'Banque Populaire', 'type' => 'string'],
            ['group' => 'payment', 'key' => 'virement_iban', 'value' => '', 'type' => 'string'],
            ['group' => 'payment', 'key' => 'virement_rib', 'value' => '', 'type' => 'string'],
            ['group' => 'payment', 'key' => 'virement_account_holder', 'value' => 'SCENTARA', 'type' => 'string'],
        ];

        foreach ($settings as $s) {
            Setting::updateOrCreate(
                ['key' => $s['key']],
                ['group' => $s['group'], 'value' => $s['value'], 'type' => $s['type']]
            );
        }
    }
}
