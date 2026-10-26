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

// Custom hook to fetch public branch and room listings.
function usePublicBranches() {
  const [data, setData] = useState<Branch[]>([]);

  useEffect(() => {
    api<Branch[]>('/branches')
      .then(setData)
      .catch(() => {});
  }, []);

  return { data };
}

// Form component for creating or editing individual hotel rooms.
export function RoomForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const { data: branches } = usePublicBranches();
  const existing = branches.flatMap((b) => b.rooms).find((r) => r.id === id);

  const [form, setForm] = useState({
    branchId: '',
    name: '',
    type: 'Deluxe',
    description: '',
    capacity: 2,
    price: 1850,
    available: true,
    image: '',
  });
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (existing) {
      setForm({
        branchId: existing.branchId,
        name: existing.name,
        type: existing.type,
        description: existing.description,
        capacity: existing.capacity,
        price: existing.price,
        available: existing.available,
        image: existing.image,
      });
    } else if (branches[0] && !form.branchId) {
      setForm((f) => ({ ...f, branchId: branches[0].id }));
    }
  }, [existing, branches]);

  function update(key: string, value: any) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api('/admin/rooms' + (editing ? '/' + id : ''), {
        method: editing ? 'PUT' : 'POST',
        body: JSON.stringify(form),
      });
      dispatch(
        showToast({
          message: editing ? 'Room updated successfully' : 'Room added successfully',
        })
      );
      navigate('/admin/rooms');
    } catch (e) {
      dispatch(showToast({ message: (e as Error).message, kind: 'error' }));
    } finally {
      setBusy(false);
    }
  }

   return (
    <>
      <Heading title={editing ? 'Edit Room' : 'Add New Room'} />
      <form className="panel stack" onSubmit={submit}>
        <div className="form-grid">
          <label>
            Branch
            <select
              value={form.branchId}
              required
              onChange={(e) => update('branchId', e.target.value)}
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Room Name
            <input required value={form.name} onChange={(e) => update('name', e.target.value)} />
          </label>
          <label>
            Room Type
            <select value={form.type} onChange={(e) => update('type', e.target.value)}>
              {['Deluxe', 'Executive', 'Family', 'Suite', 'Villa'].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
          <label>
            Capacity
            <input
              type="number"
              min="1"
              value={form.capacity}
              onChange={(e) => update('capacity', Number(e.target.value))}
            />
          </label>
          <label>
            Price per Night (R)
            <input
              type="number"
              min="1"
              value={form.price}
              onChange={(e) => update('price', Number(e.target.value))}
            />
          </label>
          <label>
            Availability
            <select
              value={String(form.available)}
              onChange={(e) => update('available', e.target.value === 'true')}
            >
              <option value="true">Available</option>
              <option value="false">Unavailable</option>
            </select>
          </label>
        </div>
        <label>
          Description
          <textarea
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
          />
        </label>
        <label>
          Room Image URL
          <input type="url" required value={form.image} onChange={(e) => update('image', e.target.value)} />
        </label>
        {form.image && <img className="form-preview" src={form.image} alt="Room preview" />}
        <div className="actions">
          <Button type="submit" disabled={busy}>
            {busy ? 'Saving...' : editing ? 'Save Changes' : 'Save Room'}
          </Button>
          <Link className="btn btn-outline" to="/admin/rooms">
            Cancel
          </Link>
        </div>
      </form>
    </>
  );
}

// Administrative view for reviewing, approving, and cancelling guest reservations.
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

// Administrative view for managing hotel branches.
export function AdminBranches() {
  const { data } = usePublicBranches();

  return (
    <>
      <Heading
        title="Manage Branches"
        action={
          <Link className="btn btn-primary" to="/admin/branches/new">
            + Add Branch
          </Link>
        }
      />
      <div className="card-grid">
        {data.map((b) => (
          <article className="branch-card" key={b.id}>
            <img src={b.image} alt={b.name} />
            <div className="branch-info">
              <h3>{b.name}</h3>
              <p>{b.address}</p>
              <p>{b.rooms.length} rooms</p>
              <Link className="btn btn-outline" to={'/admin/branches/' + b.id + '/edit'}>
                Edit Branch
              </Link>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

// Form component for creating or editing hotel branches.
export function BranchForm() {
  const { id } = useParams();
  const { data } = usePublicBranches();
  const existing = data.find((b) => b.id === id);
  const editing = !!id;

  const [form, setForm] = useState({
    name: '',
    city: '',
    address: '',
    description: '',
    image: '',
  });
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (existing) {
      setForm({
        name: existing.name,
        city: existing.city,
        address: existing.address,
        description: existing.description,
        image: existing.image,
      });
    }
  }, [existing]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    try {
      await api('/admin/branches' + (editing ? '/' + id : ''), {
        method: editing ? 'PUT' : 'POST',
        body: JSON.stringify(form),
      });
      dispatch(showToast({ message: editing ? 'Branch updated' : 'Branch created' }));
      navigate('/admin/branches');
    } catch (e) {
      dispatch(showToast({ message: (e as Error).message, kind: 'error' }));
    }
  }

  return (
    <>
      <Heading title={editing ? 'Edit Branch' : 'Add Branch'} />
      <form className="panel stack" onSubmit={submit}>
        {(Object.keys(form) as (keyof typeof form)[]).map((k) => (
          <label key={k}>
            {k.charAt(0).toUpperCase() + k.slice(1)}
            <input
              required
              value={form[k]}
              onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))}
            />
          </label>
        ))}
        <Button type="submit">Save Branch</Button>
      </form>
    </>
  );
}

// Administrative view for viewing registered system users.
export function AdminUsers() {
  const { data } = useAdmin<{ id: string; name: string; email: string; role: string }[]>('/users');

  return (
    <>
      <Heading title="Users" />
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}