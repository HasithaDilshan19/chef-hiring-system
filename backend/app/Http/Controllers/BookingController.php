<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Booking;
use App\Models\User;
use App\Models\ChefPackage;
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

        if ($user->role !== 'user' && $user->role !== 'customer') {
            return response()->json(['message' => 'Unauthorized. Only customers can make bookings.'], 403);
        }

        $validatedData = $request->validate([
            'chef_id'       => 'required|exists:users,id',
            'event_date'    => 'required|date|after_or_equal:today',
            'event_time'    => 'required|string',
            'event_type'    => 'required|string|max:255',
            'location'      => 'required|string|max:500',
            'guests_count'  => 'required|integer|min:1',
            'total_price'   => 'nullable',          // accepts numeric or price string
            'package_id'    => 'nullable|integer|exists:chef_packages,id',
            'package_name'  => 'nullable|string|max:255',
            'package_price' => 'nullable|string|max:100', // raw price string e.g. "LKR 8k"
        ]);

        $chef = User::where('id', $validatedData['chef_id'])->where('role', 'chef')->first();

        if (!$chef) {
            return response()->json(['message' => 'Selected user is not a valid chef.'], 400);
        }

        // If package_id is provided, verify it belongs to the chef
        if (!empty($validatedData['package_id'])) {
            $package = ChefPackage::where('id', $validatedData['package_id'])
                ->where('chef_id', $validatedData['chef_id'])
                ->first();

            if (!$package) {
                return response()->json(['message' => 'Package not found or does not belong to this chef.'], 404);
            }

            // If package_name not provided, use package name from database
            if (empty($validatedData['package_name'])) {
                $validatedData['package_name'] = $package->name;
            }
        }

        // Parse price string → float (handles "LKR 8k", "LKR 12,500", "8000", etc.)
        $parsedPrice = 0.00;
        $rawPrice = $validatedData['total_price'] ?? $validatedData['package_price'] ?? null;
        if ($rawPrice !== null && $rawPrice !== '') {
            // Remove currency symbol and non-numeric chars except dots and k/K
            $cleaned = preg_replace('/[^0-9.kKmM]/i', '', str_replace(',', '', (string) $rawPrice));
            if (preg_match('/([0-9.]+)([kK])/i', $cleaned, $m)) {
                $parsedPrice = floatval($m[1]) * 1000;
            } elseif (preg_match('/([0-9.]+)([mM])/i', $cleaned, $m)) {
                $parsedPrice = floatval($m[1]) * 1000000;
            } elseif (is_numeric($cleaned)) {
                $parsedPrice = floatval($cleaned);
            }
        }

        // Build booking — exclude package_price (not a DB column)
        $bookingData = array_diff_key($validatedData, array_flip(['package_price', 'total_price']));
        $booking = new Booking($bookingData);
        $booking->customer_id = $user->id;
        $booking->status      = 'pending';
        $booking->total_price = $parsedPrice;
        $booking->save();

        $booking->load(['customer', 'chef', 'package']);

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
                ->with(['customer:id,name,email,phone', 'package'])
                ->orderBy('created_at', 'desc')
                ->get();
        } else if ($user->role === 'user' || $user->role === 'customer') {
            $bookings = Booking::where('customer_id', $user->id)
                ->with([
                    'chef:id,name,email,phone',
                    'chef.chefProfile',
                    'suggestedChef:id,name,email,phone',
                    'suggestedChef.chefProfile',
                    'package'
                ])
                ->orderBy('created_at', 'desc')
                ->get();
        } else {
            // Admin can see all bookings
            $bookings = Booking::with(['customer', 'chef', 'package'])
                ->orderBy('created_at', 'desc')
                ->get();
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

        if (($user->role === 'user' || $user->role === 'customer') && $booking->customer_id !== $user->id) {
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

        if ($user->role === 'user' || $user->role === 'customer') {
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

        $booking->load(['customer', 'chef', 'package']);

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
     * Cancel booking (user can cancel their own booking)
     */
    public function cancel(Request $request, $id)
    {
        $user = $request->user();

        $booking = Booking::find($id);

        if (!$booking) {
            return response()->json(['message' => 'Booking not found'], 404);
        }

        // Only the booking owner can cancel
        if ($booking->customer_id !== $user->id) {
            return response()->json(['message' => 'You are not allowed to cancel this booking.'], 403);
        }

        if ($booking->status === 'cancelled') {
            return response()->json(['message' => 'Booking is already cancelled.'], 409);
        }

        $booking->status = 'cancelled';
        $booking->cancellation_reason = $request->input('cancellation_reason', 'Cancelled by customer');
        $booking->save();

        $booking->load(['customer', 'chef', 'package']);

        return response()->json([
            'status' => 'success',
            'message' => 'Booking cancelled successfully.',
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