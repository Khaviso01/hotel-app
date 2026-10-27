import { Link } from 'react-router-dom';
import type { Room } from '../../lib/api';
import { money } from '../../lib/api';

interface RoomCardProps {
  room: Room;
}

// Room card component displaying room image, name, description, capacity, price per night, and a booking link or availability status.

export function RoomCard({ room }: RoomCardProps) {
  return (
    <article className="panel">
      <img className="cover" src={room.image} alt={room.name} />
      <h3>{room.name}</h3>
      <p>{room.description}</p>
      <p>
        Sleeps {room.capacity} · {money(room.price)} per night
      </p>
      {room.available ? (
        <Link className="btn btn-primary" to={'/rooms/' + room.id + '/book'}>
          Book room
        </Link>
      ) : (
        <span>Unavailable</span>
      )}
    </article>
  );
}