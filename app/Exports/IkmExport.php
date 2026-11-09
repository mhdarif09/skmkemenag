<?php

namespace App\Exports;

use App\Models\Period;
use App\Models\Question;
use App\Models\Response;
use App\Models\ResponseAnswer;
use App\Models\ServiceUnit;
use App\Services\IkmCalculator;
use Illuminate\Support\Enumerable;
use Maatwebsite\Excel\Concerns\Export;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class IkmExport implements Export, ShouldAutoSize, WithMultipleSheets
{
    public function __construct(
        public readonly ?int $periodId = null,
        public readonly ?int $serviceUnitId = null,
    ) {}

    public function sheets(): array
    {
        $ikm = $this->periodId ? (new IkmCalculator)->calculate(
            $this->periodId,
            $this->serviceUnitId,
        ) : null;

        return [
            'Rekap Responden' => new RecapSheet($this->periodId, $this->serviceUnitId),
            'NRR per Pertanyaan' => new NrrSheet($this->periodId, $this->serviceUnitId, $ikm),
            'IKM' => new IkmsSheet($this->periodId, $this->serviceUnitId, $ikm),
        ];
    }
}

class RecapSheet implements FromCollection, WithHeadings, WithStyles
{
    public function __construct(
        public readonly ?int $periodId = null,
        public readonly ?int $serviceUnitId = null,
    ) {}

    public function collection(): Enumerable
    {
        return Response::query()
            ->with(['period', 'serviceUnit', 'occupation', 'answers.question'])
            ->when($this->periodId, fn ($q) => $q->where('period_id', $this->periodId))
            ->when($this->serviceUnitId, fn ($q) => $q->where('service_unit_id', $this->serviceUnitId))
            ->whereNotNull('submitted_at')
            ->orderBy('submitted_at', 'desc')
            ->get()
            ->map(fn ($r) => [
                'periode' => $r->period?->name,
                'unit_layanan' => $r->serviceUnit?->name,
                'pekerjaan' => $r->occupation?->name,
                'nama' => $r->name ?? '-',
                'jenis_kelamin' => $r->gender,
                'kota' => $r->city,
                'kebutuhan' => $r->need,
                'nilai_rata_rata' => $r->answers->avg('score'),
                'komentar' => $r->comment ?? '-',
                'tanggal' => $r->submitted_at?->format('d/m/Y H:i:s'),
            ]);
    }

    public function headings(): array
    {
        return [
            'Periode', 'Unit Layanan', 'Pekerjaan', 'Nama', 'Jenis Kelamin',
            'Kota', 'Kebutuhan', 'Nilai Rata-Rata', 'Komentar', 'Tanggal',
        ];
    }

    public function styles(Worksheet $sheet): ?array
    {
        $sheet->getStyle('A1:J1')->getFont()->setBold(true);

        return [];
    }
}

class NrrSheet implements FromCollection, WithHeadings, WithStyles
{
    public function __construct(
        public readonly ?int $periodId = null,
        public readonly ?int $serviceUnitId = null,
        public readonly ?array $ikm = null,
    ) {}

    public function collection(): Enumerable
    {
        $answers = ResponseAnswer::query()
            ->join('responses', 'responses.id', '=', 'response_answers.response_id')
            ->join('questions', 'questions.id', '=', 'response_answers.question_id')
            ->where('questions.is_active', true)
            ->when($this->periodId, fn ($q) => $q->where('responses.period_id', $this->periodId))
            ->when($this->serviceUnitId, fn ($q) => $q->where('responses.service_unit_id', $this->serviceUnitId))
            ->get();

        $nrrByQuestion = $answers->groupBy('question_id')->map(fn ($g) => $g->avg('score'));

        $questions = Question::query()->where('is_active', true)->get()->keyBy('id');

        return $nrrByQuestion->map(fn ($nrr, $questionId) => [
            'pertanyaan' => $questions->get($questionId)?->text,
            'group' => $questions->get($questionId)?->group,
            'nrr' => round($nrr, 2),
            'indeks' => round($nrr * 25, 2),
        ])->sortByDesc('indeks');
    }

    public function headings(): array
    {
        return ['Pertanyaan', 'Kelompok', 'NRR', 'Indeks (NRR x 25)'];
    }

    public function styles(Worksheet $sheet): ?array
    {
        $sheet->getStyle('A1:D1')->getFont()->setBold(true);

        return [];
    }
}

class IkmsSheet implements FromCollection, WithHeadings, WithStyles
{
    public function __construct(
        public readonly ?int $periodId = null,
        public readonly ?int $serviceUnitId = null,
        public readonly ?array $ikm = null,
    ) {}

    public function collection(): Enumerable
    {
        if (! $this->ikm) {
            return collect([[
                'periode' => '-',
                'unit_layanan' => $this->serviceUnitId ? ServiceUnit::find($this->serviceUnitId)?->name : 'Semua',
                'ikm_total' => 0,
                'ikm_pelayanan' => 0,
                'ikm_anti_korupsi' => 0,
                'mutu_pelayanan' => '-',
                'jumlah_responden' => 0,
            ]]);
        }

        return collect([[
            'periode' => $this->periodId ? Period::find($this->periodId)?->name : 'Semua',
            'unit_layanan' => $this->serviceUnitId ? ServiceUnit::find($this->serviceUnitId)?->name : 'Semua Unit',
            'ikm_total' => $this->ikm['ikm_total'],
            'ikm_pelayanan' => $this->ikm['ikm_pelayanan'],
            'ikm_anti_korupsi' => $this->ikm['ikm_anti_corruption'],
            'mutu_pelayanan' => $this->ikm['grade'],
            'jumlah_responden' => $this->ikm['respondent_count'],
        ]]);
    }

    public function headings(): array
    {
        return ['Periode', 'Unit Layanan', 'IKM Total', 'IKM Pelayanan', 'Indeks Anti Korupsi', 'Mutu Pelayanan', 'Jumlah Responden'];
    }

    public function styles(Worksheet $sheet): ?array
    {
        $sheet->getStyle('A1:G1')->getFont()->setBold(true);

        return [];
    }
}
