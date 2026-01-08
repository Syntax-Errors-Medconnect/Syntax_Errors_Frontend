'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';

export default function Navbar() {
    const { user, isAuthenticated, logout, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close sidebar when route changes
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [pathname]);

    // Prevent body scroll when sidebar is open
    useEffect(() => {
        if (isSidebarOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isSidebarOpen]);

    // Hide navbar on auth pages and landing page
    const authRoutes = ['/login', '/register', '/'];
    if (authRoutes.includes(pathname)) {
        return null;
    }

    const handleLogout = async () => {
        setIsDropdownOpen(false);
        setIsSidebarOpen(false);
        await logout();
        router.push('/login');
    };

    // Get user initials for avatar
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Navigation items based on role
    const getNavItems = () => {
        if (user?.role === 'doctor') {
            return [
                { href: '/dashboard', label: 'Dashboard', icon: 'home' },
                { href: '/doctor/appointments', label: 'Appointments', icon: 'calendar' },
                { href: '/doctor/reports', label: 'Reports', icon: 'document' },
                { href: '/doctor/patients', label: 'Patients', icon: 'users' },
                { href: '/doctor/chat', label: 'Chat', icon: 'chat' },
            ];
        } else if (user?.role === 'patient') {
            return [
                { href: '/dashboard', label: 'Dashboard', icon: 'home' },
                { href: '/patient/doctors', label: 'Doctors', icon: 'users' },
                { href: '/patient/appointments', label: 'My Appointments', icon: 'calendar' },
                { href: '/patient/book-appointment', label: 'Book Appointment', icon: 'plus' },
                { href: '/patient/reports', label: 'My Reports', icon: 'document' },
                { href: '/patient/chat', label: 'Chat', icon: 'chat' },
            ];
        } else if (user?.role === 'admin') {
            return [
                { href: '/admin/doctors', label: 'Manage Doctors', icon: 'users' },
            ];
        }
        return [];
    };

    const getIcon = (iconName: string) => {
        switch (iconName) {
            case 'home':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                );
            case 'calendar':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                );
            case 'document':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                );
            case 'users':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                );
            case 'chat':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                );
            case 'plus':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                );
            default:
                return null;
        }
    };

    const navItems = getNavItems();

    return (
        <>
            {/* Top Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        {/* Mobile Menu Button + Logo */}
                        <div className="flex items-center gap-3">
                            {/* Mobile menu button */}
                            {isAuthenticated && (
                                <button
                                    onClick={() => setIsSidebarOpen(true)}
                                    className="sm:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
                                >
                                    <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                </button>
                            )}

                            {/* Logo */}
                            <Link href="/" className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                </div>
                                <span className="text-xl font-bold text-slate-800">MedConnect</span>
                            </Link>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden sm:flex items-center gap-1">
                            {isAuthenticated && navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${pathname === item.href || pathname.startsWith(item.href + '/')
                                        ? 'bg-violet-50 text-violet-700'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                        }`}
                                >
                                    {getIcon(item.icon)}
                                    {item.label}
                                </Link>
                            ))}
                        </div>

                        {/* Right side */}
                        <div className="flex items-center gap-4">
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
                            ) : isAuthenticated ? (
                                <>
                                    {/* Profile Dropdown */}
                                    <div className="relative" ref={dropdownRef}>
                                        <button
                                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                            className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
                                        >
                                            <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                                                {user?.name ? getInitials(user.name) : 'U'}
                                            </div>
                                            <svg
                                                className={`w-4 h-4 text-slate-500 transition-transform hidden sm:block ${isDropdownOpen ? 'rotate-180' : ''}`}
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>

                                        {/* Dropdown Menu */}
                                        {isDropdownOpen && (
                                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                                                {user?.role === 'patient' && (
                                                    <>
                                                        <Link
                                                            href="/medical-history"
                                                            onClick={() => setIsDropdownOpen(false)}
                                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                                        >
                                                            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                            </svg>
                                                            Medical History
                                                        </Link>
                                                        <div className="border-t border-slate-100 my-1"></div>
                                                    </>
                                                )}
                                                <button
                                                    onClick={handleLogout}
                                                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                    </svg>
                                                    Sign out
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        className="text-slate-600 hover:text-slate-900 font-medium text-sm transition-colors"
                                    >
                                        Sign in
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors shadow-sm"
                                    >
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-50 sm:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <div
                className={`fixed top-0 left-0 bottom-0 w-72 bg-white z-50 transform transition-transform duration-300 ease-in-out sm:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {/* Sidebar Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <span className="text-lg font-bold text-slate-800">MedConnect</span>
                    </div>
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                        <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>



                {/* Navigation Links */}
                <div className="flex-1 overflow-y-auto p-4">
                    <nav className="space-y-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${pathname === item.href || pathname.startsWith(item.href + '/')
                                    ? 'bg-violet-100 text-violet-700'
                                    : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                            >
                                {getIcon(item.icon)}
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* Sidebar Footer */}
                <div className="border-t border-slate-200">
                    <div className="p-4">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 font-medium transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Sign out
                        </button>
                    </div>
                    {/* User Info at very bottom */}
                    {user && (
                        <div className="p-4 bg-slate-50 border-t border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                    {user.name ? getInitials(user.name) : 'U'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-slate-800 truncate text-sm">{user.name}</p>
                                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                                </div>
                                <span className="px-2 py-0.5 bg-violet-100 text-violet-700 text-xs font-medium rounded-full capitalize">
                                    {user.role}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
