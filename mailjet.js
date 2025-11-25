// mailjet.js – no SDK, plain HTTPS call
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
            Name: name,
          },
        ],
        Subject: "Your Booking Confirmation",
        HTMLPart: `
          <h2>Booking Confirmed ✅</h2>
          <p>Hi ${name || ""},</p>
          <p>Your stay has been confirmed.</p>

          <ul>
            <li><strong>Cabin:</strong> ${booking.cabin}</li>
            <li><strong>Check-in:</strong> ${booking.checkIn}</li>
            <li><strong>Check-out:</strong> ${booking.checkOut}</li>
            <li><strong>Total:</strong> ${booking.total}</li>
          </ul>

          <p>We look forward to hosting you!</p>
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

  return res.json();
}
