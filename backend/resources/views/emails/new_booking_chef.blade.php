<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>New Chef Booking Request</title>
</head>
<body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #090d16; color: #e2e8f0; margin: 0; padding: 20px;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #0f172a; border-radius: 16px; border: 1px solid #1e293b; overflow: hidden;">
        <!-- Header -->
        <tr>
            <td style="background-color: #1e293b; padding: 24px; text-align: center; border-bottom: 2px solid #f59e0b;">
                <h1 style="color: #f59e0b; margin: 0; font-size: 22px; font-weight: bold;">Chef Hiring System</h1>
                <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 13px;">New Event Booking Request Received</p>
            </td>
        </tr>

        <!-- Content Body -->
        <tr>
            <td style="padding: 32px 24px;">
                <h2 style="color: #ffffff; margin-top: 0; font-size: 18px;">Hello Chef {{ $booking->chef->name ?? 'Chef' }},</h2>
                <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
                    You have received a new booking request from customer <strong style="color: #f59e0b;">{{ $booking->customer->name ?? 'Customer' }}</strong>. Please review the event details below:
                </p>

                <!-- Event Details Card -->
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #182238; border-radius: 12px; border: 1px solid #334155; margin: 20px 0; padding: 16px;">
                    <tr>
                        <td style="padding: 8px 0; color: #94a3b8; font-size: 13px; width: 35%;">Customer Name:</td>
                        <td style="padding: 8px 0; color: #ffffff; font-size: 13px; font-weight: bold;">{{ $booking->customer->name ?? 'N/A' }}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #94a3b8; font-size: 13px;">Customer Phone:</td>
                        <td style="padding: 8px 0; color: #38bdf8; font-size: 13px; font-weight: bold;">{{ $booking->customer->phone ?? 'Not provided' }}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #94a3b8; font-size: 13px;">Customer Email:</td>
                        <td style="padding: 8px 0; color: #ffffff; font-size: 13px;">{{ $booking->customer->email ?? 'N/A' }}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #94a3b8; font-size: 13px;">Event Type:</td>
                        <td style="padding: 8px 0; color: #f59e0b; font-size: 13px; font-weight: bold;">{{ $booking->event_type }}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #94a3b8; font-size: 13px;">Date & Time:</td>
                        <td style="padding: 8px 0; color: #ffffff; font-size: 13px; font-weight: bold;">{{ $booking->event_date }} at {{ $booking->event_time }}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #94a3b8; font-size: 13px;">Guests Count:</td>
                        <td style="padding: 8px 0; color: #ffffff; font-size: 13px;">{{ $booking->guests_count }} Guests</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #94a3b8; font-size: 13px;">Event Venue Location:</td>
                        <td style="padding: 8px 0; color: #ffffff; font-size: 13px;">{{ $booking->location }}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #94a3b8; font-size: 13px;">Total Price Estimate:</td>
                        <td style="padding: 8px 0; color: #4ade80; font-size: 15px; font-weight: bold;">LKR {{ number_format($booking->total_price, 2) }}</td>
                    </tr>
                </table>


            </td>
        </tr>

        <!-- Footer -->
        <tr>
            <td style="background-color: #0b1120; padding: 16px 24px; text-align: center; border-top: 1px solid #1e293b;">
                <p style="color: #64748b; font-size: 12px; margin: 0;">
                    &copy; {{ date('Y') }} Chef Hiring System. All rights reserved.
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
