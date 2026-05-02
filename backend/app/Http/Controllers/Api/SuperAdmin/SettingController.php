<?php

namespace App\Http\Controllers\Api\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    /**
     * Tous les réglages regroupés (pack, livraison, paiement, site).
     */
    public function index(): JsonResponse
    {
        return response()->json(['data' => $this->getSettingsData(), 'settings' => $this->getFlatSettings()]);
    }

    private function getFlatSettings(): array
    {
        $data = $this->getSettingsData();
        $flat = [];
        foreach ($data as $group) {
            if (is_array($group)) {
                foreach ($group as $k => $v) {
                    $flat[$k] = $v;
                }
            }
        }
        return $flat;
    }

    /**
     * Mise à jour en masse des réglages.
     */
    public function update(Request $request): JsonResponse
    {
        $payload = $request->validate([
            'packPricing' => 'nullable|array',
            'delivery' => 'nullable|array',
            'payment' => 'nullable|array',
            'site' => 'nullable|array',
            'footer' => 'nullable|array',
            'updates' => 'nullable|array',
            'updates.*.key' => 'required_with:updates|string',
            'updates.*.value' => 'nullable',
        ]);
        $map = [
            'packPricing' => 'pack_pricing',
            'delivery' => 'delivery',
            'payment' => 'payment',
            'site' => 'site',
            'footer' => 'footer',
        ];
        foreach ($payload as $groupKey => $pairs) {
            if ($groupKey === 'updates' || ! is_array($pairs)) {
                continue;
            }
            $group = $map[$groupKey] ?? $groupKey;
            foreach ($pairs as $key => $value) {
                Setting::updateOrCreate(
                    ['key' => $key],
                    ['group' => $group, 'value' => is_bool($value) ? ($value ? 'true' : 'false') : (string) $value, 'type' => 'string']
                );
            }
        }
        if (! empty($payload['updates'])) {
            $siteKeys = ['site_name', 'site_logo', 'site_logo_url', 'contact_email', 'contact_phone', 'contact_address', 'collection_homme_image', 'collection_femme_image'];
            $footerKeys = [
                'footer_description', 'footer_col1_title', 'footer_col1_links', 'footer_col2_title', 'footer_col2_links',
                'footer_col3_title', 'footer_col3_links', 'footer_newsletter_enabled',
                'footer_social_facebook', 'footer_social_instagram', 'footer_social_tiktok', 'footer_social_linkedin', 'footer_social_youtube',
                'footer_copyright',
            ];
            foreach ($payload['updates'] as $row) {
                $key = $row['key'] ?? null;
                $value = $row['value'] ?? null;
                if ($key !== null) {
                    $group = in_array($key, $footerKeys, true) ? 'footer' : (in_array($key, $siteKeys, true) ? 'site' : 'general');
                    Setting::updateOrCreate(
                        ['key' => $key],
                        ['group' => $group, 'value' => is_bool($value) ? ($value ? 'true' : 'false') : (string) $value, 'type' => 'string']
                    );
                }
            }
        }
        return response()->json(['data' => $this->getSettingsData(), 'settings' => $this->getFlatSettings()]);
    }

    private function getSettingsData(): array
    {
        $get = fn (string $key, $default = '') => Setting::getValue($key, (string) $default);
        return [
            'packPricing' => [
                'duo_20ml_price' => (float) $get('duo_20ml_price', 250),
                'duo_50ml_price' => (float) $get('duo_50ml_price', 450),
                'trio_20ml_price' => (float) $get('trio_20ml_price', 350),
                'trio_50ml_price' => (float) $get('trio_50ml_price', 620),
                'duo_discount_percent' => (float) $get('duo_discount_percent', 10),
                'trio_discount_percent' => (float) $get('trio_discount_percent', 15),
            ],
            'delivery' => [
                'free_delivery_threshold' => (float) $get('free_delivery_threshold', 500),
                'min_order_amount' => (float) $get('min_order_amount', 0),
            ],
            'payment' => [
                'cod_enabled' => $get('cod_enabled', 'true') === 'true',
                'virement_enabled' => $get('virement_enabled', 'true') === 'true',
                'virement_rib' => $get('virement_rib'),
                'virement_bank_name' => $get('virement_bank_name'),
                'virement_account_holder' => $get('virement_account_holder'),
            ],
            'site' => [
                'site_name' => $get('site_name', 'SCENTARA'),
                'site_logo' => $get('site_logo'),
                'site_logo_url' => $get('site_logo_url'),
                'contact_email' => $get('contact_email'),
                'contact_phone' => $get('contact_phone'),
                'contact_address' => $get('contact_address'),
                'collection_homme_image' => $get('collection_homme_image'),
                'collection_femme_image' => $get('collection_femme_image'),
            ],
            'footer' => [
                'footer_description' => $get('footer_description', 'Découvrez l\'art du parfum marocain.'),
                'footer_col1_title' => $get('footer_col1_title', 'ENTREPRISE'),
                'footer_col1_links' => $get('footer_col1_links', '[]'),
                'footer_col2_title' => $get('footer_col2_title', 'AIDE & SUPPORT'),
                'footer_col2_links' => $get('footer_col2_links', '[]'),
                'footer_col3_title' => $get('footer_col3_title', 'LIENS RAPIDES'),
                'footer_col3_links' => $get('footer_col3_links', '[]'),
                'footer_newsletter_enabled' => $get('footer_newsletter_enabled', 'true') === 'true',
                'footer_social_facebook' => $get('footer_social_facebook'),
                'footer_social_instagram' => $get('footer_social_instagram'),
                'footer_social_tiktok' => $get('footer_social_tiktok'),
                'footer_social_linkedin' => $get('footer_social_linkedin'),
                'footer_social_youtube' => $get('footer_social_youtube'),
                'footer_copyright' => $get('footer_copyright', '© 2025 SCENTARA. Tous droits réservés.'),
            ],
        ];
    }
}
