// mailjet.js
// Plain fetch-based Mailjet client – no external "node-mailjet" dependency

const MAILJET_API_KEY = process.env.MAILJET_API_KEY;
const MAILJET_SECRET_KEY = process.env.MAILJET_SECRET_KEY;
const MAILJET_FROM_EMAIL = process.env.MAILJET_FROM_EMAIL;
const MAILJET_FROM_NAME = process.env.MAILJET_FROM_NAME || "Reservations";

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

export async function sendBookingEmail({ to, name, booking }) {
  const currency = booking.currency || "GHS";

  const guestName =
    `${booking.guest_first_name || ""} ${booking.guest_last_name || ""}`
      .trim() || name || "";

  const datesText =
    booking.check_in && booking.check_out
      ? `${booking.check_in} → ${booking.check_out}`
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
                <td style="padding:4px 12px 4px 0; color:#6b7280; width:160px;">${extraName}</td>
                <td style="padding:4px 0;">${formatMoney(extraTotal, currency)} ${extraQty > 1 ? `<span style="color:#6b7280;">${extraQty}×</span>` : ''}</td>
              </tr>
            `);
          });
        }
      });

      if (extrasRows.length > 0) {
        extrasDetailsHtml = `
          <h3 style="margin:24px 0 8px 0; font-size:13px; letter-spacing:0.08em; text-transform:uppercase; color:#6b7280;">
            Extras Included
          </h3>
          <table style="border-collapse:collapse; width:100%; margin-bottom:24px;">
            <tbody>
              ${extrasRows.join("")}
            </tbody>
          </table>
        `;
      }
    }
  }

  const html = `
  <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color:#111827; font-size:14px;">
    <h2 style="margin:0 0 12px 0; font-size:20px;">Booking Confirmed ✅</h2>
    <p style="margin:0 0 16px 0;">Hi ${guestName},</p>
    <p style="margin:0 0 24px 0;">Your stay has been confirmed. Here are your booking details:</p>

    <h3 style="margin:0 0 8px 0; font-size:13px; letter-spacing:0.08em; text-transform:uppercase; color:#6b7280;">
      Booking Details
    </h3>
    <table style="border-collapse:collapse; width:100%; margin-bottom:24px;">
      <tbody>
        <tr>
          <td style="padding:4px 12px 4px 0; color:#6b7280; width:160px;">Confirmation code:</td>
          <td style="padding:4px 0;">${booking.group_reservation_code || booking.confirmation_code || "—"}</td>
        </tr>
        <tr>
          <td style="padding:4px 12px 4px 0; color:#6b7280;">Guest:</td>
          <td style="padding:4px 0;">${guestName || "—"}</td>
        </tr>
        <tr>
          <td style="padding:4px 12px 4px 0; color:#6b7280;">Dates:</td>
          <td style="padding:4px 0;">${datesText || "—"}</td>
        </tr>
        <tr>
          <td style="padding:4px 12px 4px 0; color:#6b7280;">Room(s):</td>
          <td style="padding:4px 0;">${roomLinesHtml}</td>
        </tr>
      </tbody>
    </table>

    ${extrasDetailsHtml}

    <h3 style="margin:0 0 8px 0; font-size:13px; letter-spacing:0.08em; text-transform:uppercase; color:#6b7280;">
      Payment Summary
    </h3>
    <table style="border-collapse:collapse; width:100%; margin-bottom:24px;">
      <tbody>
        <tr>
          <td style="padding:4px 12px 4px 0; color:#6b7280; width:160px;">Room subtotal:</td>
          <td style="padding:4px 0;">${formatMoney(roomSubtotal, currency)}</td>
        </tr>
        <tr>
          <td style="padding:4px 12px 4px 0; color:#6b7280;">Extras subtotal:</td>
          <td style="padding:4px 0;">${formatMoney(extrasSubtotal, currency)}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px 8px 0; color:#166534; background:#ecfdf3;">Discount:</td>
          <td style="padding:8px 0; background:#ecfdf3;">${discountText}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px 4px 0; font-weight:600;">Total paid:</td>
          <td style="padding:8px 0; font-weight:600;">${formatMoney(totalPaid, currency)}</td>
        </tr>
      </tbody>
    </table>

    <p style="margin:0;">We look forward to hosting you.</p>
  </div>
  `;

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