<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\SystemSetting;
use App\Models\AdminPackage;

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
        $settings = SystemSetting::pluck('value', 'key')->toArray();
        
        if (isset($settings['system_logo'])) {
            $settings['system_logo'] = url($settings['system_logo']);
        }

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
            'system_logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        // Handle file upload
        if ($request->hasFile('system_logo')) {
            $file = $request->file('system_logo');
            $filename = time() . '_' . $file->getClientOriginalName();
            // Store the file in storage/app/public/logos
            $path = $file->storeAs('logos', $filename, 'public');
            
            // Save the path string to settings
            SystemSetting::updateOrCreate(
                ['key' => 'system_logo'],
                ['value' => '/storage/' . $path]
            );
        }

        foreach ($validatedData as $key => $value) {
            // Skip the file input in the loop since we handled it
            if ($key === 'system_logo') continue;

            if ($value !== null) {
                SystemSetting::updateOrCreate(
                    ['key' => $key],
                    ['value' => $value]
                );
            }
        }

        $updatedSettings = SystemSetting::pluck('value', 'key')->toArray();
        if (isset($updatedSettings['system_logo'])) {
            $updatedSettings['system_logo'] = url($updatedSettings['system_logo']);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Settings updated successfully.',
            'settings' => $updatedSettings
        ]);
    }

    /**
     * List all admin packages (public for authenticated users)
     */
    public function getAdminPackages(Request $request)
    {
        $packages = AdminPackage::where('is_active', true)->orderBy('created_at')->get();

        return response()->json([
            'status'   => 'success',
            'packages' => $packages,
        ]);
    }

    /**
     * List all admin packages including inactive (admin only)
     */
    public function getAllAdminPackages(Request $request)
    {
        $admin = $request->user();
        if ($admin->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $packages = AdminPackage::orderBy('created_at')->get();

        return response()->json([
            'status'   => 'success',
            'packages' => $packages,
        ]);
    }

    /**
     * Create a new admin package
     */
    public function storeAdminPackage(Request $request)
    {
        $admin = $request->user();
        if ($admin->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name'           => 'required|string|max:255',
            'eyebrow'        => 'nullable|string|max:255',
            'description'    => 'nullable|string|max:1000',
            'price'          => 'nullable|string|max:100',
            'guests_count'   => 'nullable|integer|min:1',
            'duration_hours' => 'nullable|integer|min:1',
            'features'       => 'nullable|array',
            'features.*'     => 'string|max:255',
            'is_featured'    => 'nullable|boolean',
        ]);

        $package = AdminPackage::create([
            'name'           => $validated['name'],
            'eyebrow'        => $validated['eyebrow'] ?? null,
            'description'    => $validated['description'] ?? null,
            'price'          => $validated['price'] ?? null,
            'guests_count'   => $validated['guests_count'] ?? 4,
            'duration_hours' => $validated['duration_hours'] ?? 3,
            'features'       => $validated['features'] ?? [],
            'is_featured'    => $validated['is_featured'] ?? false,
            'is_active'      => true,
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Package created successfully.',
            'package' => $package,
        ], 201);
    }

    /**
     * Update an admin package
     */
    public function updateAdminPackage(Request $request, $id)
    {
        $admin = $request->user();
        if ($admin->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $package = AdminPackage::findOrFail($id);

        $validated = $request->validate([
            'name'           => 'sometimes|required|string|max:255',
            'eyebrow'        => 'nullable|string|max:255',
            'description'    => 'nullable|string|max:1000',
            'price'          => 'nullable|string|max:100',
            'guests_count'   => 'nullable|integer|min:1',
            'duration_hours' => 'nullable|integer|min:1',
            'features'       => 'nullable|array',
            'features.*'     => 'string|max:255',
            'is_featured'    => 'nullable|boolean',
            'is_active'      => 'nullable|boolean',
        ]);

        $package->update($validated);

        return response()->json([
            'status'  => 'success',
            'message' => 'Package updated successfully.',
            'package' => $package,
        ]);
    }

    /**
     * Delete an admin package
     */
    public function deleteAdminPackage(Request $request, $id)
    {
        $admin = $request->user();
        if ($admin->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $package = AdminPackage::findOrFail($id);
        $package->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Package deleted successfully.',
        ]);
    }
}
