interface HotelSearchProps {
  query: string;
  onChange: (value: string) => void;
}

// Search input component allowing users to filter destinations by city or hotel name.
export function HotelSearch({ query, onChange }: HotelSearchProps) {
  return (
    <label className="field">
      Search destinations
      <input
        value={query}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search by city or hotel name"
      />
    </label>
  );
}