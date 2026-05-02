-- Abandoned-booking reminder support.
-- Creates the audit/idempotency table and adds two columns to reservations.

create table if not exists reservation_reminders (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references reservations(id) on delete cascade,
  payment_reference text not null,
  attempt smallint not null check (attempt between 1 and 8),
  guest_email text not null,
  status text not null check (status in ('sending', 'sent', 'failed')),
  mailjet_message_id text,
  error text,
  sent_at timestamptz not null default now(),
  unique (reservation_id, attempt)
);

create index if not exists reservation_reminders_payment_reference_idx
  on reservation_reminders (payment_reference);

create index if not exists reservation_reminders_sent_at_idx
  on reservation_reminders (sent_at desc);

alter table reservations
  add column if not exists do_not_remind boolean not null default false,
  add column if not exists previous_payment_references text[] not null default '{}';

-- Eligibility query hits status + created_at + check_in. Most rows are not pending_payment,
-- so a partial index keeps the index tiny.
create index if not exists reservations_pending_payment_created_at_idx
  on reservations (created_at)
  where status = 'pending_payment';
