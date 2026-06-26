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

        // Optional filtering by name
        if ($request->has('name') && !empty($request->name)) {
            $query->where('name', 'like', '%' . $request->name . '%');
        }

        // Optional filtering by city
        if ($request->has('city') && !empty($request->city)) {
            $query->whereHas('chefProfile', function($q) use ($request) {
                $q->where('city', 'like', '%' . $request->city . '%');
            });
        }

        // Optional filtering by cuisine (case-insensitive search on the json text)
        if ($request->has('cuisine') && !empty($request->cuisine)) {
            $query->whereHas('chefProfile', function($q) use ($request) {
                $q->where('cuisine_specialities', 'like', '%' . $request->cuisine . '%');
            });
        }

        $chefs = $query->get()->map(function ($chef) {
            if ($chef->chefProfile && $chef->chefProfile->photo_url) {
                $chef->chefProfile->photo_url = url($chef->chefProfile->photo_url);
            }
            if ($chef->photo_url) {
                $chef->photo_url = url($chef->photo_url);
            }
            return $chef;
        });

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
            ->with(['chefProfile'])
            ->first();

        if (!$chef) {
            return response()->json([
                'status' => 'error',
                'message' => 'Chef not found'
            ], 404);
        }

        if ($chef->chefProfile && $chef->chefProfile->photo_url) {
            $chef->chefProfile->photo_url = url($chef->chefProfile->photo_url);
        }
        if ($chef->photo_url) {
            $chef->photo_url = url($chef->photo_url);
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
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $profile = $user->chefProfile;

        if (!$profile) {
            $profile = new ChefProfile(['user_id' => $user->id]);
        }
        
        if ($request->hasFile('photo')) {
            $file = $request->file('photo');
            $filename = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('chef_photos', $filename, 'public');
            $profile->photo_url = '/storage/' . $path;
        }

        $profile->fill(collect($validatedData)->except('photo')->toArray());
        $profile->save();
        
        // Format for response
        if ($profile->photo_url) {
            $profile->photo_url = url($profile->photo_url);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Profile updated successfully',
            'profile' => $profile
        ]);
    }
}
