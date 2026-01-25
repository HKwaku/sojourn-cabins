// mailjet.js
// Plain fetch-based Mailjet client – no external "node-mailjet" dependency

const MAILJET_API_KEY = process.env.MAILJET_API_KEY;
const MAILJET_SECRET_KEY = process.env.MAILJET_SECRET_KEY;
const MAILJET_FROM_EMAIL = process.env.MAILJET_FROM_EMAIL;
const MAILJET_FROM_NAME = process.env.MAILJET_FROM_NAME || "Reservations";

const CHECK_IN_TIME = "2:00 PM";
const CHECK_OUT_TIME = "11:00 AM";


// Guest book PDF (public URL)
const GUEST_BOOK_PDF_URL =
  "https://pqtedphijayclewljlkq.supabase.co/storage/v1/object/public/cabin-images/Sojourn_Cabins_guest_book.pdf";

// Simple in-memory cache to avoid downloading the PDF on every email
let _guestBookPdfBase64 = null;

async function getGuestBookPdfBase64() {
  if (_guestBookPdfBase64) return _guestBookPdfBase64;

  const res = await fetch(GUEST_BOOK_PDF_URL);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to fetch guest book PDF (${res.status}): ${text}`);
  }

  const arrayBuf = await res.arrayBuffer();
  const b64 = Buffer.from(arrayBuf).toString("base64");
  _guestBookPdfBase64 = b64;
  return b64;
}


if (!MAILJET_API_KEY || !MAILJET_SECRET_KEY) {
  console.warn("MAILJET_API_KEY or MAILJET_SECRET_KEY is not set");
}

function formatMoney(amount, currency) {
  if (amount == null || isNaN(amount)) return "—";
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: currency || "GHS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount));
}

function formatDatePretty(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).replace(/ /g, "-");
}


export async function sendBookingEmail({ to, name, booking }) {
  const currency = booking.currency || "GHS";

  const guestName =
    `${booking.guest_first_name || ""} ${booking.guest_last_name || ""}`
      .trim() || name || "";

  const datesText =
  booking.check_in && booking.check_out
    ? `${formatDatePretty(booking.check_in)} → ${formatDatePretty(booking.check_out)}`
    : "";


  // Use all rooms if provided; otherwise fall back to a single room
  const roomsArray =
    Array.isArray(booking.rooms) && booking.rooms.length
      ? booking.rooms
      : [
          {
            room_name: booking.room_name,
            room_subtotal: booking.room_subtotal,
            extras_total: booking.extras_total,
            discount_amount: booking.discount_amount,
            total: booking.total,
          },
        ];

  const roomLinesHtml = roomsArray
    .map((r) => {
      const nm = r.room_name || "Room";
      const sub =
        r.room_subtotal != null
          ? formatMoney(r.room_subtotal, r.currency || currency)
          : "—";
      return `${nm}: ${sub}`;
    })
    .join("<br>");

  // Aggregate totals across rooms; fall back to group_* fields if provided
  const summedRoomSubtotal = roomsArray.reduce(
    (sum, r) => sum + (r.room_subtotal ? Number(r.room_subtotal) : 0),
    0
  );
  const summedExtrasSubtotal = roomsArray.reduce(
    (sum, r) => sum + (r.extras_total ? Number(r.extras_total) : 0),
    0
  );
  const summedDiscountTotal = roomsArray.reduce(
    (sum, r) => sum + (r.discount_amount ? Number(r.discount_amount) : 0),
    0
  );
  const summedTotal = roomsArray.reduce(
    (sum, r) => sum + (r.total ? Number(r.total) : 0),
    0
  );

  const roomSubtotal =
    booking.group_room_subtotal != null
      ? Number(booking.group_room_subtotal)
      : summedRoomSubtotal;

  const extrasSubtotal =
    booking.group_extras_total != null
      ? Number(booking.group_extras_total)
      : summedExtrasSubtotal;

  const discountTotal =
    booking.group_discount_total != null
      ? Number(booking.group_discount_total)
      : summedDiscountTotal;

  const totalPaid =
    booking.group_total != null
      ? Number(booking.group_total)
      : booking.total != null
      ? Number(booking.total)
      : summedTotal;

  const discountText = discountTotal
    ? `-${formatMoney(Math.abs(discountTotal), currency)}${
        booking.coupon_code && booking.discount_description
          ? ` (${booking.coupon_code} – ${booking.discount_description})`
          : booking.coupon_code
          ? ` (${booking.coupon_code})`
          : ""
      }`
    : "—";

  // Build extras details HTML if extras exist
  let extrasDetailsHtml = "";
  if (Array.isArray(booking.rooms) && booking.rooms.length > 0) {
    // Check if any room has extras
    const hasExtras = booking.rooms.some(
      (r) => Array.isArray(r.extras) && r.extras.length > 0
    );

    if (hasExtras) {
      const extrasRows = [];
      booking.rooms.forEach((room) => {
        if (Array.isArray(room.extras) && room.extras.length > 0) {
          room.extras.forEach((extra) => {
            const extraName = extra.name || "—";
            const extraQty = extra.qty || 1;
            const extraPrice = extra.price != null ? extra.price : 0;
            const extraTotal = extraQty * extraPrice;
            extrasRows.push(`
              <tr>
                <td style="padding: 6px 0; font-size: 14px; color: #0f172a;">
                  ${extraQty > 1 ? `<strong>${extraQty}×</strong> ` : ''}${extraName}
                </td>
                <td style="padding: 6px 0; text-align: right; font-size: 14px; color: #0f172a; font-weight: 500;">
                  ${formatMoney(extraTotal, currency)}
                </td>
              </tr>
            `);
          });
        }
      });

      if (extrasRows.length > 0) {
          extrasDetailsHtml = `
            <div style="padding-top: 12px; margin-top: 12px; border-top: 1px solid #e5e7eb;">
              <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: #9ca3af; letter-spacing: 0.08em; margin-bottom: 8px;">
                Experiences
              </div>
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tbody>
                  ${extrasRows.join("")}
                </tbody>
              </table>
              <div style="margin-top: 8px; padding-top: 8px; border-top: 1px dashed #e5e7eb;">
                <table role="presentation" style="width: 100%;">
                  <tr>
                    <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 500;">
                      Experiences subtotal:
                    </td>
                    <td style="padding: 6px 0; text-align: right; font-size: 13px; color: #0f172a; font-weight: 500;">
                      ${formatMoney(extrasSubtotal, currency)}
                    </td>
                  </tr>
                </table>
              </div>
            </div>
          `;
        }
      }
  }

  // Map room names to image URLs
  const roomImageMap = {
    'SEA Cabin': 'https://pqtedphijayclewljlkq.supabase.co/storage/v1/object/public/cabin-images/WhatsApp%20Image%202023-12-04%20at%2002.09.06_31bd0e74.jpg',
    'SAND Cabin': 'https://pqtedphijayclewljlkq.supabase.co/storage/v1/object/public/cabin-images/rooms/SAND/1762814626395.jpg',
    'SUN Cabin': 'https://pqtedphijayclewljlkq.supabase.co/storage/v1/object/public/cabin-images/WhatsApp%20Image%202023-12-04%20at%2002.09.17_b44450d1.jpg',
  };

  // Get unique rooms and their images
  const roomImages = roomsArray
    .map(r => {
      const roomName = r.room_name || 'Room';
      return {
        name: roomName,
        image: roomImageMap[roomName] || 'https://res.cloudinary.com/dvsalazae/image/upload/v1738159935/SEA_Cabin_t6jkdv.jpg'
      };
    })
    .filter((room, index, self) => 
      index === self.findIndex(r => r.name === room.name)
    );

  // Build cabin images HTML
  const cabinImagesHtml = roomImages.map(room => `
    <div style="margin-bottom: 16px;">
      <img src="${room.image}" alt="${room.name}" style="width: 100%; max-width: 600px; height: auto; border-radius: 12px; display: block;" />
      <p style="margin: 8px 0 0 0; font-size: 14px; color: #6b7280; text-align: center;">${room.name}</p>
    </div>
  `).join('');

  // Build room list for display
  const roomsList = roomsArray.map(r => r.room_name || 'Room').join(', ');

  // Check if this is a package booking
  const hasPackage = booking.package_code || booking.package_name;
  
  // Build package details if exists
    let packageDetailsHtml = '';

  if (hasPackage) {
    // Build a list of "Package Includes" items so that emails match the confirmation modal.
    let packageItems = [];

    // 1) Prefer an explicit packageExtras array if the caller provided one
    if (Array.isArray(booking.packageExtras) && booking.packageExtras.length > 0) {
      packageItems = booking.packageExtras
        .map((ex) => {
          if (!ex) return null;
          // Accept either plain strings or objects with common name fields
          if (typeof ex === 'string') return ex.trim();
          const label = ex.name || ex.extra_name || ex.title || '';
          const qty =
            ex.quantity || ex.qty || ex.count || ex.num || 1;
          if (!label) return null;
          return qty > 1 ? `${label} x${qty}` : label;
        })
        .filter(Boolean);
    }

    // 2) Fallback: derive from rooms[].extras (booking widget style)
    if (packageItems.length === 0 && Array.isArray(booking.rooms)) {
      const collected = [];
      booking.rooms.forEach((room) => {
        if (!room || !Array.isArray(room.extras)) return;
        room.extras.forEach((ex) => {
          if (!ex) return;
          const label = ex.name || ex.extra_name || ex.title || '';
          const qty =
            ex.quantity || ex.qty || ex.count || ex.num || 1;
          if (!label) return;
          collected.push(qty > 1 ? `${label} x${qty}` : label);
        });
      });
      const uniqueItems = Array.from(new Set(collected));
      packageItems = uniqueItems;
    }

    // 3) Final fallback: split a description string into bullet items
    if (
      packageItems.length === 0 &&
      typeof booking.packageIncludes === 'string' &&
      booking.packageIncludes.trim() !== ''
    ) {
      const splitItems = booking.packageIncludes
        .split(/[\n,•]/)
        .map((s) => s.trim())
        .filter(Boolean);
      if (splitItems.length > 0) {
        packageItems = splitItems;
      }
    }

    if (packageItems.length > 0) {
      packageDetailsHtml = `
        <div style="margin-top: 16px;">
          <h3 style="margin: 0 0 12px 0; font-size: 11px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.08em;">
            Package Includes
          </h3>
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            ${booking.packageExtras && booking.packageExtras.length > 0
              ? booking.packageExtras.map((ex) => {
                  const qty = ex.quantity || ex.qty || 1;
                  const name = ex.name || ex.extra_name || '';
                  return `
                    <tr class="package-item-row">
                      <td style="padding: 6px 0; font-size: 14px; color: #0f172a;">
                        ${qty > 1 ? `<strong>${qty}×</strong> ` : ''}${name}
                      </td>
                      <td style="padding: 6px 0; text-align: right; font-size: 13px; color: #10b981; font-weight: 500;">
                        ✓ Included
                      </td>
                    </tr>
                  `;
                }).join('')
              : packageItems.map((item) => `
                  <tr class="package-item-row">
                    <td style="padding: 6px 0; font-size: 14px; color: #0f172a;">
                      ${item}
                    </td>
                    <td style="padding: 6px 0; text-align: right; font-size: 13px; color: #10b981; font-weight: 500;">
                      ✓ Included
                      
                    </td>
                  </tr>
                `).join('')
            }
          </table>
        </div>
      `;
    }
  }

  let html; 

  // Package booking - simplified format
  if (hasPackage) {
    html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      @media only screen and (max-width: 600px) {
        .package-item-row td {
          display: block !important;
          width: 100% !important;
          text-align: left !important;
          padding: 4px 0 !important;
        }
        .package-item-row td:last-child {
          padding-bottom: 12px !important;
        }
        h1 {
          font-size: 24px !important;
        }
      }
    </style>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f3f4f6;">
      <tr>
        <td align="center" style="padding: 40px 20px;">
          <table role="presentation" style="max-width: 600px; width: 100%; margin: 0 auto; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
            
            <!-- Header with Logo -->
            <tr>
              <td style="padding: 32px 32px 24px 32px; text-align: center; background: linear-gradient(135deg, #1e293b 0%, #334155 100%);">
                <img src="https://pqtedphijayclewljlkq.supabase.co/storage/v1/object/public/cabin-images/logo.png" alt="Sojourn Cabins" style="width: 180px; height: auto; display: inline-block;" />
              </td>
            </tr>

            <!-- Title -->
            <tr>
              <td style="padding: 32px 32px 16px 32px;">
                <h1 style="margin: 0 0 8px 0; font-size: 28px; font-weight: 700; color: #111827;">Booking confirmed! 🎉</h1>
                <p style="margin: 0; font-size: 16px; color: #6b7280;">Thank you! Your reservation is confirmed.</p>
              </td>
            </tr>

            <!-- Booking Details Card -->
            <tr>
              <td style="padding: 0 32px 32px 32px;">
                <div style="background: #f9fafb; border-radius: 12px; padding: 24px; border: 1px solid #e5e7eb;">
                  <table role="presentation" style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 10px 0; font-size: 14px; color: #6b7280;">Confirmation code</td>
                      <td style="padding: 10px 0; font-size: 14px; color: #111827; font-weight: 600; text-align: right;">${booking.group_reservation_code || booking.confirmation_code || "—"}</td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 0; font-size: 14px; color: #6b7280;">Guest</td>
                      <td style="padding: 10px 0; font-size: 14px; color: #111827; font-weight: 500; text-align: right;">${guestName || "—"}</td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 0; font-size: 14px; color: #6b7280;">Dates</td>
                      <td style="padding: 10px 0; font-size: 14px; color: #111827; font-weight: 500; text-align: right;">${datesText || "—"}</td>
                    </tr>

                    <tr>
                      <td style="padding: 10px 0; font-size: 14px; color: #6b7280;">Check-in</td>
                      <td style="padding: 10px 0; font-size: 14px; color: #111827; font-weight: 500; text-align: right;">
                        ${CHECK_IN_TIME}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 0; font-size: 14px; color: #6b7280;">Check-out</td>
                      <td style="padding: 10px 0; font-size: 14px; color: #111827; font-weight: 500; text-align: right;">
                        ${CHECK_OUT_TIME}
                      </td>
                    </tr>

                    <tr>
                      <td style="padding: 10px 0; font-size: 14px; color: #6b7280;">Room</td>
                      <td style="padding: 10px 0; font-size: 14px; color: #111827; font-weight: 500; text-align: right;">${roomsList}</td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 0; font-size: 14px; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Package</td>
                      <td style="padding: 10px 0; font-size: 14px; color: #111827; font-weight: 500; text-align: right; border-bottom: 1px solid #e5e7eb;">${booking.package_name || "—"}</td>
                    </tr>
                  </table>

                  ${packageDetailsHtml}

                  <!-- Total Paid -->
                  <table role="presentation" style="width: 100%; margin-top: 20px;">
                    <tr>
                      <td style="padding: 10px 0; font-size: 15px; color: #111827; font-weight: 600;">Total paid</td>
                      <td style="padding: 10px 0; font-size: 18px; color: #111827; font-weight: 700; text-align: right;">${formatMoney(totalPaid, currency)}</td>
                    </tr>
                  </table>
                </div>
              </td>
            </tr>

            <!-- Cabin Images (same as booking widget email) -->
            <tr>
              <td style="padding: 0 32px 32px 32px;">
                ${cabinImagesHtml}
              </td>
            </tr>

            <!-- Confirmation Message -->
            <tr>
              <td style="padding: 0 32px 32px 32px; text-align: center;">
                <p style="margin: 0; font-size: 15px; color: #374151; line-height: 1.6;">
                  We look forward to hosting you!
                </p>
              </td>
            </tr>

            <!-- Explore Section -->
            <tr>
              <td style="padding: 0 32px 32px 32px;">
                <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); border-radius: 12px; padding: 24px; text-align: center;">
                  <p style="margin: 0 0 16px 0; font-size: 16px; color: #ffffff; font-weight: 600;">
                    Explore Our Cabins & Experiences
                  </p>
                  <a href="https://www.sojourngh.com" style="display: inline-block; background: #ffffff; color: #f97316; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600; font-size: 14px; letter-spacing: 0.5px;">
                    VISIT WEBSITE
                  </a>
                </div>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding: 32px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
                <table role="presentation" style="width: 100%;">
                  <tr>
                    <td style="text-align: center; padding-bottom: 16px;">
                      <p style="margin: 0 0 4px 0; font-size: 16px; font-weight: 600; color: #111827;">Sojourn Cabins</p>
                      <p style="margin: 0; font-size: 14px; color: #6b7280;">Anomabo, Ghana</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="text-align: center; padding-bottom: 16px;">
                      <p style="margin: 0 0 4px 0; font-size: 14px; color: #6b7280;">📧 theteam@sojourngh.com</p>
                      <p style="margin: 0 0 4px 0; font-size: 14px; color: #6b7280;">📱 +233 54 748 4568</p>
                      <p style="margin: 0; font-size: 14px; color: #6b7280;">🌐 <a href="https://www.sojourngh.com" style="color: #f97316; text-decoration: none;">www.sojourngh.com</a></p>
                    </td>
                  </tr>
                  <tr>
                    <td style="text-align: center; padding-top: 16px; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0; font-size: 12px; color: #9ca3af;">© 2024 Sojourn Cabins. All rights reserved.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
  } else {
    // Regular booking - detailed format with breakdown
    html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f3f4f6;">
      <tr>
        <td align="center" style="padding: 40px 20px;">
          <table role="presentation" style="max-width: 600px; width: 100%; margin: 0 auto; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
            
            <!-- Header with Logo -->
            <tr>
              <td style="padding: 32px 32px 24px 32px; text-align: center; background: linear-gradient(135deg, #1e293b 0%, #334155 100%);">
                <img src="https://pqtedphijayclewljlkq.supabase.co/storage/v1/object/public/cabin-images/logo.png" alt="Sojourn Cabins" style="width: 180px; height: auto; display: inline-block;" />
              </td>
            </tr>

            <!-- Celebration Icon & Title -->
            <tr>
              <td style="padding: 32px 32px 0 32px; text-align: center;">
                <div style="font-size: 48px; margin-bottom: 16px;">🎉</div>
                <h1 style="margin: 0 0 8px 0; font-size: 28px; font-weight: 700; color: #111827; letter-spacing: -0.5px;">Booking confirmed!</h1>
                <p style="margin: 0; font-size: 16px; color: #6b7280;">Hi ${guestName}, your stay has been confirmed.</p>
              </td>
            </tr>

            <!-- Booking Details Card -->
            <tr>
              <td style="padding: 32px;">
                <h3 style="margin: 0 0 16px 0; font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase; color: #6b7280; font-weight: 600;">Booking Details</h3>
                <div style="background: #f9fafb; border-radius: 12px; padding: 20px; border: 1px solid #e5e7eb; margin-bottom: 24px;">
                  <table role="presentation" style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 6px 0; font-size: 14px; color: #6b7280;">Confirmation code:</td>
                      <td style="padding: 6px 0; font-size: 14px; color: #111827; font-weight: 500; text-align: right;">${booking.group_reservation_code || booking.confirmation_code || "—"}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; font-size: 14px; color: #6b7280;">Guest:</td>
                      <td style="padding: 6px 0; font-size: 14px; color: #111827; font-weight: 500; text-align: right;">${guestName || "—"}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; font-size: 14px; color: #6b7280;">Dates:</td>
                      <td style="padding: 6px 0; font-size: 14px; color: #111827; font-weight: 500; text-align: right;">${datesText || "—"}</td>
                    </tr>

                    <tr>
                      <td style="padding: 10px 0; font-size: 14px; color: #6b7280;">Check-in</td>
                      <td style="padding: 10px 0; font-size: 14px; color: #111827; font-weight: 500; text-align: right;">
                        ${CHECK_IN_TIME}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 0; font-size: 14px; color: #6b7280;">Check-out</td>
                      <td style="padding: 10px 0; font-size: 14px; color: #111827; font-weight: 500; text-align: right;">
                        ${CHECK_OUT_TIME}
                      </td>
                    </tr>

                    <tr>
                      <td style="padding: 6px 0; font-size: 14px; color: #6b7280;">Room(s):</td>
                      <td style="padding: 6px 0; font-size: 14px; color: #111827; font-weight: 500; text-align: right;">${roomLinesHtml}</td>
                    </tr>
                  </table>
                </div>

                ${extrasDetailsHtml ? `
                <h3 style="margin: 0 0 12px 0; font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase; color: #6b7280; font-weight: 600;">Experiences</h3>
                <div style="background: #f9fafb; border-radius: 12px; padding: 20px; border: 1px solid #e5e7eb; margin-bottom: 24px;">
                  ${extrasDetailsHtml}
                </div>
                ` : ''}

                <h3 style="margin: 0 0 12px 0; font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase; color: #6b7280; font-weight: 600;">Payment Summary</h3>
                <div style="background: #f9fafb; border-radius: 12px; padding: 20px; border: 1px solid #e5e7eb;">
                  <table role="presentation" style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 6px 0; font-size: 14px; color: #6b7280;">Room subtotal:</td>
                      <td style="padding: 6px 0; font-size: 14px; color: #111827; text-align: right;">${formatMoney(roomSubtotal, currency)}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; font-size: 14px; color: #6b7280;">Experiences subtotal:</td>
                      <td style="padding: 6px 0; font-size: 14px; color: #111827; text-align: right;">${formatMoney(extrasSubtotal, currency)}</td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 0; font-size: 14px; color: #166534; background: #ecfdf3;">Discount:</td>
                      <td style="padding: 10px 0; font-size: 14px; color: #166534; background: #ecfdf3; text-align: right;">${discountText}</td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 0 0 0; font-size: 16px; color: #111827; font-weight: 700; border-top: 2px solid #e5e7eb;">Total paid:</td>
                      <td style="padding: 12px 0 0 0; font-size: 18px; color: #111827; font-weight: 700; text-align: right; border-top: 2px solid #e5e7eb;">${formatMoney(totalPaid, currency)}</td>
                    </tr>
                  </table>
                </div>
              </td>
            </tr>

            <!-- Cabin Images -->
            <tr>
              <td style="padding: 0 32px 32px 32px;">
                ${cabinImagesHtml}
              </td>
            </tr>

            <!-- Confirmation Message -->
            <tr>
              <td style="padding: 0 32px 32px 32px; text-align: center;">
                <p style="margin: 0; font-size: 15px; color: #374151; line-height: 1.6;">We look forward to hosting you!</p>
              </td>
            </tr>

            <!-- Explore Section -->
            <tr>
              <td style="padding: 0 32px 32px 32px;">
                <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); border-radius: 12px; padding: 24px; text-align: center;">
                  <p style="margin: 0 0 16px 0; font-size: 16px; color: #ffffff; font-weight: 600;">Explore Our Cabins & Experiences</p>
                  <a href="https://www.sojourngh.com" style="display: inline-block; background: #ffffff; color: #f97316; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600; font-size: 14px; letter-spacing: 0.5px;">VISIT WEBSITE</a>
                </div>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding: 32px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
                <table role="presentation" style="width: 100%;">
                  <tr>
                    <td style="text-align: center; padding-bottom: 16px;">
                      <p style="margin: 0 0 4px 0; font-size: 16px; font-weight: 600; color: #111827;">Sojourn Cabins</p>
                      <p style="margin: 0; font-size: 14px; color: #6b7280;">Anomabo, Ghana</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="text-align: center; padding-bottom: 16px;">
                      <p style="margin: 0 0 4px 0; font-size: 14px; color: #6b7280;">📧 theteam@sojourngh.com</p>
                      <p style="margin: 0 0 4px 0; font-size: 14px; color: #6b7280;">📱 +233 54 748 4568</p>
                      <p style="margin: 0; font-size: 14px; color: #6b7280;">🌐 <a href="https://www.sojourngh.com" style="color: #f97316; text-decoration: none;">www.sojourngh.com</a></p>
                    </td>
                  </tr>
                  <tr>
                    <td style="text-align: center; padding-top: 16px; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0; font-size: 12px; color: #9ca3af;">© 2024 Sojourn Cabins. All rights reserved.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
  }


  // ✅ Fetch the guest book PDF before sending
  const pdfBase64 = await getGuestBookPdfBase64();

  const authHeader =
    "Basic " +
    Buffer.from(`${MAILJET_API_KEY}:${MAILJET_SECRET_KEY}`).toString("base64");

  const res = await fetch("https://api.mailjet.com/v3.1/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader,
    },
    body: JSON.stringify({
      Messages: [
        {
          From: {
            Email: MAILJET_FROM_EMAIL,
            Name: MAILJET_FROM_NAME,
          },
          To: [
            {
              Email: to,
              Name: guestName || name || "",
            },
          ],
          Subject: "Booking Confirmed ✅",
          HTMLPart: html,
          // ✅ Attach guest book PDF to every confirmation email
          Attachments: [
            {
              ContentType: "application/pdf",
              Filename: "Sojourn_Cabins_Guest_Book.pdf",
              Base64Content: pdfBase64,
            },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Mailjet error:", res.status, text);
    throw new Error(`Mailjet error ${res.status}`);
  }

  return res.json();
}

// Add this new function to mailjet.js (place it after sendBookingEmail)

export async function sendExtraSelectionsEmail({ to, name, booking, extrasLink }) {
  const guestName =
    `${booking.guest_first_name || ""} ${booking.guest_last_name || ""}`
      .trim() || name || "";

  const datesText =
    booking.check_in && booking.check_out
      ? `${formatDatePretty(booking.check_in)} → ${formatDatePretty(booking.check_out)}`
      : "";

  // Get extras that need configuration
  const configurableExtras = [];
  if (Array.isArray(booking.rooms)) {
    booking.rooms.forEach(room => {
      if (Array.isArray(room.extras)) {
        room.extras.forEach(extra => {
          if (extra.needs_selection) {
            configurableExtras.push(extra.name || extra.extra_name);
          }
        });
      }
    });
  }

  const extrasListHtml = configurableExtras.length > 0
    ? configurableExtras.map(name => `
        <div style="padding: 8px 12px; background: #fef3c7; border-left: 3px solid #f59e0b; margin-bottom: 8px; border-radius: 4px;">
          <span style="font-weight: 600; color: #92400e;">${name}</span>
        </div>
      `).join('')
    : '<p style="color: #6b7280;">No experiences requiring details</p>';

  const htmlContent = `
  <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
      <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f3f4f6;">
        <tr>
          <td align="center" style="padding: 40px 20px;">
            <table role="presentation" style="max-width: 600px; width: 100%; margin: 0 auto; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
              
              
              <!-- Header with Logo -->
              <tr>
                <td style="padding: 32px 32px 24px 32px; text-align: center; background: linear-gradient(135deg, #1e293b 0%, #334155 100%);">
                  <img src="https://pqtedphijayclewljlkq.supabase.co/storage/v1/object/public/cabin-images/logo.png" alt="Sojourn Cabins" style="width: 180px; height: auto; display: inline-block;" />
                </td>
              </tr>

              <!-- Title -->
              <tr>
                <td style="padding: 32px 32px 16px 32px; text-align: center;">
                  <h1 style="margin: 0 0 8px 0; font-size: 28px; font-weight: 700; color: #111827; letter-spacing: -0.5px;">Complete Your Experience Details</h1>
                  <p style="margin: 0; font-size: 14px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em;">Confirmation: ${booking.confirmation_code || booking.group_reservation_code || ''}</p>
                </td>
              </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #0f172a;">
                Hello <strong>${guestName}</strong>,
              </p>

              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #0f172a;">
                Thank you for booking with Sojourn Cabins! Your reservation is confirmed for <strong>${datesText}</strong>.
              </p>

              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #0f172a;">
                To help us craft the perfect experience for you, please share your preferences and details for your curated experiences:
              </p>

              <!-- Extras List -->
              <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                <h3 style="margin: 0 0 12px 0; font-size: 11px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.08em;">
                  Your Curated Experiences
                </h3>
                ${extrasListHtml}
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="${extrasLink}" style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);">
                  Share Your Preferences
                </a>
              </div>

              <p style="margin: 24px 0 0 0; font-size: 14px; line-height: 1.6; color: #64748b;">
                Sharing your preferences helps us tailor each moment of your stay to your tastes, ensuring every experience is crafted with care and attention to detail.
              </p>

              <p style="margin: 16px 0 0 0; font-size: 14px; line-height: 1.6; color: #64748b;">
                If you have any questions, we're here to help make your experience extraordinary.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #f8fafc; padding: 24px 32px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #0f172a; font-weight: 600;">
                Sojourn Cabins
              </p>
              <p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.5;">
                Anomabo, Central Region, Ghana<br>
                <a href="mailto:reservations@sojourncabins.com" style="color: #f97316; text-decoration: none;">reservations@sojourncabins.com</a><br>
                <a href="https://www.sojourncabins.com" style="color: #f97316; text-decoration: none;">www.sojourncabins.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const textContent = `
Complete Your Experience Details - Sojourn Cabins

Hello ${guestName},

Thank you for booking with Sojourn Cabins! Your reservation is confirmed for ${datesText}.

To help us craft the perfect experience for you, please share your preferences and details for your curated experiences using this link:
${extrasLink}

Your curated experiences:
${configurableExtras.map(name => `• ${name}`).join('\n')}

Sharing your preferences helps us tailor each moment of your stay to your tastes, ensuring every experience is crafted with care and attention to detail.

If you have any questions, we're here to help make your experience extraordinary.

Best regards,
Sojourn Cabins
Anomabo, Central Region, Ghana
reservations@sojourncabins.com
www.sojourncabins.com
  `;

  // ✅ Fetch the guest book PDF before sending
  const pdfBase64 = await getGuestBookPdfBase64();

  const authHeader = `Basic ${Buffer.from(
    `${MAILJET_API_KEY}:${MAILJET_SECRET_KEY}`
  ).toString("base64")}`;

  const payload = {
    Messages: [
      {
        From: {
          Email: MAILJET_FROM_EMAIL,
          Name: MAILJET_FROM_NAME,
        },
        To: [
          {
            Email: to,
            Name: guestName,
          },
        ],
        Subject: `Complete Your Experience Details - ${booking.confirmation_code || booking.group_reservation_code || 'Booking'}`,
        TextPart: textContent,
        HTMLPart: htmlContent,
      },
    ],
  };

  const response = await fetch("https://api.mailjet.com/v3.1/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("Mailjet error:", errText);
    throw new Error(`Mailjet send failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}


//Mailjet helper to generate package details HTML