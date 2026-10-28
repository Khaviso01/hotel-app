
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, type Room } from '../../lib/api';
import { BookingSummary } from './BookingSummary';

// Booking form component for reserving a selected hotel room
export function BookingForm({ room }: { room: Room }) {
  // Hook for navigating between application pages
  const navigate = useNavigate();

  // State variables for storing booking information
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);

  // State variables for handling errors and submission status
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // Calculate the number of nights between check-in and check-out dates
  const nights =
    checkIn && checkOut
      ? Math.max(
          0,
          Math.round(
            (Date.parse(checkOut) - Date.parse(checkIn)) / 86400000
          )
        )
      : 0;

  // Handle booking form submission
  async function submit(e: FormEvent) {
    // Prevent the browser from refreshing when the form is submitted
    e.preventDefault();

    // Clear any previous error messages
    setError('');

    // Validate that check-out is after check-in
    if (nights < 1) {
      setError('Check-out must be after check-in');
      return;
    }

    // Disable submission while processing the booking
    setBusy(true);

    try {
      // Send booking information to the backend API
      await api('/bookings', {
        method: 'POST',
        body: JSON.stringify({
          roomId: room.id,
          checkIn,
          checkOut,
          guests,
        }),
      });

      // Navigate to the bookings page after successful submission
      navigate('/bookings');
    } catch (e) {
      // Display an error message if the booking request fails
      setError((e as Error).message);
    } finally {
      // Re-enable the submit button after processing
      setBusy(false);
    }
  }

  // Render the hotel room reservation form
  return (
    <form onSubmit={submit} className="panel">
      {/* Display the selected room name */}
      <h2>Reserve {room.name}</h2>

      {/* Check-in date input */}
      <label>
        Check in
        <input
          type="date"
          required
          value={checkIn}
          onChange={e => setCheckIn(e.target.value)}
        />
      </label>

      {/* Check-out date input */}
      <label>
        Check out
        <input
          type="date"
          required
          value={checkOut}
          onChange={e => setCheckOut(e.target.value)}
        />
      </label>

      {/* Number of guests input */}
      <label>
        Guests
        <input
          type="number"
          min={1}
          max={room.capacity}
          required
          value={guests}
          onChange={e => setGuests(Number(e.target.value))}
        />
      </label>

      {/* Display the calculated booking price summary */}
      <BookingSummary price={room.price} nights={nights} />

      {/* Display an error message when booking validation fails */}
      {error && <p className="error">{error}</p>}

      {/* Submit the reservation and prevent duplicate submissions */}
      <button className="btn btn-primary" disabled={busy}>
        {busy ? 'Submitting…' : 'Confirm booking'}
      </button>
    </form>
  );
}
