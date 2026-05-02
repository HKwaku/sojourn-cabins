import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import ResumeCheckout from './ResumeCheckout';

export const dynamic = 'force-dynamic';

type Reservation = {
  id: string;
  payment_reference: string;
  status: string;
  check_in: string | null;
  check_out: string | null;
  currency: string | null;
  total: number | null;
  room_name: string | null;
  room_subtotal: number | null;
  guest_first_name: string | null;
  guest_last_name: string | null;
  guest_email: string | null;
  group_reservation_code: string | null;
  confirmation_code: string | null;
  created_at: string;
};

function formatMoney(amount: number | null, currency: string | null) {
  if (amount == null) return '—';
  try {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: currency || 'GHS',
      minimumFractionDigits: 2,
    }).format(Number(amount));
  } catch {
    return `${currency || ''} ${amount}`.trim();
  }
}

function formatDate(iso: string | null) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

async function loadByReference(reference: string): Promise<Reservation[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );
  const { data, error } = await supabase
    .from('reservations')
    .select(
      'id, payment_reference, status, check_in, check_out, currency, total, room_name, room_subtotal, guest_first_name, guest_last_name, guest_email, group_reservation_code, confirmation_code, created_at'
    )
    .eq('payment_reference', reference)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('[resume] load error:', error);
    return [];
  }
  return (data || []) as Reservation[];
}

export default async function ResumePage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = await params;
  const reservations = await loadByReference(reference);

  if (!reservations.length) notFound();

  const primary = reservations[0];

  if (primary.status !== 'pending_payment') {
    return (
      <main className="min-h-screen bg-stone-50 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm p-8 text-center">
          <h1 className="text-2xl font-light text-stone-900 mb-3">
            This booking is no longer pending
          </h1>
          <p className="text-stone-600 leading-relaxed">
            {primary.status === 'confirmed'
              ? "Your reservation is already confirmed — check your inbox for the confirmation email."
              : "This reservation is no longer awaiting payment. If you think this is wrong, please reply to one of our emails."}
          </p>
        </div>
      </main>
    );
  }

  const checkInPast = primary.check_in
    ? new Date(primary.check_in).getTime() <= Date.now()
    : false;

  if (checkInPast) {
    return (
      <main className="min-h-screen bg-stone-50 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm p-8 text-center">
          <h1 className="text-2xl font-light text-stone-900 mb-3">
            These dates have passed
          </h1>
          <p className="text-stone-600 leading-relaxed">
            The check-in date for this reservation is in the past. Please start a fresh booking and we'll be glad to host you.
          </p>
          <a
            href="/book-escape"
            className="inline-block mt-6 px-6 py-3 rounded-xl bg-orange-500 text-white font-medium hover:bg-orange-600 transition"
          >
            Book new dates
          </a>
        </div>
      </main>
    );
  }

  const groupTotal = reservations.reduce(
    (s, r) => s + (r.total ? Number(r.total) : 0),
    0
  );
  const guestName = `${primary.guest_first_name || ''} ${primary.guest_last_name || ''}`.trim();

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-12">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="bg-gradient-to-br from-stone-900 to-stone-700 px-8 py-10 text-white">
          <p className="uppercase tracking-widest text-xs text-stone-300 mb-2">
            Sojourn Cabins
          </p>
          <h1 className="text-3xl font-light">Complete your booking</h1>
          <p className="mt-3 text-stone-300 leading-relaxed">
            Hi {guestName || 'there'} — your dates are still on hold. Pick up where you left off.
          </p>
        </div>

        <div className="px-8 py-8 space-y-6">
          <div className="rounded-xl border border-stone-200 p-5">
            <div className="flex justify-between text-sm py-2">
              <span className="text-stone-500">Dates</span>
              <span className="text-stone-900 font-medium">
                {formatDate(primary.check_in)} → {formatDate(primary.check_out)}
              </span>
            </div>
            <div className="border-t border-stone-100 mt-3 pt-3 space-y-2">
              <p className="text-[11px] uppercase tracking-widest text-stone-400 font-semibold">
                Cabin{reservations.length > 1 ? 's' : ''}
              </p>
              {reservations.map((r) => (
                <div key={r.id} className="flex justify-between text-sm">
                  <span className="text-stone-700">{r.room_name || 'Room'}</span>
                  <span className="text-stone-900 font-medium">
                    {formatMoney(r.room_subtotal, r.currency)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-stone-200 mt-4 pt-4 flex justify-between">
              <span className="text-stone-500 text-sm">Total</span>
              <span className="text-stone-900 font-bold text-lg">
                {formatMoney(groupTotal || primary.total, primary.currency)}
              </span>
            </div>
          </div>

          <ResumeCheckout reference={primary.payment_reference} />

          <p className="text-xs text-stone-500 text-center leading-relaxed">
            You'll be redirected to Paystack to complete payment securely.
          </p>
        </div>
      </div>
    </main>
  );
}
