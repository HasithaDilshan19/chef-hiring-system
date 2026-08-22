<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ChefController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\AdminController;

Route::get('/settings', function () {

    $settings = \App\Models\SystemSetting::pluck('value', 'key');

    return response()->json([
        'status' => 'success',

        'settings' => [
            'system_name' =>
                $settings['system_name'] ?? 'ChefHire',

            'system_logo' =>
                isset($settings['system_logo'])
                    ? url($settings['system_logo'])
                    : null,
        ],
    ]);
});


/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
*/

Route::post('/register', [AuthController::class, 'register']);

Route::post('/login', [AuthController::class, 'login']);

Route::post(
    '/forgotPassword/send-otp',
    [AuthController::class, 'sendOtp']
);

Route::post(
    '/forgotPassword/verify-otp',
    [AuthController::class, 'verifyOtp']
);

Route::post(
    '/forgotPassword/reset',
    [AuthController::class, 'resetPassword']
);


/*
|--------------------------------------------------------------------------
| Authenticated Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | Auth
    |--------------------------------------------------------------------------
    */

    Route::post(
        '/logout',
        [AuthController::class, 'logout']
    );

    Route::get(
        '/me',
        [AuthController::class, 'me']
    );


    /*
    |--------------------------------------------------------------------------
    | Dashboard
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/admin/stats',
        [DashboardController::class, 'adminStats']
    );

    Route::put(
        '/admin/chef/{id}/status',
        [DashboardController::class, 'updateChefStatus']
    );

    Route::get(
        '/chef/stats',
        [DashboardController::class, 'chefStats']
    );

    Route::get(
        '/user/stats',
        [DashboardController::class, 'userStats']
    );

    Route::post(
        '/user/profile-photo',
        [DashboardController::class, 'updateUserPhoto']
    );

    Route::put(
        '/user/password',
        [AuthController::class, 'updatePassword']
    );


    /*
    |--------------------------------------------------------------------------
    | Chefs
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/chefs',
        [ChefController::class, 'index']
    );

    Route::get(
        '/chefs/{id}',
        [ChefController::class, 'show']
    );

    Route::put(
        '/chef/profile',
        [ChefController::class, 'update']
    );


    /*
    |--------------------------------------------------------------------------
    | Chef Reviews
    |--------------------------------------------------------------------------
    */

    // Get all reviews for chef
    Route::get(
        '/chef-reviews/{chefId}',
        [ChefController::class, 'reviews']
    );

    // Add review
    Route::post(
        '/chefs/{chefId}/reviews',
        [ChefController::class, 'addReview']
    );

    // Delete review
    Route::delete(
        '/chef-reviews/{reviewId}',
        [ChefController::class, 'deleteReview']
    );

    Route::put(
        '/chef-reviews/{reviewId}',
         [ChefController::class, 'updateReview']
    ); 


    /*
    |--------------------------------------------------------------------------
    | Bookings
    |--------------------------------------------------------------------------
    */

    Route::post(
        '/bookings',
        [BookingController::class, 'store']
    );

    Route::get(
        '/bookings',
        [BookingController::class, 'index']
    );

    Route::put(
        '/bookings/{id}/status',
        [BookingController::class, 'updateStatus']
    );


    /*
    |--------------------------------------------------------------------------
    | Admin
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/admin/users',
        [AdminController::class, 'getUsers']
    );

    Route::put(
        '/admin/users/{id}/status',
        [AdminController::class, 'updateUserStatus']
    );

    Route::delete(
        '/admin/users/{id}',
        [AdminController::class, 'deleteUser']
    );

    Route::post(
        '/admin/bookings/{id}/email-alert',
        [AdminController::class, 'sendBookingEmailAlert']
    );

    Route::get(
        '/admin/settings',
        [AdminController::class, 'getSettings']
    );

    Route::put(
        '/admin/settings',
        [AdminController::class, 'updateSettings']
    );
});