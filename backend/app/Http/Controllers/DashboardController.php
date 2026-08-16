<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\ChefProfile;
use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use App\Mail\NewBookingChefMail;
use App\Mail\BookingStatusUserMail;
use Illuminate\Support\Facades\Http;

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
        $totalChefs = User::where('role', 'chef')->where('status', 'active')->count();
        $totalBookings = Booking::count();
        $pendingBookings = Booking::where('status', 'pending')->count();
        $completedBookings = Booking::where('status', 'completed')->count();

        // Get all chefs with profiles
        $chefs = User::where('role', 'chef')->where('status', 'active')->with('chefProfile')->get();
        
        // Get all pending chefs
        $pendingChefs = User::where('role', 'chef')->where('status', 'pending')->with('chefProfile')->get();

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
                    'pending_chef_requests' => $pendingChefs->count(),
                ],
                'chefs' => $chefs,
                'pending_chefs' => $pendingChefs,
                'bookings' => $bookings,
                'customers' => $customers,
            ]
        ]);
    }

    /**
     * Update a Chef's Registration Status (Admin)
     */
    public function updateChefStatus(Request $request, $id)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized access'], 403);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|string|in:active,rejected' // using 'active' instead of 'accepted'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $chef = User::findOrFail($id);

        if (!$chef->isChef()) {
            return response()->json(['message' => 'User is not a chef'], 400);
        }

        $chef->status = $request->status;
        $chef->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Chef status updated to ' . $request->status,
            'data' => [
                'chef' => $chef
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

        if ($profile->photo_url) {
            $profile->photo_url = url($profile->photo_url);
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
            'availability_status' => 'required|string|in:available,busy,unavailable,offline',
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

        // City coordinates map
        $cityCoordinates = [
            'Colombo' => ['lat' => 6.927179, 'lng' => 79.861244],
            'Nugegoda' => ['lat' => 6.901500, 'lng' => 79.880000],
            'Kandy' => ['lat' => 7.290572, 'lng' => 80.633728],
            'Galle' => ['lat' => 6.053519, 'lng' => 80.220978],
            'Negombo' => ['lat' => 7.208300, 'lng' => 79.835800],
        ];

        // User city: prioritize request query city, then user profile city, default Colombo
        $targetCity = $request->query('city') ?: ($user->city ?: 'Colombo');
        $defaultCoords = $cityCoordinates[$targetCity] ?? ['lat' => 6.927179, 'lng' => 79.861244];

        $userLat = (float) $request->query('latitude', $defaultCoords['lat']);
        $userLng = (float) $request->query('longitude', $defaultCoords['lng']);
        $cuisine = $request->query('cuisine');

        $chefsQuery = User::where('role', 'chef')
            ->where('status', 'active')
            ->whereHas('chefProfile', function($q) {
                $q->where('availability_status', 'available');
            })
            ->with('chefProfile');

        $chefs = $chefsQuery->get();

        // Format chefs list and compute distance
        $recommendedChefs = $chefs->map(function($chef) use ($userLat, $userLng) {
            $profile = $chef->chefProfile;
            
            if ($profile && $profile->photo_url) {
                $profile->photo_url = url($profile->photo_url);
            }
            if ($chef->photo_url) {
                $chef->photo_url = url($chef->photo_url);
            }
            
            $chefLat = $profile ? (float)$profile->latitude : $userLat;
            $chefLng = $profile ? (float)$profile->longitude : $userLng;

            // Haversine formula safely
            $lat1 = deg2rad($userLat);
            $lat2 = deg2rad($chefLat);
            $theta = deg2rad($userLng - $chefLng);
            $dist = sin($lat1) * sin($lat2) + cos($lat1) * cos($lat2) * cos($theta);
            $dist = acos(min(max($dist, -1.0), 1.0));
            $dist = rad2deg($dist);
            $miles = $dist * 60 * 1.1515;
            $distanceKm = $miles * 1.609344;

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

        // Sort: chefs in exact same city first, then by distance
        $recommendedChefs = $recommendedChefs->sort(function($a, $b) use ($targetCity) {
            $aSameCity = (strcasecmp($a->chefProfile->city ?? '', $targetCity) === 0) ? 0 : 1;
            $bSameCity = (strcasecmp($b->chefProfile->city ?? '', $targetCity) === 0) ? 0 : 1;

            if ($aSameCity !== $bSameCity) {
                return $aSameCity <=> $bSameCity;
            }

            return $a->distance <=> $b->distance;
        })->values();

        // -------------------------------------------------------
// AI RECOMMENDATION
// -------------------------------------------------------

$aiRecommendations = [];

try {

    $aiChefs = $recommendedChefs->map(function ($chef) {

        $profile = $chef->chefProfile;

        return [

            'id' => $chef->id,

            'name' => $chef->name,

            'latitude' => $profile
                ? (float) $profile->latitude
                : 0,

            'longitude' => $profile
                ? (float) $profile->longitude
                : 0,

            'cuisines' => $profile
                ? ($profile->cuisine_specialities ?? [])
                : [],

            'experience' => $profile
                ? (float) ($profile->experience_years ?? 0)
                : 0,

            'rating' => $profile
                ? (float) ($profile->rating ?? 0)
                : 0,

            'available' => $profile
                ? $profile->availability_status === 'available'
                : false,

            'distance' => $chef->distance ?? null,
        ];

    })->values()->toArray();


    // Send real chef data to Python AI service

    $aiResponse = Http::timeout(10)
        ->post(
            'http://127.0.0.1:5000/recommend',
            [
                'user' => [

                    'latitude' => $userLat,

                    'longitude' => $userLng,

                    'cuisine' => $cuisine,
                ],

                'chefs' => $aiChefs,
            ]
        );


    if ($aiResponse->successful()) {

        $aiData = $aiResponse->json();

        if (
            isset($aiData['success']) &&
            $aiData['success'] === true
        ) {

            $aiRecommendations =
                $aiData['recommendations'] ?? [];

        }

    } else {

        Log::warning(
            'AI recommendation service returned an error',
            [
                'status' => $aiResponse->status(),
                'response' => $aiResponse->body(),
            ]
        );

    }


} catch (\Throwable $e) {

    Log::error(
        'AI recommendation service unavailable',
        [
            'error' => $e->getMessage(),
        ]
    );

        }

                return response()->json([
            'status' => 'success',

            'data' => [

                'user_city' => $targetCity,

                'bookings' => $bookings,

                // Existing nearest chefs
                'nearby_chefs' => $recommendedChefs,

                // AI ranked chefs
                'ai_recommended_chefs' => $aiRecommendations,

                'cuisine_list' => [
                    'Sri Lankan',
                    'Indian',
                    'Western',
                    'Chinese',
                    'Italian'
                                ]
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
            'message' => 'Booking request sent successfully',
            'data' => $booking
        ], 201);
    }

    /**
     * Upload user profile photo.
     */
    public function updateUserPhoto(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'photo' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid image',
                'errors' => $validator->errors()
            ], 422);
        }

        $file = $request->file('photo');
        $filename = time() . '_' . $file->getClientOriginalName();
        $path = $file->storeAs('customer_photos', $filename, 'public');
        
        $user->photo_url = '/storage/' . $path;
        $user->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Photo updated successfully',
            'photo_url' => url($user->photo_url)
        ]);
    }
}
