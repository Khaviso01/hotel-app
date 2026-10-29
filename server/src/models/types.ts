// Define user account structure including authentication credentials and role permissions.
export type User = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'guest' | 'admin';
};

// Define hotel branch details including location, imagery, and available amenities.
export type Branch = {
  id: string;
  name: string;
  city: string;
  address: string;
  description: string;
  image: string;
  rating: number;
  amenities: string[];
};

// Define individual hotel room specifications, pricing, and availability status.
export type Room = {
  id: string;
  branchId: string;
  name: string;
  type: string;
  capacity: number;
  price: number;
  available: boolean;
  image: string;
  description: string;
};

// Define guest booking records with stay dates, guest counts, and approval status.
export type Booking = {
  id: string;
  userId: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  total: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
};

// Define notification messages sent to guests regarding reservations and updates.
export type Notice = {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
};

// Define the root in-memory database store schema containing all core collections.
export type Store = {
  users: User[];
  branches: Branch[];
  rooms: Room[];
  bookings: Booking[];
  notices: Notice[];
  favourites: { userId: string; branchId: string }[];
  reviews: { id: string; userId: string; branchId: string; rating: number; text: string }[];
};