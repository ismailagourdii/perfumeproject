<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->unsignedInteger('price_20ml_mad')->nullable()->after('base_price_mad');
            $table->unsignedInteger('price_50ml_mad')->nullable()->after('price_20ml_mad');
        });

        \DB::table('products')->update([
            'price_20ml_mad' => \DB::raw('base_price_mad'),
            'price_50ml_mad' => \DB::raw('base_price_mad'),
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['price_20ml_mad', 'price_50ml_mad']);
        });
    }
};
