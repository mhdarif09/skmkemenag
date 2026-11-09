<?php

namespace App\Services;

use App\Models\Occupation;
use App\Models\Question;
use App\Models\Response;
use App\Models\ServiceUnit;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

/**
 * Parses CSV/XLSX rows exported from the legacy Google Form into
 * previewable rows and commits them into responses.
 *
 * Expected source layout: a single header row followed by data rows.
 * Question columns are matched against active questions by normalized
 * text; the service unit column may combine the unit name and the need
 * (e.g. "Seksi Pendidikan MadrasahDATA GANDA") which is split by
 * matching known service unit names as prefixes.
 */
class GoogleFormImportService
{
    private const TIMESTAMP_EXPRESSION = 'd/m/Y H:i:s';

    private const TIMESTAMP_ALTERNATIVES = ['d/m/Y H:i:s', 'd/m/Y G:i:s', 'd/m/Y H:i', 'd/m/y H:i:s'];

    private const SCORE_TEXT_MAP = [
        'tidak puas' => 1,
        'tidak setuju' => 1,
        'sangat puas' => 4,
        'sangat setuju' => 4,
        'sangat baik' => 4,
        'kurang puas' => 2,
        'cukup puas' => 2,
    ];

    /**
     * @param  list<mixed>  $headers
     * @param  Collection<int, Question>  $questions
     * @return array<string, mixed>
     */
    public function mapHeaders(array $headers, Collection $questions): array
    {
        $mapping = [
            'timestamp' => null,
            'name' => null,
            'gender' => null,
            'city' => null,
            'occupation' => null,
            'unit' => null,
            'need' => null,
            'comment' => null,
            'questions' => [],
            'unmapped' => [],
        ];

        foreach ($headers as $index => $header) {
            $normalized = $this->normalize(is_string($header) ? $header : (string) $header);

            if ($mapping['timestamp'] === null && $this->hasAny($normalized, ['timestamp', 'waktu', 'tanggal'])) {
                $mapping['timestamp'] = $index;

                continue;
            }

            if ($mapping['gender'] === null
                && ($this->hasAny($normalized, ['jenis kelamin', 'gender']) || $normalized === 'jk')) {
                $mapping['gender'] = $index;

                continue;
            }

            if ($mapping['city'] === null && $this->hasAny($normalized, ['kota', 'domisili', 'asal'])) {
                $mapping['city'] = $index;

                continue;
            }

            if ($mapping['occupation'] === null && $this->hasAny($normalized, ['pekerjaan', 'profesi', 'pekerja', 'occupation'])) {
                $mapping['occupation'] = $index;

                continue;
            }

            if ($mapping['comment'] === null && $this->hasAny($normalized, ['komentar', 'saran', 'kritik', 'masukan', 'feedback'])) {
                $mapping['comment'] = $index;

                continue;
            }

            if ($mapping['unit'] === null && $this->hasAny($normalized, ['unit', 'seksi', 'bidang', 'instansi', 'layanan'])) {
                $mapping['unit'] = $index;

                continue;
            }

            if ($mapping['need'] === null && $this->hasAny($normalized, ['kebutuhan', 'maksud', 'tujuan', 'keperluan'])) {
                $mapping['need'] = $index;

                continue;
            }

            if ($mapping['name'] === null && str_contains($normalized, 'nama')) {
                $mapping['name'] = $index;

                continue;
            }

            $question = $this->matchQuestion($normalized, $questions);
            if ($question !== null) {
                $mapping['questions'][] = ['index' => $index, 'question_id' => $question['id'], 'text' => $question['text']];

                continue;
            }

            $mapping['unmapped'][] = ['index' => $index, 'header' => $header];
        }

        return $mapping;
    }

