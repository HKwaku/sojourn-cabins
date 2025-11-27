import Mailjet from "node-mailjet";

export const mailjet = Mailjet.apiConnect(
  process.env.MAILJET_API_KEY,
  process.env.MAILJET_SECRET_KEY
);

export async function sendBookingEmail({ to, name, booking }) {
  const currency = booking.currency || "GHS";

  function formatMoney(amount) {
    if (amount == null || isNaN(amount)) return "—";
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(amount));
  }

  const guestName =
    `${booking.guest_first_name || ""} ${booking.guest_last_name || ""}`
      .trim() || name || "";

  const datesText =
    booking.check_in && booking.check_out
      ? `${booking.check_in} → ${booking.check_out}`
      : "";

  // Use all rooms if provided; otherwise fall back to single room_name
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
        r.room_subtotal != null ? formatMoney(r.room_subtotal) : "—";
      return `${nm}: ${sub}`;
    })
    .join("<br>");

  // Aggregate totals across all rooms
  const roomSubtotal = roomsArray.reduce(
    (sum, r) => sum + (r.room_subtotal ? Number(r.room_subtotal) : 0),
    0
  );
  const extrasSubtotal = roomsArray.reduce(
    (sum, r) => sum + (r.extras_total ? Number(r.extras_total) : 0),
    0
  );
  const discountTotal = roomsArray.reduce(
    (sum, r) => sum + (r.discount_amount ? Number(r.discount_amount) : 0),
    0
  );
  const totalPaid =
    booking.group_total != null
      ? Number(booking.group_total)
      : booking.total != null
      ? Number(booking.total)
      : roomsArray.reduce(
          (sum, r) => sum + (r.total ? Number(r.total) : 0),
          0
        );

  const discountText = discountTotal
    ? `-${formatMoney(Math.abs(discountTotal))}${
        booking.coupon_code ? ` (${booking.coupon_code})` : ""
      }`
    : "—";

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
          <td style="padding:4px 0;">${booking.confirmation_code || "—"}</td>
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

    <h3 style="margin:0 0 8px 0; font-size:13px; letter-spacing:0.08em; text-transform:uppercase; color:#6b7280;">
      Payment Summary
    </h3>
    <table style="border-collapse:collapse; width:100%; margin-bottom:24px;">
      <tbody>
        <tr>
          <td style="padding:4px 12px 4px 0; color:#6b7280; width:160px;">Room subtotal:</td>
          <td style="padding:4px 0;">${formatMoney(
            booking.group_room_subtotal != null
              ? booking.group_room_subtotal
              : roomSubtotal
          )}</td>
        </tr>
        <tr>
          <td style="padding:4px 12px 4px 0; color:#6b7280;">Extras subtotal:</td>
          <td style="padding:4px 0;">${formatMoney(
            booking.group_extras_total != null
              ? booking.group_extras_total
              : extrasSubtotal
          )}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px 8px 0; color:#6b7280; background:#ecfdf3;">Discount:</td>
          <td style="padding:8px 0; background:#ecfdf3;">${discountText}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px 4px 0; font-weight:600;">Total paid:</td>
          <td style="padding:8px 0; font-weight:600;">${formatMoney(
            totalPaid
          )}</td>
        </tr>
      </tbody>
    </table>

    <p style="margin:0;">We look forward to hosting you.</p>
  </div>
  `;

  try {
    const request = await mailjet.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: process.env.MAILJET_FROM_EMAIL,
            Name: process.env.MAILJET_FROM_NAME || "Reservations",
          },
          To: [
            {
              Email: to,
              Name: guestName || name,
            },
          ],
          Subject: "Booking Confirmed ✅",
          HTMLPart: html,
        },
      ],
    });

    return request.body;
  } catch (err) {
    console.error("Mailjet Error:", err);
    throw err;
  }
}
