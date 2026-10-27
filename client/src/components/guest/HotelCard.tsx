import { Link } from 'react-router-dom';
import type { Branch } from '../../lib/api';

interface HotelCardProps {
  branch: Branch;
}

// Hotel card component displaying branch image, name, location, rating, and a link to view available rooms for the specific branch.
export function HotelCard({ branch }: HotelCardProps) {
  return (
    <article className="panel">
      <img className="cover" src={branch.image} alt={branch.name} />
      <h2>{branch.name}</h2>
      <p>{branch.city} · {branch.address}</p>
      <p>★ {branch.rating}</p>
      <Link className="btn btn-primary" to={'/branches/' + branch.id}>
        View rooms
      </Link>
    </article>
  );
}