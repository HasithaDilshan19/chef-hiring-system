<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\ChefProfile;
use App\Models\Booking;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Seed Admin
        $admin = User::create([
            'name' => 'Admin System',
            'email' => 'admin@chefhiring.lk',
            'password' => Hash::make('password123'),
            'role' => 'admin',
            'phone' => '0771234567',
        ]);

        // 2. Seed Customer
        $customer = User::create([
            'name' => 'Customer Hasitha',
            'email' => 'user@chefhiring.lk',
            'password' => Hash::make('password123'),
            'role' => 'user',
            'phone' => '0755566778',
        ]);

        // 3. Seed Chef 1 (Kamal)
        $chef1 = User::create([
            'name' => 'Chef Kamal Silva',
            'email' => 'chef@chefhiring.lk',
            'password' => Hash::make('password123'),
            'role' => 'chef',
            'phone' => '0777654321',
        ]);

        ChefProfile::create([
            'user_id' => $chef1->id,
            'experience_years' => 12,
            'cuisine_specialities' => ['Sri Lankan', 'Indian', 'Western'],
            'hourly_rate' => 4500.00,
            'availability_status' => 'available',
            'latitude' => 6.927179, // Colombo
            'longitude' => 79.861244,
            'city' => 'Colombo',
            'rating' => 4.80,
            'reliability_score' => 98.50,
            'bio' => 'Kamal is a seasoned chef specializing in traditional Sri Lankan spices and authentic South Asian buffets for large crowds.',
        ]);

        // 4. Seed Chef 2 (Nimal)
        $chef2 = User::create([
            'name' => 'Chef Nimal Perera',
            'email' => 'chef2@chefhiring.lk',
            'password' => Hash::make('password123'),
            'role' => 'chef',
            'phone' => '0711122334',
        ]);

        ChefProfile::create([
            'user_id' => $chef2->id,
            'experience_years' => 8,
            'cuisine_specialities' => ['Sri Lankan', 'Chinese'],
            'hourly_rate' => 3500.00,
            'availability_status' => 'available',
            'latitude' => 6.901500, // Nugegoda
            'longitude' => 79.880000,
            'city' => 'Nugegoda',
            'rating' => 4.50,
            'reliability_score' => 95.00,
            'bio' => 'Nimal is an expert in fusion cuisine, particularly Sri Lankan-style Chinese dishes and fast catering.',
        ]);

        // 5. Seed Chef 3 (Sunethra)
        $chef3 = User::create([
            'name' => 'Chef Sunethra De Silva',
            'email' => 'chef3@chefhiring.lk',
            'password' => Hash::make('password123'),
            'role' => 'chef',
            'phone' => '0722233445',
        ]);

        ChefProfile::create([
            'user_id' => $chef3->id,
            'experience_years' => 15,
            'cuisine_specialities' => ['Sri Lankan', 'Western', 'Italian'],
            'hourly_rate' => 6000.00,
            'availability_status' => 'busy',
            'latitude' => 7.290600, // Kandy
            'longitude' => 80.633700,
            'city' => 'Kandy',
            'rating' => 4.95,
            'reliability_score' => 99.00,
            'bio' => 'Sunethra has worked in 5-star hotels in Sri Lanka and Italy. Specializes in luxury event catering.',
        ]);

        // 6. Seed Bookings
        Booking::create([
            'customer_id' => $customer->id,
            'chef_id' => $chef1->id,
            'event_date' => Carbon::now()->addDays(2)->toDateString(),
            'event_time' => '12:00 PM',
            'event_type' => 'Family Gathering',
            'location' => 'Kollupitiya, Colombo 03',
            'guests_count' => 40,
            'status' => 'pending',
            'total_price' => 18000.00,
        ]);

        Booking::create([
            'customer_id' => $customer->id,
            'chef_id' => $chef2->id,
            'event_date' => Carbon::now()->addDays(7)->toDateString(),
            'event_time' => '07:00 PM',
            'event_type' => 'Birthday Party',
            'location' => 'Pagoda Road, Nugegoda',
            'guests_count' => 25,
            'status' => 'accepted',
            'total_price' => 14000.00,
        ]);
    }
}
