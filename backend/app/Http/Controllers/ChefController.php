<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\ChefProfile;
use App\Models\ChefPackage;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class ChefController extends Controller
{
    /**
     * Get all chefs
     */
    public function index(Request $request)
    {
        try {
            $chefs = User::where('role', 'chef')
                ->where('status', 'active')
                ->with('chefProfile')
                ->get();

            $chefs = $chefs->map(function ($chef) {

                $reviews = Review::where('chef_id', $chef->id)->get();

                $averageRating = $reviews->count() > 0
                    ? round($reviews->avg('rating'), 1)
                    : 0;

                return [
                    'id' => $chef->id,
                    'name' => $chef->name,
                    'email' => $chef->email,
                    'phone' => $chef->phone,
                    'photo_url' => $chef->photo_url
                        ? url($chef->photo_url)
                        : null,

                    'chef_profile' => $chef->chefProfile
                        ? [
                            'id' => $chef->chefProfile->id,
                            'bio' => $chef->chefProfile->bio,
                            'experience_years' => $chef->chefProfile->experience_years,
                            'hourly_rate' => $chef->chefProfile->hourly_rate,
                            'city' => $chef->chefProfile->city,
                            'cuisine_specialities' => $chef->chefProfile->cuisine_specialities,
                            'photo_url' => $chef->chefProfile->photo_url
                                ? url($chef->chefProfile->photo_url)
                                : null,
                            'rating' => $averageRating,
                        ]
                        : [
                            'rating' => $averageRating,
                        ],

                    'rating' => $averageRating,
                    'reviews_count' => $reviews->count(),
                ];
            });

            return response()->json([
                'status' => 'success',
                'chefs' => $chefs,
            ]);

        } catch (\Exception $e) {

            \Log::error('Error fetching chefs: ' . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch chefs.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }


    /**
     * Get single chef
     */
    public function show($id)
    {
        try {

            $chef = User::where('role', 'chef')
                ->where('status', 'active')
                ->with('chefProfile')
                ->find($id);

            if (!$chef) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Chef not found.',
                ], 404);
            }

            // ✅ Fix: Load user with all fields including photo
            $reviews = Review::where('chef_id', $chef->id)
                ->with('user')
                ->latest()
                ->get();

            $averageRating = $reviews->count() > 0
                ? round($reviews->avg('rating'), 1)
                : 0;

            // ✅ Fix: Format reviews with full photo URL
            $formattedReviews = $reviews->map(function ($review) {
                $user = $review->user;
                $userPhoto = null;
                
                if ($user) {
                    $userPhoto = $user->photo_url ?? 
                                $user->photo ?? 
                                $user->profile_photo ?? 
                                $user->avatar ?? 
                                $user->profile_photo_url ?? 
                                null;
                    
                    if ($userPhoto && !filter_var($userPhoto, FILTER_VALIDATE_URL)) {
                        $userPhoto = url($userPhoto);
                    }
                }

                return [
                    'id' => $review->id,
                    'chef_id' => $review->chef_id,
                    'user_id' => $review->user_id,
                    'rating' => $review->rating,
                    'comment' => $review->comment,
                    'created_at' => $review->created_at,
                    'updated_at' => $review->updated_at,
                    'user' => $user ? [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'photo_url' => $userPhoto,
                        'photo' => $userPhoto,
                        'profile_photo' => $userPhoto,
                        'avatar' => $userPhoto,
                    ] : null,
                ];
            });

            // Load this chef's packages
            $chefPackages = ChefPackage::where('chef_id', $chef->id)->latest()->get();

            return response()->json([
                'status' => 'success',

                'chef' => [
                    'id' => $chef->id,
                    'name' => $chef->name,
                    'email' => $chef->email,
                    'phone' => $chef->phone,

                    'photo_url' => $chef->photo_url
                        ? url($chef->photo_url)
                        : null,

                    'chef_profile' => $chef->chefProfile
                        ? [
                            'id' => $chef->chefProfile->id,
                            'bio' => $chef->chefProfile->bio,
                            'experience_years' => $chef->chefProfile->experience_years,
                            'hourly_rate' => $chef->chefProfile->hourly_rate,
                            'city' => $chef->chefProfile->city,

                            'cuisine_specialities' =>
                                $chef->chefProfile->cuisine_specialities,

                            'photo_url' =>
                                $chef->chefProfile->photo_url
                                    ? url($chef->chefProfile->photo_url)
                                    : null,

                            'rating' => $averageRating,
                        ]
                        : [
                            'rating' => $averageRating,
                        ],

                    'rating' => $averageRating,
                    'reviews_count' => $reviews->count(),
                ],

                // Chef packages
                'packages' => $chefPackages,

                // ✅ Add reviews to response
                'reviews' => $formattedReviews,
                'average_rating' => $averageRating,
                'review_count' => $reviews->count(),
            ]);

        } catch (\Exception $e) {

            \Log::error(
                'Error fetching chef details: ' .
                $e->getMessage()
            );

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch chef details.',
            ], 500);
        }
    }


    /**
     * Update chef profile
     */
    public function update(Request $request)
    {
        try {

            $user = Auth::user();

            if (!$user || $user->role !== 'chef') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized.',
                ], 403);
            }

            $validated = $request->validate([
                'bio' => 'nullable|string',
                'experience_years' => 'nullable|integer|min:0',
                'hourly_rate' => 'nullable|numeric|min:0',
                'city' => 'nullable|string|max:255',
                'cuisine_specialities' => 'nullable|array',
            ]);

            $profile = ChefProfile::firstOrCreate([
                'user_id' => $user->id,
            ]);

            $profile->update([
                'bio' => $validated['bio'] ?? $profile->bio,
                'experience_years' =>
                    $validated['experience_years']
                    ?? $profile->experience_years,

                'hourly_rate' =>
                    $validated['hourly_rate']
                    ?? $profile->hourly_rate,

                'city' =>
                    $validated['city']
                    ?? $profile->city,

                'cuisine_specialities' =>
                    $validated['cuisine_specialities']
                    ?? $profile->cuisine_specialities,
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Chef profile updated successfully.',
                'chef_profile' => $profile,
            ]);

        } catch (\Exception $e) {

            \Log::error(
                'Chef profile update error: ' .
                $e->getMessage()
            );

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update chef profile.',
            ], 500);
        }
    }


    /**
     * Get reviews for a chef - ✅ FIXED with profile photo
     */
    public function reviews($chefId)
    {
        try {

            $chef = User::where('role', 'chef')
                ->where('status', 'active')
                ->find($chefId);

            if (!$chef) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Chef not found.',
                ], 404);
            }

            // ✅ Fix: Load user with all fields including photo
            $reviews = Review::where('chef_id', $chefId)
                ->with('user')
                ->latest()
                ->get();

            // ✅ Fix: Format reviews with full photo URL
            $formattedReviews = $reviews->map(function ($review) {
                $user = $review->user;
                $userPhoto = null;
                
                if ($user) {
                    $userPhoto = $user->photo_url ?? 
                                $user->photo ?? 
                                $user->profile_photo ?? 
                                $user->avatar ?? 
                                $user->profile_photo_url ?? 
                                null;
                    
                    if ($userPhoto && !filter_var($userPhoto, FILTER_VALIDATE_URL)) {
                        $userPhoto = url($userPhoto);
                    }
                }

                return [
                    'id' => $review->id,
                    'chef_id' => $review->chef_id,
                    'user_id' => $review->user_id,
                    'rating' => $review->rating,
                    'comment' => $review->comment,
                    'created_at' => $review->created_at,
                    'updated_at' => $review->updated_at,
                    'user' => $user ? [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'photo_url' => $userPhoto,
                        'photo' => $userPhoto,
                        'profile_photo' => $userPhoto,
                        'avatar' => $userPhoto,
                    ] : null,
                ];
            });

            return response()->json([
                'status' => 'success',
                'reviews' => $formattedReviews,
                'average_rating' => $reviews->count() > 0
                    ? round($reviews->avg('rating'), 1)
                    : 0,
                'reviews_count' => $reviews->count(),
            ]);

        } catch (\Exception $e) {

            \Log::error(
                'Error fetching reviews: ' .
                $e->getMessage()
            );

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch reviews.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }


    /**
     * Add review - ✅ FIXED with profile photo
     */
    public function addReview(Request $request, $chefId)
    {
        try {

            $user = Auth::user();

            if (!$user) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Please login first.',
                ], 401);
            }

            if (
                $user->role !== 'customer' &&
                $user->role !== 'user'
            ) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Only customers can submit reviews.',
                ], 403);
            }

            $chef = User::where('role', 'chef')
                ->where('status', 'active')
                ->find($chefId);

            if (!$chef) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Chef not found.',
                ], 404);
            }

            $validated = $request->validate([
                'rating' => 'required|integer|min:1|max:5',
                'comment' => 'required|string|min:3|max:1000',
            ]);

            $existingReview = Review::where('chef_id', $chefId)
                ->where('user_id', $user->id)
                ->first();

            if ($existingReview) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'You have already reviewed this chef.',
                ], 409);
            }

            $review = Review::create([
                'chef_id' => $chefId,
                'user_id' => $user->id,
                'rating' => $validated['rating'],
                'comment' => $validated['comment'],
            ]);

            // Update chef_profile.rating with the new real average
            $newAvg = Review::where('chef_id', $chefId)->avg('rating');
            ChefProfile::where('user_id', $chefId)->update([
                'rating' => round($newAvg, 2),
            ]);

            // ✅ Fix: Load user with all fields
            $review->load('user');

            // ✅ Fix: Format the review with full photo URL
            $userData = $review->user;
            $userPhoto = null;
            if ($userData) {
                $userPhoto = $userData->photo_url ?? 
                            $userData->photo ?? 
                            $userData->profile_photo ?? 
                            $userData->avatar ?? 
                            null;
                if ($userPhoto && !filter_var($userPhoto, FILTER_VALIDATE_URL)) {
                    $userPhoto = url($userPhoto);
                }
            }

            $formattedReview = [
                'id' => $review->id,
                'chef_id' => $review->chef_id,
                'user_id' => $review->user_id,
                'rating' => $review->rating,
                'comment' => $review->comment,
                'created_at' => $review->created_at,
                'updated_at' => $review->updated_at,
                'user' => $userData ? [
                    'id' => $userData->id,
                    'name' => $userData->name,
                    'email' => $userData->email,
                    'photo_url' => $userPhoto,
                    'photo' => $userPhoto,
                    'profile_photo' => $userPhoto,
                    'avatar' => $userPhoto,
                ] : null,
            ];

            return response()->json([
                'status' => 'success',
                'message' => 'Review submitted successfully.',
                'review' => $formattedReview,
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {

            throw $e;

        } catch (\Exception $e) {

            \Log::error(
                'Review submission error: ' .
                $e->getMessage()
            );

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to submit review.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }


    /**
     * Update review - ✅ FIXED with profile photo
     */
    public function updateReview(Request $request, $reviewId)
    {
        try {

            $user = Auth::user();

            if (!$user) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Please login first.',
                ], 401);
            }

            $review = Review::find($reviewId);

            if (!$review) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Review not found.',
                ], 404);
            }

            // Only the review owner can update
            if ($review->user_id !== $user->id) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'You are not allowed to update this review.',
                ], 403);
            }

            $validated = $request->validate([
                'rating' => 'required|integer|min:1|max:5',
                'comment' => 'required|string|min:3|max:1000',
            ]);

            $review->update([
                'rating' => $validated['rating'],
                'comment' => $validated['comment'],
            ]);

            // Keep chef_profile.rating in sync with the true average
            $newAvg = Review::where('chef_id', $review->chef_id)->avg('rating');
            ChefProfile::where('user_id', $review->chef_id)->update([
                'rating' => round($newAvg, 2),
            ]);

            // ✅ Fix: Load user with all fields
            $review->load('user');

            // ✅ Fix: Format the review with full photo URL
            $userData = $review->user;
            $userPhoto = null;
            if ($userData) {
                $userPhoto = $userData->photo_url ?? 
                            $userData->photo ?? 
                            $userData->profile_photo ?? 
                            $userData->avatar ?? 
                            null;
                if ($userPhoto && !filter_var($userPhoto, FILTER_VALIDATE_URL)) {
                    $userPhoto = url($userPhoto);
                }
            }

            $formattedReview = [
                'id' => $review->id,
                'chef_id' => $review->chef_id,
                'user_id' => $review->user_id,
                'rating' => $review->rating,
                'comment' => $review->comment,
                'created_at' => $review->created_at,
                'updated_at' => $review->updated_at,
                'user' => $userData ? [
                    'id' => $userData->id,
                    'name' => $userData->name,
                    'email' => $userData->email,
                    'photo_url' => $userPhoto,
                    'photo' => $userPhoto,
                    'profile_photo' => $userPhoto,
                    'avatar' => $userPhoto,
                ] : null,
            ];

            return response()->json([
                'status' => 'success',
                'message' => 'Review updated successfully.',
                'review' => $formattedReview,
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {

            throw $e;

        } catch (\Exception $e) {

            \Log::error(
                'Review update error: ' .
                $e->getMessage()
            );

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update review.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }


    /**
     * Delete review
     */
    public function deleteReview($reviewId)
    {
        try {

            $user = Auth::user();

            if (!$user) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Please login first.',
                ], 401);
            }

            $review = Review::find($reviewId);

            if (!$review) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Review not found.',
                ], 404);
            }

            if (
                $review->user_id !== $user->id &&
                $user->role !== 'admin'
            ) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'You are not allowed to delete this review.',
                ], 403);
            }

            $review->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Review deleted successfully.',
            ]);

        } catch (\Exception $e) {

            \Log::error(
                'Review delete error: ' .
                $e->getMessage()
            );

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete review.',
            ], 500);
        }
    }


    // =========================================================
    // CHEF PACKAGES
    // =========================================================

    /**
     * Get packages for the authenticated chef
     */
    public function getMyPackages(Request $request)
    {
        try {
            $user = Auth::user();

            if (!$user || $user->role !== 'chef') {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Unauthorized.',
                ], 403);
            }

            $packages = ChefPackage::where('chef_id', $user->id)->latest()->get();

            return response()->json([
                'status'   => 'success',
                'packages' => $packages,
            ]);

        } catch (\Exception $e) {
            \Log::error('Error fetching chef packages: ' . $e->getMessage());
            return response()->json([
                'status'  => 'error',
                'message' => 'Failed to fetch packages.',
            ], 500);
        }
    }


    /**
     * Get packages for a specific chef (public-ish)
     */
    public function getChefPackages($chefId)
    {
        try {
            $chef = User::where('id', $chefId)->where('role', 'chef')->where('status', 'active')->first();

            if (!$chef) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Chef not found.',
                ], 404);
            }

            $packages = ChefPackage::where('chef_id', $chefId)->latest()->get();

            return response()->json([
                'status'   => 'success',
                'packages' => $packages,
            ]);

        } catch (\Exception $e) {
            \Log::error('Error fetching chef packages: ' . $e->getMessage());
            return response()->json([
                'status'  => 'error',
                'message' => 'Failed to fetch packages.',
            ], 500);
        }
    }


    /**
     * Create a new package for the authenticated chef
     */
    public function storePackage(Request $request)
    {
        try {
            $user = Auth::user();

            if (!$user || $user->role !== 'chef') {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Unauthorized.',
                ], 403);
            }

            $validated = $request->validate([
                'name'           => 'required|string|max:255',
                'description'    => 'nullable|string|max:1000',
                'price'          => 'nullable|string|max:100',
                'guests_count'   => 'nullable|integer|min:1',
                'duration_hours' => 'nullable|integer|min:1',
                'features'       => 'nullable|array',
                'features.*'     => 'string|max:255',
            ]);

            $package = ChefPackage::create([
                'chef_id'        => $user->id,
                'name'           => $validated['name'],
                'description'    => $validated['description'] ?? null,
                'price'          => $validated['price'] ?? null,
                'guests_count'   => $validated['guests_count'] ?? 1,
                'duration_hours' => $validated['duration_hours'] ?? 2,
                'features'       => $validated['features'] ?? [],
            ]);

            return response()->json([
                'status'  => 'success',
                'message' => 'Package created successfully.',
                'package' => $package,
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            \Log::error('Error creating chef package: ' . $e->getMessage());
            return response()->json([
                'status'  => 'error',
                'message' => 'Failed to create package.',
            ], 500);
        }
    }


    /**
     * Delete a package (chef owner only)
     */
    public function deletePackage($packageId)
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Please login first.',
                ], 401);
            }

            $package = ChefPackage::find($packageId);

            if (!$package) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Package not found.',
                ], 404);
            }

            if ($package->chef_id !== $user->id && $user->role !== 'admin') {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'You are not allowed to delete this package.',
                ], 403);
            }

            $package->delete();

            return response()->json([
                'status'  => 'success',
                'message' => 'Package deleted successfully.',
            ]);

        } catch (\Exception $e) {
            \Log::error('Error deleting chef package: ' . $e->getMessage());
            return response()->json([
                'status'  => 'error',
                'message' => 'Failed to delete package.',
            ], 500);
        }
    }
}