import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { api, type Booking, money, dateText } from '../../lib/api';
import { Button, Modal } from '../UI';
import { showToast } from '../../store';
import { useAdmin } from './useAdmin';
import { Heading } from './Heading';

//  Administrative view for managing guest reservations, filtering by status, approving pending bookings, and cancelling reservations.
export function AdminBookings() {
  const { data, error, reload } = useAdmin<Booking[]>('/bookings');
  const [filter, setFilter] = useState('');
  const [target, setTarget] = useState<{ booking: Booking; status: string } | null>(null);
  const dispatch = useDispatch();

  //  Updates the status of the targeted booking (e.g. CONFIRMED or CANCELLED).
  async function change() {
    if (!target) return;
    try {
      await api('/admin/bookings/' + target.booking.id, {
        method: 'PUT',
        body: JSON.stringify({ status: target.status }),
      });
      dispatch(
        showToast({
          message: `Booking ${target.status.toLowerCase()} successfully`,
        })
      );
      setTarget(null);
      reload();
    } catch (e) {
      dispatch(showToast({ message: (e as Error).message, kind: 'error' }));
    }
  }

  return (
    <>
      <Heading title="Manage Bookings" />
      <div className="tabs">
        {['', 'PENDING', 'CONFIRMED', 'CANCELLED'].map((s) => (
          <button key={s} className={filter === s ? 'active' : ''} onClick={() => setFilter(s)}>
            {s || 'All'}
          </button>
        ))}
      </div>
      {error && <p className="error">{error}</p>}
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Reference</th>
              <th>Guest</th>
              <th>Branch</th>
              <th>Room</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data
              ?.filter((b) => !filter || b.status === filter)
              .map((b) => (
                <tr key={b.id}>
                  <td>{b.reference}</td>
                  <td>{b.user?.name}</td>
                  <td>{b.room.branch.city}</td>
                  <td>{b.room.name}</td>
                  <td>{dateText(b.checkIn)}</td>
                  <td>{dateText(b.checkOut)}</td>
                  <td>{money(b.total)}</td>
                  <td>
                    <span className={'status ' + b.status.toLowerCase()}>{b.status}</span>
                  </td>
                  <td>
                    <div className="actions">
                      {b.status === 'PENDING' && (
                        <button onClick={() => setTarget({ booking: b, status: 'CONFIRMED' })}>
                          Approve
                        </button>
                      )}
                      {b.status !== 'CANCELLED' && (
                        <button
                          className="danger-text"
                          onClick={() => setTarget({ booking: b, status: 'CANCELLED' })}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {target && (
        <Modal
          title={target.status === 'CONFIRMED' ? 'Approve Booking?' : 'Cancel Booking?'}
          onClose={() => setTarget(null)}
        >
          <p>
            Update reservation <strong>{target.booking.reference}</strong> to {target.status.toLowerCase()}?
          </p>
          <Button
            variant={target.status === 'CANCELLED' ? 'danger' : 'primary'}
            onClick={change}
          >
            Confirm Action
          </Button>
        </Modal>
      )}
    </>
  );
}