import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-paystack-signature');

    console.log('=== Webhook Received ===');

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    // Verify signature
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY || '')
      .update(body)
      .digest('hex');

    if (hash !== signature) {
      console.error('Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log('✅ Signature verified');

    const event = JSON.parse(body);

    if (event.event === 'charge.success') {
      const reference = event.data?.reference;

      if (!reference) {
        return NextResponse.json({ received: true });
      }

      console.log('Processing payment:', reference);

      // Find ALL reservations with this payment reference
      const { data: reservations, error: fetchError } = await supabase
        .from('reservations')
        .select('*')
        .eq('payment_reference', reference);

      if (fetchError || !reservations || reservations.length === 0) {
        console.error('No reservations found:', fetchError);
        return NextResponse.json({ received: true });
      }

      console.log(`Found ${reservations.length} reservation(s)`);

      // Update ALL reservations to confirmed
      const { error: updateError } = await supabase
        .from('reservations')
        .update({
          status: 'confirmed',
          payment_status: 'completed',
        })
        .eq('payment_reference', reference);

      if (updateError) {
        console.error('Update error:', updateError);
        return NextResponse.json({ error: 'Update failed' }, { status: 500 });
      }

      console.log('✅ Reservations confirmed');

      // Send booking confirmation email using your existing system
      try {
        const primaryReservation = reservations[0];
        const isGroupBooking = reservations.length > 1;

        // Get extras for ALL reservations
        const reservationIds = reservations.map(r => r.id);
        const { data: reservationExtras } = await supabase
          .from('reservation_extras')
          .select('*')
          .in('reservation_id', reservationIds);

        console.log(`Found ${reservationExtras?.length || 0} extras`);

        // Calculate totals
        let aggregateRoomSubtotal = 0;
        let aggregateExtrasSubtotal = 0;
        let aggregateDiscountTotal = 0;
        let aggregateTotal = 0;

        const roomsForEmail = reservations.map((res: any) => {
          aggregateRoomSubtotal += res.room_subtotal || 0;
          aggregateExtrasSubtotal += res.extras_total || 0;
          aggregateDiscountTotal += res.discount_amount || 0;
          aggregateTotal += res.total || 0;

          return {
            room_name: res.room_name,
            check_in: res.check_in,
            check_out: res.check_out,
            nights: res.nights,
            adults: res.adults,
            room_subtotal: res.room_subtotal,
            extras_total: res.extras_total,
            discount_amount: res.discount_amount,
            total: res.total,
            currency: res.currency,
          };
        });

        // Build email data matching your old BookingWidget structure
        const emailData = {
          booking: {
            // Guest + primary reservation info
            confirmation_code: primaryReservation.confirmation_code,
            group_reservation_code: isGroupBooking ? primaryReservation.group_reservation_code : null,
            guest_first_name: primaryReservation.guest_first_name,
            guest_last_name: primaryReservation.guest_last_name,
            guest_email: primaryReservation.guest_email,
            guest_phone: primaryReservation.guest_phone,

            check_in: primaryReservation.check_in,
            check_out: primaryReservation.check_out,
            nights: primaryReservation.nights,
            adults: primaryReservation.adults,
            currency: primaryReservation.currency,

            // Keep primary-room fields for backwards compatibility
            room_name: primaryReservation.room_name,
            room_subtotal: primaryReservation.room_subtotal,
            extras_total: primaryReservation.extras_total,
            discount_amount: primaryReservation.discount_amount,
            coupon_code: primaryReservation.coupon_code,
            total: primaryReservation.total,

            // Full group details
            is_group_booking: isGroupBooking,
            group_room_subtotal: aggregateRoomSubtotal,
            group_extras_total: aggregateExtrasSubtotal,
            group_discount_total: aggregateDiscountTotal,
            group_total: aggregateTotal,
            rooms: isGroupBooking ? roomsForEmail : null,

            // Extras array (for email template)
            extras: reservationExtras?.map((e: any) => ({
              code: e.extra_code,
              name: e.extra_name,
              price: e.price,
              qty: e.quantity,
            })) || [],

            // Package details
            package_code: primaryReservation.package_code || null,
            package_name: primaryReservation.package_name || null,
          }
        };

        console.log('Sending booking confirmation email to:', primaryReservation.guest_email);

        // Use your EXISTING email route
        const emailResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/send-booking-email`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(emailData),
          }
        );

        if (!emailResponse.ok) {
          const errorText = await emailResponse.text();
          console.error('Email API error:', errorText);
        } else {
          console.log('✅ Booking confirmation email sent');
        }

      } catch (emailError) {
        console.error('Email error (non-critical):', emailError);
      }

      console.log('=== Webhook Complete ===');
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}