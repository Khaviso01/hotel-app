# The Retreat Hotels & Resorts

A hotel booking application with a React guest interface, an admin dashboard, an Express API, and a PostgreSQL database.

## Tech stack

- **Frontend:** React 18, TypeScript, Vite, React Router, Redux Toolkit, Lucide.
- **Backend:** Node.js, TypeScript, Express, Zod, JWT, bcryptjs, Helmet, CORS.
- **Database:** PostgreSQL with Prisma ORM.
- **Tooling:** npm workspaces; client and server share the root install and scripts.

## Requirements

- Git
- Node.js LTS and npm
- PostgreSQL (local or hosted), with permission to create/use a database

Check your installation:

```powershell
node --version
npm --version
```

## Clone and run locally

The commands below are for PowerShell. Run them in a terminal:

1. Clone the repository and enter the project directory:

   ```powershell
   git clone https://github.com/Khaviso01/postgresql-library-management-system.git
   cd postgresql-library-management-system
   ```

2. Install dependencies from the project root:

   ```powershell
   npm install
   ```

3. Create the server environment file:

   ```powershell
   Copy-Item server\.env.example server\.env
   ```

4. Create a PostgreSQL database named `the_retreat` (or choose another name and update the connection URL):

   ```powershell
   createdb the_retreat
   ```

   If `createdb` is unavailable, create the database using your PostgreSQL client or hosting provider.

5. Edit `server\.env`. Set `DATABASE_URL` to your database connection string and replace `JWT_SECRET` with a private random value of at least 32 characters. For example, generate one with:

   ```powershell
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

   Example configuration:

   ```dotenv
   DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/the_retreat?schema=public"
   JWT_SECRET="paste-your-generated-secret-here"
   PORT=4000
   CLIENT_URL="http://localhost:5173"
   ```

   URL-encode special characters in database credentials. Do not commit `server/.env` or use the example secret outside local development.

6. This project has no checked-in Prisma migrations. Create and apply the initial migration:

   ```powershell
   npm run db:migrate -w server -- --name init
   ```

7. Start the frontend and API together:

   ```powershell
   npm run dev
   ```

8. Open the Vite URL shown in the terminal (normally `http://localhost:5173`). The API runs on `http://localhost:4000`; its health check is `http://localhost:4000/api/health` and should return `{"ok":true}`.

Keep the terminal running while you use the app. Press `Ctrl+C` to stop the development processes.

## Database and first admin

The database starts empty: there are no sample branches, rooms, or users. The declared `db:seed` command currently points to a missing seed file, so it will fail.

To populate the app, register at `/auth`, then promote your account to admin directly in PostgreSQL:

```sql
UPDATE "User"
SET role = 'ADMIN'::"Role"
WHERE email = 'you@example.com';
```

Sign out and back in to get a new token. Then use `/admin` to create branches and rooms. Registration always creates guest accounts; never grant admin access to untrusted users.

## Features and routes

- **Guest:** browse branches and rooms, register/sign in, request bookings, view bookings, submit reviews, manage favourites, and view notifications.
- **Admin:** manage branches, rooms, bookings, users, and reviews; view dashboard/reports; broadcast notifications.

Main client routes: `/`, `/branches`, `/branches/:id`, `/rooms/:id/book`, `/bookings`, `/auth`, and `/admin` (with admin subpages).

The client uses a Vite proxy for `/api` requests to `http://localhost:4000`. Booking requests start as `PENDING`; booking totals are calculated as nights × room price + 150. No payment is collected.

## API overview

All API paths are prefixed with `/api`. Authenticated requests use:

```http
Authorization: Bearer <token>
```

| Endpoints | Access | Purpose |
|---|---|---|
| `GET /health` | Public | API health check |
| `POST /auth/register`, `POST /auth/login` | Public | Create account or sign in |
| `GET /auth/me`, `PATCH /auth/me` | Signed in | Read/update current profile |
| `GET /branches`, `GET /branches/:id`, `GET /rooms` | Public | Browse branches and rooms |
| `/bookings` (`GET`, `POST`), `/bookings/:id` (`GET`, `PATCH`, `DELETE`) | Signed in | Manage own bookings |
| `/reviews`, `/favourites`, `/notifications` | Signed in | Reviews, saved branches, and notifications |
| `/admin/*` | Admin | Dashboard and hotel/user/review/notification management |

Requests with invalid data return an error; admin endpoints require an `ADMIN` role. See `server/src/routes/` for request fields and endpoint behavior.

## Commands

Run commands from the project root:

| Command | Purpose |
|---|---|
| `npm install` | Install all workspace dependencies |
| `npm run dev` | Run client and API together |
| `npm run dev -w client` | Run only the Vite client |
| `npm run dev -w server` | Run only the API |
| `npm run build` | Type-check/build client and compile server |
| `npm run db:migrate` | Apply development migrations after the initial migration |
| `npm run db:generate -w server` | Regenerate Prisma Client |
| `npm start -w server` | Start the compiled API after building |

There are currently no test or lint scripts.

## Build and deployment

Build both workspaces:

```powershell
npm run build
```

The client output is in `client/dist`; the compiled server is in `server/dist`. The API can be started after building with `npm start -w server`. The client has no production `start` script; host `client/dist` on a static web server configured for SPA route fallback. Configure production API routing, CORS (`CLIENT_URL`), secrets, and database migrations for your hosting environment. The local Vite proxy is for development only.

## Troubleshooting

- **Missing/weak `JWT_SECRET`:** Set a private value of 32 or more characters in `server/.env`.
- **Database connection or missing-table errors:** Check that PostgreSQL is running, the database exists, and the URL is correct; then run the initial migration command above.
- **No hotels displayed:** The database has no seed data. Create an admin and add branches/rooms.
- **`npm run db:seed` fails:** The seed file has not been implemented.
- **API unavailable:** Keep `npm run dev` running and check `http://localhost:4000/api/health`. The Vite proxy targets port 4000.
- **Admin API responds `403`:** Promote the account in the database, then sign out and back in.

## Project structure

```text
client/                 React application, pages, components, and Vite config
server/src/             Express app, API routes, and authentication middleware
server/prisma/          Prisma schema
package.json            Root workspace scripts
```
