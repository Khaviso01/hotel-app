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