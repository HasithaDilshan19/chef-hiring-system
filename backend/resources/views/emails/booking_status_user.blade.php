<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Booking Status Update</title>
</head>
<body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #090d16; color: #e2e8f0; margin: 0; padding: 20px;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #0f172a; border-radius: 16px; border: 1px solid #1e293b; overflow: hidden;">
        <!-- Header -->
        <tr>
            <td style="background-color: #1e293b; padding: 24px; text-align: center; border-bottom: 2px solid #f59e0b;">
                <h1 style="color: #f59e0b; margin: 0; font-size: 22px; font-weight: bold;">Chef Hiring System</h1>
                <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 13px;">Booking Status Notification</p>
            </td>
        </tr>

        <!-- Content Body -->
        <tr>
            <td style="padding: 32px 24px;">
                <h2 style="color: #ffffff; margin-top: 0; font-size: 18px;">Hello {{ $booking->customer->name ?? 'Customer' }},</h2>

                @if($booking->status === 'accepted')
                    <div style="background-color: rgba(74, 222, 128, 0.1); border: 1px solid rgba(74, 222, 128, 0.3); border-radius: 12px; padding: 16px; margin: 20px 0;">
                        <h3 style="color: #4ade80; margin: 0 0 6px 0; font-size: 16px;">🎉 Your Booking has been APPROVED!</h3>
                        <p style="color: #cbd5e1; font-size: 13px; margin: 0;">
                            Great news! Chef <strong>{{ $booking->chef->name ?? 'Chef' }}</strong> has officially confirmed and approved your booking request.
                        </p>
                    </div>
                @elseif($booking->status === 'completed')
                    <div style="background-color: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 12px; padding: 16px; margin: 20px 0;">
                        <h3 style="color: #38bdf8; margin: 0 0 6px 0; font-size: 16px;">✨ Event Completed</h3>
                        <p style="color: #cbd5e1; font-size: 13px; margin: 0;">
                            Your event booking with Chef <strong>{{ $booking->chef->name ?? 'Chef' }}</strong> has been marked as completed.
                        </p>
                    </div>
                @elseif($booking->status === 'cancelled')
                    <div style="background-color: rgba(244, 63, 94, 0.1); border: 1px solid rgba(244, 63, 94, 0.3); border-radius: 12px; padding: 16px; margin: 20px 0;">
                        <h3 style="color: #f43f5e; margin: 0 0 6px 0; font-size: 16px;">Booking Status: CANCELLED</h3>
                        <p style="color: #cbd5e1; font-size: 13px; margin: 0;">
                            We regret to inform you that your booking with Chef <strong>{{ $booking->chef->name ?? 'Chef' }}</strong> has been cancelled.
                        </p>
                        @if(!empty($booking->cancellation_reason))
                            <p style="color: #f43f5e; font-size: 13px; margin: 8px 0 0 0; font-weight: bold;">
                                Reason for Cancellation:
                            </p>
                            <p style="color: #e2e8f0; font-size: 13px; margin: 4px 0 0 0; font-style: italic; background-color: rgba(15, 23, 42, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(244, 63, 94, 0.2);">
                                "{{ $booking->cancellation_reason }}"
                            </p>
                        @endif

                        @if($booking->suggestedChef)
                            <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(244, 63, 94, 0.2);">
                                <h4 style="color: #f59e0b; margin: 0 0 6px 0; font-size: 14px;">💡 AI Suggested Replacement Chef:</h4>
                                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: rgba(245, 158, 11, 0.05); border: 1px solid rgba(245, 158, 11, 0.2); border-radius: 8px; padding: 12px; margin-top: 6px;">
                                    <tr>
                                        <td style="padding: 4px 0; color: #94a3b8; font-size: 12px; width: 35%;">Suggested Chef:</td>
                                        <td style="padding: 4px 0; color: #ffffff; font-size: 12px; font-weight: bold;">{{ $booking->suggestedChef->name }}</td>
                                    </tr>
                                    @if($booking->suggestedChef->chefProfile)
                                        <tr>
                                            <td style="padding: 4px 0; color: #94a3b8; font-size: 12px;">Experience:</td>
                                            <td style="padding: 4px 0; color: #ffffff; font-size: 12px;">{{ $booking->suggestedChef->chefProfile->experience_years }} Years</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 4px 0; color: #94a3b8; font-size: 12px;">Rating:</td>
                                            <td style="padding: 4px 0; color: #f59e0b; font-size: 12px; font-weight: bold;">★ {{ number_format($booking->suggestedChef->chefProfile->rating, 1) }}</td>
                                        </tr>
                                    @endif
                                    <tr>
                                        <td style="padding: 4px 0; color: #94a3b8; font-size: 12px;">Phone:</td>
                                        <td style="padding: 4px 0; color: #38bdf8; font-size: 12px; font-weight: bold;">{{ $booking->suggestedChef->phone ?? 'Contact on dashboard' }}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 4px 0; color: #94a3b8; font-size: 12px;">Email:</td>
                                        <td style="padding: 4px 0; color: #ffffff; font-size: 12px;">{{ $booking->suggestedChef->email }}</td>
                                    </tr>
                                </table>
                            </div>
                        @endif
                    </div>
                @else
                    <div style="background-color: rgba(244, 63, 94, 0.1); border: 1px solid rgba(244, 63, 94, 0.3); border-radius: 12px; padding: 16px; margin: 20px 0;">
                        <h3 style="color: #f43f5e; margin: 0 0 6px 0; font-size: 16px;">Booking Status: {{ strtoupper($booking->status) }}</h3>
                        <p style="color: #cbd5e1; font-size: 13px; margin: 0;">
                            The status of your booking with Chef <strong>{{ $booking->chef->name ?? 'Chef' }}</strong> is now: <strong>{{ strtoupper($booking->status) }}</strong>.
                        </p>
                    </div>
                @endif

                <!-- Booking & Chef Info Table -->
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #182238; border-radius: 12px; border: 1px solid #334155; margin: 20px 0; padding: 16px;">
                    <tr>
                        <td style="padding: 8px 0; color: #94a3b8; font-size: 13px; width: 35%;">Assigned Chef:</td>
                        <td style="padding: 8px 0; color: #ffffff; font-size: 13px; font-weight: bold;">{{ $booking->chef->name ?? 'N/A' }}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #94a3b8; font-size: 13px;">Chef Phone:</td>
                        <td style="padding: 8px 0; color: #38bdf8; font-size: 13px; font-weight: bold;">{{ $booking->chef->phone ?? 'Contact available on dashboard' }}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #94a3b8; font-size: 13px;">Chef Email:</td>
                        <td style="padding: 8px 0; color: #ffffff; font-size: 13px;">{{ $booking->chef->email ?? 'N/A' }}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #94a3b8; font-size: 13px;">Event Type:</td>
                        <td style="padding: 8px 0; color: #f59e0b; font-size: 13px; font-weight: bold;">{{ $booking->event_type }}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #94a3b8; font-size: 13px;">Event Date & Time:</td>
                        <td style="padding: 8px 0; color: #ffffff; font-size: 13px; font-weight: bold;">{{ $booking->event_date }} at {{ $booking->event_time }}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #94a3b8; font-size: 13px;">Venue Address:</td>
                        <td style="padding: 8px 0; color: #ffffff; font-size: 13px;">{{ $booking->location }}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #94a3b8; font-size: 13px;">Total Booking Amount:</td>
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
