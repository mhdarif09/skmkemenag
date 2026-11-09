<?php

namespace Database\Factories;

use App\Models\Period;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Period>
 */
class PeriodFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => 'Survei '.fake()->monthName().' '.fake()->year(),
            'start_date' => Carbon::now()->subMonths(6),
            'end_date' => Carbon::now()->addMonths(5),
            'is_active' => false,
        ];
    }

    public function active(): static
    {
        return $this->state(fn (array $attributes): array => [
            'start_date' => now()->subDays(7)->startOfDay(),
            'end_date' => now()->addDays(60)->endOfDay(),
            'is_active' => true,
        ]);
    }
}
