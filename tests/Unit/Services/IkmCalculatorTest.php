<?php

use App\Models\Occupation;
use App\Models\Period;
use App\Models\Question;
use App\Models\Response;
use App\Models\ResponseAnswer;
use App\Models\ServiceUnit;
use App\Services\IkmCalculator;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, LazilyRefreshDatabase::class);

it('multiplies the average respondent score by the index scale', function () {
    $period = Period::factory()->create();
    $serviceUnit = ServiceUnit::factory()->create();
    $occupation = Occupation::factory()->create();
    Question::factory()->count(2)->create();

    Response::factory()
        ->withScores(4)
        ->count(2)
        ->create([
            'period_id' => $period->id,
            'service_unit_id' => $serviceUnit->id,
            'occupation_id' => $occupation->id,
        ]);

    $result = (new IkmCalculator)->calculate($period->id);

    expect($result['ikm_total'])->toBe(100.0);
    expect($result['ikm_pelayanan'])->toBe(100.0);
    expect($result['grade'])->toBe('A');
    expect($result['respondent_count'])->toBe(2);
});

it('calculates the index from the lowest and highest respondent scores', function () {
    $period = Period::factory()->create();
    $serviceUnit = ServiceUnit::factory()->create();
    $occupation = Occupation::factory()->create();
    $questions = Question::factory()->count(2)->create();

    $firstResponse = Response::factory()->create([
        'period_id' => $period->id,
        'service_unit_id' => $serviceUnit->id,
        'occupation_id' => $occupation->id,
    ]);
    $secondResponse = Response::factory()->create([
        'period_id' => $period->id,
        'service_unit_id' => $serviceUnit->id,
        'occupation_id' => $occupation->id,
    ]);

    foreach ($questions as $question) {
        ResponseAnswer::create([
            'response_id' => $firstResponse->id,
            'question_id' => $question->id,
            'score' => 4,
        ]);

        ResponseAnswer::create([
            'response_id' => $secondResponse->id,
            'question_id' => $question->id,
            'score' => 2,
        ]);
    }

    $result = (new IkmCalculator)->calculate($period->id);

    expect($result['ikm_total'])->toBe(75.0);
    expect($result['ikm_pelayanan'])->toBe(75.0);
    expect($result['grade'])->toBe('C');
});

it('calculates separate service and anti-corruption indices', function () {
    $period = Period::factory()->create();
    $serviceUnit = ServiceUnit::factory()->create();
    $occupation = Occupation::factory()->create();
    $serviceQuestion = Question::factory()->create(['group' => Question::GROUP_SERVICE]);
    $antiCorruptionQuestion = Question::factory()->create(['group' => Question::GROUP_ANTI_CORRUPTION]);

    $response = Response::factory()->create([
        'period_id' => $period->id,
        'service_unit_id' => $serviceUnit->id,
        'occupation_id' => $occupation->id,
    ]);

    ResponseAnswer::create([
        'response_id' => $response->id,
        'question_id' => $serviceQuestion->id,
        'score' => 4,
    ]);

    ResponseAnswer::create([
        'response_id' => $response->id,
        'question_id' => $antiCorruptionQuestion->id,
        'score' => 2,
    ]);

    $result = (new IkmCalculator)->calculate($period->id);

    expect($result['ikm_pelayanan'])->toBe(100.0);
    expect($result['ikm_anti_corruption'])->toBe(50.0);
    expect($result['ikm_total'])->toBe(75.0);
});

it('calculates only the responses of the given service unit', function () {
    $period = Period::factory()->create();
    $firstServiceUnit = ServiceUnit::factory()->create();
    $secondServiceUnit = ServiceUnit::factory()->create();
    $occupation = Occupation::factory()->create();
    $questions = Question::factory()->count(2)->create();

    $firstResponse = Response::factory()->create([
        'period_id' => $period->id,
        'service_unit_id' => $firstServiceUnit->id,
        'occupation_id' => $occupation->id,
    ]);
    $secondResponse = Response::factory()->create([
        'period_id' => $period->id,
        'service_unit_id' => $secondServiceUnit->id,
        'occupation_id' => $occupation->id,
    ]);

    foreach ($questions as $question) {
        ResponseAnswer::create([
            'response_id' => $firstResponse->id,
            'question_id' => $question->id,
            'score' => 4,
        ]);

        ResponseAnswer::create([
            'response_id' => $secondResponse->id,
            'question_id' => $question->id,
            'score' => 2,
        ]);
    }

    $result = (new IkmCalculator)->calculate($period->id, $secondServiceUnit->id);

    expect($result['respondent_count'])->toBe(1);
    expect($result['ikm_total'])->toBe(50.0);
});

it('assigns the grade band from the service index', function (float $ikm, string $expectedGrade) {
    expect((new IkmCalculator)->gradeFor($ikm))->toBe($expectedGrade);
})->with([
    'grade a covers the maximum index' => [100.0, 'A'],
    'grade b covers the second band' => [88.3, 'B'],
    'grade c covers the third band' => [76.6, 'C'],
    'grade d covers the fourth band' => [64.99, 'D'],
]);
