<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\ChefProfile;

class LoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_login_successfully()
    {
        $admin = User::factory()->create([
            'email' => 'admin@chefhiring.lk',
            'password' => \Illuminate\Support\Facades\Hash::make('password123'),
            'role' => 'admin',
            'status' => 'active',
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'admin@chefhiring.lk',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.user.role', 'admin');
    }

    public function test_customer_can_login_successfully()
    {
        $user = User::factory()->create([
            'email' => 'user@chefhiring.lk',
            'password' => \Illuminate\Support\Facades\Hash::make('password123'),
            'role' => 'user',
            'status' => 'active',
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'user@chefhiring.lk',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.user.role', 'user');
    }

    public function test_chef_can_login_successfully()
    {
        $chef = User::factory()->create([
            'email' => 'chef@chefhiring.lk',
            'password' => \Illuminate\Support\Facades\Hash::make('password123'),
            'role' => 'chef',
            'status' => 'active',
        ]);

        ChefProfile::create([
            'user_id' => $chef->id,
            'experience_years' => 5,
            'cuisine_specialities' => ['Sri Lankan'],
            'hourly_rate' => 2000,
            'availability_status' => 'available',
            'city' => 'Colombo',
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'chef@chefhiring.lk',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.user.role', 'chef');
    }

    public function test_login_fails_with_invalid_password()
    {
        User::factory()->create([
            'email' => 'user@chefhiring.lk',
            'password' => \Illuminate\Support\Facades\Hash::make('password123'),
            'role' => 'user',
            'status' => 'active',
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'user@chefhiring.lk',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(401)
            ->assertJsonPath('status', 'error')
            ->assertJsonPath('message', 'Invalid credentials');
    }
}
