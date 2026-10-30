
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { send } from '../lib/api';

type PaymentResult = {
  success: boolean;
  bookingId: string;
  status: string;
  paymentStatus: string;
};

export default function PaymentCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const bookingId = params.get('bookingId');
  const reference = params.get('reference');

  const started = useRef(false);
  const [message, setMessage] = useState(
    'Verifying your payment securely...'
  );
  const [error, setError] = useState(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    if (!bookingId) {
      setError(true);
      setMessage(
        'Booking information is missing. Please check your reservations.'
      );
      return;
    }

    async function verify() {
      try {
        const result = await send<PaymentResult>(
          '/payments/verify',
          'POST',
          { bookingId }
        );

        if (!result.success) {
          throw new Error('Payment could not be confirmed.');
        }

        setMessage('Payment successful! Opening your booking...');

        navigate('/confirmation/' + result.bookingId, {
          replace: true
        });
      } catch (err) {
        setError(true);
        setMessage(
          err instanceof Error
            ? err.message
            : 'Unable to verify your payment.'
        );
      }
    }

    void verify();
  }, [bookingId, reference, navigate]);

  return (
    <main className="container section">
      <div
        className="panel"
        style={{
          maxWidth: 560,
          margin: '60px auto',
          textAlign: 'center',
          padding: 32
        }}
      >
        <h1>{error ? 'Payment Not Confirmed' : 'Checking Payment'}</h1>

        <p className="muted">{message}</p>

        {error && (
          <div style={{ marginTop: 24 }}>
            <button
              className="btn"
              onClick={() => navigate('/bookings')}
            >
              View My Bookings
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
