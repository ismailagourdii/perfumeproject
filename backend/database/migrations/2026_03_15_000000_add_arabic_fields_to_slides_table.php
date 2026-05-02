<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('slides', function (Blueprint $table) {
            $table->string('title_ar')->nullable()->after('title');
            $table->text('subtitle_ar')->nullable()->after('subtitle');
            $table->string('button1_text_ar')->nullable()->after('button1_text');
            $table->string('button2_text_ar')->nullable()->after('button2_text');
            $table->string('badge_ar')->nullable()->after('badge_text');
        });
    }

    public function down(): void
    {
        Schema::table('slides', function (Blueprint $table) {
            $table->dropColumn(['title_ar', 'subtitle_ar', 'button1_text_ar', 'button2_text_ar', 'badge_ar']);
        });
    }
};
