<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$profiles = \App\Models\ChefProfile::with('user')->get();
echo "CHEF PROFILES:\n";
foreach ($profiles as $p) {
    echo "Chef: " . ($p->user->name ?? 'N/A') . " | City: {$p->city} | Lat: " . var_export($p->latitude, true) . " | Lng: " . var_export($p->longitude, true) . "\n";
}
