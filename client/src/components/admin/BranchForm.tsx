import { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { api, type Room, type Branch, type Booking, money, dateText } from '../../lib/api';
import { Button, Modal } from '../UI';
import { showToast } from '../../store';
import { useAdmin } from './useAdmin';
import { usePublicBranches } from './usePublicBranches';
import { Heading } from './Heading';

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

  // Handles form submission for creating a new branch or updating an existing one.
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