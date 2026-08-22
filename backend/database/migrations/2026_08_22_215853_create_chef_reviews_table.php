<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('chef_reviews', function (Blueprint $table) {
            $table->id();

            // Customer who gives the review
            $table->foreignId('user_id')
                ->constrained('users')
                ->onDelete('cascade');

            // Chef being reviewed
            $table->foreignId('chef_id')
                ->constrained('users')
                ->onDelete('cascade');

            // Rating from 1 to 5
            $table->unsignedTinyInteger('rating');

            // Customer comment
            $table->text('comment')->nullable();

            $table->timestamps();

            // One customer can review a chef only once
            $table->unique(
                ['user_id', 'chef_id'],
                'unique_user_chef_review'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('chef_reviews');
    }
};