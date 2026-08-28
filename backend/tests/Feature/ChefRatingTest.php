<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\ChefProfile;
use App\Models\Review;

class ChefRatingTest extends TestCase
{
    use RefreshDatabase;

    protected $chef;
    protected $chefProfile;
    protected $customer1;
    protected $customer2;

    protected function setUp(): void
    {
        parent::setUp();

        $this->chef = User::factory()->create([
            'role' => 'chef',
            'status' => 'active',
        ]);

        $this->chefProfile = ChefProfile::create([
            'user_id' => $this->chef->id,
            'bio' => 'Sample bio',
            'experience_years' => 5,
            'hourly_rate' => 2500,
            'availability_status' => 'available',
            'city' => 'Colombo',
            'rating' => 0,
        ]);

        $this->customer1 = User::factory()->create([
            'role' => 'customer',
            'status' => 'active',
        ]);

        $this->customer2 = User::factory()->create([
            'role' => 'customer',
            'status' => 'active',
        ]);
    }

    public function test_chef_index_and_show_return_correct_rating_and_review_count()
    {
        Review::create([
            'chef_id' => $this->chef->id,
            'user_id' => $this->customer1->id,
            'rating' => 4,
            'comment' => 'Great experience!',
        ]);

        Review::create([
            'chef_id' => $this->chef->id,
            'user_id' => $this->customer2->id,
            'rating' => 5,
            'comment' => 'Excellent chef!',
        ]);

        $responseIndex = $this->actingAs($this->customer1)
            ->getJson('/api/chefs');

        $responseIndex->assertStatus(200)
            ->assertJsonPath('status', 'success');

        $chefDataIndex = collect($responseIndex->json('chefs'))->firstWhere('id', $this->chef->id);
        $this->assertEquals(4.5, $chefDataIndex['rating']);
        $this->assertEquals(2, $chefDataIndex['reviews_count']);

        $responseShow = $this->actingAs($this->customer1)
            ->getJson("/api/chefs/{$this->chef->id}");

        $responseShow->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('average_rating', 4.5)
            ->assertJsonPath('review_count', 2);
    }

    public function test_submitting_updating_and_deleting_review_updates_chef_profile_rating()
    {
        // 1. Submit review
        $responseAdd = $this->actingAs($this->customer1)
            ->postJson("/api/chefs/{$this->chef->id}/reviews", [
                'rating' => 4,
                'comment' => 'Very good dishes',
            ]);

        $responseAdd->assertStatus(201);
        $this->assertEquals(4.00, (float)$this->chefProfile->fresh()->rating);

        $reviewId = $responseAdd->json('review.id');

        // 2. Submit second review
        $this->actingAs($this->customer2)
            ->postJson("/api/chefs/{$this->chef->id}/reviews", [
                'rating' => 2,
                'comment' => 'Could be better',
            ]);

        $this->assertEquals(3.00, (float)$this->chefProfile->fresh()->rating);

        // 3. Update first review
        $this->actingAs($this->customer1)
            ->putJson("/api/chef-reviews/{$reviewId}", [
                'rating' => 5,
                'comment' => 'Updated: Amazing service!',
            ]);

        $this->assertEquals(3.50, (float)$this->chefProfile->fresh()->rating);

        // 4. Delete review
        $this->actingAs($this->customer1)
            ->deleteJson("/api/chef-reviews/{$reviewId}");

        $this->assertEquals(2.00, (float)$this->chefProfile->fresh()->rating);
    }

    public function test_chef_dashboard_stats_returns_correct_average_rating()
    {
        Review::create([
            'chef_id' => $this->chef->id,
            'user_id' => $this->customer1->id,
            'rating' => 5,
            'comment' => 'Outstanding!',
        ]);

        Review::create([
            'chef_id' => $this->chef->id,
            'user_id' => $this->customer2->id,
            'rating' => 4,
            'comment' => 'Delicious food!',
        ]);

        $response = $this->actingAs($this->chef)
            ->getJson('/api/chef/stats');

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.stats.rating', 4.5)
            ->assertJsonPath('data.stats.reviews_count', 2);
    }
}
