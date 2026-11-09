<?php

namespace Database\Seeders;

use App\Models\ServiceUnit;
use Illuminate\Database\Seeder;

class ServiceUnitSeeder extends Seeder
{
    /**
     * @var list<array<string, null|string>>
     */
    public const UNITS = [
        ['name' => 'SETJEN', 'description' => 'PTSP/PPID/Kepegawaian/Keuangan/TU Umum'],
        ['name' => 'Seksi PD Pontren', 'description' => null],
        ['name' => 'Seksi Pendidikan Madrasah', 'description' => null],
        ['name' => 'Penyelenggara Kristen', 'description' => null],
    ];

    public function run(): void
    {
        foreach (self::UNITS as $unit) {
            ServiceUnit::create($unit);
        }
    }
}
