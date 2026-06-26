<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\SystemSetting;

class AdminController extends Controller
{
    /**
     * Get all users (customers, chefs, admins)
     */
    public function getUsers(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $users = User::with('chefProfile')->orderBy('created_at', 'desc')->get();

        return response()->json([
            'status' => 'success',
            'users' => $users
        ]);
    }

    /**
     * Update user status (active/inactive)
     */
    public function updateUserStatus(Request $request, $id)
    {
        $admin = $request->user();
        if ($admin->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validatedData = $request->validate([
            'status' => 'required|string|in:active,inactive'
        ]);

        $user = User::findOrFail($id);
        
        // Prevent admin from deactivating themselves
        if ($user->id === $admin->id && $validatedData['status'] === 'inactive') {
            return response()->json(['message' => 'Cannot deactivate your own admin account.'], 400);
        }

        $user->status = $validatedData['status'];
        $user->save();

        return response()->json([
            'status' => 'success',
            'message' => 'User status updated successfully.',
            'user' => $user
        ]);
    }

    /**
     * Delete a user
     */
    public function deleteUser(Request $request, $id)
    {
        $admin = $request->user();
        if ($admin->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $user = User::findOrFail($id);

        if ($user->id === $admin->id) {
            return response()->json(['message' => 'Cannot delete your own admin account.'], 400);
        }

        $user->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'User deleted successfully.'
        ]);
    }

    /**
     * Send email alert to Chef about a booking
     */
    public function sendBookingEmailAlert(Request $request, $id)
    {
        $admin = $request->user();
        if ($admin->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $booking = \App\Models\Booking::with('chef', 'customer')->findOrFail($id);

        if (!$booking->chef || !$booking->chef->email) {
            return response()->json(['message' => 'Chef does not have a valid email address.'], 400);
        }

        try {
            \Illuminate\Support\Facades\Mail::to($booking->chef->email)->send(new \App\Mail\ChefAlertMail($booking));
            
            return response()->json([
                'status' => 'success',
                'message' => 'Email alert sent successfully to ' . $booking->chef->email
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Failed to send email alert: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to send email alert. Ensure email services are configured correctly.'
            ], 500);
        }
    }

    /**
     * Get system settings
     */
    public function getSettings(Request $request)
    {
        $admin = $request->user();
        if ($admin->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Get all settings as key-value pairs
        $settings = SystemSetting::pluck('value', 'key');

        return response()->json([
            'status' => 'success',
            'settings' => $settings
        ]);
    }

    /**
     * Update system settings
     */
    public function updateSettings(Request $request)
    {
        $admin = $request->user();
        if ($admin->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validatedData = $request->validate([
            'system_name' => 'nullable|string|max:255',
            'contact_email' => 'nullable|email',
            'contact_phone' => 'nullable|string',
            'commission_rate' => 'nullable|numeric|min:0|max:100',
        ]);

        foreach ($validatedData as $key => $value) {
            if ($value !== null) {
                SystemSetting::updateOrCreate(
                    ['key' => $key],
                    ['value' => $value]
                );
            }
        }

        $updatedSettings = SystemSetting::pluck('value', 'key');

        return response()->json([
            'status' => 'success',
            'message' => 'Settings updated successfully.',
            'settings' => $updatedSettings
        ]);
    }
}
