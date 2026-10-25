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