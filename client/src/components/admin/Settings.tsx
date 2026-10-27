import { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { api, type Room, type Branch, type Booking, money, dateText } from '../../lib/api';
import { Button, Modal } from '../UI';
import { showToast } from '../../store';
import { useAdmin } from './useAdmin';
import { usePublicBranches } from './usePublicBranches';
import { Heading } from './Heading';

//  Administrative Settings view providing an overview of system administration guidelines and production deployment configuration recommendations.
export function Settings() {
  return (
    <>
      <Heading title="Settings" />
      <div className="panel stack">
        <h3>Hotel Administration</h3>
        <p>
          Manage branches, room availability, booking approvals and guest notifications using the navigation
          menu.
        </p>
        <p className="small">
          For production, configure HTTPS, backups, a payment provider, email delivery and OAuth credentials.
        </p>
      </div>
    </>
  );
}