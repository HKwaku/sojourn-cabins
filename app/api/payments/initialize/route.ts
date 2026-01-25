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

    // Generate unique payment reference
    const reference = `BK${Date.now()}`;
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

    // Generate group reservation code if multiple rooms
    const groupReservationCode = roomsToCreate.length > 1 
      ? `GRP-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`
      : null;

    if (groupReservationCode) {
      console.log('Group reservation code:', groupReservationCode);
    }
    
    // Create reservation for each room
    const confirmationCodes = [];
    
    for (let i = 0; i < roomsToCreate.length; i++) {
      const room = roomsToCreate[i];
      const isPrimary = (i === 0);
      
      // Generate UNIQUE confirmation code for THIS room
      const roomConfirmationCode = `BK${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
      confirmationCodes.push(roomConfirmationCode);

      console.log(`Creating reservation ${i + 1}/${roomsToCreate.length}:`, room.roomTypeCode);
      console.log(`- Confirmation code: ${roomConfirmationCode}`);
      console.log(`- Group code: ${groupReservationCode || 'none'}`);

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
          confirmation_code: roomConfirmationCode,
          room_type_id: roomTypes.id,
          room_type_code: room.roomTypeCode,
          room_name: room.roomName,
          check_in: body.checkIn,
          check_out: body.checkOut,
          nights: room.nights || body.nights,
          adults: room.adults || body.adults,
          room_subtotal: room.roomSubtotal,
          extras_total: isPrimary ? room.extrasTotal : 0,
          discount_amount: room.discountAmount || 0,
          room_discount: room.roomDiscount || 0,
          extras_discount: isPrimary ? (room.extrasDiscount || 0) : 0,
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
          payment_reference: reference,
          group_reservation_code: groupReservationCode,
        });

      if (insertError) {
        console.error('Insert error:', insertError);
        throw new Error(`Failed to create reservation: ${insertError.message}`);
      }

      console.log(`✅ Created reservation: ${roomConfirmationCode}`);

      // Insert extras only for first room AND only if extras were selected
      if (isPrimary && room.extras && room.extras.length > 0) {
        // Get the reservation we just created
        const { data: createdRes } = await supabase
          .from('reservations')
          .select('id')
          .eq('confirmation_code', roomConfirmationCode)
          .single();

        if (createdRes) {
          // **FILTER: Only insert extras that were actually selected (qty > 0)**
          const selectedExtras = room.extras.filter((extra: any) => 
            extra.qty && extra.qty > 0
          );
          
          console.log(`Total extras in payload: ${room.extras.length}`);
          console.log(`Selected extras (qty > 0): ${selectedExtras.length}`);
          
          if (selectedExtras.length > 0) {
            const reservationExtras = selectedExtras.map((extra: any) => ({
              reservation_id: createdRes.id,
              extra_code: extra.code,
              extra_name: extra.name,
              price: extra.price,
              quantity: extra.qty,
              subtotal: extra.price * extra.qty,
              discount_amount: extra.discount || 0,
            }));
            
            const { error: extrasError } = await supabase
              .from('reservation_extras')
              .insert(reservationExtras);

            if (extrasError) {
              console.error('Extras insert error:', extrasError);
            } else {
              console.log(`✅ Added ${selectedExtras.length} selected extras`);
            }
          } else {
            console.log('ℹ️ No extras selected (all have qty = 0)');
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
            .eq('confirmation_code', roomConfirmationCode);
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
      groupCode: groupReservationCode,
      confirmationCode: confirmationCodes[0],
      confirmationCodes: confirmationCodes
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