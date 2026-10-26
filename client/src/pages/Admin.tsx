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