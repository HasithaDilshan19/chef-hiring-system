<!DOCTYPE html>
<html>
<head>
    <title>Platform Alert: Action Required on Booking</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <h2>Hello {{ $booking->chef->name }},</h2>
    
    <p>The Admin team has sent you an alert regarding one of your bookings.</p>
    
    <div style="background: #f8f9fa; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0;">
        <p><strong>Event:</strong> {{ $booking->event_type }}</p>
        <p><strong>Date & Time:</strong> {{ $booking->event_date }} at {{ $booking->event_time }}</p>
        <p><strong>Customer:</strong> {{ $booking->customer->name }} ({{ $booking->customer->phone }})</p>
        <p><strong>Location:</strong> {{ $booking->location }}</p>
        <p><strong>Current Status:</strong> {{ strtoupper($booking->status) }}</p>
    </div>
    
    <p>Please log in to your dashboard to review this booking request.</p>
    
    <p>Thanks,<br>
    The Admin Team</p>
</body>
</html>
