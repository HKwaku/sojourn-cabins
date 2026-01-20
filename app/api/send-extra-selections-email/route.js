import { NextResponse } from 'next/server';
import { sendExtraSelectionsEmail } from '../../../mailjet';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function POST(req) {
  try {
    const { booking, extrasLink } = await req.json();

    await sendExtraSelectionsEmail({
      to: booking.guest_email,
      name: booking.guest_first_name || '',
      booking,
      extrasLink,
    });

    return NextResponse.json(
      { success: true },
      { headers: CORS_HEADERS }
    );
  } catch (err) {
    console.error('Error sending extra selections email', err);

    return NextResponse.json(
      { success: false },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}