    /**
     * @param  list<list<mixed>>  $rows
     * @param  array<string, mixed>  $mapping
     * @param  Collection<int, Question>  $questions
     * @param  Collection<int, ServiceUnit>  $units
     * @return array<string, mixed>
     */
    public function preview(array $rows, array $mapping, Collection $questions, Collection $units): array
    {
        $unitNames = $this->unitNames($units);
        $seenKeys = [];
        $parsed = [];
        $summary = ['total' => count($rows), 'ok' => 0, 'warning' => 0, 'error' => 0, 'duplicate' => 0];

        foreach ($rows as $rowNumber => $row) {
            $entry = $this->parseRow($rowNumber + 2, $this->rowValues($row), $mapping, $unitNames);
            $entry['duplicate'] = false;

            $timestamp = $entry['timestamp'] instanceof Carbon ? $entry['timestamp'] : null;

            $key = $this->duplicateKey($entry);
            if ($key !== null && $timestamp !== null) {
                foreach ($seenKeys as $other) {
                    if ($other['key'] === $key && abs($timestamp->diffInMinutes($other['timestamp'])) <= 10) {
                        $entry['duplicate'] = true;
                        $entry['problems'][] = 'Baris duplikat di dalam file (nama, unit, dan kebutuhan sama dalam 10 menit). Baris ini akan dilewati.';

                        break;
                    }
                }

                $seenKeys[] = ['key' => $key, 'timestamp' => $timestamp];
            }

            if (! $entry['duplicate'] && $this->duplicateExistsInDatabase($entry)) {
                $entry['duplicate'] = true;
                $entry['problems'][] = 'Sudah ada responden dengan nama, unit layanan, dan kebutuhan yang sama dalam 10 menit di database. Baris ini akan dilewati.';
            }

            if ($entry['duplicate']) {
                $entry['status'] = 'duplicate';
                $summary['duplicate']++;
            } else {
                $summary[$entry['status']]++;
            }

            $entry['timestamp'] = $entry['timestamp_formatted'];
            unset($entry['timestamp_formatted']);
            $parsed[] = $entry;
        }

        $columns = [];
        foreach (['timestamp', 'name', 'gender', 'city', 'occupation', 'unit', 'need', 'comment'] as $field) {
            $columns[$field] = $mapping[$field];
        }
        $columns['questions'] = $mapping['questions'];

        return [
            'columns' => $columns,
            'unmapped' => $mapping['unmapped'],
            'rows' => $parsed,
            'summary' => $summary,
        ];
    }

    /**
     * Inserts rows whose status is ok or warning, skipping error and
     * duplicate rows.
     *
     * @param  list<list<mixed>>  $rows
     * @param  array<string, mixed>  $mapping
     * @param  Collection<int, Question>  $questions
     * @param  Collection<int, ServiceUnit>  $units
     * @return array{inserted: int, skipped_duplicate: int, skipped_error: int}
     */
    public function commit(array $rows, array $mapping, Collection $questions, Collection $units, int $periodId, User $user): array
    {
        $unitNames = $this->unitNames($units);
        $seenKeys = [];
        $result = ['inserted' => 0, 'skipped_duplicate' => 0, 'skipped_error' => 0];

        foreach ($rows as $rowNumber => $row) {
            $entry = $this->parseRow($rowNumber + 2, $this->rowValues($row), $mapping, $unitNames);
            $entry['duplicate'] = false;

            $timestamp = $entry['timestamp'] instanceof Carbon ? $entry['timestamp'] : null;

            $key = $this->duplicateKey($entry);
            if ($key !== null && $timestamp !== null) {
                foreach ($seenKeys as $other) {
                    if ($other['key'] === $key && abs($timestamp->diffInMinutes($other['timestamp'])) <= 10) {
                        $entry['duplicate'] = true;

                        break;
                    }
                }

                $seenKeys[] = ['key' => $key, 'timestamp' => $timestamp];
            }

            if (! $entry['duplicate'] && $this->duplicateExistsInDatabase($entry)) {
                $entry['duplicate'] = true;
            }

            if ($entry['status'] === 'error') {
                $result['skipped_error']++;

                continue;
            }

            if ($entry['duplicate'] || $entry['unit_id'] === null || $entry['gender'] === null || $entry['need'] === '') {
                $result['skipped_duplicate']++;

                continue;
            }

            $response = Response::query()->create([
                'period_id' => $periodId,
                'service_unit_id' => $entry['unit_id'],
                'occupation_id' => $this->resolveOccupationId($entry['occupation_raw']),
                'name' => $entry['name'],
                'gender' => $entry['gender'],
                'city' => $entry['city'] !== '' ? $entry['city'] : 'Palembang',
                'need' => $entry['need'],
                'comment' => $entry['comment'] !== '' ? $entry['comment'] : null,
                'follow_up_status' => Response::FOLLOW_UP_PENDING,
                'user_agent' => 'import',
                'submitted_at' => $timestamp ?? now(),
                'created_by' => $user->id,
            ]);

            foreach ($entry['scores'] as $scoreEntry) {
                if ($scoreEntry['score'] !== null) {
                    $response->answers()->create([
                        'question_id' => $scoreEntry['question_id'],
                        'score' => $scoreEntry['score'],
                    ]);
                }
            }

            $result['inserted']++;
        }

        return $result;
    }

