<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\Shop\ProductController as ShopProductController;
use App\Http\Controllers\Api\Shop\PackBuilderController;
use App\Http\Controllers\Api\Shop\CityController as ShopCityController;
use App\Http\Controllers\Api\Shop\ShopSettingsController as ShopSettingsController;
use App\Http\Controllers\Api\Shop\CollectionController as ShopCollectionController;
use App\Http\Controllers\Api\User\OrderController as UserOrderController;
use App\Http\Controllers\Api\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Api\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Api\SuperAdmin\ProductController as SuperAdminProductController;
use App\Http\Controllers\Api\SuperAdmin\SettingController as SuperAdminSettingController;
use App\Http\Controllers\Api\SuperAdmin\CityController as SuperAdminCityController;
use App\Http\Controllers\Api\SuperAdmin\CarrierController as SuperAdminCarrierController;
use App\Http\Controllers\Api\SuperAdmin\UserController as SuperAdminUserController;
use App\Http\Controllers\Api\SuperAdmin\SlideController as SuperAdminSlideController;
use App\Http\Controllers\Api\SuperAdmin\MediaController as SuperAdminMediaController;
use App\Http\Controllers\Api\SuperAdmin\ProductImportController as SuperAdminProductImportController;
use App\Http\Controllers\Api\SlideController as PublicSlideController;
use App\Http\Controllers\Api\BannerController as PublicBannerController;
use App\Http\Controllers\Api\PageController as PublicPageController;
use App\Http\Controllers\Api\SuperAdmin\BannerController as SuperAdminBannerController;
use App\Http\Controllers\Api\SuperAdmin\PageController as SuperAdminPageController;
use App\Http\Controllers\Api\SuperAdmin\CollectionController as SuperAdminCollectionController;

Route::prefix('auth')->group(function () {
    Route::post('login', [AuthController::class, 'login']);
    Route::post('register', [AuthController::class, 'register']);
});

// Catalogue & shop public (sans auth)
Route::get('products', [ShopProductController::class, 'index']);
Route::get('products/{slug}', [ShopProductController::class, 'show']);
Route::get('cities', [ShopCityController::class, 'index']);
Route::get('settings/shop', [ShopSettingsController::class, 'index']);
Route::get('slides', [PublicSlideController::class, 'index']);
Route::post('slides/{slide}/view', [PublicSlideController::class, 'view']);
Route::post('slides/{slide}/click', [PublicSlideController::class, 'click']);
Route::get('banners', [PublicBannerController::class, 'index']);
Route::get('pages', [PublicPageController::class, 'index']);
Route::get('pages/{slug}', [PublicPageController::class, 'show']);
Route::get('collections', [ShopCollectionController::class, 'index']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('me', [AuthController::class, 'me']);
    Route::post('logout', [AuthController::class, 'logout']);

    Route::post('orders', [UserOrderController::class, 'store']);
    Route::get('orders', [UserOrderController::class, 'index']);
    Route::get('orders/{order}', [UserOrderController::class, 'show']);

    Route::prefix('shop')->group(function () {
        Route::get('products', [ShopProductController::class, 'index']);
        Route::get('products/{product}', [ShopProductController::class, 'show']);
        Route::get('cities', [ShopCityController::class, 'index']);
        Route::post('orders/preview-pack', [PackBuilderController::class, 'preview']);
    });

    Route::prefix('admin')->middleware('role:admin,superadmin')->group(function () {
        Route::get('orders', [AdminOrderController::class, 'index']);
        Route::get('orders/{order}', [AdminOrderController::class, 'show']);

        Route::get('products', [AdminProductController::class, 'index']);
        Route::post('products', [AdminProductController::class, 'store']);
        Route::get('products/{product}', [AdminProductController::class, 'show']);
        Route::put('products/{product}', [AdminProductController::class, 'update']);
        Route::delete('products/{product}', [AdminProductController::class, 'destroy']);
    });

    Route::prefix('super-admin')->middleware('role:superadmin')->group(function () {
        Route::get('products/import/template', [SuperAdminProductImportController::class, 'template']);
        Route::post('products/import/preview', [SuperAdminProductImportController::class, 'preview']);
        Route::post('products/import', [SuperAdminProductImportController::class, 'import']);

        Route::apiResource('products', SuperAdminProductController::class)->except(['create', 'edit']);
        Route::get('settings', [SuperAdminSettingController::class, 'index']);
        Route::put('settings', [SuperAdminSettingController::class, 'update']);

        Route::apiResource('cities', SuperAdminCityController::class)->except(['create', 'edit', 'show']);
        Route::apiResource('carriers', SuperAdminCarrierController::class)->except(['create', 'edit', 'show']);
        Route::apiResource('users', SuperAdminUserController::class)->except(['create', 'edit']);

        Route::put('slides/reorder', [SuperAdminSlideController::class, 'reorder']);
        Route::apiResource('slides', SuperAdminSlideController::class)->except(['create', 'edit', 'show']);

        Route::get('media', [SuperAdminMediaController::class, 'index']);
        Route::post('media/upload', [SuperAdminMediaController::class, 'upload']);
        Route::delete('media/{filename}', [SuperAdminMediaController::class, 'destroy']);

        Route::put('banners/reorder', [SuperAdminBannerController::class, 'reorder']);
        Route::apiResource('banners', SuperAdminBannerController::class)->except(['create', 'edit', 'show']);

        Route::apiResource('pages', SuperAdminPageController::class)->except(['create', 'edit']);
        Route::post('collections/reorder', [SuperAdminCollectionController::class, 'reorder']);
        Route::apiResource('collections', SuperAdminCollectionController::class);
    });
});
