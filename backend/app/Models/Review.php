<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use HasFactory;

    protected $table = 'chef_reviews';

    protected $fillable = [
        'chef_id',
        'user_id',
        'rating',
        'comment',
    ];

    protected $casts = [
        'rating' => 'integer',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function chef()
    {
        return $this->belongsTo(User::class, 'chef_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}