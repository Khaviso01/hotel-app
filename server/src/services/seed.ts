
import bcrypt from 'bcryptjs';
import type { Branch, Store } from '../models/types.js';
import { photo } from '../utils/images.js';

// Define the default hotel branches for The Retreat.
// Each branch includes its location, description, image, rating, and amenities.
const branches: Branch[] = [
  {
    id: 'cape-town',
    name: 'The Retreat — Cape Town',
    city: 'Cape Town',
    address: 'Sea Point, Cape Town, South Africa',
    description: 'Coastal luxury, ocean views and memorable stays.',
    image: photo('photo-1571896349842-33c89424de2d'),
    rating: 4.8,
    amenities: ['Free WiFi', 'Pool', 'Spa', 'Restaurant', 'Gym']
  },
  {
    id: 'durban',
    name: 'The Retreat — Durban',
    city: 'Durban',
    address: 'Umhlanga, Durban, South Africa',
    description: 'A warm seaside escape with contemporary comfort.',
    image: photo('photo-1566073771259-6a8506099945'),
    rating: 4.6,
    amenities: ['Free WiFi', 'Pool', 'Breakfast', 'Parking']
  },
  {
    id: 'pretoria',
    name: 'The Retreat — Pretoria',
    city: 'Pretoria',
    address: 'Menlyn, Pretoria, South Africa',
    description: 'Elegant urban hospitality for business and leisure.',
    image: photo('photo-1542314831-068cd1dbfeeb'),
    rating: 4.5,
    amenities: ['Free WiFi', 'Restaurant', 'Gym', 'Parking']
  },
  {
    id: 'kruger',
    name: 'The Retreat — Kruger',
    city: 'Kruger',
    address: 'Hazyview, Mpumalanga, South Africa',
    description: 'Nature-inspired stays near the Kruger region.',
    image: photo('photo-1582719508461-905c673771fd'),
    rating: 4.7,
    amenities: ['Pool', 'Spa', 'Safari', 'Restaurant']
  }
];

// Define the default room images used across hotel branches.
export const roomImages = [
  photo('photo-1611892440504-42a792e24d32'),
  photo('photo-1590490360182-c33d57733427'),
  photo('photo-1566665797739-1674de7a421a'),
  photo('photo-1591088398332-8a7791972843')
];

// Define the available room types, guest capacities, and base prices.
// Room prices are stored in South African Rand (ZAR).
const types = [
  {
    name: 'Deluxe Room',
    type: 'Deluxe',
    capacity: 2,
    price: 1850
  },
  {
    name: 'Executive Room',
    type: 'Executive',
    capacity: 2,
    price: 2250
  },
  {
    name: 'Family Room',
    type: 'Family',
    capacity: 4,
    price: 2950
  },
  {
    name: 'Ocean View Suite',
    type: 'Suite',
    capacity: 2,
    price: 3450
  }
];

// Define the initial database content used when no saved data exists.
export const starter: Store = {
  // Create the default administrator account.
  // Hash the password before storing it.
  users: [
    {
      id: 'admin-1',
      name: 'Retreat Admin',
      email: 'admin@theretreat.test',
      passwordHash: bcrypt.hashSync('Admin123!', 10),
      role: 'admin'
    }
  ],

  // Add all predefined hotel branches.
  branches,

  // Generate rooms for every hotel branch.
  // Each branch receives the four predefined room types.
  rooms: branches.flatMap((b, bi) =>
    types.map((r, i) => ({
      ...r,

      // Generate a unique room ID based on the branch and room number.
      id: `${b.id}-room-${i + 1}`,

      // Associate the room with its hotel branch.
      branchId: b.id,

      // Adjust room prices according to the hotel branch.
    
      price:
        r.price +
        (bi === 1 ? -200 : bi === 2 ? -400 : bi === 3 ? 100 : 0),

      // Set all generated rooms as initially available.
      available: true,

      // Assign a room image based on its room type.
      image: roomImages[i],

      // Provide a default room description.
      description: 'Beautifully appointed room with premium amenities.'
    }))
  ),

  // Initialize empty collections for guest and admin activities.
  bookings: [],
  notices: [],
  favourites: [],
  reviews: []
};
