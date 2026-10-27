import { money } from '../../lib/api';

interface BookingSummaryProps {
  price: number;
  nights: number;
}

// Booking summary sidebar component displaying cost breakdown per night, service fees, and the estimated total calculation.
export function BookingSummary({ price, nights }: BookingSummaryProps) {
  return (
    <aside className="panel">
      <h2>Booking summary</h2>
      <p>
        {nights} night(s) × {money(price)}
      </p>
      <p>Service fee: {money(150)}</p>
      <strong>Estimated total: {money(nights * price + 150)}</strong>
    </aside>
  );
}