# The Retreat Hotel App — modular refactor

This project is a **work-in-progress reconstruction** from the uploaded archive. The archive contained an empty Guest.tsx and did not contain client/server package.json, entrypoint, store, or stylesheet. The Admin components were split from the original Admin.tsx with their logic preserved; the guest components and missing scaffolding were added.

## Start

1. Run `npm install` from the root (this updates the root lockfile).
2. Copy `server/.env.example` to `server/.env` and set your own database credentials and JWT secret.
3. Run `npm run db:migrate`.
4. Run `npm run dev`.

**Important:** The application has not been fully runtime-tested here; payment integration, OAuth, and production-ready admin route protection are not implemented. Do not use it for real customer bookings or payments without further work. The original ZIP contained `.git`, `node_modules`, and `server/.env`; these were deliberately excluded from this ZIP for security and size. If real secrets were ever committed, rotate them.
