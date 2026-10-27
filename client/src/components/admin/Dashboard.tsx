import { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { api, type Room, type Branch, type Booking, money, dateText } from '../../lib/api';
import { Button, Modal } from '../UI';
import { showToast } from '../../store';
import { useAdmin } from './useAdmin';
import { usePublicBranches } from './usePublicBranches';
import { Heading } from './Heading';

// Administrative Dashboard view providing an overview of system performance metrics and quick access links to key management actions.
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