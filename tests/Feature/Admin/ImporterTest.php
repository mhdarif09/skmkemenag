<?php

use App\Models\Period;
use App\Models\Question;
use App\Models\Response;
use App\Models\ServiceUnit;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    foreach (['super_admin', 'admin_unit', 'viewer'] as $role) {
        Role::findOrCreate($role, 'web');
    }
});

function seedImportReferenceData(): void
{
    Period::factory()->create(['is_active' => true]);
    ServiceUnit::factory()->create(['name' => 'Seksi Pendidikan Madrasah']);
    ServiceUnit::factory()->create(['name' => 'Seksi Bimbingan Masyarakat Islam']);
    Question::factory()->create(['group' => 'A', 'text' => 'Seberapa puas Anda terhadap layanan petugas?', 'order' => 1]);
    Question::factory()->create(['group' => 'B', 'text' => 'Apakah petugas bebas dari pungutan tidak resmi?', 'order' => 2]);
}

function legacyGoogleFormCsv(): string
{
    return implode("\n", [
        'Timestamp,Nama,Jenis Kelamin,Kota Domisili,Pekerjaan,Pilihan Pelayanan,'.
        'Seberapa puas Anda terhadap layanan petugas?,Apakah petugas bebas dari pungutan tidak resmi?,Komentar / Saran',
        '02/11/2026 10:30:00,Budi Santoso,Laki-laki,Palembang,Wiraswasta,Seksi Pendidikan MadrasahDATA GANDA,4,Sangat Puas,Mohon perbaikan pelayanan',
        '02/11/2026 10:35:00,Siti Aminah,Perempuan,Palembang,Pelajar,Seksi Tidak TerdaftarBalik Pemuda,3,Sangat Setuju,Mohon dilanjutkan',
        '02/11/2026 10:32:00,Budi Santoso,Laki-laki,Palembang,Wiraswasta,Seksi Pendidikan MadrasahDATA GANDA,4,Sangat Puas,Baris duplikat',
    ]);
}

function adminUser(): User
{
    $user = User::factory()->create();
    $user->assignRole('super_admin');

    return $user;
}

it('redirects guests to the login page', function () {
    $this->get(route('admin.importer.index'))->assertRedirect(route('login'));
});

it('previews a legacy google form csv with auto column mapping', function () {
    seedImportReferenceData();
    $user = adminUser();

    $file = UploadedFile::fake()->createWithContent('impor.csv', legacyGoogleFormCsv());

    $response = $this->actingAs($user)->postJson(route('admin.importer.preview'), ['file' => $file]);

    $response->assertOk();

    $preview = $response->json();
    expect($preview['summary']['total'])->toBe(3);
    expect($preview['columns']['timestamp'])->toBe(0);
    expect($preview['columns']['name'])->toBe(1);
    expect($preview['columns']['gender'])->toBe(2);
    expect($preview['columns']['city'])->toBe(3);
    expect($preview['columns']['occupation'])->toBe(4);
    expect($preview['columns']['unit'])->toBe(5);
    expect($preview['columns']['comment'])->toBe(8);
    expect(count($preview['columns']['questions']))->toBe(2);
});

it('splits the combined unit and need column and flags problems', function () {
    seedImportReferenceData();
    $user = adminUser();

    $file = UploadedFile::fake()->createWithContent('impor.csv', legacyGoogleFormCsv());

    $preview = $this->actingAs($user)->postJson(route('admin.importer.preview'), ['file' => $file])->json();

    $first = $preview['rows'][0];
    expect($first['unit'])->toBe('Seksi Pendidikan Madrasah');
    expect($first['unit_id'])->not->toBeNull();
    expect($first['need'])->toBe('DATA GANDA');
    expect($first['status'])->toBe('ok');

    // Second row has an unrecognisable unit prefix
    $second = $preview['rows'][1];
    expect($second['unit'])->toBeNull();
    expect($second['status'])->toBe('error');
    expect($second['problems'])->not->toBeEmpty();
});

it('commits rows skipping duplicates and problem rows', function () {
    seedImportReferenceData();
    $user = adminUser();

    $file = UploadedFile::fake()->createWithContent('impor.csv', legacyGoogleFormCsv());

    $period = Period::query()->first();

    $result = $this->actingAs($user)
        ->postJson(route('admin.importer.commit'), ['file' => $file, 'period_id' => $period->id])
        ->json();

    // Row 1 ok; row 2 error (unit not known); row 3 duplicate of row 1 (within 10 minutes).
    expect($result['inserted'])->toBe(1);
    expect($result['skipped_error'])->toBe(1);
    expect($result['skipped_duplicate'])->toBe(1);

    $response = Response::query()->first();
    expect($response->serviceUnit->name)->toBe('Seksi Pendidikan Madrasah');
    expect($response->need)->toBe('DATA GANDA');
    expect($response->gender)->toBe('L');
    expect($response->submitted_at->format('d/m/Y H:i:s'))->toBe('02/11/2026 10:30:00');
    expect($response->answers()->count())->toBe(2);
});

it('allows viewers to open the page but not to commit', function () {
    seedImportReferenceData();
    $user = User::factory()->create();
    $user->assignRole('viewer');

    $this->actingAs($user)->get(route('admin.importer.index'))->assertOk();

    $file = UploadedFile::fake()->createWithContent('impor.csv', legacyGoogleFormCsv());

    $this->actingAs($user)->postJson(route('admin.importer.commit'), ['file' => $file, 'period_id' => 1])
        ->assertForbidden();
});
