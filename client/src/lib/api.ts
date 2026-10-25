// One API helper keeps authentication and error handling consistent.
export async function api<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('retreat_token');
  const response = await fetch('/api' + path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: 'Bearer ' + token } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  if (response.status === 204) return undefined as T;
  return response.json();
}

// Room entity type definition matching the backend schema
export type Room = {
  id: string;
  branchId: string;
  name: string;
  type: string;
  description: string;
  capacity: number;
  price: number;
  available: boolean;
  image: string;
  branch?: Branch;
};

// Branch entity type definition with related rooms and reviews
export type Branch = {
  id: string;
  name: string;
  city: string;
  address: string;
  description: string;
  image: string;
  rating: number;
  rooms: Room[];
  reviews?: {
    id: string;
    rating: number;
    comment: string;
    user: { name: string };
  }[];
};

// Booking entity type definition with associated room, branch, and user details
export type Booking = {
  id: string;
  reference: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  checkIn: string;
  checkOut: string;
  guests: number;
  total: number;
  room: Room & { branch: Branch };
  user?: { name: string; email: string };
};