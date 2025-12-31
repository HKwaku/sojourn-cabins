import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('=== Payment Initialization Started ===');

    // Validate
    if (!body.guest?.email || !body.finalTotal) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check credentials
    if (!process.env.PAYSTACK_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Payment system not configured' },
        { status: 500 }
      );
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    // Generate unique reference
    const reference = `BK${Date.now()}`;
    const confirmationCode = reference.substring(2, 10);
    const amountInKobo = Math.round(body.finalTotal * 100);

    console.log('Generated reference:', reference);
    console.log('Amount in kobo:', amountInKobo);

    // Initialize payment with Paystack
    const paystackResponse = await fetch(
      'https://api.paystack.co/transaction/initialize',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: body.guest.email,
          amount: amountInKobo,
          currency: body.currency || 'GHS',
          reference: reference,
          callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/callback`,
          metadata: {
            guest_name: `${body.guest.first} ${body.guest.last}`,
            is_group_booking: body.isGroupBooking || false,
            room_count: body.allRooms?.length || 1
          }
        }),
      }
    );

    if (!paystackResponse.ok) {
      const errorText = await paystackResponse.text();
      console.error('Paystack error:', errorText);
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

    console.log('✅ Paystack initialized');

    // Determine which rooms to create (multi-room support)
    const roomsToCreate = body.allRooms || [{
      roomTypeCode: body.roomTypeCode,
      roomName: body.roomName,
      roomSubtotal: body.roomSubtotal,
      extrasTotal: body.extrasTotal,
      discountAmount: body.discountAmount,
      finalTotal: body.finalTotal,
      extras: body.extras,
      couponCode: body.couponCode,
      adults: body.adults,
      nights: body.nights
    }];

    console.log(`Creating ${roomsToCreate.length} reservation(s)`);

    // Create reservation for each room
    for (let i = 0; i < roomsToCreate.length; i++) {
      const room = roomsToCreate[i];
      const isPrimary = (i === 0);
      
      console.log(`Creating reservation ${i + 1}/${roomsToCreate.length}:`, room.roomTypeCode);

      // Lookup room type
      const { data: roomTypes, error: roomError } = await supabase
        .from('room_types')
        .select('id')
        .eq('code', room.roomTypeCode)
        .single();

      if (roomError || !roomTypes) {
        console.error('Room lookup error:', roomError);
        throw new Error(`Room type not found: ${room.roomTypeCode}`);
      }

      // Insert reservation
      const { error: insertError } = await supabase
        .from('reservations')
        .insert({
          confirmation_code: confirmationCode,
          room_type_id: roomTypes.id,
          room_type_code: room.roomTypeCode,
          room_name: room.roomName,
          check_in: body.checkIn,
          check_out: body.checkOut,
          nights: room.nights || body.nights,
          adults: room.adults || body.adults,
          room_subtotal: room.roomSubtotal,
          extras_total: isPrimary ? room.extrasTotal : 0, // Only first room gets extras
          discount_amount: isPrimary ? room.discountAmount : 0, // Only first room gets discount
          coupon_code: isPrimary ? room.couponCode : null,
          total: room.finalTotal,
          currency: body.currency,
          guest_first_name: body.guest.first,
          guest_last_name: body.guest.last,
          guest_email: body.guest.email,
          guest_phone: body.guest.phone || '',
          country_code: body.guest.countryCode || '',
          status: 'pending_payment',
          payment_status: 'pending',
          payment_reference: reference, // SAME reference for all rooms!
          group_reservation_code: body.groupReservationCode || null,
        });

      if (insertError) {
        console.error('Insert error:', insertError);
        throw new Error(`Failed to create reservation: ${insertError.message}`);
      }

      // Insert extras only for first room
      if (isPrimary && room.extras && room.extras.length > 0) {
        console.log(`Adding ${room.extras.length} extras to primary reservation`);
        
        // Get the reservation we just created
        const { data: createdRes } = await supabase
          .from('reservations')
          .select('id')
          .eq('payment_reference', reference)
          .eq('room_type_code', room.roomTypeCode)
          .single();

        if (createdRes) {
          const reservationExtras = room.extras.map((extra: any) => ({
            reservation_id: createdRes.id,
            extra_code: extra.code,
            extra_name: extra.name,
            price: extra.price,
            quantity: extra.qty,
            subtotal: extra.price * extra.qty,
          }));
          
          const { error: extrasError } = await supabase
            .from('reservation_extras')
            .insert(reservationExtras);

          if (extrasError) {
            console.error('Extras insert error:', extrasError);
            // Non-critical, continue
          } else {
            console.log('✅ Extras added');
          }
        }
        // If this is a package booking, store package info
        if (body.isPackage && body.packageId) {
          await supabase
            .from('reservations')
            .update({
              package_id: body.packageId,
              package_code: body.packageCode || null,
              package_name: body.packageName || null
            })
            .eq('payment_reference', reference)
            .eq('room_type_code', room.roomTypeCode);
        }
      }
    }

    console.log(`✅ Created ${roomsToCreate.length} reservation(s) with reference: ${reference}`);
    console.log('=== Payment Initialization Complete ===');

    // Return Paystack checkout URL
    return NextResponse.json({
      success: true,
      authorization_url: paystackData.data.authorization_url,
      reference: reference,
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Payment failed';
    console.error('=== Payment Initialization Error ===');
    console.error('Error:', errorMessage);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}