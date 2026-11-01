# The Retreat Hotels & Resorts

A full-stack hotel booking demo featuring a React guest website, an admin dashboard, and a Node.js/Express API. The project uses TypeScript on both sides and saves development data in a local JSON file.

# Preview

<img src="client/assets/the-retreat-preview.png" alt="Alt text" width="500">

## Tech stack

| Area | Technologies |
| --- | --- |
| Frontend | React 18, TypeScript, Vite, React Router, Context API, CSS, Lucide React |
| Backend | Node.js, Express, TypeScript, Zod, JWT, bcryptjs, CORS, dotenv |
| Storage | Local `data.json` file, initialized from `server/src/services/seed.ts` |
| Tooling | npm, tsx, TypeScript, concurrently |

> This version does **not** use PostgreSQL, Prisma, Redux Toolkit, OAuth, or live payment processing.

## Requirements

- Node.js 20 or later and npm
- Git (only if cloning from a repository)

Check your installation:

```powershell
node --version
npm --version
```

## Run locally

1. Download/extract the project, or clone **your actual The Retreat repository** and open its root folder.
2. Install dependencies from the project root:

   ```powershell
   npm install
   npm run install:all
   ```

3. Create the server environment file:

   ```powershell
   Copy-Item server\.env.example server\.env
   ```

4. Edit `server/.env` and replace the example JWT secret. Generate a random value with:

   ```powershell
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

   The environment file contains these settings:

   ```dotenv
   PORT=4000
   JWT_SECRET=replace-with-a-long-random-secret
   CLIENT_URL=http://localhost:5173
   ```

5. Start the frontend and backend together:

   ```powershell
   npm run dev
   ```

6. Open the application:

   | Page/service | URL |
   | --- | --- |
   | Guest website | http://localhost:5173 |
   | Admin dashboard | http://localhost:5173/admin |
   | API health check | http://localhost:4000/api/health |

Press `Ctrl+C` in the terminal to stop the development servers.

## Features

### Guest website

- Browse hotel branches and rooms with photographs, descriptions, amenities, and prices.
- Filter rooms by branch and guest capacity.
- Register, sign in, and view the authenticated account.
- Create booking requests, view booking history and details, and cancel bookings.
- Save and remove favourite hotel branches.
- View and submit reviews.
- Read notifications and mark them as read.

### Admin dashboard

- View booking, revenue, branch, room, user, and occupancy statistics.
- Create, edit, and delete rooms.
- Create and edit hotel branches.
- View bookings and update booking statuses.
- View registered users and reviews.
- Send notifications to one user or all guest accounts.
- Access reports and settings interfaces; not every setting has a dedicated backend operation.

## Booking rules

Bookings require authentication. The backend checks that the selected room exists and is available, the check-out date follows check-in, guest count fits room capacity, and the requested dates do not overlap an existing non-cancelled booking.

```text
Total (ZAR) = room price per night × number of nights + R150 service fee
```

New bookings start as `pending`. Admins can set `pending`, `confirmed`, or `cancelled`; guests can cancel their own bookings. **No payment is collected.**

## Starter data and admin access

On the first run, `server/src/services/database.ts` creates `data.json` from `server/src/services/seed.ts` if the file does not already exist.

The starter data includes four branches—Cape Town, Durban, Pretoria, and Kruger—and four room types per branch (16 rooms total).

**Development-only admin account:**

```text
Email:    admin@theretreat.test
Password: Admin123!
```

Do not deploy with these credentials. New registrations receive the `guest` role. Existing `data.json` records are retained on restart; editing `seed.ts` does not overwrite them.

## API overview

All routes are prefixed with `/api`. Protected requests use `Authorization: Bearer <token>`.

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/api/health` | Public | Health check |
| POST | `/api/auth/register` | Public | Register guest |
| POST | `/api/auth/login` | Public | Sign in |
| GET | `/api/auth/me` | Authenticated | Current user |
| GET | `/api/branches` | Public | All branches |
| GET | `/api/branches/:id` | Public | Branch details |
| GET | `/api/rooms` | Public | Rooms; optional `branchId` and `guests` filters |
| GET | `/api/rooms/:id` | Public | Room details |
| POST | `/api/bookings` | Authenticated | Create booking |
| GET | `/api/bookings` | Authenticated | Own bookings; all for admin |
| GET | `/api/bookings/:id` | Authenticated | Accessible booking details |
| PATCH | `/api/bookings/:id` | Authenticated | Change permitted booking status |
| GET | `/api/favourites` | Authenticated | Favourite branches |
| POST | `/api/favourites/:branchId` | Authenticated | Add favourite |
| DELETE | `/api/favourites/:branchId` | Authenticated | Remove favourite |
| GET | `/api/reviews` | Public | List reviews |
| POST | `/api/reviews` | Authenticated | Submit review |
| GET | `/api/notifications` | Authenticated | Own notifications |
| PATCH | `/api/notifications/:id/read` | Authenticated | Mark as read |
| GET | `/api/admin/stats` | Admin | Dashboard statistics |
| GET | `/api/admin/users` | Admin | Registered users |
| POST | `/api/admin/rooms` | Admin | Add room |
| PATCH | `/api/admin/rooms/:id` | Admin | Edit room |
| DELETE | `/api/admin/rooms/:id` | Admin | Delete room |
| POST | `/api/admin/branches` | Admin | Add branch |
| PATCH | `/api/admin/branches/:id` | Admin | Edit branch |
| POST | `/api/admin/notifications` | Admin | Send notifications |

See `server/src/routes/` for request schemas and authorization details.

## Project structure

```text
the-retreat-hotel/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/
│   │   │   ├── guest/
│   │   │   └── shared/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── style.css
│   ├── package.json
│   └── vite.config.ts
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── index.ts
│   ├── .env.example
│   └── package.json
├── package.json
└── README.md
```

## Commands

| Run from project root | Description |
| --- | --- |
| `npm install` | Install root dependencies |
| `npm run install:all` | Install client and server dependencies |
| `npm run dev` | Run both development servers |
| `npm run build` | Build client and server |

To run one service individually:

```powershell
npm run dev --prefix client
npm run dev --prefix server
```

To start the compiled API after building:

```powershell
npm start --prefix server
```

The frontend builds into `client/dist` and the backend into `server/dist`. The Vite `/api` proxy targets port 4000 during local development; configure API routing separately for production hosting.

## Troubleshooting

- **Frontend cannot reach API:** Check that the backend is running on port 4000 and the Vite proxy configuration is unchanged.
- **Admin login fails:** Confirm the credentials and check whether an existing `data.json` has different users.
- **Hotels or rooms missing:** Check the saved `data.json`; starter data is used only when the file is first created.
- **JWT/authentication errors:** Verify `server/.env`, restart the API, and sign in again.
- **Port already in use:** Stop the other process or update the relevant port configuration.
- **Dependency or build errors:** Install dependencies in both `client` and `server`, then review the terminal output.

## License

No license has been specified for this project.
