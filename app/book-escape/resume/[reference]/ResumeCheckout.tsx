'use client';

import { useState } from 'react';

export default function ResumeCheckout({ reference }: { reference: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleResume() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/payments/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference }),
      });
      const data = await res.json();
      if (!res.ok || !data?.authorization_url) {
        throw new Error(data?.error || 'Could not restart checkout');
      }
      window.location.href = data.authorization_url;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleResume}
        disabled={loading}
        className="w-full py-4 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold text-base shadow-lg shadow-orange-500/30 hover:from-orange-600 hover:to-orange-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
      >
        {loading ? 'Redirecting to payment…' : 'Continue to payment'}
      </button>
      {error && (
        <p className="text-sm text-red-600 text-center" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
