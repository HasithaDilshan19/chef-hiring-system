<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\ChefProfile;

class UserDeactivationTest extends TestCase
{
    use RefreshDatabase;

    public function test_deactivated_user_cannot_login()
    {
        $user = User::factory()->create([
            'email' => 'deactivated_user@example.com',
            'password' => bcrypt('password123'),
            'role' => 'user',
            'status' => 'inactive',
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'deactivated_user@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(403)
            ->assertJson([
                'status' => 'error',
                'message' => 'Your account has been deactivated. Please contact support.',
            ]);
    }

    public function test_deactivated_chef_cannot_login()
    {
        $chef = User::factory()->create([
            'email' => 'deactivated_chef@example.com',
            'password' => bcrypt('password123'),
            'role' => 'chef',
            'status' => 'inactive',
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'deactivated_chef@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(403)
            ->assertJson([
                'status' => 'error',
                'message' => 'Your account has been deactivated. Please contact support.',
            ]);
    }

    public function test_deactivated_chef_is_hidden_from_chef_search()
    {
        $activeChef = User::factory()->create([
            'role' => 'chef',
            'status' => 'active',
        ]);
        ChefProfile::create([
            'user_id' => $activeChef->id,
            'experience_years' => 5,
            'cuisine_specialities' => ['Italian'],
            'hourly_rate' => 2500,
            'city' => 'Colombo',
            'availability_status' => 'available',
        ]);

        $inactiveChef = User::factory()->create([
            'role' => 'chef',
            'status' => 'inactive',
        ]);
        ChefProfile::create([
            'user_id' => $inactiveChef->id,
            'experience_years' => 3,
            'cuisine_specialities' => ['French'],
            'hourly_rate' => 2000,
            'city' => 'Colombo',
            'availability_status' => 'available',
        ]);

        $customer = User::factory()->create(['role' => 'user', 'status' => 'active']);
        $token = $customer->createToken('test_token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/chefs');

        $response->assertStatus(200);
        $chefIds = collect($response->json('chefs'))->pluck('id');

        $this->assertTrue($chefIds->contains($activeChef->id));
        $this->assertFalse($chefIds->contains($inactiveChef->id));
    }

    public function test_deactivated_chef_details_returns_404()
    {
        $inactiveChef = User::factory()->create([
            'role' => 'chef',
            'status' => 'inactive',
        ]);
        ChefProfile::create([
            'user_id' => $inactiveChef->id,
            'experience_years' => 3,
            'cuisine_specialities' => ['French'],
            'hourly_rate' => 2000,
            'city' => 'Colombo',
            'availability_status' => 'available',
        ]);

        $customer = User::factory()->create(['role' => 'user', 'status' => 'active']);
        $token = $customer->createToken('test_token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->getJson("/api/chefs/{$inactiveChef->id}");

        $response->assertStatus(404);
    }

    public function test_cannot_book_deactivated_chef()
    {
        $inactiveChef = User::factory()->create([
            'role' => 'chef',
            'status' => 'inactive',
        ]);
        ChefProfile::create([
            'user_id' => $inactiveChef->id,
            'experience_years' => 3,
            'cuisine_specialities' => ['French'],
            'hourly_rate' => 2000,
            'city' => 'Colombo',
            'availability_status' => 'available',
        ]);

        $customer = User::factory()->create(['role' => 'user', 'status' => 'active']);
        $token = $customer->createToken('test_token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/bookings', [
                'chef_id' => $inactiveChef->id,
                'event_date' => now()->addDays(2)->format('Y-m-d'),
                'event_time' => '18:00',
                'event_type' => 'Dinner Party',
                'location' => 'Colombo',
                'guests_count' => 4,
                'total_price' => 5000,
            ]);

        $response->assertStatus(400);
    }

    public function test_admin_deactivating_user_revokes_tokens()
    {
        $admin = User::factory()->create(['role' => 'admin', 'status' => 'active']);
        $adminToken = $admin->createToken('admin_token')->plainTextToken;

        $user = User::factory()->create(['role' => 'user', 'status' => 'active']);
        $userToken = $user->createToken('user_token')->plainTextToken;

        $this->assertEquals(1, $user->tokens()->count());

        $response = $this->withHeader('Authorization', "Bearer $adminToken")
            ->putJson("/api/admin/users/{$user->id}/status", [
                'status' => 'inactive',
            ]);

        $response->assertStatus(200);

        $this->assertEquals(0, $user->tokens()->count());
    }

    public function test_can_book_admin_package()
    {
        $activeChef = User::factory()->create([
            'role' => 'chef',
            'status' => 'active',
        ]);
        ChefProfile::create([
            'user_id' => $activeChef->id,
            'experience_years' => 5,
            'cuisine_specialities' => ['Italian'],
            'hourly_rate' => 2500,
            'city' => 'Colombo',
            'availability_status' => 'available',
        ]);

        $adminPkg = \App\Models\AdminPackage::create([
            'name' => 'Family Feast',
            'eyebrow' => 'For sharing',
            'price' => 'LKR 8,000',
            'guests_count' => 4,
            'duration_hours' => 3,
            'is_active' => true,
        ]);

        $customer = User::factory()->create(['role' => 'user', 'status' => 'active']);
        $token = $customer->createToken('test_token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/bookings', [
                'chef_id' => $activeChef->id,
                'package_id' => $adminPkg->id,
                'package_name' => $adminPkg->name,
                'package_price' => $adminPkg->price,
                'event_date' => now()->addDays(2)->format('Y-m-d'),
                'event_time' => '18:00',
                'event_type' => 'Family Feast',
                'location' => 'Colombo',
                'guests_count' => 4,
                'total_price' => 8000,
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'status' => 'success',
            ]);
    }
}
