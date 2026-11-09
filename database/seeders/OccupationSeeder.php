<?php

namespace Database\Seeders;

use App\Models\Occupation;
use Illuminate\Database\Seeder;

class OccupationSeeder extends Seeder
{
    public function run(): void
    {
        foreach (['ASN', 'NON ASN'] as $name) {
            Occupation::create(['name' => $name]);
        }
    }
}
