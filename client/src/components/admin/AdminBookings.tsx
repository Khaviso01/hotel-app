import { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { api, type Room, type Branch, type Booking, money, dateText } from '../../lib/api';
import { Button, Modal } from '../UI';
import { showToast } from '../../store';
import { useAdmin } from './useAdmin';
import { usePublicBranches } from './usePublicBranches';
import { Heading } from './Heading';

// Administrative view for managing hotel branches.
export function AdminBookings() {
  const { data, error, reload } = useAdmin<Booking[]>('/bookings');
  const [target, setTarget] = useState<{ booking: Booking; status: 'CONFIRMED' | 'CANCELLED' } | null>(
    null
  );
  const [filter, setFilter] = useState('');
  const dispatch = useDispatch();

  async function change() {
    if (!target) return;
    try {
      await api('/admin/bookings/' + target.booking.id, {
        method: 'PATCH',
        body: JSON.stringify({ status: target.status }),
      });
      dispatch(showToast({ message: 'Booking ' + target.status.toLowerCase() }));
      setTarget(null);
      reload();
    } catch (e) {
      dispatch(showToast({ message: (e as Error).message, kind: 'error' }));
    }
  }