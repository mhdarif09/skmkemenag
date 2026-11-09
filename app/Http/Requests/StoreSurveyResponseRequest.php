<?php

namespace App\Http\Requests;

use App\Models\Occupation;
use App\Models\Question;
use App\Models\ServiceUnit;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSurveyResponseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $activeQuestionIds = Question::query()->where('is_active', true)->pluck('id')->all();

        return [
            'period_id' => ['required', 'integer', 'exists:periods,id'],
            'service_unit_id' => ['required', 'integer', Rule::exists('service_units', 'id')->where('is_active', true)],
            'occupation_id' => ['required', 'integer', Rule::exists('occupations', 'id')->where('is_active', true)],
            'name' => ['nullable', 'string', 'max:120'],
            'gender' => ['required', 'in:L,P'],
            'city' => ['required', 'string', 'max:120'],
            'need' => ['required', 'string', 'max:500'],
            'comment' => ['nullable', 'string', 'max:2000'],
            'answers' => ['required', 'array'],
            'answers.*.question_id' => ['required', 'integer', Rule::in($activeQuestionIds)],
            'answers.*.score' => ['required', 'integer', 'between:1,4'],
            'website' => ['nullable', 'size:0'],
            'turnstile_token' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'website.size' => 'Permintaan tidak dapat diproses.',
        ];
    }
}
