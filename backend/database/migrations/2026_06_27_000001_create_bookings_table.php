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
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('chef_id')->constrained('users')->onDelete('cascade');
            $table->date('event_date');
            $table->string('event_time')->nullable(); // e.g. "Dinner", "18:00"
            $table->string('event_type'); // e.g. Wedding, Funeral, Birthday, Family Gathering, Religious Function
            $table->string('location');
            $table->integer('guests_count')->default(1);
            $table->string('status')->default('pending'); // pending, accepted, completed, cancelled
            $table->decimal('total_price', 10, 2)->default(0.00);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
