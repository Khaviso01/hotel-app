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
