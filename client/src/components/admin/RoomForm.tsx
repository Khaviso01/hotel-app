import { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { api, type Room, type Branch, type Booking, money, dateText } from '../../lib/api';
import { Button, Modal } from '../UI';
import { showToast } from '../../store';
import { useAdmin } from './useAdmin';
import { usePublicBranches } from './usePublicBranches';
import { Heading } from './Heading';

// Form component for creating new hotel rooms or editing existing room details.
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

  // Helper function to update form field state.
  function update(key: string, value: any) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  // Handles form submission for creating or updating a room.
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