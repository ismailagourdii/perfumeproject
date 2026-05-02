<?php

namespace App\Http\Controllers\Api\Shop;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ShopSettingsController extends Controller
{
    /**
     * Configuration boutique (checkout): moyens de paiement + infos virement.
     */
    public function index(Request $request): JsonResponse
    {
        $cod = Setting::getValue('cod_enabled', 'true') === 'true';
        $virement = Setting::getValue('virement_enabled', 'true') === 'true';

        $methods = [];
        if ($cod) {
            $methods[] = ['code' => 'cod', 'label' => 'Paiement à la livraison', 'description' => 'Payez en espèces à la livraison.'];
        }
        if ($virement) {
            $methods[] = ['code' => 'virement', 'label' => 'Virement bancaire', 'description' => 'Virement vers notre RIB.'];
        }

        $bankDetails = null;
        if ($virement) {
            $bankDetails = [
                'bankName' => Setting::getValue('virement_bank_name', ''),
                'iban' => Setting::getValue('virement_iban', ''),
                'rib' => Setting::getValue('virement_rib', ''),
                'holder' => Setting::getValue('virement_account_holder', ''),
            ];
        }

        $siteLogo = Setting::getValue('site_logo', '');
        $collectionHommeImage = Setting::getValue('collection_homme_image', '');
        $collectionFemmeImage = Setting::getValue('collection_femme_image', '');
        if (is_string($siteLogo) && $siteLogo !== '') {
            $currentOrigin = $request->getSchemeAndHttpHost();
            $siteLogo = preg_replace('#^https?://localhost:8002#', $currentOrigin, $siteLogo) ?? $siteLogo;
            $siteLogo = preg_replace('#^https?://127\.0\.0\.1:8002#', $currentOrigin, $siteLogo) ?? $siteLogo;
        }
        if (is_string($collectionHommeImage) && $collectionHommeImage !== '') {
            $currentOrigin = $request->getSchemeAndHttpHost();
            $collectionHommeImage = preg_replace('#^https?://localhost:8002#', $currentOrigin, $collectionHommeImage) ?? $collectionHommeImage;
            $collectionHommeImage = preg_replace('#^https?://127\.0\.0\.1:8002#', $currentOrigin, $collectionHommeImage) ?? $collectionHommeImage;
        }
        if (is_string($collectionFemmeImage) && $collectionFemmeImage !== '') {
            $currentOrigin = $request->getSchemeAndHttpHost();
            $collectionFemmeImage = preg_replace('#^https?://localhost:8002#', $currentOrigin, $collectionFemmeImage) ?? $collectionFemmeImage;
            $collectionFemmeImage = preg_replace('#^https?://127\.0\.0\.1:8002#', $currentOrigin, $collectionFemmeImage) ?? $collectionFemmeImage;
        }

        $duo20mlPrice = (float) Setting::getValue('duo_20ml_price', 199);
        $duo50mlPrice = (float) Setting::getValue('duo_50ml_price', 350);
        $trio20mlPrice = (float) Setting::getValue('trio_20ml_price', 279);
        $trio50mlPrice = (float) Setting::getValue('trio_50ml_price', 499);
        $duoDiscountPercent = (float) Setting::getValue('duo_discount_percent', 10);
        $trioDiscountPercent = (float) Setting::getValue('trio_discount_percent', 15);

        $footerDescription = Setting::getValue('footer_description', '');
        $footerCol1Title = Setting::getValue('footer_col1_title', '');
        $footerCol1Links = Setting::getValue('footer_col1_links', '[]');
        $footerCol2Title = Setting::getValue('footer_col2_title', '');
        $footerCol2Links = Setting::getValue('footer_col2_links', '[]');
        $footerCol3Title = Setting::getValue('footer_col3_title', '');
        $footerCol3Links = Setting::getValue('footer_col3_links', '[]');
        $footerNewsletterEnabled = Setting::getValue('footer_newsletter_enabled', 'true') === 'true';
        $footerSocialFacebook = Setting::getValue('footer_social_facebook', '');
        $footerSocialInstagram = Setting::getValue('footer_social_instagram', '');
        $footerSocialTiktok = Setting::getValue('footer_social_tiktok', '');
        $footerSocialLinkedin = Setting::getValue('footer_social_linkedin', '');
        $footerSocialYoutube = Setting::getValue('footer_social_youtube', '');
        $footerCopyright = Setting::getValue('footer_copyright', '');

        if (is_string($footerCol1Links)) {
            $footerCol1Links = json_decode($footerCol1Links, true) ?: [];
        }
        if (is_string($footerCol2Links)) {
            $footerCol2Links = json_decode($footerCol2Links, true) ?: [];
        }
        if (is_string($footerCol3Links)) {
            $footerCol3Links = json_decode($footerCol3Links, true) ?: [];
        }

        return response()->json([
            'settings' => [
                'paymentMethods' => $methods,
                'bankDetails' => $bankDetails,
                'site_logo' => $siteLogo ?: null,
                'collection_homme_image' => (is_string($collectionHommeImage) && $collectionHommeImage !== '') ? $collectionHommeImage : null,
                'collection_femme_image' => (is_string($collectionFemmeImage) && $collectionFemmeImage !== '') ? $collectionFemmeImage : null,
                'duo_20ml_price' => $duo20mlPrice,
                'duo_50ml_price' => $duo50mlPrice,
                'trio_20ml_price' => $trio20mlPrice,
                'trio_50ml_price' => $trio50mlPrice,
                'duo_discount_percent' => $duoDiscountPercent,
                'trio_discount_percent' => $trioDiscountPercent,
                'footer_description' => $footerDescription,
                'footer_col1_title' => $footerCol1Title,
                'footer_col1_links' => $footerCol1Links,
                'footer_col2_title' => $footerCol2Title,
                'footer_col2_links' => $footerCol2Links,
                'footer_col3_title' => $footerCol3Title,
                'footer_col3_links' => $footerCol3Links,
                'footer_newsletter_enabled' => $footerNewsletterEnabled,
                'footer_social_facebook' => $footerSocialFacebook ?: null,
                'footer_social_instagram' => $footerSocialInstagram ?: null,
                'footer_social_tiktok' => $footerSocialTiktok ?: null,
                'footer_social_linkedin' => $footerSocialLinkedin ?: null,
                'footer_social_youtube' => $footerSocialYoutube ?: null,
                'footer_copyright' => $footerCopyright,
            ],
        ]);
    }
}
