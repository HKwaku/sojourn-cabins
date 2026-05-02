import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
// @ts-expect-error mailjet.js is plain JS at the project root
import { sendAbandonedBookingEmail } from '../../../../mailjet';
import { signUnsubscribeToken } from '../_lib/unsubscribe-token';

export const maxDuration = 60;

const ATTEMPT_MIN_AGE_HOURS: Record<number, number> = {
  1: 1,    // ~1 hour
  2: 24,   // 1 day
  3: 48,   // 2 days
  4: 72,   // 3 days
  5: 240,  // 10 days
  6: 408,  // 17 days
  7: 576,  // 24 days
  8: 744,  // 31 days
};

const ATTEMPTS = [1, 2, 3, 4, 5, 6, 7, 8] as const;
type Attempt = (typeof ATTEMPTS)[number];

const CANDIDATES_PER_ATTEMPT = 200;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

type ReservationRow = {
  id: string;
  payment_reference: string | null;
  guest_email: string | null;
  guest_first_name: string | null;
  guest_last_name: string | null;
  group_reservation_code: string | null;
  created_at: string;
  check_in: string | null;
  check_out: string | null;
  currency: string | null;
  total: number | null;
  room_name: string | null;
  room_subtotal: number | null;
  extras_total: number | null;
};

type AttemptResult = { sent: number; failed: number; skipped: number };

function isAuthorized(request: NextRequest): boolean {
  if (process.env.NODE_ENV !== 'production') return true;
  if (request.headers.get('x-vercel-cron')) return true;
  const cronSecret = process.env.CRON_SECRET;
  const auth = request.headers.get('authorization');
  return Boolean(cronSecret && auth === `Bearer ${cronSecret}`);
}

function baseUrl(request: NextRequest): string {
  const fromEnv = process.env.NEXT_PUBLIC_BASE_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, '');
  // Fall back to the request origin so dev works without env config.
  return new URL(request.url).origin;
}

async function fetchCandidates(attempt: Attempt): Promise<ReservationRow[]> {
  const cutoff = new Date(
    Date.now() - ATTEMPT_MIN_AGE_HOURS[attempt] * 60 * 60 * 1000
  ).toISOString();
  const today = new Date().toISOString();

  const { data, error } = await supabase
    .from('reservations')
    .select(
      'id, payment_reference, guest_email, guest_first_name, guest_last_name, group_reservation_code, created_at, check_in, check_out, currency, total, room_name, room_subtotal, extras_total'
    )
    .eq('status', 'pending_payment')
    .eq('do_not_remind', false)
    .not('payment_reference', 'is', null)
    .not('guest_email', 'is', null)
    .lte('created_at', cutoff)
    .gt('check_in', today)
    .order('created_at', { ascending: true })
    .limit(CANDIDATES_PER_ATTEMPT);

  if (error) {
    console.error(`[reminders] fetch attempt=${attempt} error:`, error);
    return [];
  }
  return (data || []) as ReservationRow[];
}

// Collapse multi-room (group) bookings to one row per payment_reference.
// Picks the earliest-created reservation as the primary recipient.
function dedupeByPaymentRef(rows: ReservationRow[]): ReservationRow[] {
  const seen = new Set<string>();
  const out: ReservationRow[] = [];
  for (const r of rows) {
    const ref = r.payment_reference;
    if (!ref) continue;
    if (seen.has(ref)) continue;
    seen.add(ref);
    out.push(r);
  }
  return out;
}

async function alreadyAttempted(
  reservationId: string,
  attempt: Attempt
): Promise<boolean> {
  const { data, error } = await supabase
    .from('reservation_reminders')
    .select('id')
    .eq('reservation_id', reservationId)
    .eq('attempt', attempt)
    .limit(1);
  if (error) {
    console.error('[reminders] check existing error:', error);
    return true; // fail-safe: skip rather than risk a duplicate send
  }
  return (data?.length || 0) > 0;
}

async function loadGroupRooms(
  paymentReference: string
): Promise<ReservationRow[]> {
  const { data, error } = await supabase
    .from('reservations')
    .select(
      'id, payment_reference, guest_email, guest_first_name, guest_last_name, group_reservation_code, created_at, check_in, check_out, currency, total, room_name, room_subtotal, extras_total'
    )
    .eq('payment_reference', paymentReference);
  if (error) {
    console.error('[reminders] group rooms fetch error:', error);
    return [];
  }
  return (data || []) as ReservationRow[];
}

