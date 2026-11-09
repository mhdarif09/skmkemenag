<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        foreach (['super_admin', 'admin_unit', 'viewer'] as $role) {
            Role::findOrCreate($role, 'web');
        }

        User::create([
            'name' => 'Super Admin',
            'email' => 'superadmin@kemenag.palembang.go.id',
            'email_verified_at' => now(),
            'password' => 'password',
        ])->assignRole('super_admin');

        User::create([
            'name' => 'Admin Unit Layanan',
            'email' => 'adminunit@kemenag.palembang.go.id',
            'email_verified_at' => now(),
            'password' => 'password',
        ])->assignRole('admin_unit');

        User::create([
            'name' => 'Pemantau',
            'email' => 'viewer@kemenag.palembang.go.id',
            'email_verified_at' => now(),
            'password' => 'password',
        ])->assignRole('viewer');
    }
}
