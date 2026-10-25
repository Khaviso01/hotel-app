import { useEffect, useState, type ReactNode } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Heart, Home, CalendarDays, UserRound, LogOut, Menu, X, Bell, ShieldCheck } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import { hideToast, setUser } from '../store';

    //  Brand Logo component with optional light theme styling for dark backgrounds.
    export function Logo({ light = false }: { light?: boolean }) {
    return (
        <Link to="/" className={'logo ' + (light ? 'logo-light' : '')}>
        The Retreat<small>HOTELS & RESORTS</small>
        </Link>
    );
    }

    // Reusable Button component supporting primary, outline, and danger variants.
export function Button({
  children,
  onClick,
  variant = 'primary',
  type = 'button',
  disabled = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'outline' | 'danger';
  type?: 'button' | 'submit';
  disabled?: boolean;
}) {
  return (
    <button className={'btn btn-' + variant} onClick={onClick} type={type} disabled={disabled}>
      {children}
    </button>
  );
}

// Modal Dialog component with keyboard escape listener and backdrop click-to-close handling.
export function Modal({
  title,
  children,
  onClose,
  actions,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  actions?: ReactNode;
}) {
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  }, [onClose]);

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section className="modal" role="dialog" aria-modal="true" aria-label={title}>
        <button className="icon-button close" onClick={onClose} aria-label="Close">
          <X size={19} />
        </button>
        <h2>{title}</h2>
        <div>{children}</div>
        <div className="modal-actions">{actions}</div>
      </section>
    </div>
  );
}

// Toast notification banner that auto-dismisses after 4 seconds or via manual close.
export function Toast() {
  const toast = useSelector((s: RootState) => s.toast);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!toast.message) return;
    const timer = setTimeout(() => dispatch(hideToast()), 4000);
    return () => clearTimeout(timer);
  }, [toast.message, dispatch]);

  return toast.message ? (
    <div className={'toast ' + toast.kind} role="status">
      {toast.message}
      <button onClick={() => dispatch(hideToast())} aria-label="Dismiss">
        <X size={16} />
      </button>
    </div>
  ) : null;
}

// Site Header component with responsive mobile navigation and authentication state links
export function Header() {
  const user = useSelector((s: RootState) => s.auth.user);
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Logo />
        <button
          className="icon-button mobile-menu"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X /> : <Menu />}
        </button>
        <nav className={open ? 'nav open' : 'nav'} onClick={() => setOpen(false)}>
          <NavLink to="/">Home</NavLink>
          <NavLink to="/branches">Our Branches</NavLink>
          <NavLink to="/bookings">My Bookings</NavLink>
          <NavLink to="/favourites">Favourites</NavLink>
          <NavLink to="/notifications">
            <Bell size={18} /> Notifications
          </NavLink>
          {user?.role === 'ADMIN' && (
            <NavLink to="/admin">
              <ShieldCheck size={18} /> Admin
            </NavLink>
          )}
          <NavLink to={user ? '/profile' : '/auth'}>
            <UserRound size={18} />
            {user ? 'Profile' : 'Sign In'}
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

// Bottom navigation bar for mobile viewports.
export function MobileNav() {
  return (
    <nav className="bottom-nav">
      <NavLink to="/">
        <Home />
        <span>Home</span>
      </NavLink>
      <NavLink to="/bookings">
        <CalendarDays />
        <span>Bookings</span>
      </NavLink>
      <NavLink to="/favourites">
        <Heart />
        <span>Favourites</span>
      </NavLink>
      <NavLink to="/profile">
        <UserRound />
        <span>Profile</span>
      </NavLink>
    </nav>
  );
}

// Standard layout wrapper for guest-facing pages.
export function GuestLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <MobileNav />
      <footer className="footer">
        <div className="container">
          <Logo light />
          <p>Where comfort meets nature. © {new Date().getFullYear()} The Retreat.</p>
        </div>
      </footer>
    </>
  );
}

// Administrative dashboard layout wrapper with collapsible sidebar and navigation links.
export function AdminLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);

  const links = [
    ['/admin', 'Dashboard'],
    ['/admin/rooms', 'Manage Rooms'],
    ['/admin/bookings', 'Manage Bookings'],
    ['/admin/branches', 'Manage Branches'],
    ['/admin/users', 'Users'],
    ['/admin/reviews', 'Reviews'],
    ['/admin/notifications', 'Notifications'],
    ['/admin/reports', 'Reports'],
    ['/admin/settings', 'Settings'],
  ];

  return (
    <div className="admin-shell">
      <aside className={'admin-sidebar ' + (open ? 'open' : '')}>
        <Logo light />
        {links.map(([url, name]) => (
          <NavLink
            end={url === '/admin'}
            key={url}
            to={url}
            onClick={() => setOpen(false)}
          >
            {name}
          </NavLink>
        ))}
        <button
          onClick={() => {
            localStorage.removeItem('retreat_token');
            dispatch(setUser(null));
            navigate('/auth');
          }}
        >
          <LogOut size={17} /> Sign Out
        </button>
      </aside>
      <div className="admin-main">
        <header className="admin-top">
          <button
            className="icon-button"
            onClick={() => setOpen(!open)}
            aria-label="Toggle sidebar"
          >
            <Menu />
          </button>
          <span>Administration</span>
          <Link to="/">Guest App ↗</Link>
        </header>
        <div className="admin-content">{children}</div>
      </div>
    </div>
  );
}
