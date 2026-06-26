<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;

// Public Auth routes
// Public routes
Route::get('/settings', function () {
    $settings = \App\Models\SystemSetting::pluck('value', 'key');
    return response()->json([
        'status' => 'success',
        'settings' => [
            'system_name' => $settings['system_name'] ?? 'ChefHire',
            'system_logo' => isset($settings['system_logo']) ? url($settings['system_logo']) : null,
        ]
    ]);
});

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Authenticated routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Dashboard stats routes
    Route::get('/admin/stats', [DashboardController::class, 'adminStats']);
    Route::put('/admin/chef/{id}/status', [DashboardController::class, 'updateChefStatus']);
    Route::get('/chef/stats', [DashboardController::class, 'chefStats']);
    Route::get('/user/stats', [DashboardController::class, 'userStats']);
    Route::post('/user/profile-photo', [DashboardController::class, 'updateUserPhoto']);
    Route::put('/user/password', [AuthController::class, 'updatePassword']);

    // Chef Profile & Search Routes
    Route::get('/chefs', [\App\Http\Controllers\ChefController::class, 'index']);
    Route::get('/chefs/{id}', [\App\Http\Controllers\ChefController::class, 'show']);
    Route::put('/chef/profile', [\App\Http\Controllers\ChefController::class, 'update']);

    // Booking Routes
    Route::post('/bookings', [\App\Http\Controllers\BookingController::class, 'store']);
    Route::get('/bookings', [\App\Http\Controllers\BookingController::class, 'index']);
    Route::put('/bookings/{id}/status', [\App\Http\Controllers\BookingController::class, 'updateStatus']);

    // Admin Management Routes
    Route::get('/admin/users', [\App\Http\Controllers\AdminController::class, 'getUsers']);
    Route::put('/admin/users/{id}/status', [\App\Http\Controllers\AdminController::class, 'updateUserStatus']);
    Route::delete('/admin/users/{id}', [\App\Http\Controllers\AdminController::class, 'deleteUser']);
    Route::post('/admin/bookings/{id}/email-alert', [\App\Http\Controllers\AdminController::class, 'sendBookingEmailAlert']);
    Route::get('/admin/settings', [\App\Http\Controllers\AdminController::class, 'getSettings']);
    Route::put('/admin/settings', [\App\Http\Controllers\AdminController::class, 'updateSettings']);
});
