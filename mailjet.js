// mailjet.js – Mailjet send using plain HTTPS
// @ts-nocheck

const MAILJET_API_KEY = process.env.MAILJET_API_KEY;
const MAILJET_SECRET_KEY = process.env.MAILJET_SECRET_KEY;
const MAILJET_FROM_EMAIL = process.env.MAILJET_FROM_EMAIL;
const MAILJET_FROM_NAME = process.env.MAILJET_FROM_NAME || "Reservations";

if (!MAILJET_API_KEY || !MAILJET_SECRET_KEY) {
  console.warn("MAILJET_API_KEY or MAILJET_SECRET_KEY is not set");
}

export async function sendBookingEmail({ to, name, booking }) {
  const authHeader =
    "Basic " +
    Buffer.from(`${MAILJET_API_KEY}:${MAILJET_SECRET_KEY}`).toString("base64");

  // mirror the booking summary modal structure

  function formatMoney(amount, currency) {
    const curr = currency || "GHS";
    const num = Number(amount || 0);
    try {
      return new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: curr,
      }).format(num);
    } catch {
      return `${curr} ${num.toFixed(2)}`;
    }
  }

  const fullName =
    `${booking.guest_first_name || ""} ${booking.guest_last_name || ""}`.trim() ||
    name ||
    "";
  const dates =
    booking.check_in && booking.check_out
      ? `${booking.check_in} → ${booking.check_out}`
      : "—";

  const roomSubtotal =
    booking.room_subtotal != null
      ? formatMoney(booking.room_subtotal, booking.currency)
      : "—";

  const extrasSubtotal =
    booking.extras_total != null
      ? formatMoney(booking.extras_total, booking.currency)
      : "—";

  const discountText =
    booking.discount_amount && Number(booking.discount_amount) > 0
      ? `-${formatMoney(
          booking.discount_amount,
          booking.currency
        )}${booking.coupon_code ? ` (${booking.coupon_code})` : ""}`
      : "—";

  const totalPaid =
    booking.total != null
      ? formatMoney(booking.total, booking.currency)
      : "—";

  const body = {
    Messages: [
      {
        From: {
          Email: MAILJET_FROM_EMAIL,
          Name: MAILJET_FROM_NAME,
        },
        To: [
          {
            Email: to,
            Name: fullName || name || "",
          },
        ],
        Subject: "Your Booking Confirmation",
        HTMLPart: `
          <div style="font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:14px;line-height:1.6;color:#111827;">
            <h2 style="font-size:20px;margin:0 0 8px;">Booking Confirmed ✅</h2>
            <p style="margin:0 0 12px;">Hi ${fullName || ""},</p>
            <p style="margin:0 0 20px;">Your stay has been confirmed. Here are your booking details:</p>

            <!-- Booking details -->
            <div style="margin-bottom:20px;">
              <div style="font-size:12px;font-weight:600;text-transform:uppercase;color:#9ca3af;letter-spacing:.08em;margin-bottom:8px;">
                Booking details
              </div>
              <table style="border-collapse:collapse;width:100%;max-width:480px;">
                <tbody>
                  <tr>
                    <td style="padding:4px 8px 4px 0;text-align:right;color:#6b7280;width:140px;">Confirmation code:</td>
                    <td style="width:1px;border-left:1px solid #e5e7eb;"></td>
                    <td style="padding:4px 0 4px 8px;text-align:left;">
                      ${booking.confirmation_code || "—"}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:4px 8px 4px 0;text-align:right;color:#6b7280;">Guest:</td>
                    <td style="width:1px;border-left:1px solid #e5e7eb;"></td>
                    <td style="padding:4px 0 4px 8px;text-align:left;">
                      ${fullName || "—"}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:4px 8px 4px 0;text-align:right;color:#6b7280;">Dates:</td>
                    <td style="width:1px;border-left:1px solid #e5e7eb;"></td>
                    <td style="padding:4px 0 4px 8px;text-align:left;">
                      ${dates}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:4px 8px 4px 0;text-align:right;color:#6b7280;">Room:</td>
                    <td style="width:1px;border-left:1px solid #e5e7eb;"></td>
                    <td style="padding:4px 0 4px 8px;text-align:left;">
                      ${booking.room_name || "—"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Payment summary -->
            <div>
              <div style="font-size:12px;font-weight:600;text-transform:uppercase;color:#9ca3af;letter-spacing:.08em;margin-bottom:8px;">
                Payment summary
              </div>
              <table style="border-collapse:collapse;width:100%;max-width:480px;">
                <tbody>
                  <tr>
                    <td style="padding:4px 8px 4px 0;text-align:right;color:#6b7280;width:140px;">Room subtotal:</td>
                    <td style="width:1px;border-left:1px solid #e5e7eb;"></td>
                    <td style="padding:4px 0 4px 8px;text-align:left;">
                      ${roomSubtotal}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:4px 8px 4px 0;text-align:right;color:#6b7280;">Extras subtotal:</td>
                    <td style="width:1px;border-left:1px solid #e5e7eb;"></td>
                    <td style="padding:4px 0 4px 8px;text-align:left;">
                      ${extrasSubtotal}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:4px 8px 4px 0;text-align:right;color:#166534;background:#ecfdf5;">Discount:</td>
                    <td style="width:1px;border-left:1px solid #bbf7d0;background:#ecfdf5;"></td>
                    <td style="padding:4px 0 4px 8px;text-align:left;color:#166534;background:#ecfdf5;">
                      ${discountText}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:8px 8px 0 0;text-align:right;color:#111827;font-weight:600;border-top:2px solid #e5e7eb;">
                      Total paid:
                    </td>
                    <td style="width:1px;border-left:1px solid #e5e7eb;border-top:2px solid #e5e7eb;"></td>
                    <td style="padding:8px 0 0 8px;text-align:left;font-weight:600;border-top:2px solid #e5e7eb;">
                      ${totalPaid}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p style="margin-top:20px;">We look forward to hosting you.</p>
          </div>
        `,
      },
    ],
  };

  const res = await fetch("https://api.mailjet.com/v3.1/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Mailjet error:", res.status, text);
    throw new Error(`Mailjet error ${res.status}`);
  }

  return await res.json();
}
