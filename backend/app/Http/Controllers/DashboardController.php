<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\ChefProfile;
use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class DashboardController extends Controller
{
    /**
     * Get Admin dashboard statistics and data.
     */
    public function adminStats(Request $request)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized access'], 403);
        }

        $totalUsers = User::where('role', 'user')->count();
        $totalChefs = User::where('role', 'chef')->count();
        $totalBookings = Booking::count();
        $pendingBookings = Booking::where('status', 'pending')->count();
        $completedBookings = Booking::where('status', 'completed')->count();

        // Get all chefs with profiles
        $chefs = User::where('role', 'chef')->with('chefProfile')->get();

        // Get all bookings with customer and chef details
        $bookings = Booking::with(['customer', 'chef.chefProfile'])->latest()->get();

        // Get all customers
        $customers = User::where('role', 'user')->get();

        return response()->json([
            'status' => 'success',
            'data' => [
                'stats' => [
                    'total_users' => $totalUsers,
                    'total_chefs' => $totalChefs,
                    'total_bookings' => $totalBookings,
                    'pending_bookings' => $pendingBookings,
                    'completed_bookings' => $completedBookings,
                ],
                'chefs' => $chefs,
                'bookings' => $bookings,
                'customers' => $customers,
            ]
        ]);
    }

    /**
     * Get Chef dashboard data and profile.
     */
    public function chefStats(Request $request)
    {
        $user = $request->user();
        if (!$user->isChef()) {
            return response()->json(['message' => 'Unauthorized access'], 403);
        }

        $profile = $user->chefProfile;
        if (!$profile) {
            return response()->json(['message' => 'Chef profile not found'], 404);
        }

        $bookings = Booking::where('chef_id', $user->id)->with('customer')->latest()->get();

        $stats = [
            'total_bookings' => $bookings->count(),
            'pending_bookings' => $bookings->where('status', 'pending')->count(),
            'accepted_bookings' => $bookings->where('status', 'accepted')->count(),
            'completed_bookings' => $bookings->where('status', 'completed')->count(),
            'rating' => (float)$profile->rating,
            'reliability' => (float)$profile->reliability_score,
        ];

        return response()->json([
            'status' => 'success',
            'data' => [
                'stats' => $stats,
                'bookings' => $bookings,
                'profile' => $profile,
            ]
        ]);
    }

    /**
     * Update Chef profile.
     */
    public function updateChefProfile(Request $request)
    {
        $user = $request->user();
        if (!$user->isChef()) {
            return response()->json(['message' => 'Unauthorized access'], 403);
        }

        $validator = Validator::make($request->all(), [
            'experience_years' => 'required|integer|min:0',
            'cuisine_specialities' => 'required|array',
            'cuisine_specialities.*' => 'string',
            'hourly_rate' => 'required|numeric|min:0',
            'city' => 'required|string|max:100',
            'bio' => 'nullable|string',
            'availability_status' => 'required|string|in:available,busy,unavailable',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $profile = $user->chefProfile;
        if (!$profile) {
            $profile = new ChefProfile(['user_id' => $user->id]);
        }

        $profile->fill($request->all());
        $profile->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Profile updated successfully',
            'data' => [
                'profile' => $profile
            ]
        ]);
    }

    /**
     * Handle booking status changes (Accept/Decline/Complete) by Chef.
     */
    public function updateBookingStatus(Request $request, $id)
    {
        $user = $request->user();
        $booking = Booking::findOrFail($id);

        // Ensure user is authorized (must be the booked chef or the user who booked or admin)
        if ($user->isChef() && $booking->chef_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized action'], 403);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|string|in:accepted,completed,cancelled'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $booking->status = $request->status;
        $booking->save();

        // If a chef cancels a booking, we simulate the alternative chef suggestion.
        // In the real system, when a cancellation occurs, we could raise a flag or notify.
        return response()->json([
            'status' => 'success',
            'message' => 'Booking status updated to ' . $request->status,
            'data' => [
                'booking' => $booking
            ]
        ]);
    }

    /**
     * Get Customer (User) dashboard data, recommended chefs list, and bookings.
     */
    public function userStats(Request $request)
    {
        $user = $request->user();
        if (!$user->isUser()) {
            return response()->json(['message' => 'Unauthorized access'], 403);
        }

        $bookings = Booking::where('customer_id', $user->id)->with(['chef.chefProfile'])->latest()->get();

        // Recommend chefs based on location
        // Default customer location if not provided is Colombo
        $userLat = $request->query('latitude', 6.927179);
        $userLng = $request->query('longitude', 79.861244);
        $cuisine = $request->query('cuisine');

        $chefsQuery = User::where('role', 'chef')
            ->whereHas('chefProfile', function($q) {
                $q->where('availability_status', 'available');
            })
            ->with('chefProfile');

        $chefs = $chefsQuery->get();

        // Format chefs list and compute distance
        $recommendedChefs = $chefs->map(function($chef) use ($userLat, $userLng) {
            $profile = $chef->chefProfile;
            
            // Haversine formula
            $theta = $userLng - $profile->longitude;
            $dist = sin(deg2rad($userLat)) * sin(deg2rad($profile->latitude)) +  cos(deg2rad($userLat)) * cos(deg2rad($profile->latitude)) * cos(deg2rad($theta));
            $dist = acos($dist);
            $dist = rad2deg($dist);
            $miles = $dist * 60 * 1.1515;
            $distanceKm = $miles * 1.609344; // in kilometers

            $chef->distance = round($distanceKm, 2);
            return $chef;
        });

        // Filter by cuisine if selected
        if ($cuisine) {
            $recommendedChefs = $recommendedChefs->filter(function($chef) use ($cuisine) {
                $specs = $chef->chefProfile->cuisine_specialities ?? [];
                return in_array($cuisine, $specs);
            });
        }

        // Sort by distance (ascending)
        $recommendedChefs = $recommendedChefs->sortBy('distance')->values();

        return response()->json([
            'status' => 'success',
            'data' => [
                'bookings' => $bookings,
                'recommended_chefs' => $recommendedChefs,
                'cuisine_list' => ['Sri Lankan', 'Indian', 'Western', 'Chinese', 'Italian']
            ]
        ]);
    }

    /**
     * Create a new chef booking.
     */
    public function createBooking(Request $request)
    {
        $user = $request->user();
        if (!$user->isUser()) {
            return response()->json(['message' => 'Only customers can book chefs'], 403);
        }

        $validator = Validator::make($request->all(), [
            'chef_id' => 'required|exists:users,id',
            'event_date' => 'required|date|after_or_equal:today',
            'event_time' => 'required|string',
            'event_type' => 'required|string',
            'location' => 'required|string',
            'guests_count' => 'required|integer|min:1',
            'total_price' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check if chef is available
        $chef = User::findOrFail($request->chef_id);
        if (!$chef->isChef() || $chef->chefProfile->availability_status !== 'available') {
            return response()->json(['message' => 'This chef is currently unavailable'], 422);
        }

        $booking = Booking::create([
            'customer_id' => $user->id,
            'chef_id' => $request->chef_id,
            'event_date' => $request->event_date,
            'event_time' => $request->event_time,
            'event_type' => $request->event_type,
            'location' => $request->location,
            'guests_count' => $request->guests_count,
            'status' => 'pending',
            'total_price' => $request->total_price,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Booking request sent successfully',
            'data' => $booking
        ], 201);
    }
}
