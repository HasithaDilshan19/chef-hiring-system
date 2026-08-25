<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('admin_packages', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('eyebrow')->nullable();        // e.g. "For intimate evenings"
            $table->text('description')->nullable();
            $table->string('price')->nullable();          // e.g. "From LKR 5,000"
            $table->unsignedInteger('guests_count')->default(4);
            $table->unsignedInteger('duration_hours')->default(3);
            $table->json('features')->nullable();         // array of feature strings
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('admin_packages');
    }
};
