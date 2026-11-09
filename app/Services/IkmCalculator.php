<?php

namespace App\Services;

use App\Models\Question;
use App\Models\ResponseAnswer;
use Illuminate\Database\Eloquent\Collection;

class IkmCalculator
{
    public const SCALE_MULTIPLIER = 25;

    public const GRADE_A_MIN = 88.31;

    public const GRADE_B_MIN = 76.61;

    public const GRADE_C_MIN = 65.00;

    public const GRADE_D_MIN = 25.00;

    /**
     * Calculate the service satisfaction index and the anti-corruption index
     * for the given scope. A null period, service unit, occupation, or gender
     * means the calculation is not filtered by that dimension.
     *
     * @return array{
     *     respondent_count: int,
     *     ikm_total: float,
     *     ikm_pelayanan: float,
     *     ikm_anti_corruption: float,
     *     grade: string,
     *     nrr: array<int, float>,
     * }
     */
    public function calculate(?int $periodId = null, ?int $serviceUnitId = null, ?string $gender = null, ?int $occupationId = null): array
    {
        $answers = $this->answers($periodId, $serviceUnitId, $gender, $occupationId);

        /** @var array<int, float> $nrrByQuestionId */
        $nrrByQuestionId = $answers
            ->groupBy('question_id')
            ->map(fn ($group) => (float) $group->map(fn ($answer) => (int) $answer->score)->average())
            ->all();

        $groupsByQuestionId = Question::query()
            ->where('is_active', true)
            ->get(['id', 'group'])
            ->keyBy('id');

        $ikmPelayanan = round($this->average($this->scoresOfGroup($nrrByQuestionId, $groupsByQuestionId, Question::GROUP_SERVICE)) * self::SCALE_MULTIPLIER, 2);

        $ikmAntiCorruption = round($this->average($this->scoresOfGroup($nrrByQuestionId, $groupsByQuestionId, Question::GROUP_ANTI_CORRUPTION)) * self::SCALE_MULTIPLIER, 2);

        $ikmTotal = round($this->average(array_values($nrrByQuestionId)) * self::SCALE_MULTIPLIER, 2);

        return [
            'respondent_count' => $answers->pluck('response_id')->unique()->count(),
            'ikm_total' => $ikmTotal,
            'ikm_pelayanan' => $ikmPelayanan,
            'ikm_anti_corruption' => $ikmAntiCorruption,
            'grade' => $this->gradeFor($ikmPelayanan),
            'nrr' => $nrrByQuestionId,
        ];
    }

    public function gradeFor(float $ikmPelayanan): string
    {
        if ($ikmPelayanan >= self::GRADE_A_MIN) {
            return 'A';
        }

        if ($ikmPelayanan >= self::GRADE_B_MIN) {
            return 'B';
        }

        if ($ikmPelayanan >= self::GRADE_C_MIN) {
            return 'C';
        }

        return 'D';
    }

    /**
     * @return Collection<int, ResponseAnswer>
     */
    private function answers(?int $periodId = null, ?int $serviceUnitId = null, ?string $gender = null, ?int $occupationId = null): Collection
    {
        return ResponseAnswer::query()
            ->select('response_answers.response_id', 'response_answers.question_id', 'response_answers.score')
            ->join('responses', 'responses.id', '=', 'response_answers.response_id')
            ->join('questions', 'questions.id', '=', 'response_answers.question_id')
            ->where('questions.is_active', true)
            ->when($periodId !== null, fn ($query) => $query->where('responses.period_id', $periodId))
            ->when($serviceUnitId !== null, fn ($query) => $query->where('responses.service_unit_id', $serviceUnitId))
            ->when($occupationId !== null, fn ($query) => $query->where('responses.occupation_id', $occupationId))
            ->when($gender !== null && $gender !== '', fn ($query) => $query->where('responses.gender', $gender))
            ->get();
    }

    /**
     * @param  array<int, float>  $nrrByQuestionId
     * @return array<int, float>
     */
    private function scoresOfGroup(array $nrrByQuestionId, Collection $groupsByQuestionId, string $group): array
    {
        $scores = [];

        foreach ($nrrByQuestionId as $questionId => $nrr) {
            if (($groupsByQuestionId[$questionId]->group ?? null) === $group) {
                $scores[] = $nrr;
            }
        }

        return $scores;
    }

    /**
     * @param  array<int, float>  $values
     */
    private function average(array $values): float
    {
        if ($values === []) {
            return 0.0;
        }

        return array_sum($values) / count($values);
    }
}
