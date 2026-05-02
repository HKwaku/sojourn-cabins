import crypto from 'crypto';

function getSecret(): string {
  const secret = process.env.REMINDERS_UNSUBSCRIBE_SECRET;
  if (!secret) {
    throw new Error('REMINDERS_UNSUBSCRIBE_SECRET is not configured');
  }
  return secret;
}

function base64url(buf: Buffer | string): string {
  const b = Buffer.isBuffer(buf) ? buf : Buffer.from(buf);
  return b.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64url(s: string): Buffer {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4));
  return Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/') + pad, 'base64');
}

export function signUnsubscribeToken(email: string): string {
  const payload = base64url(email.toLowerCase().trim());
  const sig = base64url(
    crypto.createHmac('sha256', getSecret()).update(payload).digest()
  );
  return `${payload}.${sig}`;
}

export function verifyUnsubscribeToken(token: string): string | null {
  if (!token || typeof token !== 'string') return null;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;

  const expected = base64url(
    crypto.createHmac('sha256', getSecret()).update(payload).digest()
  );

  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return null;
  if (!crypto.timingSafeEqual(a, b)) return null;

  return fromBase64url(payload).toString('utf8');
}
