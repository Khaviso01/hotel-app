import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { GuestLayout, AdminLayout, Toast } from './components/UI';
import { Home, Branches, BranchDetails, ReserveRoom, MyBookings } from './pages/Guest';
import {
  Dashboard,
  AdminRooms,
  RoomForm,
  AdminBookings,
  AdminBranches,
  BranchForm,
  AdminUsers,
  AdminReviews,
  AdminNotifications,
  Reports,
  Settings,
} from './pages/Admin';
import { AuthPage } from './pages/Auth';
import './style.css';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <Toast />
        <Routes>
          {/* Guest Portal Routes */}
          <Route path="/" element={<GuestLayout><Home /></GuestLayout>} />
          <Route path="/branches" element={<GuestLayout><Branches /></GuestLayout>} />
          <Route path="/branches/:id" element={<GuestLayout><BranchDetails /></GuestLayout>} />
          <Route path="/rooms/:id/book" element={<GuestLayout><ReserveRoom /></GuestLayout>} />
          <Route path="/bookings" element={<GuestLayout><MyBookings /></GuestLayout>} />
          <Route path="/auth" element={<GuestLayout><AuthPage /></GuestLayout>} />

          {/* Admin Dashboard Routes */}
          {[
            ['/admin', <Dashboard />],
            ['/admin/rooms', <AdminRooms />],
            ['/admin/rooms/new', <RoomForm />],
            ['/admin/rooms/:id/edit', <RoomForm />],
            ['/admin/bookings', <AdminBookings />],
            ['/admin/branches', <AdminBranches />],
            ['/admin/branches/new', <BranchForm />],
            ['/admin/branches/:id/edit', <BranchForm />],
            ['/admin/users', <AdminUsers />],
            ['/admin/reviews', <AdminReviews />],
            ['/admin/notifications', <AdminNotifications />],
            ['/admin/reports', <Reports />],
            ['/admin/settings', <Settings />],
          ].map(([path, element]) => (
            <Route
              key={path as string}
              path={path as string}
              element={<AdminLayout>{element}</AdminLayout>}
            />
          ))}

          {/* Fallback Catch-All Route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);