<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Mail;
use App\Mail\BookingStatusUserMail;
use Tests\TestCase;

class BookingCancellationTest extends TestCase
{
    use DatabaseTransactions;

    public function test_chef_can_cancel_accepted_booking(): void
    {
        Mail::fake();
        \Illuminate\Support\Facades\Http::fake([
            'http://127.0.0.1:5000/recommend' => \Illuminate\Support\Facades\Http::response([
                'success' => true,
                'recommendations' => [
                    [
                        'chef_id' => 999,
                        'name' => 'Replacement Chef',
                        'score' => 95.0,
                    ]
                ]
            ], 200),
        ]);

        // Create a customer
        $customer = User::factory()->create([
            'role' => 'user',
            'status' => 'active',
            'city' => 'Colombo',
        ]);

        // Create a chef
        $chef = User::factory()->create([
            'role' => 'chef',
            'status' => 'active',
        ]);

        // Create an available replacement chef
        $suggestedChef = User::factory()->create([
            'id' => 999,
            'role' => 'chef',
            'status' => 'active',
        ]);
        \App\Models\ChefProfile::create([
            'user_id' => $suggestedChef->id,
            'experience_years' => 5,
            'cuisine_specialities' => ['Indian'],
            'hourly_rate' => 3000,
            'availability_status' => 'available',
            'city' => 'Colombo',
        ]);

        // Create an accepted booking
        $booking = Booking::create([
            'customer_id' => $customer->id,
            'chef_id' => $chef->id,
            'event_date' => now()->addDays(2)->format('Y-m-d'),
            'event_time' => '18:00',
            'event_type' => 'Dinner Party',
            'location' => 'Colombo, Sri Lanka',
            'guests_count' => 10,
            'status' => 'accepted',
            'total_price' => 15000.00,
        ]);

        // Call the endpoint to cancel the booking
        $response = $this->actingAs($chef)
            ->putJson("/api/bookings/{$booking->id}/status", [
                'status' => 'cancelled',
                'cancellation_reason' => 'Emergency family matter',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'booking' => [
                    'id' => $booking->id,
                    'status' => 'cancelled',
                    'cancellation_reason' => 'Emergency family matter',
                    'suggested_chef_id' => 999,
                ]
            ]);

        // Verify state in database
        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => 'cancelled',
            'cancellation_reason' => 'Emergency family matter',
            'suggested_chef_id' => 999,
        ]);

        // Verify that the email was sent
        Mail::assertSent(BookingStatusUserMail::class, function ($mail) use ($customer, $booking) {
            return $mail->hasTo($customer->email) && 
                   $mail->booking->id === $booking->id &&
                   $mail->booking->cancellation_reason === 'Emergency family matter' &&
                   $mail->booking->suggested_chef_id === 999;
        });
    }

    public function test_chef_cannot_cancel_pending_booking(): void
    {
        // Create a customer
        $customer = User::factory()->create([
            'role' => 'user',
            'status' => 'active',
        ]);

        // Create a chef
        $chef = User::factory()->create([
            'role' => 'chef',
            'status' => 'active',
        ]);

        // Create a pending booking
        $booking = Booking::create([
            'customer_id' => $customer->id,
            'chef_id' => $chef->id,
            'event_date' => now()->addDays(2)->format('Y-m-d'),
            'event_time' => '18:00',
            'event_type' => 'Dinner Party',
            'location' => 'Colombo, Sri Lanka',
            'guests_count' => 10,
            'status' => 'pending',
            'total_price' => 15000.00,
        ]);

        // Call the endpoint to cancel the booking (which is not accepted yet)
        $response = $this->actingAs($chef)
            ->putJson("/api/bookings/{$booking->id}/status", [
                'status' => 'cancelled',
            ]);

        $response->assertStatus(400)
            ->assertJson([
                'message' => 'Only accepted bookings can be cancelled by the chef',
            ]);

        // Verify state in database remains pending
        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => 'pending',
        ]);
    }
}
