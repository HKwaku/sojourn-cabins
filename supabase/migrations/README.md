# Sojourn Cabins migrations

Run order is by filename (timestamp prefix). Apply via the Supabase dashboard SQL editor or `supabase db push`.

## Required env vars introduced by these migrations

| Variable | Where used | Purpose |
| --- | --- | --- |
| `REMINDERS_ENABLED` | `app/api/reservations/send-abandonment-reminders/route.ts` | Set to `"true"` to actually send. Anything else makes the cron a no-op (useful for dry-running in production before flipping the switch). |
| `REMINDERS_UNSUBSCRIBE_SECRET` | `app/api/reservations/_lib/unsubscribe-token.ts` | HMAC secret for the one-click unsubscribe links in reminder emails. Use a 32+ char random string. Rotating it invalidates outstanding unsubscribe links — cheap to rotate, no migration needed. |
| `NEXT_PUBLIC_BASE_URL` | resume + reminder routes | Already used by the payment init route for `callback_url`. Reminder emails use it to build absolute resume + unsubscribe URLs. |
| `CRON_SECRET` | already present in `app/api/exchange-rates/update/route.ts` | Same value protects the new reminder cron route. |

## Operational notes

- The reminder cron (`/api/reservations/send-abandonment-reminders`) is hourly at :30. Manual triggers:
  - `?dry=true` — count candidates, send nothing.
  - `?attempt=N` — only run a single attempt bucket (1..8).
  - `?reservation_id=<uuid>&attempt=N&force=true` — re-send a specific reservation (used by the Bernard "manual resend" button).
- Idempotency is enforced by `reservation_reminders.unique (reservation_id, attempt)`. A failed Mailjet send leaves a row with `status='failed'` — re-running the cron does NOT retry it (intentional; failures are surfaced for ops review). To retry, delete the failed row or use `force=true`.
- Group bookings (multi-row, same `payment_reference`) get exactly one reminder, addressed to the earliest-created row.

## Known edge case: resumed-booking webhook orphan

When a guest clicks the resume link, `payment_reference` on the reservation is rotated to a fresh Paystack reference and the old one is appended to `previous_payment_references`. The Paystack webhook (`app/api/payments/webhook/route.ts`) matches inbound transactions by `eq('payment_reference', reference)` only — it does **not** check `previous_payment_references`.

If a guest pays via the *original* Paystack `authorization_url` (e.g. an old browser tab) after resuming, the webhook will not find the reservation and the row stays `pending_payment` even though Paystack received money. Likelihood is low: the original `authorization_url` is only ever returned to the booking widget in a JSON response and is not persisted, emailed, or otherwise surfaced.

**Manual reconciliation** when this happens:
```sql
update reservations
set payment_reference = '<paystack-reference-from-paystack-dashboard>',
    previous_payment_references = array_append(previous_payment_references, payment_reference)
where '<paystack-reference-from-paystack-dashboard>' = any(previous_payment_references);
```
Then trigger the webhook manually (re-send from Paystack dashboard) and confirmation email flow runs normally.

If orphans become frequent, the fix is a 6-line webhook fallback that also queries `previous_payment_references @> ARRAY[reference]`.
