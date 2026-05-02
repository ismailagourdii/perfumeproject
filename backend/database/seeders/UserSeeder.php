<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Seed the application's users (superadmin, admin, user).
     */
    public function run(): void
    {
        $users = [
            [
                'name' => 'Super Admin',
                'email' => 'superadmin@scentara.ma',
                'password' => Hash::make('superadmin123'),
                'role' => 'superadmin',
            ],
            [
                'name' => 'Admin',
                'email' => 'admin@scentara.ma',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
            ],
            [
                'name' => 'Client Démo',
                'email' => 'user@scentara.ma',
                'password' => Hash::make('user123'),
                'role' => 'user',
            ],
        ];

        foreach ($users as $data) {
            User::updateOrCreate(
                ['email' => $data['email']],
                [
                    'name' => $data['name'],
                    'password' => $data['password'],
                    'role' => $data['role'],
                ]
            );
        }
    }
}
