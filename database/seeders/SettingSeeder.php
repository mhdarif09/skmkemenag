<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    /**
     * @var array<string, string|null>
     */
    public const SETTINGS = [
        Setting::ORGANIZATION_NAME => 'Kementerian Agama Kota Palembang',
        Setting::LOGO_PATH => null,
        Setting::ANONYMOUS_MODE => '1',
        Setting::SHOW_PUBLIC_IKM => '1',
        Setting::WELCOME_TEXT => 'Survei Kepuasan Masyarakat (SKM) dan Persepsi Anti Korupsi Kementerian Agama Kota Palembang. Hasil survei ini menjadi dasar perbaikan kualitas pelayanan kami.',
    ];

    public function run(): void
    {
        foreach (self::SETTINGS as $key => $value) {
            Setting::updateOrCreate(['key' => $key], ['value' => $value]);
        }
    }
}
