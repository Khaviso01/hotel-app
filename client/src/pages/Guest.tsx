import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, type Branch, type Room, type Booking, dateText, money } from '../lib/api';
import { HeroSection } from '../components/guest/HeroSection';
import { HotelSearch } from '../components/guest/HotelSearch';
import { HotelCard } from '../components/guest/HotelCard';
import { HotelGallery } from '../components/guest/HotelGallery';
import { HotelFacilities } from '../components/guest/HotelFacilities';
import { RoomCard } from '../components/guest/RoomCard';
import { BookingForm } from '../components/guest/BookingForm';

// Custom hook for fetching API data with error handling.
function useData<T>(path: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api<T>(path)
      .then(setData)
      .catch((e) => setError(e.message));
  }, [path]);

  return { data, error };
}

// Home page view combining the hero section and branch directory.
export function Home() {
  return (
    <>
      <HeroSection />
      <Branches />
    </>
  );
}

// Branches directory view with search filtering.
export function Branches() {
  const { data, error } = useData<Branch[]>('/branches');
  const [query, setQuery] = useState('');

  return (
    <main className="container">
      <h1>Our branches</h1>
      <HotelSearch query={query} onChange={setQuery} />
      {error && <p className="error">{error}</p>}
      <div className="cards">
        {data
          ?.filter((b) => (b.name + ' ' + b.city).toLowerCase().includes(query.toLowerCase()))
          .map((b) => (
            <HotelCard key={b.id} branch={b} />
          ))}
      </div>
    </main>
  );
}

// Detailed view for an individual hotel branch including gallery, facilities, and room listings./
export function BranchDetails() {
  const { id } = useParams();
  const { data, error } = useData<Branch>('/branches/' + id);

  return (
    <main className="container">
      {error && <p className="error">{error}</p>}
      {data && (
        <>
          <h1>{data.name}</h1>
          <p>
            {data.address}, {data.city}
          </p>
          <HotelGallery
            name={data.name}
            images={[data.image, ...data.rooms.map((r) => r.image)]}
          />
          <p>{data.description}</p>
          <HotelFacilities />
          <h2>Rooms</h2>
          <div className="cards">
            {data.rooms.map((r) => (
              <RoomCard key={r.id} room={r} />
            ))}
          </div>
        </>
      )}
    </main>
  );
}

// Room reservation view rendering the booking form for a selected room.
export function ReserveRoom() {
  const { id } = useParams();
  const { data, error } = useData<Room[]>('/rooms');
  const room = data?.find((r) => r.id === id);

  return (
    <main className="container">
      {error && <p className="error">{error}</p>}
      {room ? <BookingForm room={room} /> : <p>Loading room…</p>}
    </main>
  );
}

// User bookings view listing reservations associated with the current user.
export function MyBookings() {
  const { data, error } = useData<Booking[]>('/bookings');

  return (
    <main className="container">
      <h1>My bookings</h1>
      {error && (
        <p className="error">
          {error} <Link to="/auth">Sign in</Link>
        </p>
      )}
      {data?.map((b) => (
        <article className="panel" key={b.id}>
          <h2>{b.room?.name}</h2>
          <p>
            {b.reference} · {b.status}
          </p>
          <p>
            {dateText(b.checkIn)} – {dateText(b.checkOut)}
          </p>
          <strong>{money(b.total)}</strong>
        </article>
      ))}
    </main>
  );
}