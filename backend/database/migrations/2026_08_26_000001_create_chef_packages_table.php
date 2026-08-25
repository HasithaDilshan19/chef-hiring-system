<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('chef_packages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('chef_id')->constrained('users')->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('price')->nullable();          // e.g. "From LKR 5,000"
            $table->unsignedInteger('guests_count')->default(1);
            $table->unsignedInteger('duration_hours')->default(2);
            $table->json('features')->nullable();         // array of feature strings
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('chef_packages');
    }
};
