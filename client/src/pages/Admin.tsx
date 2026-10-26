import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { api, Room, Branch, Booking, money, dateText } from '../lib/api';
import { Button, Modal } from '../components/UI';
import { showToast } from '../store';

// Custom hook for fetching administrative data with automatic error handling and reload triggers. 
function useAdmin<T>(path: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState('');
  const [tick, setTick] = useState(0);

  useEffect(() => {
    api<T>('/admin' + path)
      .then(setData)
      .catch((e) => setError(e.message));
  }, [path, tick]);

  return { data, error, reload: () => setTick((v) => v + 1) };
}

// Reusable section heading component with optional action elements.
function Heading({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="section-heading">
      <h1>{title}</h1>
      {action}
    </div>
  );
}

// Admin Dashboard overview displaying performance metrics and quick navigation actions.
export function Dashboard() {
  const { data, error } = useAdmin<{
    bookings: number;
    revenue: number;
    rooms: number;
    branches: number;
    users: number;
  }>('/stats');

  return (
    <>
      <Heading title="Dashboard" />
      <p className="muted">Overview of The Retreat's performance</p>
      {error && <p className="error">{error}</p>}
      <div className="metric-grid">
        {[
          ['Total Bookings', data?.bookings],
          ['Revenue', money(data?.revenue || 0)],
          ['Rooms', data?.rooms],
          ['Branches', data?.branches],
          ['Users', data?.users],
        ].map(([label, value]) => (
          <div className="metric" key={label as string}>
            <span>{label}</span>
            <strong>{value ?? '—'}</strong>
          </div>
        ))}
      </div>
      <div className="panel">
        <h2>Quick Actions</h2>
        <div className="actions">
          <Link className="btn btn-primary" to="/admin/rooms/new">
            Add Room
          </Link>
          <Link className="btn btn-outline" to="/admin/bookings">
            Manage Reservations
          </Link>
          <Link className="btn btn-outline" to="/admin/branches">
            Manage Branches
          </Link>
        </div>
      </div>
    </>
  );
}

// Administrative view for managing hotel rooms with search filtering and deletion dialogs.
export function AdminRooms() {
  const { data: branches } = usePublicBranches();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [remove, setRemove] = useState<Room | null>(null);
  const [filter, setFilter] = useState('');

  const rooms = branches?.flatMap((b) => b.rooms.map((r) => ({ ...r, branch: b }))) || [];

  async function deleteRoom() {
    if (!remove) return;
    try {
      await api('/admin/rooms/' + remove.id, { method: 'DELETE' });
      dispatch(showToast({ message: 'Room deleted successfully' }));
      setRemove(null);
      navigate('/admin/rooms');
      window.location.reload();
    } catch (e) {
      dispatch(showToast({ message: (e as Error).message, kind: 'error' }));
    }
  }

  return (
    <>
      <Heading
        title="Manage Rooms"
        action={
          <Link className="btn btn-primary" to="/admin/rooms/new">
            + Add Room
          </Link>
        }
      />
      <input
        className="search-input"
        placeholder="Search rooms..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Room</th>
              <th>Branch</th>
              <th>Type</th>
              <th>Capacity</th>
              <th>Price / night</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rooms
              .filter((r) => (r.name + ' ' + r.branch.city).toLowerCase().includes(filter.toLowerCase()))
              .map((r) => (
                <tr key={r.id}>
                  <td>
                    <div className="table-room">
                      <img src={r.image} alt="" />
                      {r.name}
                    </div>
                  </td>
                  <td>{r.branch.city}</td>
                  <td>{r.type}</td>
                  <td>{r.capacity}</td>
                  <td>{money(r.price)}</td>
                  <td>
                    <span className={'status ' + (r.available ? 'confirmed' : 'cancelled')}>
                      {r.available ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                  <td>
                    <div className="actions">
                      <Link to={'/admin/rooms/' + r.id + '/edit'}>Edit</Link>
                      <button className="danger-text" onClick={() => setRemove(r)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {remove && (
        <Modal title="Delete Room?" onClose={() => setRemove(null)}>
          <p>
            Permanently delete <strong>{remove.name}</strong>? This cannot be undone.
          </p>
          <Button variant="danger" onClick={deleteRoom}>
            Delete Room
          </Button>
        </Modal>
      )}
    </>
  );
}