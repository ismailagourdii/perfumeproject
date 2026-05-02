<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('slides', function (Blueprint $table) {
            $table->unsignedInteger('duration_ms')->default(5000)->after('is_active');
            $table->string('text_color', 20)->default('#ffffff')->after('duration_ms');
            $table->unsignedTinyInteger('overlay_opacity')->default(40)->after('text_color');
            $table->string('text_position', 20)->default('left')->after('overlay_opacity');
            $table->string('mobile_image_url')->nullable()->after('image_url');
            $table->string('badge_text')->nullable()->after('title');
            $table->string('button1_style', 20)->default('filled')->after('button2_link');
            $table->dateTime('active_from')->nullable()->after('is_active');
            $table->dateTime('active_until')->nullable()->after('active_from');
            $table->unsignedBigInteger('view_count')->default(0)->after('active_until');
            $table->unsignedBigInteger('click_count')->default(0)->after('view_count');
        });
    }

    public function down(): void
    {
        Schema::table('slides', function (Blueprint $table) {
            $table->dropColumn([
                'duration_ms',
                'text_color',
                'overlay_opacity',
                'text_position',
                'mobile_image_url',
                'badge_text',
                'button1_style',
                'active_from',
                'active_until',
                'view_count',
                'click_count',
            ]);
        });
    }
};
