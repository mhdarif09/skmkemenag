<?php

namespace Database\Seeders;

use App\Models\Period;
use Illuminate\Database\Seeder;

class PeriodSeeder extends Seeder
{
    public function run(): void
    {
        Period::create([
            'name' => 'Survei November 2026',
            'start_date' => '2026-11-03',
            'end_date' => '2026-12-20',
            'is_active' => true,
        ]);
    }
}
