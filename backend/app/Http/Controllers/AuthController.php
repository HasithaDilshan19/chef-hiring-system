<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\ChefProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;

class AuthController extends Controller
{
    /**
     * ---------------------------------------------------------
     * REGISTER
     * ---------------------------------------------------------
     */
    public function register(Request $request)
    {
        $rules = [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'phone' => 'nullable|string|max:20',
            'city' => 'nullable|string|max:100',
            'role' => 'required|string|in:user,chef,admin',
        ];

        // Chef validation
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

        $validator = Validator::make(
            $request->all(),
            $rules
        );

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Create User
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'phone' => $request->phone,
            'city' => $request->city,
            'status' => $request->role === 'chef'
                ? 'pending'
                : 'active',
        ]);

        // Create Chef Profile
        if ($user->role === 'chef') {
            ChefProfile::create([
                'user_id' => $user->id,
                'experience_years' => $request->experience_years,
                'cuisine_specialities' => $request->cuisine_specialities,
                'hourly_rate' => $request->hourly_rate,
                'city' => $request->city,
                'bio' => $request->bio,

                'latitude' => $request->latitude ?? 6.927179,
                'longitude' => $request->longitude ?? 79.861244,

                'availability_status' => 'available',
                'rating' => 5.00,
                'reliability_score' => 100.00,
            ]);
        }

        // Load chef profile
        $user->load('chefProfile');

        // Chef requires admin approval
        if (
            $user->role === 'chef' &&
            $user->status === 'pending'
        ) {
            return response()->json([
                'status' => 'success',
                'message' =>
                    'Registration successful. Your account is pending admin approval.',
                'data' => [
                    'user' => $user,
                    'token' => null
                ]
            ], 201);
        }

        // Generate token
        $token = $user
            ->createToken('auth_token')
            ->plainTextToken;

        if ($user->photo_url) {
            $user->photo_url = url($user->photo_url);
        }

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
     * ---------------------------------------------------------
     * LOGIN
     * ---------------------------------------------------------
     */
    public function login(Request $request)
    {
        $validator = Validator::make(
            $request->all(),
            [
                'email' => 'required|string|email',
                'password' => 'required|string',
            ]
        );

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::where(
            'email',
            $request->email
        )->first();

        if (
            !$user ||
            !Hash::check(
                $request->password,
                $user->password
            )
        ) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid credentials'
            ], 401);
        }

        if ($user->status === 'pending') {
            return response()->json([
                'status' => 'error',
                'message' =>
                    'Your account is pending admin approval.'
            ], 403);
        }

        if ($user->status === 'rejected') {
            return response()->json([
                'status' => 'error',
                'message' =>
                    'Your account registration was rejected.'
            ], 403);
        }

        if (in_array($user->status, ['inactive', 'deactivated'])) {
            return response()->json([
                'status' => 'error',
                'message' =>
                    'Your account has been deactivated. Please contact support.'
            ], 403);
        }

        if ($user->role !== 'admin' && $user->status !== 'active' && $user->status !== null) {
            return response()->json([
                'status' => 'error',
                'message' =>
                    'Your account is not active.'
            ], 403);
        }

        // Generate token
        $token = $user
            ->createToken('auth_token')
            ->plainTextToken;

        // Load relations
        $user->load('chefProfile');

        if ($user->photo_url) {
            $user->photo_url = url($user->photo_url);
        }

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
     * ---------------------------------------------------------
     * FORGOT PASSWORD
     * SEND OTP TO EMAIL
     * ---------------------------------------------------------
     */
    public function sendOtp(Request $request)
    {
        $validator = Validator::make(
            $request->all(),
            [
                'email' => 'required|email'
            ]
        );

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Please enter a valid email address.',
                'errors' => $validator->errors()
            ], 422);
        }

        // Clean email
        $email = strtolower(
            trim($request->email)
        );

        // Find user
        $user = User::where(
            'email',
            $email
        )->first();

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' =>
                    'No account found with this email address.'
            ], 404);
        }

        // Generate 6 digit OTP
        $otp = (string) random_int(
            100000,
            999999
        );

        // Store OTP for 10 minutes
        Cache::put(
            'forgot_password_otp_' . $email,
            $otp,
            now()->addMinutes(10)
        );

        // Remove old verification
        Cache::forget(
            'forgot_password_verified_' . $email
        );

        try {

            // Send OTP email
            Mail::raw(
                "Hello {$user->name},\n\n" .
                "We received a request to reset your ChefHire account password.\n\n" .
                "Your OTP is:\n\n" .
                "{$otp}\n\n" .
                "This OTP will expire in 10 minutes.\n\n" .
                "If you did not request a password reset, please ignore this email.\n\n" .
                "Regards,\n" .
                "ChefHire Team",
                function ($message) use ($email) {

                    $message
                        ->to($email)
                        ->subject(
                            'ChefHire Password Reset OTP'
                        );
                }
            );

            return response()->json([
                'status' => 'success',
                'message' =>
                    'OTP has been sent to your email address.',
                'data' => [
                    'email' => $email
                ]
            ], 200);

        } catch (\Exception $e) {

            // Remove OTP if mail failed
            Cache::forget(
                'forgot_password_otp_' . $email
            );

            return response()->json([
                'status' => 'error',
                'message' =>
                    'Unable to send OTP email. Please check your mail configuration and try again.'
            ], 500);
        }
    }


    /**
     * ---------------------------------------------------------
     * FORGOT PASSWORD
     * VERIFY OTP
     * ---------------------------------------------------------
     */
    public function verifyOtp(Request $request)
    {
        $validator = Validator::make(
            $request->all(),
            [
                'email' => 'required|email',
                'otp' => 'required|string|size:6'
            ]
        );

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' =>
                    'Please enter the 6-digit OTP.',
                'errors' => $validator->errors()
            ], 422);
        }

        $email = strtolower(
            trim($request->email)
        );

        // Get stored OTP
        $storedOtp = Cache::get(
            'forgot_password_otp_' . $email
        );

        // OTP expired
        if (!$storedOtp) {
            return response()->json([
                'status' => 'error',
                'message' =>
                    'OTP has expired. Please request a new OTP.'
            ], 400);
        }

        // Wrong OTP
        if ($storedOtp !== $request->otp) {
            return response()->json([
                'status' => 'error',
                'message' =>
                    'Invalid OTP. Please try again.'
            ], 400);
        }

        // OTP verified
        Cache::put(
            'forgot_password_verified_' . $email,
            true,
            now()->addMinutes(10)
        );

        // Delete OTP so it cannot be reused
        Cache::forget(
            'forgot_password_otp_' . $email
        );

        return response()->json([
            'status' => 'success',
            'message' =>
                'OTP verified successfully.',
            'data' => [
                'email' => $email,
                'verified' => true
            ]
        ], 200);
    }


    /**
     * ---------------------------------------------------------
     * FORGOT PASSWORD
     * RESET PASSWORD
     * ---------------------------------------------------------
     */
    public function resetPassword(Request $request)
    {
        $validator = Validator::make(
            $request->all(),
            [
                'email' => 'required|email',
                'password' =>
                    'required|string|min:8|confirmed',
            ]
        );

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' =>
                    'Password validation failed.',
                'errors' => $validator->errors()
            ], 422);
        }

        $email = strtolower(
            trim($request->email)
        );

        // Check OTP verification
        $verified = Cache::get(
            'forgot_password_verified_' . $email
        );

        if (!$verified) {
            return response()->json([
                'status' => 'error',
                'message' =>
                    'Please verify the OTP before resetting your password.'
            ], 403);
        }

        // Find user
        $user = User::where(
            'email',
            $email
        )->first();

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' =>
                    'User account not found.'
            ], 404);
        }

        // Update password
        $user->password = Hash::make(
            $request->password
        );

        $user->save();

        // Clear verification
        Cache::forget(
            'forgot_password_verified_' . $email
        );

        return response()->json([
            'status' => 'success',
            'message' =>
                'Password reset successfully. You can now login with your new password.'
        ], 200);
    }


    /**
     * ---------------------------------------------------------
     * LOGOUT
     * ---------------------------------------------------------
     */
    public function logout(Request $request)
    {
        $request
            ->user()
            ->currentAccessToken()
            ->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Logged out successfully'
        ]);
    }


    /**
     * ---------------------------------------------------------
     * GET AUTHENTICATED USER
     * ---------------------------------------------------------
     */
    public function me(Request $request)
    {
        $user = $request
            ->user()
            ->load('chefProfile');

        if ($user->photo_url) {
            $user->photo_url = url(
                $user->photo_url
            );
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'user' => $user
            ]
        ]);
    }


    /**
     * ---------------------------------------------------------
     * UPDATE PASSWORD
     * ---------------------------------------------------------
     */
    public function updatePassword(Request $request)
    {
        $validator = Validator::make(
            $request->all(),
            [
                'current_password' => 'required|string',
                'password' =>
                    'required|string|min:8|confirmed',
            ]
        );

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();

        if (
            !Hash::check(
                $request->current_password,
                $user->password
            )
        ) {
            return response()->json([
                'status' => 'error',
                'message' =>
                    'Current password does not match'
            ], 400);
        }

        $user->password = Hash::make(
            $request->password
        );

        $user->save();

        return response()->json([
            'status' => 'success',
            'message' =>
                'Password updated successfully'
        ]);
    }
}