<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'chef_id',
        'event_date',
        'event_time',
        'event_type',
        'location',
        'guests_count',
        'status',
        'total_price',
    ];

    protected $casts = [
        'event_date' => 'date',
        'guests_count' => 'integer',
        'total_price' => 'decimal:2',
    ];

    /**
     * Get the customer (user) who made the booking.
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    /**
     * Get the chef (user) who was booked.
     */
    public function chef(): BelongsTo
    {
        return $this->belongsTo(User::class, 'chef_id');
    }
}
