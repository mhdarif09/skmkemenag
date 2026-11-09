<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Occupation;
use App\Models\Period;
use App\Models\Question;
use App\Models\Response;
use App\Models\ServiceUnit;
use App\Models\Setting;
use App\Services\IkmCalculator;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $periodId = $request->integer('period_id') ?: null;
        $serviceUnitId = $request->integer('service_unit_id') ?: null;

        $period = $periodId ? Period::find($periodId) : Period::query()->where('is_active', true)->first();
        $periodId = $period?->id;

        $ikm = $periodId ? (new IkmCalculator)->calculate($periodId, $serviceUnitId) : null;

        // IKM per period (line chart)
        $ikmPerPeriod = Period::query()->orderBy('start_date')->get()->map(function (Period $p) {
            $result = (new IkmCalculator)->calculate($p->id);

            return [
                'period' => $p->name,
                'ikm_total' => $result['ikm_total'],
                'ikm_pelayanan' => $result['ikm_pelayanan'],
                'ikm_anti_corruption' => $result['ikm_anti_corruption'],
            ];
        });

        // NRR per question (bar chart, lowest -> highest)
        $nrrPerQuestion = [];
        if ($ikm) {
            $questions = Question::query()->where('is_active', true)->get()->keyBy('id');
            foreach ($ikm['nrr'] as $questionId => $nrr) {
                $question = $questions->get($questionId);
                if ($question) {
                    $nrrPerQuestion[] = [
                        'question' => $question->text,
                        'nrr' => round($nrr, 2),
                        'ikm' => round($nrr * 25, 2),
                    ];
                }
            }
            usort($nrrPerQuestion, fn ($a, $b) => $a['nrr'] <=> $b['nrr']);
        }

        // IKM per service unit
        $ikmPerUnit = ServiceUnit::query()->where('is_active', true)->get()->map(function (ServiceUnit $unit) use ($periodId) {
            $result = (new IkmCalculator)->calculate($periodId, $unit->id);

            return [
                'unit' => $unit->name,
                'ikm_total' => $result['ikm_total'],
                'respondent_count' => $result['respondent_count'],
            ];
        });

        // Gender counts
        $genderCounts = Response::query()
            ->when($periodId, fn ($q) => $q->where('period_id', $periodId))
            ->when($serviceUnitId, fn ($q) => $q->where('service_unit_id', $serviceUnitId))
            ->selectRaw('gender, count(*) as total')
            ->groupBy('gender')
            ->pluck('total', 'gender');

        // Occupation counts
        $occupationCounts = Response::query()
            ->join('occupations', 'occupations.id', '=', 'responses.occupation_id')
            ->when($periodId, fn ($q) => $q->where('responses.period_id', $periodId))
            ->when($serviceUnitId, fn ($q) => $q->where('responses.service_unit_id', $serviceUnitId))
            ->selectRaw('occupations.name, count(*) as total')
            ->groupBy('occupations.name')
            ->pluck('total', 'name');

        // Today's respondents
        $todayCount = Response::query()
            ->when($periodId, fn ($q) => $q->where('period_id', $periodId))
            ->whereDate('submitted_at', today())
            ->count();

        // Recent comments
        $recentComments = Response::query()
            ->with(['serviceUnit', 'occupation'])
            ->when($periodId, fn ($q) => $q->where('period_id', $periodId))
            ->when($serviceUnitId, fn ($q) => $q->where('service_unit_id', $serviceUnitId))
            ->whereNotNull('comment')
            ->latest('submitted_at')
            ->limit(8)
            ->get(['id', 'name', 'comment', 'submitted_at', 'service_unit_id', 'follow_up_status']);

        return Inertia::render('admin/dashboard', [
            'periods' => Period::query()->orderBy('start_date', 'desc')->get(['id', 'name', 'is_active']),
            'serviceUnits' => ServiceUnit::query()->where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'filters' => [
                'period_id' => $periodId,
                'service_unit_id' => $serviceUnitId,
            ],
            'ikm' => $ikm,
            'todayCount' => $todayCount,
            'ikmPerPeriod' => $ikmPerPeriod,
            'nrrPerQuestion' => $nrrPerQuestion,
            'ikmPerUnit' => $ikmPerUnit,
            'genderCounts' => $genderCounts,
            'occupationCounts' => $occupationCounts,
            'recentComments' => $recentComments,
            'organizationName' => Setting::getValue(Setting::ORGANIZATION_NAME, 'Kementerian Agama Kota Palembang'),
        ]);
    }
}
