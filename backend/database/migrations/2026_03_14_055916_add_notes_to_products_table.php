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
            $table->json('notes')->nullable()->after('description_ar');
            if (!Schema::hasColumn('products', 'intensity')) {
                $table->string('intensity')->nullable()->after('notes_ar');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('notes');
            if (Schema::hasColumn('products', 'intensity')) {
                $table->dropColumn('intensity');
            }
        });
    }
};
