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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('city_id')->constrained()->cascadeOnDelete();
            $table->foreignId('carrier_id')->constrained()->cascadeOnDelete();
            $table->string('status')->default('pending');
            $table->unsignedInteger('subtotal_mad');
            $table->unsignedInteger('shipping_fee_mad')->default(0);
            $table->unsignedInteger('discount_mad')->default(0);
            $table->unsignedInteger('total_mad');
            $table->string('receiver_name');
            $table->string('receiver_phone');
            $table->string('address_line1');
            $table->string('address_line2')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
