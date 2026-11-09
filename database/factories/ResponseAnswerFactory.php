<?php

namespace Database\Factories;

use App\Models\Question;
use App\Models\Response;
use App\Models\ResponseAnswer;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ResponseAnswer>
 */
class ResponseAnswerFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'response_id' => Response::factory(),
            'question_id' => Question::factory(),
            'score' => fake()->numberBetween(1, 4),
        ];
    }
}
