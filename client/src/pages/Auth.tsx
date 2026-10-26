import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { api } from '../lib/api';
import { setUser } from '../store';

// Authentication page component handling user sign-in and registration workflows.
export function AuthPage() {
  const [register, setRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Handles form submission for authentication (login or registration).
  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const result = await api<{
        token: string;
        user: { id: string; name: string; email: string; role: string };
      }>('/auth/' + (register ? 'register' : 'login'), {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
      localStorage.setItem('retreat_token', result.token);
      dispatch(setUser(result.user));
      navigate('/');
    } catch (e) {
      setError((e as Error).message);
    }
  }