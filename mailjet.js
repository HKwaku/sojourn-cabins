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

  const totalPaid =
    booking.group_total != null
      ? Number(booking.group_total)
      : booking.total != null
      ? Number(booking.total)
      : roomsArray.reduce((sum, r) => sum + (r.total ? Number(r.total) : 0), 0);

  // Map room names to image URLs
  const roomImageMap = {
    'SEA Cabin': 'https://res.cloudinary.com/dvsalazae/image/upload/v1738159935/SEA_Cabin_t6jkdv.jpg',
    'SAND Cabin': 'https://res.cloudinary.com/dvsalazae/image/upload/v1738159935/SAND_Cabin_klxwai.jpg',
    'SUN Cabin': 'https://res.cloudinary.com/dvsalazae/image/upload/v1738159935/SUN_Cabin_wiqc7f.jpg',
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
    const packageItems = [];
    
    // Add package extras if they exist
    if (Array.isArray(booking.rooms) && booking.rooms.length > 0) {
      booking.rooms.forEach((room) => {
        if (Array.isArray(room.extras) && room.extras.length > 0) {
          room.extras.forEach((extra) => {
            const extraName = extra.name || "—";
            if (!packageItems.includes(extraName)) {
              packageItems.push(extraName);
            }
          });
        }
      });
    }

    if (packageItems.length > 0) {
      packageDetailsHtml = `
        <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin: 24px 0;">
          <h3 style="margin: 0 0 12px 0; font-size: 15px; font-weight: 600; color: #111827;">Package includes</h3>
          <ul style="margin: 0; padding-left: 20px; color: #374151;">
            ${packageItems.map(item => `<li style="margin-bottom: 6px;">${item}</li>`).join('')}
          </ul>
        </div>
      `;
    }
  }

  const html = `
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
          <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
            
            <!-- Header with Logo -->
            <tr>
              <td style="padding: 32px 32px 24px 32px; text-align: center; background: linear-gradient(135deg, #1e293b 0%, #334155 100%);">
                <img src="https://res.cloudinary.com/dvsalazae/image/upload/v1738159935/logo_white_tg5ubv.png" alt="Sojourn Cabins" style="width: 180px; height: auto; display: inline-block;" />
              </td>
            </tr>

            <!-- Celebration Icon & Title -->
            <tr>
              <td style="padding: 32px 32px 0 32px; text-align: center;">
                <div style="font-size: 48px; margin-bottom: 16px;">🎉</div>
                <h1 style="margin: 0 0 8px 0; font-size: 28px; font-weight: 700; color: #111827; letter-spacing: -0.5px;">Booking confirmed!</h1>
                <p style="margin: 0; font-size: 16px; color: #6b7280;">Thank you! Your reservation is confirmed.</p>
              </td>
            </tr>

            <!-- Booking Details Card -->
            <tr>
              <td style="padding: 32px;">
                <div style="background: #f9fafb; border-radius: 12px; padding: 24px; border: 1px solid #e5e7eb;">
                  <table role="presentation" style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 8px 0; font-size: 14px; color: #6b7280; width: 45%;">Confirmation code</td>
                      <td style="padding: 8px 0; font-size: 14px; color: #111827; font-weight: 600; text-align: right;">${booking.group_reservation_code || booking.confirmation_code || "—"}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; font-size: 14px; color: #6b7280;">Guest</td>
                      <td style="padding: 8px 0; font-size: 14px; color: #111827; font-weight: 500; text-align: right;">${guestName || "—"}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; font-size: 14px; color: #6b7280;">Dates</td>
                      <td style="padding: 8px 0; font-size: 14px; color: #111827; font-weight: 500; text-align: right;">${datesText || "—"}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; font-size: 14px; color: #6b7280;">Room</td>
                      <td style="padding: 8px 0; font-size: 14px; color: #111827; font-weight: 500; text-align: right;">${roomsList}</td>
                    </tr>
                    ${hasPackage ? `
                    <tr>
                      <td style="padding: 8px 0; font-size: 14px; color: #6b7280;">Package</td>
                      <td style="padding: 8px 0; font-size: 14px; color: #111827; font-weight: 500; text-align: right;">${booking.package_code || booking.package_name || "—"}</td>
                    </tr>
                    ` : ''}
                  </table>

                  ${packageDetailsHtml}

                  <!-- Total Paid -->
                  <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #e5e7eb;">
                    <table role="presentation" style="width: 100%;">
                      <tr>
                        <td style="font-size: 15px; color: #111827; font-weight: 600;">Total paid</td>
                        <td style="font-size: 18px; color: #111827; font-weight: 700; text-align: right;">${formatMoney(totalPaid, currency)}</td>
                      </tr>
                    </table>
                  </div>
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
                <p style="margin: 0 0 8px 0; font-size: 15px; color: #374151; line-height: 1.6;">A confirmation email will be sent to you shortly.</p>
                <p style="margin: 0; font-size: 15px; color: #374151; line-height: 1.6;">We look forward to hosting you!</p>
              </td>
            </tr>

            <!-- Explore Section -->
            <tr>
              <td style="padding: 0 32px 32px 32px;">
                <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); border-radius: 12px; padding: 24px; text-align: center;">
                  <p style="margin: 0 0 16px 0; font-size: 16px; color: #ffffff; font-weight: 600;">Explore Our Cabins & Experiences</p>
                  <a href="https://www.sojourncabins.com" style="display: inline-block; background: #ffffff; color: #f97316; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600; font-size: 14px; letter-spacing: 0.5px;">VISIT WEBSITE</a>
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
                      <p style="margin: 0 0 4px 0; font-size: 14px; color: #6b7280;">📧 reservations@sojourncabins.com</p>
                      <p style="margin: 0 0 4px 0; font-size: 14px; color: #6b7280;">📱 +233 54 748 4568</p>
                      <p style="margin: 0; font-size: 14px; color: #6b7280;">🌐 <a href="https://www.sojourncabins.com" style="color: #f97316; text-decoration: none;">www.sojourncabins.com</a></p>
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