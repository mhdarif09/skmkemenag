<?php

namespace Database\Seeders;

use App\Models\Occupation;
use App\Models\Period;
use App\Models\Question;
use App\Models\Response;
use App\Models\ResponseAnswer;
use App\Models\ServiceUnit;
use Illuminate\Database\Seeder;

/**
 * Demo data modelled after the legacy Google Form export (8 responses
 * between 03-09 November 2026). Run together with the other seeders via
 * `php artisan migrate:fresh --seed`.
 */
class DemoResponseSeeder extends Seeder
{
    /**
     * Sums of scores (15 questions, 1-4) per respondent are kept realistic:
     * mostly good service with a spread across respondents.
     *
     * @var list<array<string, mixed>>
     */
    public const ROWS = [
        ['name' => 'Mulyani', 'gender' => 'P', 'unit' => 'Seksi Pendidikan Madrasah', 'need' => 'DATA GANDA', 'scores' => [4, 4, 4, 4, 4, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4], 'date' => '2026-11-03 09:21:15', 'comment' => null],
        ['name' => 'Ahmad Fauzi', 'gender' => 'L', 'unit' => 'SETJEN', 'need' => 'Mengambil SKP triwulan 3', 'scores' => [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4], 'date' => '2026-11-03 10:02:44', 'comment' => 'Pelayanan sudah baik, terima kasih.'],
        ['name' => 'Siti Aminah', 'gender' => 'P', 'unit' => 'SETJEN', 'need' => 'Pengambilan surat keterangan', 'scores' => [4, 4, 3, 4, 4, 4, 4, 3, 4, 4, 4, 4, 4, 4, 4], 'date' => '2026-11-04 08:15:30', 'comment' => null],
        ['name' => 'Budi Santoso', 'gender' => 'L', 'unit' => 'Seksi PD Pontren', 'need' => 'Verifikasi data pontren', 'scores' => [3, 3, 4, 4, 3, 4, 4, 4, 3, 3, 4, 3, 4, 4, 4], 'date' => '2026-11-05 13:40:10', 'comment' => 'Prosedur perlu diperjelas di loket.'],
        ['name' => 'Rina Marlina', 'gender' => 'P', 'unit' => 'Seksi Pendidikan Madrasah', 'need' => 'Pengajuan izin operasional madrasah', 'scores' => [4, 4, 4, 4, 4, 4, 4, 4, 4, 3, 4, 4, 4, 4, 4], 'date' => '2026-11-06 09:05:00', 'comment' => null],
        ['name' => 'Joko Prasetyo', 'gender' => 'L', 'unit' => 'SETJEN', 'need' => 'Pengambilan SKP tahunan', 'scores' => [4, 4, 4, 4, 4, 3, 4, 4, 4, 4, 4, 4, 3, 4, 4], 'date' => '2026-11-07 14:33:52', 'comment' => null],
        ['name' => 'Mulyani', 'gender' => 'P', 'unit' => 'Seksi PD Pontren', 'need' => 'Pembinaan TPQ', 'scores' => [4, 3, 4, 4, 4, 4, 4, 4, 4, 4, 3, 4, 4, 4, 4], 'date' => '2026-11-09 10:10:22', 'comment' => 'Petugas ramah dan cepat.'],
        ['name' => 'Dedi Mulyadi', 'gender' => 'L', 'unit' => 'Penyelenggara Kristen', 'need' => 'Pengurusan surat rekomendasi', 'scores' => [3, 4, 4, 4, 4, 4, 3, 4, 4, 4, 4, 4, 4, 3, 4], 'date' => '2026-11-09 15:47:30', 'comment' => null],
    ];

    public function run(): void
    {
        $period = Period::query()->where('is_active', true)->first();

        if ($period === null) {
            $this->command?->warn('No active period; demo responses skipped.');

            return;
        }

        $units = ServiceUnit::query()->pluck('id', 'name')->all();
        $occupations = Occupation::query()->pluck('id', 'name')->all();
        $questions = Question::query()->orderBy('order')->get();

        foreach (self::ROWS as $index => $row) {
            $response = Response::create([
                'period_id' => $period->id,
                'service_unit_id' => $units[$row['unit']] ?? null,
                'occupation_id' => $occupations['ASN'],
                'name' => $row['name'],
                'gender' => $row['gender'],
                'city' => $index === 4 ? 'Palembabg' : 'Palembang',
                'need' => $row['need'],
                'comment' => $row['comment'],
                'follow_up_status' => Response::FOLLOW_UP_PENDING,
                'ip_hash' => hash('sha256', 'demo-ip-'.$index),
                'user_agent' => 'DemoSeeder/1.0',
                'submitted_at' => $row['date'],
            ]);

            foreach ($questions as $questionIndex => $question) {
                ResponseAnswer::create([
                    'response_id' => $response->id,
                    'question_id' => $question->id,
                    'score' => $row['scores'][$questionIndex],
                ]);
            }
        }
    }
}
