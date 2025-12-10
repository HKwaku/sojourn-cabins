import { NextResponse } from 'next/server';
import { sendBookingEmail } from '../../../mailjet';

// CORS headers so Bernard Admin (different origin) can call this safely.
// Using "*" here avoids breaking existing Sojourn usage.
// If you want to lock it down later, change '*' to your Bernard Admin URL.
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Preflight handler for browsers
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function POST(req) {
  try {
    const { booking } = await req.json();

    await sendBookingEmail({
      to: booking.guest_email,
      name: booking.guest_first_name || '',
      booking, // pass the full booking object through
    });

    // 🔁 Same JSON shape & status as before, just with CORS headers added
    return NextResponse.json(
      { success: true },
      { headers: CORS_HEADERS }
    );
  } catch (err) {
    console.error('Error sending booking email', err);

    // 🔁 Same error contract: { success: false } with 500 status
    return NextResponse.json(
      { success: false },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
