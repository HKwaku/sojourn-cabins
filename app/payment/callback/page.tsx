'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [bookingDetails, setBookingDetails] = useState<any>(null);

  useEffect(() => {
    const reference = searchParams.get('reference') || searchParams.get('trxref');
    
    if (!reference) {
      setStatus('failed');
      return;
    }

    const pendingBooking = sessionStorage.getItem('pending_booking');
    if (pendingBooking) {
      try {
        setBookingDetails(JSON.parse(pendingBooking));
      } catch (e) {
        console.error('Failed to parse booking details:', e);
      }
    }

    setTimeout(() => {
      setStatus('success');
    }, 3000);
  }, [searchParams]);

  const formatCurrency = (amount: number, currency: string = 'GHS') => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  if (status === 'verifying') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#ffffff',
        padding: '24px'
      }}>
        <div style={{
          background: 'white',
          padding: '48px',
          borderRadius: '12px',
          textAlign: 'center',
          maxWidth: '500px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 4px rgba(0,0,0,.08), 0 4px 10px rgba(0,0,0,.05)'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #000',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 24px'
          }} />
          <h2 style={{ fontSize: '20px', marginBottom: '8px', fontWeight: '500', color: '#0f172a' }}>
            Verifying Payment
          </h2>
          <p style={{ color: '#64748b', fontSize: '14px' }}>
            Please wait while we confirm your booking...
          </p>
          <style jsx>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (status === 'success') {
  const isPackage = bookingDetails?.isPackage;
  const isGroupBooking = bookingDetails?.isGroupBooking;
  
  // ⭐ Use confirmation code from API response
  const displayCode = isGroupBooking && bookingDetails?.groupCode
    ? bookingDetails.groupCode
    : bookingDetails?.confirmationCode || '—';  // ⭐ CHANGED: Use confirmationCode
  
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#ffffff',
      padding: '24px'
    }}>
      <div style={{
        background: '#ffffff',
        padding: '32px',
        borderRadius: '12px',
        maxWidth: '650px',
        width: '100%',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 4px rgba(0,0,0,.08), 0 4px 10px rgba(0,0,0,.05)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          paddingBottom: '16px',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a' }}>
            Booking confirmed! 🎉
          </div>
          <button
            onClick={() => router.push('/')}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '24px',
              color: '#9ca3af',
              cursor: 'pointer',
              padding: '0',
              lineHeight: '1'
            }}
          >
            ×
          </button>
        </div>

        {/* Main Content */}
        <div>
          <p style={{ margin: '0 0 16px', color: '#0f172a', fontSize: '14px' }}>
            Thank you! Your reservation is confirmed.
          </p>

          {/* Summary Box */}
          {bookingDetails && (
            <div style={{
              background: '#f9fafb',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              marginTop: '16px'
            }}>
              {/* Booking Details Section */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  color: '#9ca3af',
                  letterSpacing: '0.08em',
                  marginBottom: '12px'
                }}>
                  Booking details
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {/* Confirmation Code */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', alignItems: 'center' }}>
                    <span style={{ color: '#64748b' }}>
                      {isGroupBooking ? 'Group confirmation:' : 'Confirmation code:'}
                    </span>
                    <span style={{ color: '#0f172a', fontWeight: '600', fontFamily: 'monospace', fontSize: '14px' }}>
                      {displayCode}
                    </span>
                  </div>

                  {/* Guest Name */}
                  {bookingDetails.guestName && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span style={{ color: '#64748b' }}>Guest:</span>
                      <span style={{ color: '#0f172a', fontWeight: '500' }}>
                        {bookingDetails.guestName}
                      </span>
                    </div>
                  )}

                  {/* Dates */}
                  {bookingDetails.checkIn && bookingDetails.checkOut && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span style={{ color: '#64748b' }}>Dates:</span>
                      <span style={{ color: '#0f172a', fontWeight: '500' }}>
                        {formatDate(bookingDetails.checkIn)} → {formatDate(bookingDetails.checkOut)}
                      </span>
                    </div>
                  )}

                  
                  {/* Room/Cabin - Show list for multi-room */}
                  {isGroupBooking && bookingDetails.roomNames ? (
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      fontSize: '13px',
                      alignItems: 'start' 
                    }}>
                      <span style={{ color: '#64748b' }}>Rooms:</span>
                      <div style={{ 
                        textAlign: 'right', 
                        color: '#0f172a', 
                        fontWeight: '500' 
                      }}>
                        {bookingDetails.roomNames.map((roomName: string, idx: number) => (
                          <div key={idx}>{roomName}</div>
                        ))}
                      </div>
                    </div>
                  ) : bookingDetails.roomName ? (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span style={{ color: '#64748b' }}>Room:</span>
                      <span style={{ color: '#0f172a', fontWeight: '500' }}>
                        {bookingDetails.roomName}
                      </span>
                    </div>
                  ) : null}

                  {/* Nights */}
                  {bookingDetails.nights && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span style={{ color: '#64748b' }}>Nights:</span>
                      <span style={{ color: '#0f172a', fontWeight: '500' }}>
                        {bookingDetails.nights}
                      </span>
                    </div>
                  )}

                  {/* ⭐ NEW: Room Subtotal */}
                  {bookingDetails.roomSubtotal && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span style={{ color: '#64748b' }}>Room subtotal:</span>
                      <span style={{ color: '#0f172a', fontWeight: '500' }}>
                        {formatCurrency(bookingDetails.roomSubtotal, bookingDetails.currency)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Experiences (if extras) */}
              {/* Package Includes or Experiences */}
              {((isPackage && bookingDetails.packageExtras && bookingDetails.packageExtras.length > 0) ||
                (!isPackage && bookingDetails.extras && bookingDetails.extras.length > 0)) && (
                <div style={{ 
                  paddingTop: '12px', 
                  marginTop: '12px',
                  borderTop: '1px solid #e5e7eb' 
                }}>
                  <div style={{
                    fontSize: '11px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    color: '#9ca3af',
                    letterSpacing: '0.08em',
                    marginBottom: '8px'
                  }}>
                    {isPackage ? 'Package Includes' : 'Experiences'}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {(isPackage ? bookingDetails.packageExtras : bookingDetails.extras).map((extra: any, idx: number) => {
                      const qty = extra.quantity || extra.qty || 1;  // ⭐ Support both fields
                      const lineTotal = isPackage 
                        ? 0
                        : (extra.price || 0) * qty;
                      return (
                        <div key={idx} style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          fontSize: '13px',
                          color: '#0f172a'
                        }}>
                          <span>
                            {qty > 1 && `${qty}× `}  {/* ⭐ Show quantity for both */}
                            {extra.name || extra.extra_name}  {/* ⭐ Support both fields */}
                          </span>
                          {!isPackage && <span>{formatCurrency(lineTotal, bookingDetails.currency)}</span>}
                          {isPackage && <span style={{ color: '#10b981', fontSize: '12px' }}>✓ Included</span>}
                        </div>
                      );
                    })}
                  </div>
                  {!isPackage && (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '13px',
                      marginTop: '8px',
                      paddingTop: '8px',
                      borderTop: '1px dashed #e5e7eb',
                      fontWeight: '500'
                    }}>
                      <span style={{ color: '#64748b' }}>Experiences subtotal:</span>
                      <span style={{ color: '#0f172a' }}>
                        {formatCurrency(bookingDetails.extrasTotal || 0, bookingDetails.currency)}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Discount (if applicable) */}
              {bookingDetails.discountAmount > 0 && bookingDetails.couponCode && (
                <div style={{ 
                  paddingTop: '12px', 
                  marginTop: '12px',
                  borderTop: '1px solid #e5e7eb',
                  background: '#d1fae5',
                  margin: '12px -20px 0',
                  padding: '12px 20px',
                  borderRadius: '0 0 8px 8px'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '13px',
                    fontWeight: '500',
                    color: '#065f46'
                  }}>
                    <span>Discount ({bookingDetails.couponCode}):</span>
                    <span>-{formatCurrency(bookingDetails.discountAmount, bookingDetails.currency)}</span>
                  </div>
                </div>
              )}

              {/* Total Paid */}
              <div style={{ 
                marginTop: '16px', 
                paddingTop: '16px', 
                borderTop: '2px solid #e5e7eb' 
              }}>
                <div style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  color: '#9ca3af',
                  letterSpacing: '0.08em',
                  marginBottom: '8px'
                }}>
                  Payment summary
                </div>
                {bookingDetails.amount && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '16px',
                    fontWeight: '600'
                  }}>
                    <span style={{ color: '#0f172a' }}>Total paid:</span>
                    <span style={{ color: '#0f172a' }}>
                      {formatCurrency(bookingDetails.amount, bookingDetails.currency)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <p style={{ margin: '16px 0 0', fontSize: '13px', color: '#64748b', lineHeight: '1.5' }}>
            A confirmation email will be sent to you shortly.
          </p>
        </div>

        {/* Footer Button */}
        <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #e5e7eb' }}>
          <button
            onClick={() => router.push('/')}
            style={{
              width: '100%',
              background: '#000',
              color: 'white',
              padding: '14px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background 0.2s',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#1f2937')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#000')}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

  // Failed state
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#ffffff',
      padding: '24px'
    }}>
      <div style={{
        background: 'white',
        padding: '48px',
        borderRadius: '12px',
        textAlign: 'center',
        maxWidth: '500px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 4px rgba(0,0,0,.08), 0 4px 10px rgba(0,0,0,.05)'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          background: '#ef4444',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px'
        }}>
          <span style={{ color: 'white', fontSize: '32px' }}>✕</span>
        </div>
        <h2 style={{ fontSize: '20px', marginBottom: '12px', color: '#ef4444', fontWeight: '600' }}>
          Payment Cancelled
        </h2>
        <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '14px' }}>
          Your payment was not completed. No charges were made.
        </p>
        <button
          onClick={() => router.push('/')}
          style={{
            background: '#000',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600'
          }}
        >
          Return to Home
        </button>
      </div>
    </div>
  );
}

export default function PaymentCallback() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div>Loading...</div>
      </div>
    }>
      <PaymentCallbackContent />
    </Suspense>
  );
}