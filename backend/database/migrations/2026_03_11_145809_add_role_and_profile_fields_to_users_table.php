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
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'role')) {
                $table->string('role')->default('user')->after('password');
            }

            if (!Schema::hasColumn('users', 'phone')) {
                $table->string('phone')->nullable()->after('role');
            }

            if (!Schema::hasColumn('users', 'avatar_path')) {
                $table->string('avatar_path')->nullable()->after('phone');
            }

            if (!Schema::hasColumn('users', 'deleted_at')) {
                $table->softDeletes();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'role')) {
                $table->dropColumn('role');
            }
            if (Schema::hasColumn('users', 'phone')) {
                $table->dropColumn('phone');
            }
            if (Schema::hasColumn('users', 'avatar_path')) {
                $table->dropColumn('avatar_path');
            }
            if (Schema::hasColumn('users', 'deleted_at')) {
                $table->dropSoftDeletes();
            }
        });
    }
};
