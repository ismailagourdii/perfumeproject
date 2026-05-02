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
        Schema::create('pages', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('title_ar')->nullable();
            $table->string('slug')->unique();
            $table->longText('content')->nullable();
            $table->longText('content_ar')->nullable();
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->string('status', 20)->default('draft');
            $table->boolean('show_in_footer')->default(false);
            $table->boolean('show_in_navbar')->default(false);
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pages');
    }
};
