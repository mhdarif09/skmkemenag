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
     * Monotonic counter so factory-created period names stay unique even
     * when several periods are created inside one test.
     */
    private static int $sequence = 0;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $months = [
            'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
        ];

        $index = self::$sequence++;
        $month = $months[$index % 12];
        $year = 2025 + intdiv($index, 12);

        return [
            'name' => "Survei {$month} {$year}",
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