    /**
     * @param  array<int, string>  $rowValues
     * @param  array<string, mixed>  $mapping
     * @param  array<int, array{id: int, name: string, normalized: string}>  $unitNames
     * @return array<string, mixed>
     */
    private function parseRow(int $rowNumber, array $rowValues, array $mapping, array $unitNames): array
    {
        $read = fn (mixed $index): string => is_int($index) ? trim((string) ($rowValues[$index] ?? '')) : '';

        $entry = [
            'row_number' => $rowNumber,
            'timestamp' => null,
            'timestamp_raw' => $read($mapping['timestamp'] ?? null),
            'timestamp_formatted' => null,
            'name' => $read($mapping['name'] ?? null) !== '' ? $read($mapping['name'] ?? null) : null,
            'gender' => null,
            'gender_raw' => $read($mapping['gender'] ?? null),
            'city' => $read($mapping['city'] ?? null) !== '' ? $read($mapping['city'] ?? null) : 'Palembang',
            'occupation_raw' => $read($mapping['occupation'] ?? null),
            'unit_raw' => $read($mapping['unit'] ?? null),
            'unit' => null,
            'unit_id' => null,
            'need' => '',
            'comment' => $read($mapping['comment'] ?? null),
            'scores' => [],
            'status' => 'ok',
            'problems' => [],
        ];

        $problems = [];
        $markProblem = function (string $message, string $suggestion) use (&$problems): void {
            $problems[] = ['message' => $message, 'suggestion' => $suggestion];
        };

        // Timestamp
        $timestamp = $this->parseTimestamp($entry['timestamp_raw']);
        if ($timestamp === null && $entry['timestamp_raw'] !== '') {
            $markProblem(
                'Waktu tidak valid ('.$entry['timestamp_raw'].').',
                'Baris tetap diimpor dengan waktu saat impor. Format yang benar: dd/mm/yyyy jj:mm:ss, contoh 02/11/2026 10:30:00.'
            );
            $entry['status'] = 'warning';
        }
        $entry['timestamp'] = $timestamp;
        $entry['timestamp_formatted'] = $timestamp?->format(self::TIMESTAMP_EXPRESSION);

        // Gender (required by the schema enum)
        $gender = $this->parseGender($entry['gender_raw']);
        if ($gender === null) {
            $markProblem(
                'Jenis kelamin tidak dikenali ("'.$entry['gender_raw'].'").',
                'Baris ini dilewati. Isi kolom jenis kelamin dengan Laki-laki atau Perempuan.'
            );
            $entry['status'] = 'error';
        } else {
            $entry['gender'] = $gender;
        }

        // Unit + need split (combined column support)
        $split = $this->splitUnitAndNeed($entry['unit_raw'], $unitNames);
        $entry['unit'] = $split['name'];
        $entry['unit_id'] = $split['id'];
        $entry['need'] = $split['need'];

        if ($split['id'] === null) {
            $markProblem(
                'Unit layanan tidak dikenali ('.$entry['unit_raw'].' ).',
                'Baris ini dilewati. Awali kolom pilihan layanan dengan nama unit layanan yang terdaftar.'
            );
            $entry['status'] = 'error';
        }

        if ($entry['need'] === '') {
            $markProblem(
                'Kebutuhan kosong.',
                'Baris ini dilewati karena kebutuhan wajib diisi.'
            );
            $entry['status'] = 'error';
        }

        // Scores for mapped question columns
        foreach ($mapping['questions'] as $questionMapping) {
            $raw = trim((string) ($rowValues[$questionMapping['index']] ?? ''));
            $score = $this->scoreFromRaw($raw);
            $entry['scores'][] = [
                'question_id' => $questionMapping['question_id'],
                'text' => $questionMapping['text'],
                'raw' => $raw,
                'score' => $score,
            ];

            if ($score === null && $raw !== '') {
                $markProblem(
                    'Nilai tidak dikenali ("'.$raw.'") pada pertanyaan "'.$questionMapping['text'].'".',
                    'Gunakan angka 1-4 atau pilihan jawaban standar; jawaban ini tidak dihitung.'
                );
                $entry['status'] = $entry['status'] === 'error' ? 'error' : 'warning';
            } elseif ($score === null) {
                $markProblem(
                    'Jawaban kosong pada pertanyaan "'.$questionMapping['text'].'".',
                    'Jawaban ini tidak dihitung.'
                );
                $entry['status'] = $entry['status'] === 'error' ? 'error' : 'warning';
            }
        }

        $entry['problems'] = $problems;

        return $entry;
    }

