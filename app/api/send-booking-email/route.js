import { NextResponse } from 'next/server';
import { sendBookingEmail } from '../../../mailjet';

export async function POST(req) {
  try {
    const { booking } = await req.json();

    await sendBookingEmail({
      to: booking.guest_email,
      name: booking.guest_first_name || '',
      booking: {
        cabin: booking.room_name,
        checkIn: booking.check_in,
        checkOut: booking.check_out,
        total: booking.total,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error sending booking email', err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
