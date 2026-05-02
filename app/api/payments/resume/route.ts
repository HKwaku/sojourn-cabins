import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const oldReference: string = (body?.reference || '').toString();

    if (!oldReference) {
      return NextResponse.json({ error: 'Missing reference' }, { status: 400 });
    }

    if (!process.env.PAYSTACK_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Payment system not configured' },
        { status: 500 }
      );
    }

    const { data: rows, error } = await supabase
      .from('reservations')
      .select(
        'id, payment_reference, status, total, currency, guest_email, guest_first_name, guest_last_name, check_in, group_reservation_code, previous_payment_references'
      )
      .eq('payment_reference', oldReference);

    if (error || !rows || rows.length === 0) {
      return NextResponse.json(
        { error: 'Reservation not found' },
        { status: 404 }
      );
    }

    const primary = rows[0];

    if (primary.status !== 'pending_payment') {
      return NextResponse.json(
        { error: 'This reservation is no longer pending payment' },
        { status: 409 }
      );
    }

    if (primary.check_in && new Date(primary.check_in).getTime() <= Date.now()) {
      return NextResponse.json(
        { error: 'Check-in date has already passed' },
        { status: 409 }
      );
    }

    if (!primary.guest_email) {
      return NextResponse.json(
        { error: 'Reservation is missing guest email' },
        { status: 422 }
      );
    }

    const groupTotal = rows.reduce(
      (s, r) => s + (r.total ? Number(r.total) : 0),
      0
    );
    const total = groupTotal || Number(primary.total || 0);
    if (!total) {
      return NextResponse.json(
        { error: 'Reservation has no payable total' },
        { status: 422 }
      );
    }

    const newReference = `BK${Date.now()}`;
    const amountInKobo = Math.round(total * 100);

    const paystackResponse = await fetch(
      'https://api.paystack.co/transaction/initialize',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: primary.guest_email,
          amount: amountInKobo,
          currency: primary.currency || 'GHS',
          reference: newReference,
          callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/callback`,
          metadata: {
            guest_name:
              `${primary.guest_first_name || ''} ${primary.guest_last_name || ''}`.trim(),
            is_group_booking: rows.length > 1,
            room_count: rows.length,
            resumed_from: oldReference,
          },
        }),
      }
    );

    if (!paystackResponse.ok) {
      const errorText = await paystackResponse.text();
      console.error('[resume] Paystack error:', errorText);
      return NextResponse.json(
        { error: 'Payment gateway error' },
        { status: 502 }
      );
    }

    const paystackData = await paystackResponse.json();
    if (!paystackData.status) {
      return NextResponse.json(
        { error: paystackData.message || 'Payment initialization failed' },
        { status: 400 }
      );
    }

    // Swap payment_reference on every row sharing the old reference, archiving
    // the old value to previous_payment_references for audit. Postgres has no
    // batch array_append on update — do it row by row but in a single round trip
    // via individual updates (small N, always 1–4 rows).
    for (const r of rows) {
      const history = Array.isArray(r.previous_payment_references)
        ? r.previous_payment_references
        : [];
      const nextHistory = oldReference && !history.includes(oldReference)
        ? [...history, oldReference]
        : history;

      const { error: updateError } = await supabase
        .from('reservations')
        .update({
          payment_reference: newReference,
          previous_payment_references: nextHistory,
        })
        .eq('id', r.id);

      if (updateError) {
        console.error('[resume] update error:', updateError);
        return NextResponse.json(
          { error: 'Failed to update reservation reference' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      authorization_url: paystackData.data.authorization_url,
      reference: newReference,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Resume failed';
    console.error('[resume] error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
