<?php

use App\Models\Question;
use App\Models\Response;
use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    foreach (['super_admin', 'admin_unit', 'viewer'] as $role) {
        Role::findOrCreate($role, 'web');
    }
});

function createSurveyData(): void
{
    Question::factory()->count(2)->create();

    Response::factory()
        ->withScores(4)
        ->count(2)
        ->create();
}

it('redirects guests to the login page', function () {
    $this->get(route('admin.laporan.index'))->assertRedirect(route('login'));
});

it('renders the laporan page for a super admin', function () {
    createSurveyData();
    $user = User::factory()->create();
    $user->assignRole('super_admin');

    $this->actingAs($user)->get(route('admin.laporan.index'))
        ->assertOk();
});

it('downloads the excel export for a super admin', function () {
    createSurveyData();
    $user = User::factory()->create();
    $user->assignRole('super_admin');

    $this->actingAs($user)->get(route('admin.laporan.excel'))
        ->assertOk()
        ->assertDownload('laporan-ikm.xlsx');
});

it('downloads the pdf export for a super admin', function () {
    createSurveyData();
    $user = User::factory()->create();
    $user->assignRole('super_admin');

    $this->actingAs($user)->get(route('admin.laporan.pdf'))
        ->assertOk()
        ->assertDownload();
});

it('allows a viewer to view the laporan page', function () {
    createSurveyData();
    $user = User::factory()->create();
    $user->assignRole('viewer');

    $this->actingAs($user)->get(route('admin.laporan.index'))
        ->assertOk();
});
