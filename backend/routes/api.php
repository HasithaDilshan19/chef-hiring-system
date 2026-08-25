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

    // ✅ Cancel booking (customer only)
    Route::post(
        '/bookings/{id}/cancel',
        [BookingController::class, 'cancel']
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

    /*
    |--------------------------------------------------------------------------
    | Admin Platform Packages (Foodie Packages)
    |--------------------------------------------------------------------------
    */

    // Public list (any authenticated user — for FoodiePackages page)
    Route::get('/packages', [AdminController::class, 'getAdminPackages']);

    // Admin-only full list (including inactive)
    Route::get('/admin/packages', [AdminController::class, 'getAllAdminPackages']);

    // Create
    Route::post('/admin/packages', [AdminController::class, 'storeAdminPackage']);

    // Update
    Route::put('/admin/packages/{id}', [AdminController::class, 'updateAdminPackage']);

    // Delete
    Route::delete('/admin/packages/{id}', [AdminController::class, 'deleteAdminPackage']);


    /*
    |--------------------------------------------------------------------------
    | Chef Packages
    |--------------------------------------------------------------------------
    */

    // Get my own packages (chef only)
    Route::get('/chef/packages', [ChefController::class, 'getMyPackages']);

    // Create a package (chef only)
    Route::post('/chef/packages', [ChefController::class, 'storePackage']);

    // Delete a package (chef only)
    Route::delete('/chef/packages/{id}', [ChefController::class, 'deletePackage']);

    // Get packages for a specific chef (any authenticated user)
    Route::get('/chefs/{id}/packages', [ChefController::class, 'getChefPackages']);
});