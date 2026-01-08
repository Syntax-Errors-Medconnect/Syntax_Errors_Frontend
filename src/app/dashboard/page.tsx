'use client';

import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { appointmentApi, visitApi } from '@/lib/api';
import Link from 'next/link';

interface Appointment {
    _id: string;
    patientId?: string;
    patientName?: string;
    patientEmail?: string;
    doctorId: string;
    doctorName: string;
    status: string;
    requestedDate: string;
    message: string;
    createdAt: string;
}

export default function DashboardPage() {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState('');
    const [pendingAppointments, setPendingAppointments] = useState<Appointment[]>([]);
    const [approvedAppointments, setApprovedAppointments] = useState<Appointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [greeting, setGreeting] = useState('');
    const [todayStr, setTodayStr] = useState('');
    const [patientCount, setPatientCount] = useState(0);

    useEffect(() => {
        if (user?.name) {
            setName(user.name);
        }
    }, [user]);

    // Set greeting and date on client side to avoid hydration mismatch
    useEffect(() => {
        const hour = new Date().getHours();
        let greetingText = 'Morning';
        if (hour >= 12 && hour < 17) greetingText = 'Afternoon';
        if (hour >= 17) greetingText = 'Evening';
        setGreeting(greetingText);

        const dateStr = new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
        setTodayStr(dateStr);
    }, []);

    useEffect(() => {
        const fetchRecentActivity = async () => {
            try {
                if (user?.role === 'doctor') {
                    const response = await appointmentApi.getDoctorAppointments();
                    if (response.data.success) {
                        const pending = response.data.data.appointments
                            .filter(a => a.status === 'pending')
                            .slice(0, 5);
                        const approved = response.data.data.appointments
                            .filter(a => a.status === 'accepted')
                            .slice(0, 5);
                        setPendingAppointments(pending);
                        setApprovedAppointments(approved);
                    }

                    // Fetch patient count for doctors
                    const patientsResponse = await visitApi.getPatients();
                    if (patientsResponse.data.success) {
                        setPatientCount(patientsResponse.data.data.patients.length);
                    }
                } else if (user?.role === 'patient') {
                    const response = await appointmentApi.getPatientAppointments();
                    if (response.data.success) {
                        const pending = response.data.data.appointments
                            .filter(a => a.status === 'pending')
                            .slice(0, 5);
                        const approved = response.data.data.appointments
                            .filter(a => a.status === 'accepted')
                            .slice(0, 5);
                        setPendingAppointments(pending);
                        setApprovedAppointments(approved);
                    }
                }
            } catch (err) {
                console.error('Error fetching activity:', err);
            } finally {
                setIsLoading(false);
            }
        };

        if (user) {
            fetchRecentActivity();
        }
    }, [user]);

    const handleSaveProfile = () => {
        // TODO: Implement profile update API
        setIsEditing(false);
    };

    return (
        <AuthGuard>
            <div className="min-h-screen bg-slate-50">
                <div className="pt-20 px-4 sm:px-6 lg:px-8 pb-12">
                    <div className="max-w-7xl mx-auto space-y-6">

                        {/* Welcome Header */}
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">
                                Good {greeting}, {user?.role === 'doctor' ? 'Dr. ' : ''}{user?.name?.split(' ')[0]}
                            </h1>
                            <p className="text-slate-500">{todayStr}</p>
                        </div>

                        {/* Statistics Cards - For Doctor and Patient only */}
                        {user?.role && user.role !== 'admin' && (
                            (user.role === 'doctor' && (patientCount > 0 || pendingAppointments.length > 0 || approvedAppointments.length > 0)) ||
                            (user.role === 'patient' && (pendingAppointments.length > 0 || approvedAppointments.length > 0))
                        ) && (
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {/* Total Patients (Doctor) / Total Appointments (Patient) */}
                                    <div className={`rounded-xl p-6 text-white shadow-lg ${user?.role === 'doctor'
                                        ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/25'
                                        : 'bg-gradient-to-br from-violet-500 to-purple-600 shadow-violet-500/25'
                                        }`}>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className={user?.role === 'doctor' ? 'text-blue-100' : 'text-violet-100'} style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                                                    {user?.role === 'doctor' ? 'Total Patients' : 'Total Appointments'}
                                                </p>
                                                <p className="text-3xl font-bold mt-2">
                                                    {user?.role === 'doctor'
                                                        ? patientCount
                                                        : pendingAppointments.length + approvedAppointments.length}
                                                </p>
                                            </div>
                                            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    {user?.role === 'doctor' ? (
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    ) : (
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    )}
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Pending Appointments */}
                                    <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl p-6 text-white shadow-lg shadow-amber-500/25">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-amber-100 text-sm font-medium">Pending</p>
                                                <p className="text-3xl font-bold mt-2">{pendingAppointments.length}</p>
                                            </div>
                                            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Approved Appointments */}
                                    <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl p-6 text-white shadow-lg shadow-emerald-500/25">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-emerald-100 text-sm font-medium">Approved</p>
                                                <p className="text-3xl font-bold mt-2">{approvedAppointments.length}</p>
                                            </div>
                                            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Profile Card - Enhanced */}
                            <div className="lg:col-span-1">
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group">
                                    <div className="relative bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 px-6 py-8 text-center overflow-hidden">
                                        {/* Animated background gradient */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                        <div className="relative z-10">
                                            <div className="w-24 h-24 mx-auto bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white text-3xl font-bold border-4 border-white/40 shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 animate-pulse">
                                                {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
                                            </div>
                                            <h2 className="text-xl font-semibold text-white mt-4 group-hover:scale-105 transition-transform duration-300">{user?.name}</h2>
                                            <span className="inline-block mt-2 px-4 py-1.5 rounded-full text-sm font-medium bg-white/30 backdrop-blur text-white shadow-lg">
                                                {user?.role === 'doctor' ? 'Doctor' : user?.role === 'admin' ? 'Admin' : 'Patient'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-6 space-y-4">
                                        {isEditing ? (
                                            <div className="space-y-3">
                                                <div>
                                                    <label className="text-sm text-slate-500">Name</label>
                                                    <input
                                                        type="text"
                                                        value={name}
                                                        onChange={(e) => setName(e.target.value)}
                                                        className="w-full mt-1 px-3 py-2 border border-slate-200 text-slate-800 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                                    />
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={handleSaveProfile}
                                                        className="flex-1 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700"
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                        onClick={() => setIsEditing(false)}
                                                        className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-200"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div>
                                                    <p className="text-sm text-slate-500">Email</p>
                                                    <p className="font-medium text-slate-800">{user?.email}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-slate-500">Member Since</p>
                                                    <p className="font-medium text-slate-800">
                                                        {user?.createdAt
                                                            ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                                                            : 'Recently joined'}
                                                    </p>
                                                </div>
                                                {user?.role === 'doctor' && user?.specialization && (
                                                    <div>
                                                        <p className="text-sm text-slate-500">Specialization</p>
                                                        <p className="font-medium text-slate-800">{user.specialization}</p>
                                                    </div>
                                                )}
                                                <button
                                                    onClick={() => setIsEditing(true)}
                                                    className="w-full py-2.5 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 hover:border-violet-300 hover:text-violet-600 flex items-center justify-center gap-2 transition-all duration-200"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                    </svg>
                                                    Edit Profile
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Recent Activity */}
                            <div className="lg:col-span-2 space-y-6">
                                {user?.role === 'admin' ? (
                                    // Admin view - show manage doctors link
                                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                                        <div className="px-5 py-4 border-b border-slate-100">
                                            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                                                <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Admin Actions
                                            </h3>
                                        </div>
                                        <div className="p-5">
                                            <Link
                                                href="/admin/doctors"
                                                className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:bg-violet-50 transition-colors group"
                                            >
                                                <div className="w-10 h-10 bg-violet-100 group-hover:bg-violet-200 rounded-lg flex items-center justify-center transition-colors">
                                                    <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-slate-800 group-hover:text-violet-700 transition-colors">Manage Doctors</p>
                                                    <p className="text-sm text-slate-500">Add, view, and manage doctor accounts</p>
                                                </div>
                                                <svg className="w-5 h-5 text-slate-400 group-hover:text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </Link>
                                        </div>
                                    </div>
                                ) : user?.role === 'patient' && (pendingAppointments.length === 0 && approvedAppointments.length === 0) ? (
                                    // Patient view with no appointments - show quick actions
                                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                                        <div className="px-5 py-4 border-b border-slate-100">
                                            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                                                <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Quick Actions
                                            </h3>
                                        </div>
                                        <div className="p-5 space-y-3">
                                            <Link
                                                href="/patient/doctors"
                                                className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:bg-violet-50 transition-colors group"
                                            >
                                                <div className="w-10 h-10 bg-violet-100 group-hover:bg-violet-200 rounded-lg flex items-center justify-center transition-colors">
                                                    <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-slate-800 group-hover:text-violet-700 transition-colors">Browse Doctors</p>
                                                    <p className="text-sm text-slate-500">Find and connect with healthcare professionals</p>
                                                </div>
                                                <svg className="w-5 h-5 text-slate-400 group-hover:text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </Link>

                                            <Link
                                                href="/patient/book-appointment"
                                                className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:bg-emerald-50 transition-colors group"
                                            >
                                                <div className="w-10 h-10 bg-emerald-100 group-hover:bg-emerald-200 rounded-lg flex items-center justify-center transition-colors">
                                                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                    </svg>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-slate-800 group-hover:text-emerald-700 transition-colors">Book Appointment</p>
                                                    <p className="text-sm text-slate-500">Schedule a visit with a doctor</p>
                                                </div>
                                                <svg className="w-5 h-5 text-slate-400 group-hover:text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </Link>
                                        </div>
                                    </div>
                                ) : (
                                    // Show recent appointments for doctors and patients with appointments
                                    <>
                                        {/* Pending Appointments */}
                                        {pendingAppointments.length > 0 && (
                                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                                                <div className="px-5 py-4 border-b border-slate-100">
                                                    <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                                                        <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        Pending Appointments
                                                    </h3>
                                                </div>
                                                <div className="divide-y divide-slate-100">
                                                    {pendingAppointments.map((apt) => (
                                                        <div key={apt._id} className="px-5 py-4 hover:bg-slate-50 transition-colors">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                                                                    {user?.role === 'doctor'
                                                                        ? apt.patientName?.charAt(0).toUpperCase()
                                                                        : apt.doctorName?.charAt(0).toUpperCase()}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="font-medium text-slate-800 truncate">
                                                                        {user?.role === 'doctor' ? apt.patientName : `Dr. ${apt.doctorName}`}
                                                                    </p>
                                                                    <p className="text-sm text-slate-500">
                                                                        {new Date(apt.requestedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                                    </p>
                                                                </div>
                                                                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                                                                    Pending
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100">
                                                    <Link
                                                        href={user?.role === 'doctor' ? '/doctor/appointments' : '/patient/appointments'}
                                                        className="text-sm text-violet-600 hover:text-violet-700 font-medium flex items-center gap-1"
                                                    >
                                                        View all
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </Link>
                                                </div>
                                            </div>
                                        )}

                                        {/* Approved Appointments */}
                                        {approvedAppointments.length > 0 && (
                                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                                                <div className="px-5 py-4 border-b border-slate-100">
                                                    <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                                                        <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        Approved Appointments
                                                    </h3>
                                                </div>
                                                <div className="divide-y divide-slate-100">
                                                    {approvedAppointments.map((apt) => (
                                                        <div key={apt._id} className="px-5 py-4 hover:bg-slate-50 transition-colors">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                                                                    {user?.role === 'doctor'
                                                                        ? apt.patientName?.charAt(0).toUpperCase()
                                                                        : apt.doctorName?.charAt(0).toUpperCase()}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="font-medium text-slate-800 truncate">
                                                                        {user?.role === 'doctor' ? apt.patientName : `Dr. ${apt.doctorName}`}
                                                                    </p>
                                                                    <p className="text-sm text-slate-500">
                                                                        {new Date(apt.requestedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                                    </p>
                                                                </div>
                                                                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                                                                    Approved
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100">
                                                    <Link
                                                        href={user?.role === 'doctor' ? '/doctor/appointments' : '/patient/appointments'}
                                                        className="text-sm text-violet-600 hover:text-violet-700 font-medium flex items-center gap-1"
                                                    >
                                                        View all
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </Link>
                                                </div>
                                            </div>
                                        )}

                                        {/* Empty State - For doctors with no appointments */}
                                        {user?.role === 'doctor' && pendingAppointments.length === 0 && approvedAppointments.length === 0 && (
                                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                                                <div className="px-8 py-12 text-center">
                                                    <div className="w-20 h-20 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                                        <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                    <h3 className="text-lg font-semibold text-slate-800 mb-2">No Appointments Yet</h3>
                                                    <p className="text-slate-500 mb-6 max-w-md mx-auto">
                                                        You don't have any appointments at the moment. Patients can book appointments with you, and they'll appear here.
                                                    </p>
                                                    <Link
                                                        href="/doctor/appointments"
                                                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-sm"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        View Appointments
                                                    </Link>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthGuard>
    );
}
