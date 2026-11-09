<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Imports\GoogleFormSheets;
use App\Models\Period;
use App\Models\Question;
use App\Models\ServiceUnit;
use App\Models\User;
use App\Services\GoogleFormImportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class ImporterController extends Controller
{
    public function index()
    {
        return Inertia::render('admin/importer/index', [
            'periods' => Period::query()->orderBy('start_date', 'desc')->get(['id', 'name', 'is_active']),
        ]);
    }

    /**
     * Parse the uploaded legacy Google Form export and return a
     * preview without touching the database.
     */
    public function preview(Request $request, GoogleFormImportService $service): JsonResponse
    {
        [$rows, $mapping, $questions, $units] = $this->parse($request, $service);

        $preview = $service->preview($rows, $mapping, $questions, $units);

        return response()->json($preview);
    }

    /**
     * Commit the parsed rows: inserts ok and warning rows, skips
     * error and duplicate rows.
     */
    public function commit(Request $request, GoogleFormImportService $service): JsonResponse
    {
        $validated = $request->validate([
            'period_id' => ['required', 'integer', 'exists:periods,id'],
            'file' => ['required', 'file', 'mimes:csv,txt,xlsx'],
        ]);

        /** @var User $user */
        $user = $request->user();

        [$rows, $mapping, $questions, $units] = $this->parse($request, $service);

        $result = $service->commit($rows, $mapping, $questions, $units, (int) $validated['period_id'], $user);

        return response()->json($result);
    }

    /**
     * Download a CSV template whose headers exactly match what the
     * importer's header mapper expects (Google Form export style).
     */
    public function template(): Response
    {
        $questions = Question::query()->where('is_active', true)->orderBy('order')->pluck('text');
        $units = ServiceUnit::query()->where('is_active', true)->orderBy('name')->pluck('name');

        $headers = [
            'Timestamp',
            'Nama',
            'Jenis Kelamin (L/P)',
            'Kota Domisili',
            'Pekerjaan',
            'Unit Layanan',
            'Kebutuhan',
            ...$questions->all(),
            'Komentar / Saran (opsional)',
        ];

        $firstUnit = $units->first() ?? 'Seksi Pendidikan Madrasah';

        $example = [
            '2026-11-09 09:15:00',
            'Contoh Responden',
            'L',
            'Palembang',
            'ASN',
            $firstUnit,
            'Contoh kebutuhan layanan',
            ...array_fill(0, $questions->count(), 4),
            'Contoh saran (boleh kosong)',
        ];

        $csv = implode(',', array_map($this->csvCell(...), $headers))."\n";
        $csv .= implode(',', array_map($this->csvCell(...), $example))."\n";

        return response($csv, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="template-import-survei.csv"',
        ]);
    }

    private function csvCell(mixed $value): string
    {
        $cell = (string) $value;

        if (str_contains($cell, ',') || str_contains($cell, '"') || str_contains($cell, "\n")) {
            return '"'.str_replace('"', '""', $cell).'"';
        }

        return $cell;
    }

    /**
     * @return array{0: list<list<mixed>>, 1: array<string, mixed>, 2: Collection<int, Question>, 3: Collection<int, ServiceUnit>}
     */
    private function parse(Request $request, GoogleFormImportService $service): array
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt,xlsx'],
        ]);

        $data = Excel::toArray(new GoogleFormSheets, $request->file('file'));

        /** @var list<list<mixed>> $sheet */
        $sheet = $data[0] ?? [];

        $headers = $sheet[0] ?? [];
        $rows = array_slice($sheet, 1);

        $questions = Question::query()->where('is_active', true)->orderBy('order')->get();
        $units = ServiceUnit::query()->where('is_active', true)->orderBy('name')->get();

        $mapping = $service->mapHeaders($headers, $questions);

        return [$rows, $mapping, $questions, $units];
    }
}
