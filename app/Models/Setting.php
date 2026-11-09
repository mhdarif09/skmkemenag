<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $key
 * @property string|null $value
 */
class Setting extends Model
{
    /** @use HasFactory<Database\Factories\SettingFactory> */
    use HasFactory;

    public const ORGANIZATION_NAME = 'organization_name';

    public const LOGO_PATH = 'logo_path';

    public const ANONYMOUS_MODE = 'anonymous_mode';

    public const SHOW_PUBLIC_IKM = 'show_public_ikm';

    public const WELCOME_TEXT = 'welcome_text';

    protected $fillable = ['key', 'value'];

    public static function getValue(string $key, mixed $default = null): mixed
    {
        $setting = static::query()->where('key', $key)->first();

        return $setting?->value ?? $default;
    }

    public static function setValue(string $key, mixed $value): void
    {
        static::query()->updateOrCreate(['key' => $key], ['value' => $value]);
    }
}
