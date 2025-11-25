import Mailjet from "node-mailjet";

export const mailjet = Mailjet.apiConnect(
  process.env.MAILJET_API_KEY,
  process.env.MAILJET_SECRET_KEY
);

export async function sendBookingEmail({ to, name, booking }) {
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
              Name: name,
            },
          ],
          Subject: "Your Booking Confirmation",
          HTMLPart: `
            <h2>Booking Confirmed ✅</h2>
            <p>Hi ${name},</p>
            <p>Your stay has been confirmed.</p>

            <ul>
              <li><strong>Check-in:</strong> ${booking.checkIn}</li>
              <li><strong>Check-out:</strong> ${booking.checkOut}</li>
              <li><strong>Cabin:</strong> ${booking.cabin}</li>
              <li><strong>Total:</strong> ${booking.total}</li>
            </ul>

            <p>We look forward to hosting you!</p>
          `,
        },
      ],
    });

    return request.body;
  } catch (err) {
    console.error("Mailjet Error:", err);
    throw err;
  }
}
