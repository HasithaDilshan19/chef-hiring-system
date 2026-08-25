<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ChefPackage extends Model
{
    use HasFactory;

    protected $fillable = [
        'chef_id',
        'name',
        'description',
        'price',
        'guests_count',
        'duration_hours',
        'features',
    ];

    protected $casts = [
        'features'       => 'array',
        'guests_count'   => 'integer',
        'duration_hours' => 'integer',
    ];

    public function chef(): BelongsTo
    {
        return $this->belongsTo(User::class, 'chef_id');
    }
}
