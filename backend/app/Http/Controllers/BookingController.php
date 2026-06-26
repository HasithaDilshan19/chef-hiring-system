<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Booking;
use App\Models\User;

class BookingController extends Controller
{
    /**
     * Create a new booking.
     */
    public function store(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'user') {
            return response()->json(['message' => 'Unauthorized. Only customers can make bookings.'], 403);
        }

        $validatedData = $request->validate([
            'chef_id' => 'required|exists:users,id',
            'event_date' => 'required|date|after_or_equal:today',
            'event_time' => 'required|string',
            'event_type' => 'required|string|max:255',
            'location' => 'required|string|max:500',
            'guests_count' => 'required|integer|min:1',
            'total_price' => 'nullable|numeric|min:0'
        ]);

        $chef = User::where('id', $validatedData['chef_id'])->where('role', 'chef')->first();

        if (!$chef) {
            return response()->json(['message' => 'Selected user is not a valid chef.'], 400);
        }

        $booking = new Booking($validatedData);
        $booking->customer_id = $user->id;
        $booking->status = 'pending';
        $booking->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Booking requested successfully',
            'booking' => $booking
        ], 201);
    }

    /**
     * Get bookings for the authenticated user (customer or chef).
     */
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'chef') {
            $bookings = Booking::where('chef_id', $user->id)
                ->with('customer:id,name,email,phone')
                ->orderBy('created_at', 'desc')
                ->get();
        } else if ($user->role === 'user') {
            $bookings = Booking::where('customer_id', $user->id)
                ->with('chef:id,name,email,phone', 'chef.chefProfile')
                ->orderBy('created_at', 'desc')
                ->get();
        } else {
            // Admin can see all bookings
            $bookings = Booking::with('customer', 'chef')->orderBy('created_at', 'desc')->get();
        }

        return response()->json([
            'status' => 'success',
            'bookings' => $bookings
        ]);
    }

    /**
     * Update the status of a booking.
     */
    public function updateStatus(Request $request, $id)
    {
        $user = $request->user();
        
        $validatedData = $request->validate([
            'status' => 'required|string|in:accepted,rejected,cancelled,completed'
        ]);

        $booking = Booking::find($id);

        if (!$booking) {
            return response()->json(['message' => 'Booking not found'], 404);
        }

        // Authorization checks
        if ($user->role === 'chef' && $booking->chef_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($user->role === 'user' && $booking->customer_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // State machine logic based on role
        if ($user->role === 'chef') {
            if (!in_array($validatedData['status'], ['accepted', 'rejected', 'completed'])) {
                return response()->json(['message' => 'Invalid status transition for chef'], 400);
            }
        }

        if ($user->role === 'user') {
            if ($validatedData['status'] !== 'cancelled') {
                return response()->json(['message' => 'Customers can only cancel bookings'], 400);
            }
        }

        $booking->status = $validatedData['status'];
        $booking->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Booking status updated',
            'booking' => $booking
        ]);
    }
}