async function processOne(
  row: ReservationRow,
  attempt: Attempt,
  request: NextRequest
): Promise<'sent' | 'failed' | 'skipped'> {
  if (!row.payment_reference || !row.guest_email) return 'skipped';

  // Insert the sentinel first; the unique (reservation_id, attempt) constraint
  // serializes overlapping cron runs.
  const { data: sentinel, error: insertError } = await supabase
    .from('reservation_reminders')
    .insert({
      reservation_id: row.id,
      payment_reference: row.payment_reference,
      attempt,
      guest_email: row.guest_email,
      status: 'sending',
    })
    .select('id')
    .single();

  if (insertError) {
    // Most common cause: another run already inserted this (reservation_id, attempt)
    // pair. That's fine — treat as skipped.
    if (insertError.code === '23505') return 'skipped';
    console.error('[reminders] sentinel insert error:', insertError);
    return 'failed';
  }

  const sentinelId = sentinel?.id;

  try {
    const groupRooms = row.group_reservation_code
      ? await loadGroupRooms(row.payment_reference)
      : [row];

    const rooms = groupRooms.map((r) => ({
      room_name: r.room_name,
      room_subtotal: r.room_subtotal,
      extras_total: r.extras_total,
      total: r.total,
      currency: r.currency,
    }));

    const groupTotal = groupRooms.reduce(
      (s, r) => s + (r.total ? Number(r.total) : 0),
      0
    );

    const origin = baseUrl(request);
    const resumeUrl = `${origin}/book-escape/resume/${encodeURIComponent(row.payment_reference)}`;
    const unsubscribeUrl = `${origin}/api/reservations/unsubscribe-reminders?token=${encodeURIComponent(
      signUnsubscribeToken(row.guest_email)
    )}`;

    const result = await sendAbandonedBookingEmail({
      to: row.guest_email,
      name: row.guest_first_name || '',
      booking: {
        guest_first_name: row.guest_first_name,
        guest_last_name: row.guest_last_name,
        check_in: row.check_in,
        check_out: row.check_out,
        currency: row.currency,
        rooms,
        group_total: groupTotal || row.total,
        total: row.total,
      },
      attempt,
      resumeUrl,
      unsubscribeUrl,
    });

    await supabase
      .from('reservation_reminders')
      .update({
        status: 'sent',
        mailjet_message_id: result?.messageId ? String(result.messageId) : null,
      })
      .eq('id', sentinelId);

    return 'sent';
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(
      `[reminders] send failed reservation=${row.id} attempt=${attempt}:`,
      message
    );
    await supabase
      .from('reservation_reminders')
      .update({ status: 'failed', error: message.slice(0, 500) })
      .eq('id', sentinelId);
    return 'failed';
  }
}

async function runAttempt(
  attempt: Attempt,
  dryRun: boolean,
  request: NextRequest
): Promise<AttemptResult & { candidates: number }> {
  const raw = await fetchCandidates(attempt);
  const candidates = dedupeByPaymentRef(raw);

  if (dryRun) {
    return { sent: 0, failed: 0, skipped: 0, candidates: candidates.length };
  }

  const result: AttemptResult = { sent: 0, failed: 0, skipped: 0 };
  for (const row of candidates) {
    const status = await processOne(row, attempt, request);
    result[status]++;
  }
  return { ...result, candidates: candidates.length };
}

async function runForReservation(
  reservationId: string,
  attempt: Attempt,
  force: boolean,
  request: NextRequest
): Promise<AttemptResult & { candidates: number }> {
  const { data, error } = await supabase
    .from('reservations')
    .select(
      'id, payment_reference, guest_email, guest_first_name, guest_last_name, group_reservation_code, created_at, check_in, check_out, currency, total, room_name, room_subtotal, extras_total, status, do_not_remind'
    )
    .eq('id', reservationId)
    .single();

  if (error || !data) {
    return { sent: 0, failed: 0, skipped: 0, candidates: 0 };
  }
  if (data.status !== 'pending_payment') {
    return { sent: 0, failed: 0, skipped: 1, candidates: 1 };
  }
  if (data.do_not_remind && !force) {
    return { sent: 0, failed: 0, skipped: 1, candidates: 1 };
  }
  if (!force && (await alreadyAttempted(reservationId, attempt))) {
    return { sent: 0, failed: 0, skipped: 1, candidates: 1 };
  }

  const status = await processOne(data as ReservationRow, attempt, request);
  return {
    sent: status === 'sent' ? 1 : 0,
    failed: status === 'failed' ? 1 : 0,
    skipped: status === 'skipped' ? 1 : 0,
    candidates: 1,
  };
}

async function handle(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (process.env.REMINDERS_ENABLED !== 'true') {
    return NextResponse.json({
      success: true,
      skipped: true,
      reason: 'REMINDERS_ENABLED is not "true"',
    });
  }

  const url = new URL(request.url);
  const dryRun = url.searchParams.get('dry') === 'true';
  const reservationId = url.searchParams.get('reservation_id');
  const force = url.searchParams.get('force') === 'true';
  const attemptParam = url.searchParams.get('attempt');
  const onlyAttempt = attemptParam ? Number(attemptParam) : null;

  const attempts: Attempt[] =
    onlyAttempt && ATTEMPTS.includes(onlyAttempt as Attempt)
      ? [onlyAttempt as Attempt]
      : [...ATTEMPTS];

  const summary: Record<string, AttemptResult & { candidates: number }> = {};

  if (reservationId) {
    const a = (onlyAttempt as Attempt) || 1;
    summary[`attempt${a}`] = await runForReservation(
      reservationId,
      a,
      force,
      request
    );
  } else {
    for (const a of attempts) {
      summary[`attempt${a}`] = await runAttempt(a, dryRun, request);
    }
  }

  return NextResponse.json({
    success: true,
    dryRun,
    summary,
  });
}

export async function GET(request: NextRequest) {
  return handle(request);
}

export async function POST(request: NextRequest) {
  return handle(request);
}
