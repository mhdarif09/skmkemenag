<?php

namespace Database\Factories;

use App\Models\Question;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Question>
 */
class QuestionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'group' => Question::GROUP_SERVICE,
            'text' => fake()->sentence(),
            'order' => fake()->unique()->numberBetween(1, 100),
            'is_active' => true,
        ];
    }

    public function antiCorruption(): static
    {
        return $this->state(fn (array $attributes): array => [
            'group' => Question::GROUP_ANTI_CORRUPTION,
        ]);
    }
}
