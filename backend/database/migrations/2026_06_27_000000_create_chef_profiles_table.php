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
        Schema::create('chef_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->onDelete('cascade');
            $table->json('cuisine_specialities')->nullable(); // e.g. ["Sri Lankan", "Indian"]
            $table->integer('experience_years')->default(0);
            $table->decimal('hourly_rate', 10, 2)->default(0.00);
            $table->string('availability_status')->default('available'); // available, busy, unavailable
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->string('city')->nullable();
            $table->decimal('rating', 3, 2)->default(5.00);
            $table->decimal('reliability_score', 5, 2)->default(100.00);
            $table->text('bio')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chef_profiles');
    }
};
