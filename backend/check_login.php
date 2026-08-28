<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$emails = [
    'admin@chefhiring.lk',
    'chef@chefhiring.lk',
    'user@chefhiring.lk',
];

foreach ($emails as $email) {
    $user = \App\Models\User::where('email', $email)->first();
    if (!$user) {
        echo "NOT FOUND: $email\n";
        continue;
    }
    $check = \Illuminate\Support\Facades\Hash::check('password123', $user->password);
    echo "Email: $email | Status: {$user->status} | PwLen: " . strlen($user->password) . " | Match: " . ($check ? 'YES' : 'NO') . "\n";
}

echo "\n--- ALL USERS IN DB ---\n";
$all = \App\Models\User::all();
if ($all->isEmpty()) {
    echo "No users in database!\n";
} else {
    foreach ($all as $u) {
        echo "ID: {$u->id} | Email: {$u->email} | Role: {$u->role} | Status: {$u->status}\n";
    }
}