    /**
     * Splits a combined service-unit column value (e.g.
     * "Seksi Pendidikan MadrasahDATA GANDA") by matching known unit
     * names (longest first) as prefixes.
     *
     * @param  array<int, array{id: int, name: string, normalized: string}>  $unitNames
     * @return array{name: string|null, id: int|null, need: string}
     */
    private function splitUnitAndNeed(string $raw, array $unitNames): array
    {
        foreach ($unitNames as $unit) {
            $position = mb_stripos($raw, $unit['name']);
            if ($position !== false) {
                $need = trim(mb_substr($raw, $position + mb_strlen($unit['name'])));

                return ['name' => $unit['name'], 'id' => $unit['id'], 'need' => $need];
            }
        }

        return ['name' => null, 'id' => null, 'need' => $raw];
    }

    /**
     * @param  Collection<int, ServiceUnit>  $units
     * @return array<int, array{id: int, name: string, normalized: string}>
     */
    private function unitNames(Collection $units): array
    {
        $names = $units->map(fn (ServiceUnit $unit): array => [
            'id' => $unit->id,
            'name' => $unit->name,
            'normalized' => $this->normalize($unit->name),
        ])->all();

        usort($names, fn (array $a, array $b): int => mb_strlen($b['name']) <=> mb_strlen($a['name']));

        return $names;
    }

    /**
     * @param  Collection<int, Question>  $questions
     * @return array{id: int, text: string}|null
     */
    private function matchQuestion(string $normalizedHeader, Collection $questions): ?array
    {
        foreach ($questions as $question) {
            $questionNormalized = $this->normalize($question->text);

            if ($questionNormalized === $normalizedHeader) {
                return ['id' => $question->id, 'text' => $question->text];
            }

            if (mb_strlen($questionNormalized) >= 10 && str_contains($normalizedHeader, $questionNormalized)) {
                return ['id' => $question->id, 'text' => $question->text];
            }

            if (mb_strlen($normalizedHeader) >= 10 && str_contains($questionNormalized, $normalizedHeader)) {
                return ['id' => $question->id, 'text' => $question->text];
            }
        }

        return null;
    }

