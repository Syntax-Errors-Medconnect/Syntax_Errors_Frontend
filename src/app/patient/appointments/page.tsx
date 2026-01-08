'use client';

import AuthGuard from '@/components/AuthGuard';
import { useState, useEffect } from 'react';
import { appointmentApi } from '@/lib/api';
import Link from 'next/link';

interface Appointment {
    _id: string;
    doctorId: string;
    doctorName: string;
    status: string;
    requestedDate: string;
    message: string;
    createdAt: string;
}

export default function MyAppointmentsPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const response = await appointmentApi.getPatientAppointments();
                if (response.data.success && response.data.data.appointments) {
                    setAppointments(response.data.data.appointments);
                }
            } catch (err) {
                console.error('Error fetching appointments:', err);
                setError('Unable to load appointments. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchAppointments();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'accepted': return 'bg-green-100 text-green-700';
            case 'rejected': return 'bg-red-100 text-red-700';
            case 'pending': return 'bg-amber-100 text-amber-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'accepted':
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                );
            case 'rejected':
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
        }
    };

    return (
        <AuthGuard>
            <div className="min-h-screen bg-slate-50">
                <div className="pt-20 px-4 sm:px-6 lg:px-8 pb-12">
                    <div className="max-w-4xl mx-auto">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-800">My Appointments</h1>
                                <p className="text-slate-500 mt-1">View and track your appointment requests</p>
                            </div>
                            <Link
                                href="/patient/book-appointment"
                                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 text-white font-medium hover:bg-violet-700 transition-colors shadow-md"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Book New
                            </Link>
                        </div>

                        {/* Appointments List */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="w-8 h-8 border-3 border-violet-600 border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : error ? (
                                <div className="p-8 text-center">
                                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    </div>
                                    <p className="text-slate-600 mb-4">{error}</p>
                                    <Link
                                        href="/patient/book-appointment"
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700"
                                    >
                                        Book an Appointment
                                    </Link>
                                </div>
                            ) : appointments.length === 0 ? (
                                <div className="p-12 text-center">
                                    <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <h3 className="text-lg font-semibold text-slate-800 mb-1">No appointments yet</h3>
                                    <p className="text-slate-500 mb-4">Book your first appointment to get started</p>
                                    <Link
                                        href="/patient/book-appointment"
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Book Appointment
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                                    {appointments.map((appointment) => (
                                        <div
                                            key={appointment._id}
                                            className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
                                        >
                                            <div className="flex flex-col items-center text-center">
                                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4">
                                                    {appointment.doctorName?.charAt(0).toUpperCase() || 'D'}
                                                </div>
                                                <h3 className="font-semibold text-lg text-slate-800 mb-2">Dr. {appointment.doctorName}</h3>
                                                <p className="text-sm text-slate-500 mb-3">
                                                    {new Date(appointment.requestedDate).toLocaleDateString('en-US', {
                                                        weekday: 'short',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        year: 'numeric',
                                                    })}
                                                </p>

                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium capitalize mb-4 ${getStatusColor(appointment.status)}`}>
                                                    {getStatusIcon(appointment.status)}
                                                    {appointment.status}
                                                </span>

                                                {appointment.message && (
                                                    <p className="text-xs text-slate-600 bg-slate-50 rounded-lg p-3 border border-slate-100 w-full line-clamp-2">
                                                        {appointment.message}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Stats */}
                        {!isLoading && !error && appointments.length > 0 && (
                            <div className="mt-6 grid grid-cols-3 gap-4">
                                <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
                                    <p className="text-2xl font-bold text-amber-600">
                                        {appointments.filter(a => a.status === 'pending').length}
                                    </p>
                                    <p className="text-sm text-slate-500">Pending</p>
                                </div>
                                <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
                                    <p className="text-2xl font-bold text-green-600">
                                        {appointments.filter(a => a.status === 'accepted').length}
                                    </p>
                                    <p className="text-sm text-slate-500">Accepted</p>
                                </div>
                                <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
                                    <p className="text-2xl font-bold text-red-600">
                                        {appointments.filter(a => a.status === 'rejected').length}
                                    </p>
                                    <p className="text-sm text-slate-500">Rejected</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthGuard>
    );
}
