<?php

namespace App\Http\Controllers\Admin;

use App\Exports\IkmExport;
use App\Http\Controllers\Controller;
use App\Models\Period;
use App\Models\Question;
use App\Models\Response;
use App\Models\ServiceUnit;
use App\Models\Setting;
use App\Services\IkmCalculator;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class LaporanController extends Controller
{
    public function index(Request $request)
    {
        $periodId = $request->integer('period_id') ?: null;
        $serviceUnitId = $request->integer('service_unit_id') ?: null;

        $period = $periodId ? Period::find($periodId) : Period::query()->where('is_active', true)->first();
        $periodId = $period?->id;

        $calculator = new IkmCalculator;
        $ikm = $periodId ? $calculator->calculate($periodId, $serviceUnitId) : null;

        // NRR per question with text
        $nrrPerQuestion = [];
        if ($ikm) {
            $questions = Question::query()->where('is_active', true)->get()->keyBy('id');
            foreach ($ikm['nrr'] as $questionId => $nrr) {
                $question = $questions->get($questionId);
                if ($question) {
                    $nrrPerQuestion[] = [
                        'id' => $question->id,
                        'text' => $question->text,
                        'group' => $question->group,
                        'nrr' => round($nrr, 2),
                        'ikm' => round($nrr * 25, 2),
                        'grade' => $calculator->gradeFor(round($nrr * 25, 2)),
                    ];
                }
            }
            usort($nrrPerQuestion, fn ($a, $b) => $a['nrr'] <=> $b['nrr']);
        }

        // Lowest NRR element for auto conclusion/recommendation
        $lowest = $nrrPerQuestion ? $nrrPerQuestion[0] : null;
        $conclusion = null;
        $recommendation = null;
        if ($lowest) {
            $groupLabel = $lowest['group'] === 'A' ? 'pelayanan' : 'anti korupsi';
            $conclusion = "Unsur dengan nilai terendah adalah \"{$lowest['text']}\" (NRR {$lowest['nrr']}, indeks {$lowest['ikm']}) dalam kelompok {$groupLabel}.";
            $recommendation = "Disarankan untuk meninjau dan memperbaiki aspek terkait {$lowest['text']} guna meningkatkan kepuasan dan persepsi masyarakat.";
        }

        // Comments
        $comments = Response::query()
            ->with(['serviceUnit', 'occupation'])
            ->when($periodId, fn ($q) => $q->where('period_id', $periodId))
            ->when($serviceUnitId, fn ($q) => $q->where('service_unit_id', $serviceUnitId))
            ->whereNotNull('comment')
            ->latest('submitted_at')
            ->get(['id', 'name', 'gender', 'city', 'need', 'comment', 'submitted_at', 'service_unit_id', 'follow_up_status']);

        return Inertia::render('admin/laporan/index', [
            'periods' => Period::query()->orderBy('start_date', 'desc')->get(['id', 'name', 'is_active']),
            'serviceUnits' => ServiceUnit::query()->where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'filters' => ['period_id' => $periodId, 'service_unit_id' => $serviceUnitId],
            'ikm' => $ikm,
            'nrrPerQuestion' => $nrrPerQuestion,
            'lowest' => $lowest,
            'conclusion' => $conclusion,
            'recommendation' => $recommendation,
            'comments' => $comments,
            'organizationName' => Setting::getValue('organization_name', 'Kementerian Agama Kota Palembang'),
            'logoPath' => Setting::getValue('logo_path'),
        ]);
    }

    public function exportExcel(Request $request)
    {
        $periodId = $request->integer('period_id') ?: null;
        $serviceUnitId = $request->integer('service_unit_id') ?: null;

        return Excel::download(new IkmExport($periodId, $serviceUnitId), 'laporan-ikm.xlsx');
    }

    public function exportPdf(Request $request)
    {
        $periodId = $request->integer('period_id') ?: null;
        $serviceUnitId = $request->integer('service_unit_id') ?: null;

        $period = $periodId ? Period::find($periodId) : Period::query()->where('is_active', true)->first();
        $periodId = $period?->id;

        $calculator = new IkmCalculator;
        $ikm = $periodId ? $calculator->calculate($periodId, $serviceUnitId) : null;

        $nrrPerQuestion = [];
        if ($ikm) {
            $questions = Question::query()->where('is_active', true)->get()->keyBy('id');
            foreach ($ikm['nrr'] as $questionId => $nrr) {
                $question = $questions->get($questionId);
                if ($question) {
                    $nrrPerQuestion[] = [
                        'text' => $question->text,
                        'group' => $question->group,
                        'nrr' => round($nrr, 2),
                        'ikm' => round($nrr * 25, 2),
                        'grade' => $calculator->gradeFor(round($nrr * 25, 2)),
                    ];
                }
            }
            usort($nrrPerQuestion, fn ($a, $b) => $a['nrr'] <=> $b['nrr']);
        }

        $lowest = $nrrPerQuestion ? $nrrPerQuestion[0] : null;
        $conclusion = null;
        $recommendation = null;
        if ($lowest) {
            $groupLabel = $lowest['group'] === 'A' ? 'pelayanan' : 'anti korupsi';
            $conclusion = "Unsur dengan nilai terendah adalah \"{$lowest['text']}\" (NRR {$lowest['nrr']}, indeks {$lowest['ikm']}) dalam kelompok {$groupLabel}.";
            $recommendation = "Disarankan untuk meninjau dan memperbaiki aspek terkait {$lowest['text']} guna meningkatkan kepuasan dan persepsi masyarakat.";
        }

        $comments = Response::query()
            ->when($periodId, fn ($q) => $q->where('period_id', $periodId))
            ->when($serviceUnitId, fn ($q) => $q->where('service_unit_id', $serviceUnitId))
            ->whereNotNull('comment')
            ->latest('submitted_at')
            ->get(['id', 'name', 'gender', 'city', 'need', 'comment', 'submitted_at']);

        $organizationName = Setting::getValue('organization_name', 'Kementerian Agama Kota Palembang');
        $logoPath = Setting::getValue('logo_path');

        $periodName = $period ? $period->name : 'Semua Periode';
        $unitName = $serviceUnitId ? ServiceUnit::find($serviceUnitId)?->name : 'Semua Unit';

        $pdf = Pdf::loadView('laporan.pdf', [
            'organizationName' => $organizationName,
            'logoPath' => $logoPath,
            'periodName' => $periodName,
            'unitName' => $unitName,
            'ikm' => $ikm,
            'nrrPerQuestion' => $nrrPerQuestion,
            'lowest' => $lowest,
            'conclusion' => $conclusion,
            'recommendation' => $recommendation,
            'comments' => $comments,
        ]);

        return $pdf->download('laporan-ikm-'.($periodId ?: 'semua').'.pdf');
    }
}
