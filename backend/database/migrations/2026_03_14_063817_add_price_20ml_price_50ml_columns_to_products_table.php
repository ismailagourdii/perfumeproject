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
        if (! Schema::hasColumn('products', 'price_20ml')) {
            Schema::table('products', function (Blueprint $table) {
                $table->decimal('price_20ml', 10, 2)->default(0)->after('base_price_mad');
            });
        }
        if (! Schema::hasColumn('products', 'price_50ml')) {
            Schema::table('products', function (Blueprint $table) {
                $table->decimal('price_50ml', 10, 2)->default(0)->after('price_20ml');
            });
        }

        $hasMad = Schema::hasColumn('products', 'price_20ml_mad');
        foreach (\DB::table('products')->get() as $row) {
            $p20 = $hasMad && $row->price_20ml_mad !== null ? (float) $row->price_20ml_mad : (float) ($row->base_price_mad ?? 0);
            $p50 = $hasMad && $row->price_50ml_mad !== null ? (float) $row->price_50ml_mad : (float) ($row->base_price_mad ?? 0);
            \DB::table('products')->where('id', $row->id)->update(['price_20ml' => $p20, 'price_50ml' => $p50]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            if (Schema::hasColumn('products', 'price_20ml')) {
                $table->dropColumn('price_20ml');
            }
            if (Schema::hasColumn('products', 'price_50ml')) {
                $table->dropColumn('price_50ml');
            }
        });
    }
};
