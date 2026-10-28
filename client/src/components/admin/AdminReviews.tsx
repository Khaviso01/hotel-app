import { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { api, type Room, type Branch, type Booking, money, dateText } from '../../lib/api';
import { Button, Modal } from '../UI';
import { showToast } from '../../store';
import { useAdmin } from './useAdmin';
import { usePublicBranches } from './usePublicBranches';
import { Heading } from './Heading';

// Admin component for viewing and managing guest reviews.
export function AdminReviews() {

  // Fetch all guest reviews from the admin API and provide a reload function.
  const { data, reload } = useAdmin<
    {
      id: string;
      rating: number;
      comment: string;
      user: { name: string };
      branch: { name: string };
    }[]
  >('/reviews');

  // Initialize Redux dispatch for displaying notifications.
  const dispatch = useDispatch();

  // Store the ID of the review selected for deletion.
  const [target, setTarget] = useState<string | null>(null);

  // Delete the selected review from the database.
  async function remove() {
    try {
      // Send a DELETE request to the admin reviews API.
      await api('/admin/reviews/' + target, { method: 'DELETE' });

      // Display a success notification.
      dispatch(showToast({ message: 'Review deleted' }));

      // Close the confirmation modal.
      setTarget(null);

      // Refresh the reviews list after successful deletion.
      reload();

    } catch (e) {
      // Display an error notification if the deletion fails.
      dispatch(showToast({ message: (e as Error).message, kind: 'error' }));
    }
  }

  // Render the reviews list and delete confirmation modal.
  return (
    <>
      {/* Display the page heading. */}
      <Heading title="Reviews" />

      {/* Loop through all reviews returned by the API. */}
      {data?.map((r) => (
        <div className="panel review-admin" key={r.id}>
          <div>
            {/* Display the guest name and review rating. */}
            <strong>
              {r.user.name}
              {r.rating} ★
            </strong>

            {/* Display the hotel branch associated with the review. */}
            <p>{r.branch.name}</p>

            {/* Display the guest's review comment. */}
            <p>{r.comment}</p>
          </div>

          {/* Open the delete confirmation modal for the selected review. */}
          <Button variant="danger" onClick={() => setTarget(r.id)}>
            Delete
          </Button>
        </div>
      ))}

      {/* Show the confirmation modal when a review is selected. */}
      {target && (
        <Modal title="Delete Review?" onClose={() => setTarget(null)}>
          <p>Remove this guest review permanently?</p>

          {/* Confirm and permanently delete the selected review. */}
          <Button variant="danger" onClick={remove}>
            Delete Review
          </Button>
        </Modal>
      )}
    </>
  );
}
