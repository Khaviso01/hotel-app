import { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { api, type Room, type Branch, type Booking, money, dateText } from '../../lib/api';
import { Button, Modal } from '../UI';
import { showToast } from '../../store';
import { useAdmin } from './useAdmin';
import { usePublicBranches } from './usePublicBranches';
import { Heading } from './Heading';

export function AdminNotifications() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const dispatch = useDispatch();

  async function send(e: FormEvent) {
    e.preventDefault();
    try {
      const r = await api<{ sent: number }>('/admin/notifications', {
        method: 'POST',
        body: JSON.stringify({ title, message }),
      });
      dispatch(showToast({ message: 'Notification sent to ' + r.sent + ' users' }));
      setTitle('');
      setMessage('');
    } catch (e) {
      dispatch(showToast({ message: (e as Error).message, kind: 'error' }));
    }
  }

// Reports and analytics dashboard view.
  return (
    <>
      <Heading title="Send Notifications" />
      <form className="panel stack" onSubmit={send}>
        <label>
          Title
          <input required value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label>
          Message
          <textarea required value={message} onChange={(e) => setMessage(e.target.value)} />
        </label>
        <Button type="submit">Send to All Users</Button>
      </form>
    </>
  );
}
