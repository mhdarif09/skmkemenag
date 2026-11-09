<?php

namespace Database\Factories;

use App\Models\Occupation;
use App\Models\Period;
use App\Models\Question;
use App\Models\Response;
use App\Models\ResponseAnswer;
use App\Models\ServiceUnit;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Response>
 */
class ResponseFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'period_id' => Period::factory(),
            'service_unit_id' => ServiceUnit::factory(),
            'occupation_id' => Occupation::factory(),
            'name' => fake()->name(),
            'gender' => fake()->randomElement(['L', 'P']),
            'city' => 'Palembang',
            'need' => fake()->sentence(),
            'comment' => fake()->boolean(30) ? fake()->sentence() : null,
            'follow_up_status' => Response::FOLLOW_UP_PENDING,
            'follow_up_note' => null,
            'ip_hash' => hash('sha256', fake()->ipv4()),
            'user_agent' => fake()->userAgent(),
            'submitted_at' => fake()->dateTimeBetween('-30 days', 'now'),
        ];
    }

    /**
     * Attach answers for every active question: all scores set to `$score`.
     */
    public function withScores(int $score): static
    {
        return $this->afterCreating(function (Response $response) use ($score): void {
            $questions = Question::query()->where('is_active', true)->get();

            foreach ($questions as $question) {
                ResponseAnswer::create([
                    'response_id' => $response->id,
                    'question_id' => $question->id,
                    'score' => $score,
                ]);
            }
        });
    }
}
