<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ChefProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'cuisine_specialities',
        'experience_years',
        'hourly_rate',
        'availability_status',
        'latitude',
        'longitude',
        'city',
        'rating',
        'reliability_score',
        'bio',
    ];

    protected $casts = [
        'cuisine_specialities' => 'array',
        'experience_years' => 'integer',
        'hourly_rate' => 'decimal:2',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'rating' => 'decimal:2',
        'reliability_score' => 'decimal:2',
    ];

    /**
     * Get the user that owns the chef profile.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
