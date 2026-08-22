<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\ChefProfile;
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
                ->with('chefProfile')
                ->find($id);

            if (!$chef) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Chef not found.',
                ], 404);
            }

            $reviews = Review::where('chef_id', $chef->id)
                ->with('user:id,name,photo_url')
                ->latest()
                ->get();

            $averageRating = $reviews->count() > 0
                ? round($reviews->avg('rating'), 1)
                : 0;

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
     * Get reviews for a chef
     */
    public function reviews($chefId)
    {
        try {

            $chef = User::where('role', 'chef')
                ->find($chefId);

            if (!$chef) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Chef not found.',
                ], 404);
            }

            $reviews = Review::where('chef_id', $chefId)
                ->with('user:id,name,photo_url')
                ->latest()
                ->get();

            return response()->json([
                'status' => 'success',
                'reviews' => $reviews,
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
            ], 500);
        }
    }


    /**
     * Add review
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

            $review->load('user:id,name,photo_url');

            return response()->json([
                'status' => 'success',
                'message' => 'Review submitted successfully.',
                'review' => $review,
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
     * ✅ UPDATE REVIEW - නව method එක
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

            $review->load('user:id,name,photo_url');

            return response()->json([
                'status' => 'success',
                'message' => 'Review updated successfully.',
                'review' => $review,
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
}