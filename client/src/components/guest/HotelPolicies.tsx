import { CheckCircle } from 'lucide-react';

interface HotelPoliciesProps {
  items: string[];
}

export function HotelPolicies({ items }: HotelPoliciesProps) {
  return (
    <section className="hotel-policies">
      <h3>Hotel Policies</h3>

      {items.length === 0 ? (
        <p className="muted">
          Please contact the hotel for its current policies.
        </p>
      ) : (
        <div className="policy-list">
          {items.map((policy, index) => (
            <div className="policy-item" key={`${policy}-${index}`}>
              <CheckCircle size={18} />
              <span>{policy}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}