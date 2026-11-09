<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $response_id
 * @property int $question_id
 * @property int $score
 */
class ResponseAnswer extends Model
{
    /** @use HasFactory<Database\Factories\ResponseAnswerFactory> */
    use HasFactory;

    protected $fillable = ['response_id', 'question_id', 'score'];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'score' => 'integer',
        ];
    }
}
