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
        ['name' => 'Sekretariat Jenderal (PPID / TU Umum / Kepegawaian / Keuangan / Protokol)', 'description' => 'PPID, TU Umum, Kepegawaian, Keuangan, Protokol'],
        ['name' => 'Seksi Pendidikan Madrasah', 'description' => null],
        ['name' => 'Seksi Pendidikan Agama Islam', 'description' => null],
        ['name' => 'Bimbingan Masyarakat Islam', 'description' => null],
        ['name' => 'Penyelenggara Zakat Wakaf', 'description' => null],
        ['name' => 'Penyelenggara Kristen', 'description' => null],
        ['name' => 'Penyelenggara Buddha', 'description' => null],
        ['name' => 'Seksi Pendidikan Diniyah dan Pondok Pesantren', 'description' => null],
    ];

    public function run(): void
    {
        foreach (self::UNITS as $unit) {
            ServiceUnit::firstOrCreate(['name' => $unit['name']], $unit);
        }
    }
}
