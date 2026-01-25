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
          payment_status: 'paid',
        })
        .eq('payment_reference', reference);

      if (updateError) {
        console.error('Update error:', updateError);
        return NextResponse.json({ error: 'Update failed' }, { status: 500 });
      }

      console.log('✅ Reservations confirmed');

      // Send booking confirmation email
      try {
        const primaryReservation = reservations[0];
        const isGroupBooking = reservations.length > 1;
        const isPackage = !!(primaryReservation.package_code || primaryReservation.package_name);

        console.log('📧 === EMAIL SENDING START ===');

<<<<<<< HEAD
        // Get extras with the needs_guest_input flag from the extras table
=======
        // Get extras - we'll fetch needs_guest_input separately since the join might not work
>>>>>>> main
        const reservationIds = reservations.map(r => r.id);
        const { data: reservationExtras, error: extrasError } = await supabase
          .from('reservation_extras')
          .select(`
            *,
            extras!inner(needs_guest_input)
          `)
          .in('reservation_id', reservationIds);

        if (extrasError) {
          console.error('❌ Error fetching extras:', extrasError);
        }

        console.log('Found extras:', reservationExtras?.length || 0);
        
        // Fetch the needs_guest_input flag for each extra from the extras table
        let extrasConfigMap: Record<string, boolean> = {};
        if (reservationExtras && reservationExtras.length > 0) {
          const extraCodes = [...new Set(reservationExtras.map((e: any) => e.extra_code))];
          const { data: extrasConfig } = await supabase
            .from('extras')
            .select('code, needs_guest_input')
            .in('code', extraCodes);
          
          if (extrasConfig) {
            extrasConfigMap = extrasConfig.reduce((acc: any, extra: any) => {
              acc[extra.code] = extra.needs_guest_input;
              return acc;
            }, {});
          }
          
          console.log('📊 Extras config map:', extrasConfigMap);
        }

        // Check if any extras need selection (from database flag or if it's a package)
        const hasExtrasNeedingSelection = reservationExtras && reservationExtras.length > 0 && (
          isPackage || 
<<<<<<< HEAD
          reservationExtras.some((extra: any) => extra.extras?.needs_guest_input === true)
=======
          reservationExtras.some((extra: any) => extrasConfigMap[extra.extra_code] === true)
>>>>>>> main
        );

        console.log('Extras needing selection:', hasExtrasNeedingSelection);
        console.log('Is package:', isPackage);

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

          const roomExtras = (reservationExtras || [])
            .filter((e: any) => e.reservation_id === res.id)
            .map((e: any) => {
              // For packages, all extras need selection
              // For regular bookings, use the needs_guest_input flag from the database
<<<<<<< HEAD
              const needsSelection = isPackage || (e.extras?.needs_guest_input === true);
=======
              const needsSelection = isPackage || (extrasConfigMap[e.extra_code] === true);
              
              // Debug logging
              console.log(`📦 Extra: ${e.extra_name}`);
              console.log(`   - extra_code: ${e.extra_code}`);
              console.log(`   - isPackage: ${isPackage}`);
              console.log(`   - needs_guest_input from DB: ${extrasConfigMap[e.extra_code]}`);
              console.log(`   - needsSelection: ${needsSelection}`);
>>>>>>> main
              
              return {
                code: e.extra_code,
                name: e.extra_name,
                price: e.price,
                qty: e.quantity,
                needs_selection: needsSelection,
              };
            });

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
            extras: roomExtras,
          };
        });

        // Package extras
        let packageExtras = null;
        if (isPackage && reservationExtras && reservationExtras.length > 0) {
          packageExtras = reservationExtras.map((e: any) => ({
            name: e.extra_name,
            extra_name: e.extra_name,
            price: e.price,
            quantity: e.quantity,
            qty: e.quantity,
            needs_selection: true, // All package extras need selection
          }));
        }

        // Use group_reservation_code for group bookings, otherwise confirmation_code
        const displayConfirmationCode = isGroupBooking && primaryReservation.group_reservation_code
          ? primaryReservation.group_reservation_code
          : primaryReservation.confirmation_code;

        console.log(`📧 Using confirmation code: ${displayConfirmationCode} (isGroup: ${isGroupBooking})`);

        // Build email data
        const emailData = {
          booking: {
            confirmation_code: displayConfirmationCode,
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
            room_name: primaryReservation.room_name,
            room_subtotal: primaryReservation.room_subtotal,
            extras_total: primaryReservation.extras_total,
            discount_amount: primaryReservation.discount_amount,
            coupon_code: primaryReservation.coupon_code,
            total: primaryReservation.total,
            is_group_booking: isGroupBooking,
            group_room_subtotal: aggregateRoomSubtotal,
            group_extras_total: aggregateExtrasSubtotal,
            group_discount_total: aggregateDiscountTotal,
            group_total: aggregateTotal,
            rooms: isGroupBooking ? roomsForEmail : [roomsForEmail[0]],
            package_code: primaryReservation.package_code || null,
            package_name: primaryReservation.package_name || null,
            packageExtras: packageExtras,
          }
        };

        console.log('📧 Confirmation code:', emailData.booking.confirmation_code);
        console.log('📧 Is group:', isGroupBooking);

        if (!process.env.NEXT_PUBLIC_BASE_URL) {
          console.error('❌ NEXT_PUBLIC_BASE_URL not set - emails will fail!');
        }

        // Send booking confirmation email - always attempt to send
        try {
          const emailResponse = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/send-booking-email`,
            {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              body: JSON.stringify(emailData),
            }
          );

          console.log('📧 Email API status:', emailResponse.status);

          if (!emailResponse.ok) {
            const errorText = await emailResponse.text();
            console.error('❌ Email failed:', errorText);
          } else {
            console.log('✅ Email sent successfully');
          }
        } catch (emailSendError: any) {
          console.error('❌ Error calling email API:', emailSendError.message);
        }

        // Send extra selections email if needed
        if (hasExtrasNeedingSelection) {
          console.log('📧 === EXTRA SELECTIONS EMAIL START ===');
          
          const extrasLink = `${process.env.NEXT_PUBLIC_BASE_URL}/extra-selections?code=${displayConfirmationCode}`;
          
          const extrasEmailData = {
            booking: emailData.booking,
            extrasLink: extrasLink,
          };

          try {
            const extrasEmailResponse = await fetch(
              `${process.env.NEXT_PUBLIC_BASE_URL}/api/send-extra-selections-email`,
              {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  'Accept': 'application/json'
                },
                body: JSON.stringify(extrasEmailData),
              }
            );

            console.log('📧 Extra selections email API status:', extrasEmailResponse.status);

            if (!extrasEmailResponse.ok) {
              const errorText = await extrasEmailResponse.text();
              console.error('❌ Extra selections email failed:', errorText);
            } else {
              console.log('✅ Extra selections email sent successfully');
              console.log('📧 Link:', extrasLink);
            }
          } catch (extraEmailError: any) {
            console.error('❌ Error calling extra selections email API:', extraEmailError.message);
          }

          console.log('📧 === EXTRA SELECTIONS EMAIL END ===');
        } else {
          console.log('ℹ️ No extras requiring selection, skipping extra selections email');
        }

        console.log('📧 === EMAIL SENDING END ===');

      } catch (emailError: any) {
        console.error('❌ EMAIL ERROR:', emailError);
      }

      console.log('=== Webhook Complete ===');
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }