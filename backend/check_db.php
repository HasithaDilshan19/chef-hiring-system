<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Booking;

try {
    $bookings = Booking::all();
    echo "Total Bookings in DB: " . $bookings->count() . "\n";
    foreach ($bookings as $b) {
        echo "ID: {$b->id}, Cust: {$b->customer_id}, Chef: {$b->chef_id}, Date: {$b->event_date}, Status: {$b->status}, Price: {$b->total_price}, Pkg: {$b->package_name}\n";
    }
} catch (\Exception $e) {
    echo "DB ERROR: " . $e->getMessage() . "\n";
}
