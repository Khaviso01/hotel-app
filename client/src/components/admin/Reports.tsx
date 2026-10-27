import { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { api, type Room, type Branch, type Booking, money, dateText } from '../../lib/api';
import { Button, Modal } from '../UI';
import { showToast } from '../../store';
import { useAdmin } from './useAdmin';
import { usePublicBranches } from './usePublicBranches';
import { Heading } from './Heading';

// Administrative settings overview and documentation view.
export function Reports() {
  const { data } = useAdmin<{
    bookings: number;
    revenue: number;
    rooms: number;
    branches: number;
    users: number;
  }>('/stats');

  return (
    <>
      <Heading title="Reports & Analytics" />
      <div className="metric-grid">
        {[
          ['Bookings', data?.bookings],
          ['Confirmed Revenue', money(data?.revenue || 0)],
          ['Rooms', data?.rooms],
          ['Branches', data?.branches],
        ].map(([k, v]) => (
          <div className="metric" key={k as string}>
            <span>{k}</span>
            <strong>{v ?? '—'}</strong>
          </div>
        ))}
      </div>
      <p className="muted">These figures are calculated from your PostgreSQL database.</p>
    </>
  );
}
