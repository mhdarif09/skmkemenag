<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

/**
 * Seeds three admin accounts (super_admin, admin_unit, viewer).
 *
 * Credentials come from the environment (see .env.example / deploy docs) and
 * fall back to safe local defaults for development. In production, set
 * IKM_SEED_PASSWORD to a strong value or run this seeder only once and change
 * the passwords afterwards.
 */
class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        foreach (['super_admin', 'admin_unit', 'viewer'] as $role) {
            Role::findOrCreate($role, 'web');
        }

        $password = (string) env('IKM_SEED_PASSWORD', 'password');

        $this->upsertAdmin([
            'name' => 'Super Admin',
            'email' => (string) env('IKM_SEED_SUPER_EMAIL', 'superadmin@kemenag.palembang.go.id'),
            'role' => 'super_admin',
        ], $password);

        $this->upsertAdmin([
            'name' => 'Admin Unit Layanan',
            'email' => (string) env('IKM_SEED_UNIT_EMAIL', 'adminunit@kemenag.palembang.go.id'),
            'role' => 'admin_unit',
        ], $password);

        $this->upsertAdmin([
            'name' => 'Pemantau',
            'email' => (string) env('IKM_SEED_VIEWER_EMAIL', 'viewer@kemenag.palembang.go.id'),
            'role' => 'viewer',
        ], $password);
    }

    /**
     * @param  array{name: string, email: string, role: string}  $admin
     */
    private function upsertAdmin(array $admin, string $password): void
    {
        $user = User::query()->firstOrNew(['email' => $admin['email']]);
        $user->fill([
            'name' => $admin['name'],
            'email_verified_at' => now(),
            'password' => $password,
            'remember_token' => Str::random(10),
        ]);

        if (! $user->exists) {
            $user->save();
        }

        $user->assignRole($admin['role']);
    }
}
