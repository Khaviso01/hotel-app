import { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { api, type Room, type Branch, type Booking, money, dateText } from '../../lib/api';
import { Button, Modal } from '../UI';
import { showToast } from '../../store';
import { useAdmin } from './useAdmin';
import { usePublicBranches } from './usePublicBranches';
import { Heading } from './Heading';

// Administrative component for managing, filtering, and deleting hotel rooms across all branches.
export function AdminRooms() {
  const { data: branches } = usePublicBranches();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [remove, setRemove] = useState<Room | null>(null);
  const [filter, setFilter] = useState('');

  // Flatten rooms across all branches and attach branch metadata
  const rooms = branches?.flatMap((b) => b.rooms.map((r) => ({ ...r, branch: b }))) || [];

  // Deletes the selected room and refreshes the room list.
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