<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\ChefProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Register a new user or chef.
     */
    public function register(Request $request)
    {
        $rules = [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'phone' => 'nullable|string|max:20',
            'role' => 'required|string|in:user,chef,admin',
        ];

        // Add additional rules if registration role is chef
        if ($request->role === 'chef') {
            $rules = array_merge($rules, [
                'experience_years' => 'required|integer|min:0',
                'cuisine_specialities' => 'required|array',
                'cuisine_specialities.*' => 'string',
                'hourly_rate' => 'required|numeric|min:0',
                'city' => 'required|string|max:100',
                'bio' => 'nullable|string',
                'latitude' => 'nullable|numeric',
                'longitude' => 'nullable|numeric',
            ]);
        }

        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Create the User
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'phone' => $request->phone,
        ]);

        // Create Chef Profile if role is chef
        if ($user->role === 'chef') {
            ChefProfile::create([
                'user_id' => $user->id,
                'experience_years' => $request->experience_years,
                'cuisine_specialities' => $request->cuisine_specialities,
                'hourly_rate' => $request->hourly_rate,
                'city' => $request->city,
                'bio' => $request->bio,
                'latitude' => $request->latitude ?? 6.927179, // Colombo default
                'longitude' => $request->longitude ?? 79.861244,
                'availability_status' => 'available',
                'rating' => 5.00,
                'reliability_score' => 100.00,
            ]);
        }

        // Generate Sanctum token
        $token = $user->createToken('auth_token')->plainTextToken;

        // Load relations
        $user->load('chefProfile');

        return response()->json([
            'status' => 'success',
            'message' => 'User registered successfully',
            'data' => [
                'user' => $user,
                'token' => $token
            ]
        ], 201);
    }

    /**
     * Log in a user.
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid credentials'
            ], 401);
        }

        // Generate token
        $token = $user->createToken('auth_token')->plainTextToken;

        // Load relations
        $user->load('chefProfile');

        return response()->json([
            'status' => 'success',
            'message' => 'Login successful',
            'data' => [
                'user' => $user,
                'token' => $token
            ]
        ]);
    }

    /**
     * Log out the current user (revoke token).
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Logged out successfully'
        ]);
    }

    /**
     * Get the authenticated user profile.
     */
    public function me(Request $request)
    {
        $user = $request->user()->load('chefProfile');

        return response()->json([
            'status' => 'success',
            'data' => [
                'user' => $user
            ]
        ]);
    }
}
