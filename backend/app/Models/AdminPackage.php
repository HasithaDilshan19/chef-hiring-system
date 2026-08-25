<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class AdminPackage extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'eyebrow',
        'description',
        'price',
        'guests_count',
        'duration_hours',
        'features',
        'is_featured',
        'is_active',
    ];

    protected $casts = [
        'features'       => 'array',
        'guests_count'   => 'integer',
        'duration_hours' => 'integer',
        'is_featured'    => 'boolean',
        'is_active'      => 'boolean',
    ];
}
