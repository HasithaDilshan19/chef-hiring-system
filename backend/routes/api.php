<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;

// Public Auth routes
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

    // Chef Profile & Search Routes
    Route::get('/chefs', [\App\Http\Controllers\ChefController::class, 'index']);
    Route::get('/chefs/{id}', [\App\Http\Controllers\ChefController::class, 'show']);
    Route::put('/chef/profile', [\App\Http\Controllers\ChefController::class, 'update']);

    // Booking Routes
    Route::post('/bookings', [\App\Http\Controllers\BookingController::class, 'store']);
    Route::get('/bookings', [\App\Http\Controllers\BookingController::class, 'index']);
    Route::put('/bookings/{id}/status', [\App\Http\Controllers\BookingController::class, 'updateStatus']);
});
