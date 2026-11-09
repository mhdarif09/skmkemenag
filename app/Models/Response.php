<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $period_id
 * @property int $service_unit_id
 * @property int $occupation_id
 * @property string|null $name
 * @property string $gender
 * @property string $city
 * @property string $need
 * @property string|null $comment
 * @property string $follow_up_status
 * @property string|null $follow_up_note
 * @property string|null $ip_hash
 * @property string|null $user_agent
 * @property Carbon|null $submitted_at
 * @property Carbon|null $deleted_at
 */
class Response extends Model
{
    /** @use HasFactory<Database\Factories\ResponseFactory> */
    use HasFactory, SoftDeletes;

    public const FOLLOW_UP_PENDING = 'pending';

    public const FOLLOW_UP_DONE = 'done';

    protected $fillable = [
        'period_id',
        'service_unit_id',
        'occupation_id',
        'name',
        'gender',
        'city',
        'need',
        'comment',
        'follow_up_status',
        'follow_up_note',
        'ip_hash',
        'user_agent',
        'submitted_at',
        'created_by',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'submitted_at' => 'datetime',
            'deleted_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<Period, $this>
     */
    public function period(): BelongsTo
    {
        return $this->belongsTo(Period::class);
    }

    /**
     * @return BelongsTo<ServiceUnit, $this>
     */
    public function serviceUnit(): BelongsTo
    {
        return $this->belongsTo(ServiceUnit::class);
    }

    /**
     * @return BelongsTo<Occupation, $this>
     */
    public function occupation(): BelongsTo
    {
        return $this->belongsTo(Occupation::class);
    }

    /**
     * @return HasMany<ResponseAnswer, $this>
     */
    public function answers(): HasMany
    {
        return $this->hasMany(ResponseAnswer::class);
    }

    /**
     * @param  Builder<self>  $query
     */
    public function scopeBetween(Builder $query, ?string $from = null, ?string $to = null): void
    {
        if ($from !== null) {
            $query->whereDate('submitted_at', '>=', $from);
        }

        if ($to !== null) {
            $query->whereDate('submitted_at', '<=', $to);
        }
    }
}
