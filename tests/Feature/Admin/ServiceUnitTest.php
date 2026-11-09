<?php

use App\Models\Question;
use App\Models\Response;
use App\Models\ServiceUnit;
use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    foreach (['super_admin', 'admin_unit', 'viewer'] as $role) {
        Role::findOrCreate($role, 'web');
    }
});

function actingAsRole(string $role): User
{
    $user = User::factory()->create();
    $user->assignRole($role);

    return $user;
}

it('lets an admin add a service unit', function () {
    $this->actingAs(actingAsRole('super_admin'));

    $this->post(route('admin.units.store'), [
        'name' => 'Seksi Pendidikan Agama Islam',
        'description' => 'Seksi PAI',
    ])->assertRedirect(route('admin.units.index'));

    $this->assertDatabaseHas('service_units', ['name' => 'Seksi Pendidikan Agama Islam']);
});

it('prevents duplicate unit names', function () {
    $this->actingAs(actingAsRole('super_admin'));
    ServiceUnit::factory()->create(['name' => 'Seksi Pendidikan Madrasah']);

    $this->post(route('admin.units.store'), ['name' => 'Seksi Pendidikan Madrasah'])
        ->assertSessionHasErrors('name');
});

it('lets an admin rename a service unit', function () {
    $this->actingAs(actingAsRole('admin_unit'));
    $unit = ServiceUnit::factory()->create(['name' => 'Nama Lama']);

    $this->put(route('admin.units.update', $unit), ['name' => 'Nama Baru'])
        ->assertRedirect(route('admin.units.index'));

    $this->assertDatabaseHas('service_units', ['name' => 'Nama Baru']);
});

it('refuses to delete a unit that has responses', function () {
    $this->actingAs(actingAsRole('super_admin'));

    $unit = ServiceUnit::factory()->create();
    Response::factory()->create(['service_unit_id' => $unit->id]);

    $this->delete(route('admin.units.destroy', $unit))
        ->assertRedirect(route('admin.units.index'));

    $this->assertDatabaseHas('service_units', ['id' => $unit->id]);
});

it('lets an admin delete a unit without responses', function () {
    $this->actingAs(actingAsRole('super_admin'));
    $unit = ServiceUnit::factory()->create(['name' => 'Unit Kosong']);

    $this->delete(route('admin.units.destroy', $unit))
        ->assertRedirect(route('admin.units.index'));

    $this->assertDatabaseMissing('service_units', ['id' => $unit->id]);
});

it('shows the unit list to viewers but forbids them from adding units', function () {
    $this->actingAs(actingAsRole('viewer'));

    $this->get(route('admin.units.index'))->assertOk();
    $this->post(route('admin.units.store'), ['name' => 'Ubah Coba'])->assertForbidden();
});

it('downloads a CSV template matching the importer columns', function () {
    $this->actingAs(actingAsRole('admin_unit'));
    Question::factory()->create(['text' => 'Pertanyaan contoh pelayanan', 'order' => 1]);

    $response = $this->get(route('admin.importer.template'));

    $response->assertOk();
    $response->assertHeader('Content-Type', 'text/csv; charset=UTF-8');

    $content = $response->getContent();
    expect($content)
        ->toContain('Timestamp,Nama,Jenis Kelamin (L/P),Kota Domisili,Pekerjaan,Unit Layanan,Kebutuhan,')
        ->toContain('Pertanyaan contoh pelayanan')
        ->toContain('Komentar / Saran (opsional)');
});
