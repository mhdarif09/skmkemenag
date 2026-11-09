<?php

use App\Models\User;
use Spatie\Permission\Models\Role;

test('guests are redirected to the login page', function () {
    // /dashboard redirects to /admin; guests then bounce to login.
    $this->get(route('dashboard'))->assertRedirect('/admin');
    $this->get('/admin')->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    Role::firstOrCreate(['name' => 'super_admin', 'guard_name' => 'web']);
    $user = User::factory()->create();
    $user->assignRole('super_admin');
    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertRedirect('/admin');
    $this->get('/admin')->assertOk();
});
