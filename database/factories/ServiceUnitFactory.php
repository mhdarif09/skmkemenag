<?php

namespace Database\Factories;

use App\Models\ServiceUnit;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ServiceUnit>
 */
class ServiceUnitFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => 'Seksi '.fake()->unique()->word(),
            'description' => fake()->sentence(),
            'is_active' => true,
        ];
    }
}
