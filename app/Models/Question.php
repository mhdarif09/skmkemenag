<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $group
 * @property string $text
 * @property int $order
 * @property bool $is_active
 * @property Carbon|null $deleted_at
 */
class Question extends Model
{
    /** @use HasFactory<Database\Factories\QuestionFactory> */
    use HasFactory, SoftDeletes;

    public const GROUP_SERVICE = 'A';

    public const GROUP_ANTI_CORRUPTION = 'B';

    protected $fillable = ['group', 'text', 'order', 'is_active', 'deleted_at'];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'order' => 'integer',
            'deleted_at' => 'datetime',
        ];
    }

    /**
     * Get all answers for this question.
     *
     * @return HasMany<ResponseAnswer, $this>
     */
    public function answers(): HasMany
    {
        return $this->hasMany(ResponseAnswer::class);
    }

    /**
     * @param  Builder<self>  $query
     */
    public function scopeActive(Builder $query): void
    {
        $query->where('is_active', true);
    }
}
