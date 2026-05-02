import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyUnsubscribeToken } from '../_lib/unsubscribe-token';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

function htmlPage(title: string, body: string, status = 200) {
  const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>${title}</title><meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; margin: 0; padding: 48px 20px; color: #0f172a; }
  .card { max-width: 480px; margin: 0 auto; background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); text-align: center; }
  h1 { margin: 0 0 12px 0; font-size: 22px; font-weight: 600; }
  p { margin: 0 0 8px 0; font-size: 15px; line-height: 1.5; color: #475569; }
  a { color: #f97316; text-decoration: none; }
</style>
</head><body><div class="card"><h1>${title}</h1>${body}</div></body></html>`;
  return new NextResponse(html, {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

async function unsubscribe(token: string) {
  const email = verifyUnsubscribeToken(token);
  if (!email) {
    return htmlPage(
      'Invalid link',
      `<p>This unsubscribe link is invalid or expired. If you keep receiving emails, reply to one of them and we'll take care of it.</p>`,
      400
    );
  }

  const { error } = await supabase
    .from('reservations')
    .update({ do_not_remind: true })
    .ilike('guest_email', email);

  if (error) {
    console.error('Unsubscribe DB error:', error);
    return htmlPage(
      'Something went wrong',
      `<p>We couldn't update your preferences right now. Please reply to the email and we'll handle it manually.</p>`,
      500
    );
  }

  return htmlPage(
    "You're unsubscribed",
    `<p>We won't send any more booking reminders to <strong>${email}</strong>.</p><p>Your reservation itself is unchanged — if you'd still like to complete it, just reply to one of our emails.</p>`
  );
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token') || '';
  return unsubscribe(token);
}

// Mailjet's one-click List-Unsubscribe-Post sends a POST.
export async function POST(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token') || '';
  return unsubscribe(token);
}
