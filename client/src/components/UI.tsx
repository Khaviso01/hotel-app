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