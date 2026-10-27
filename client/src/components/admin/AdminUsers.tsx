import { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { api, type Room, type Branch, type Booking, money, dateText } from '../../lib/api';
import { Button, Modal } from '../UI';
import { showToast } from '../../store';
import { useAdmin } from './useAdmin';
import { usePublicBranches } from './usePublicBranches';
import { Heading } from './Heading';

// Administrative view for viewing registered system users and their assigned roles.
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

// Administrative view for moderating and deleting guest reviews.
export function AdminReviews() {
  const { data, reload } = useAdmin<
    { id: string; rating: number; comment: string; user: { name: string }; branch: { name: string } }[]
  >('/reviews');
  const dispatch = useDispatch();
  const [target, setTarget] = useState<string | null>(null);

  // Permanently deletes the selected review.
  async function remove() {
    try {
      await api('/admin/reviews/' + target, { method: 'DELETE' });
      dispatch(showToast({ message: 'Review deleted' }));
      setTarget(null);
      reload();
    } catch (e) {
      dispatch(showToast({ message: (e as Error).message, kind: 'error' }));
    }
  }

  return (
    <>
      <Heading title="Reviews" />
      {data?.map((r) => (
        <div className="panel review-admin" key={r.id}>
          <div>
            <strong>
              {r.user.name} {r.rating} ★
            </strong>
            <p>{r.branch.name}</p>
            <p>{r.comment}</p>
          </div>
          <Button variant="danger" onClick={() => setTarget(r.id)}>
            Delete
          </Button>
        </div>
      ))}
      {target && (
        <Modal title="Delete Review?" onClose={() => setTarget(null)}>
          <p>Remove this guest review permanently?</p>
          <Button variant="danger" onClick={remove}>
            Delete Review
          </Button>
        </Modal>
      )}
    </>
  );
}