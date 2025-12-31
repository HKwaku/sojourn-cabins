import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { booking } = await request.json();

    if (!booking || !booking.guest_email) {
      return NextResponse.json(
        { error: 'Missing booking data or guest email' },
        { status: 400 }
      );
    }

    // Format currency
    const formatCurrency = (amount: number, currency: string = 'GHS') => {
      return new Intl.NumberFormat('en-GH', {
        style: 'currency',
        currency: currency
      }).format(amount);
    };

    // Format date
    const formatDate = (dateStr: string) => {
      return new Date(dateStr).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    };

    // Build email HTML
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Confirmation - Sojourn Cabins</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    
    <!-- Header -->
    <div style="background-color: #000000; padding: 32px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 300; letter-spacing: 0.5px;">
        SOJOURN CABINS
      </h1>
      <p style="color: #ffffff; margin: 8px 0 0; font-size: 14px; opacity: 0.9;">
        Payment Confirmation
      </p>
    </div>

    <!-- Main Content -->
    <div style="padding: 40px 32px;">
      
      <!-- Success Icon -->
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; width: 64px; height: 64px; background-color: #10b981; border-radius: 50%; position: relative;">
          <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; font-size: 32px;">✓</div>
        </div>
      </div>

      <h2 style="color: #0f172a; font-size: 20px; font-weight: 600; margin: 0 0 16px; text-align: center;">
        Payment Successful!
      </h2>

      <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 0 0 24px; text-align: center;">
        Your payment of <strong style="color: #0f172a;">${formatCurrency(booking.amount_paid, booking.currency)}</strong> has been processed successfully.
      </p>

      <!-- Payment Details Box -->
      <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
        
        <h3 style="color: #9ca3af; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 16px;">
          Payment Details
        </h3>

        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-size: 13px;">Transaction Reference:</td>
            <td style="padding: 8px 0; color: #0f172a; font-size: 13px; text-align: right; font-family: monospace; font-weight: 600;">
              ${booking.payment_reference}
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-size: 13px;">Amount Paid:</td>
            <td style="padding: 8px 0; color: #0f172a; font-size: 13px; text-align: right; font-weight: 600;">
              ${formatCurrency(booking.amount_paid, booking.currency)}
            </td>
          </tr>
          ${booking.card_type ? `
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-size: 13px;">Payment Method:</td>
            <td style="padding: 8px 0; color: #0f172a; font-size: 13px; text-align: right;">
              ${booking.card_type} •••• ${booking.last4 || ''}
            </td>
          </tr>
          ` : ''}
          ${booking.paid_at ? `
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-size: 13px;">Payment Date:</td>
            <td style="padding: 8px 0; color: #0f172a; font-size: 13px; text-align: right;">
              ${new Date(booking.paid_at).toLocaleString('en-GB')}
            </td>
          </tr>
          ` : ''}
        </table>
      </div>

      <!-- Booking Summary Box -->
      <div style="background-color: #eff6ff; border: 1px solid #3b82f6; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
        
        <h3 style="color: #1e40af; font-size: 13px; font-weight: 600; margin: 0 0 12px;">
          Booking Summary
        </h3>

        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; color: #1e40af; font-size: 13px;">Confirmation Code:</td>
            <td style="padding: 6px 0; color: #1e40af; font-size: 13px; text-align: right; font-family: monospace; font-weight: 600;">
              ${booking.confirmation_code}
            </td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #1e40af; font-size: 13px;">Guest:</td>
            <td style="padding: 6px 0; color: #1e40af; font-size: 13px; text-align: right;">
              ${booking.guest_first_name} ${booking.guest_last_name}
            </td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #1e40af; font-size: 13px;">Check-in:</td>
            <td style="padding: 6px 0; color: #1e40af; font-size: 13px; text-align: right;">
              ${formatDate(booking.check_in)}
            </td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #1e40af; font-size: 13px;">Check-out:</td>
            <td style="padding: 6px 0; color: #1e40af; font-size: 13px; text-align: right;">
              ${formatDate(booking.check_out)}
            </td>
          </tr>
          ${booking.is_group_booking ? `
          <tr>
            <td style="padding: 6px 0; color: #1e40af; font-size: 13px;">Rooms:</td>
            <td style="padding: 6px 0; color: #1e40af; font-size: 13px; text-align: right;">
              ${booking.rooms?.length || 1} rooms
            </td>
          </tr>
          ` : `
          <tr>
            <td style="padding: 6px 0; color: #1e40af; font-size: 13px;">Room:</td>
            <td style="padding: 6px 0; color: #1e40af; font-size: 13px; text-align: right;">
              ${booking.room_name}
            </td>
          </tr>
          `}
        </table>
      </div>

      <!-- Next Steps -->
      <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
        <p style="color: #92400e; font-size: 13px; margin: 0; line-height: 1.6;">
          <strong style="display: block; margin-bottom: 8px;">What's Next?</strong>
          • A detailed booking confirmation email has also been sent<br>
          • Check-in instructions will be sent 24 hours before arrival<br>
          • Keep your confirmation code handy: <strong>${booking.confirmation_code}</strong>
        </p>
      </div>

      <!-- Footer Note -->
      <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin: 0; text-align: center;">
        This is an automated payment confirmation. For booking inquiries, please reply to this email or contact us directly.
      </p>

    </div>

    <!-- Footer -->
    <div style="background-color: #f9fafb; padding: 24px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="color: #64748b; font-size: 12px; margin: 0 0 8px;">
        <strong style="color: #0f172a;">Sojourn Cabins</strong><br>
        Anomabo, Ghana
      </p>
      <p style="color: #9ca3af; font-size: 11px; margin: 0;">
        © ${new Date().getFullYear()} Sojourn Cabins. All rights reserved.
      </p>
    </div>

  </div>
</body>
</html>
    `;

    // Send via your existing email service (Resend/Mailjet)
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Sojourn Cabins <bookings@sojourncabins.com>',
        to: [booking.guest_email],
        subject: `Payment Confirmed - ${formatCurrency(booking.amount_paid, booking.currency)} - ${booking.confirmation_code}`,
        html: emailHtml,
      }),
    });

    if (!emailResponse.ok) {
      const error = await emailResponse.text();
      console.error('Resend API error:', error);
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

    const result = await emailResponse.json();
    return NextResponse.json({ success: true, id: result.id });

  } catch (error) {
    console.error('Payment email error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}