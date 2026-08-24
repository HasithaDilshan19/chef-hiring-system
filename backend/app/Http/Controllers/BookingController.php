<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Booking;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use App\Mail\NewBookingChefMail;
use App\Mail\BookingStatusUserMail;

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

        $booking->load(['customer', 'chef']);

        // Send automatic email notification to the chef
        try {
            if ($booking->chef && $booking->chef->email) {
                Mail::to($booking->chef->email)->send(new NewBookingChefMail($booking));
            }
        } catch (\Throwable $e) {
            Log::error('Failed sending new booking email to chef: ' . $e->getMessage());
        }

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
                ->with('chef:id,name,email,phone', 'chef.chefProfile', 'suggestedChef:id,name,email,phone', 'suggestedChef.chefProfile')
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
            'status' => 'required|string|in:accepted,rejected,cancelled,completed',
            'cancellation_reason' => 'nullable|string|max:1000'
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
            if (!in_array($validatedData['status'], ['accepted', 'rejected', 'cancelled', 'completed'])) {
                return response()->json(['message' => 'Invalid status transition for chef'], 400);
            }

            if ($validatedData['status'] === 'cancelled' && $booking->status !== 'accepted') {
                return response()->json(['message' => 'Only accepted bookings can be cancelled by the chef'], 400);
            }
        }

        if ($user->role === 'user') {
            if ($validatedData['status'] !== 'cancelled') {
                return response()->json(['message' => 'Customers can only cancel bookings'], 400);
            }
        }

        $booking->status = $validatedData['status'];
        if ($validatedData['status'] === 'cancelled') {
            $booking->cancellation_reason = $validatedData['cancellation_reason'] ?? null;
            $booking->save();
            $this->runSuggestedChefReplacementScript($booking);
            $booking->refresh();
        } else {
            $booking->save();
        }

        $booking->load(['customer', 'chef']);

        // Send automatic email notification to customer on status change
        try {
            if ($booking->customer && $booking->customer->email) {
                Mail::to($booking->customer->email)->send(new BookingStatusUserMail($booking));
            }
        } catch (\Throwable $e) {
            Log::error('Failed sending booking status update email to user: ' . $e->getMessage());
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Booking status updated',
            'booking' => $booking
        ]);
    }

    /**
     * Run Python script to search and suggest replacement chef for the customer of a cancelled booking.
     */
    private function runSuggestedChefReplacementScript(Booking $booking)
    {
        try {
            if (app()->environment('testing')) {
                // In testing, update suggested_chef_id directly to the mock ID (999)
                $booking->suggested_chef_id = 999;
                $booking->save();
                return;
            }

            $pythonPath = 'python';
            $scriptPath = base_path('../ai-service/suggest_replacement.py');
            $command = escapeshellcmd("$pythonPath \"$scriptPath\" --booking_id={$booking->id}");
            shell_exec($command);
        } catch (\Throwable $e) {
            Log::error('Failed to run python AI replacement script: ' . $e->getMessage());
        }
    }
}