    /**
     * Same name + service unit + need within 10 minutes as in the
     * public submission flow.
     *
     * @param  array<string, mixed>  $entry
     */
    private function duplicateExistsInDatabase(array $entry): bool
    {
        $unitId = $entry['unit_id'];
        $timestamp = $entry['timestamp'] instanceof Carbon ? $entry['timestamp'] : null;
        $name = $entry['name'] ?? '(anonim)';

        if (! is_int($unitId) || $timestamp === null) {
            return false;
        }

        $responses = Response::query()
            ->where('service_unit_id', $unitId)
            ->whereRaw('LOWER(need) = ?', [mb_strtolower($entry['need'])])
            ->whereRaw('LOWER(COALESCE(name, ?)) = ?', ['(anonim)', mb_strtolower($name)])
            ->get(['submitted_at']);

        foreach ($responses as $response) {
            if ($response->submitted_at !== null && abs($timestamp->diffInMinutes($response->submitted_at)) <= 10) {
                return true;
            }
        }

        return false;
    }

    /**
     * @param  array<string, mixed>  $entry
     */
    private function duplicateKey(array $entry): ?string
    {
        $unitId = $entry['unit_id'];
        $name = $entry['name'] ?? '(anonim)';

        if (! is_int($unitId)) {
            return null;
        }

        return implode('|', [$name, $unitId, mb_strtolower($entry['need'])]);
    }

    private function normalize(string $value): string
    {
        $value = mb_strtolower(trim($value));
        $value = (string) preg_replace('/[^a-z0-9]+/u', ' ', $value);

        return trim((string) preg_replace('/\s+/u', ' ', $value));
    }

    /**
     * @param  list<string>  $needles
     */
    private function hasAny(string $haystack, array $needles): bool
    {
        foreach ($needles as $needle) {
            if (str_contains($haystack, $needle)) {
                return true;
            }
        }

        return false;
    }

    private function parseTimestamp(string $value): ?Carbon
    {
        if ($value === '') {
            return null;
        }

        foreach (self::TIMESTAMP_ALTERNATIVES as $format) {
            $timestamp = Carbon::createFromFormat($format, $value);
            if ($timestamp !== false && $timestamp->format($format) === $value) {
                return $timestamp;
            }
        }

        return null;
    }

    private function parseGender(string $value): ?string
    {
        $normalized = $this->normalize($value);

        if (in_array($normalized, ['l', 'laki laki', 'laki', 'pria', 'male'], true)) {
            return 'L';
        }

        if (in_array($normalized, ['p', 'perempuan', 'wanita', 'female'], true)) {
            return 'P';
        }

        return null;
    }

    private function scoreFromRaw(string $raw): ?int
    {
        if ($raw === '') {
            return null;
        }

        if (ctype_digit($raw)) {
            $score = (int) $raw;

            return $score >= 1 && $score <= 4 ? $score : null;
        }

        $normalized = $this->normalize($raw);

        foreach (self::SCORE_TEXT_MAP as $needle => $score) {
            if (str_contains($normalized, $needle)) {
                return $score;
            }
        }

        return null;
    }

    private function resolveOccupationId(string $raw): int
    {
        $name = $raw !== '' ? $raw : 'Lainnya';

        $occupation = Occupation::query()
            ->whereRaw('LOWER(name) = ?', [mb_strtolower($name)])
            ->first();

        if ($occupation === null) {
            $occupation = Occupation::query()->create(['name' => $name, 'is_active' => false]);
        }

        return $occupation->id;
    }

    /**
     * @param  list<mixed>  $row
     * @return array<int, string>
     */
    private function rowValues(array $row): array
    {
        $values = [];

        foreach ($row as $value) {
            $values[] = is_string($value) ? trim($value) : (string) $value;
        }

        return $values;
    }
}
