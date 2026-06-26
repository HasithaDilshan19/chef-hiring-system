<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\ChefProfile;

class ChefController extends Controller
{
    /**
     * Display a listing of chefs (search & discover).
     */
    public function index(Request $request)
    {
        $query = User::where('role', 'chef')->with('chefProfile');

        // Optional filtering by city
        if ($request->has('city') && !empty($request->city)) {
            $query->whereHas('chefProfile', function($q) use ($request) {
                $q->where('city', 'like', '%' . $request->city . '%');
            });
        }

        // Optional filtering by cuisine
        if ($request->has('cuisine') && !empty($request->cuisine)) {
            $query->whereHas('chefProfile', function($q) use ($request) {
                $q->whereJsonContains('cuisine_specialities', $request->cuisine);
            });
        }

        $chefs = $query->get();

        return response()->json([
            'status' => 'success',
            'chefs' => $chefs
        ]);
    }

    /**
     * Display the specified chef.
     */
    public function show($id)
    {
        $chef = User::where('id', $id)
            ->where('role', 'chef')
            ->with(['chefProfile', 'bookings'])
            ->first();

        if (!$chef) {
            return response()->json([
                'status' => 'error',
                'message' => 'Chef not found'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'chef' => $chef
        ]);
    }

    /**
     * Update the authenticated chef's profile.
     */
    public function update(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'chef') {
            return response()->json(['message' => 'Unauthorized. Only chefs can update their profile.'], 403);
        }

        $validatedData = $request->validate([
            'bio' => 'nullable|string',
            'hourly_rate' => 'nullable|numeric|min:0',
            'city' => 'nullable|string|max:255',
            'cuisine_specialities' => 'nullable|array',
            'availability_status' => 'nullable|string|in:available,busy,offline',
        ]);

        $profile = $user->chefProfile;

        if (!$profile) {
            $profile = new ChefProfile(['user_id' => $user->id]);
        }

        $profile->fill($validatedData);
        $profile->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Profile updated successfully',
            'profile' => $profile
        ]);
    }
}
