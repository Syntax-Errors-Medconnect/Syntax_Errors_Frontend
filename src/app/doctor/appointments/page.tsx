'use client';

import { useState, useEffect } from 'react';
import { appointmentApi } from '@/lib/api';
import { formatDateIST, formatTime12Hour } from '@/lib/dateUtils';
import AuthGuard from '@/components/AuthGuard';
import RoleGuard from '@/components/RoleGuard';
import Link from 'next/link';
import StartVideoCallButton from '@/components/StartVideoCallButton';

interface Appointment {
    _id: string;
    patientId: string;
    patientName: string;
    patientEmail: string;
    doctorId: string;
    doctorName: string;
    status: string;
    requestedDate: string;
    requestedTime?: string;
    message: string;
    createdAt: string;
}

export default function DoctorAppointmentsPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('pending');

    useEffect(() => {
        fetchAppointments();
    }, [filter]);

    const fetchAppointments = async () => {
        try {
            setIsLoading(true);
            const status = filter === 'all' ? undefined : filter;
            const response = await appointmentApi.getDoctorAppointments(status);
            if (response.data.success) {
                setAppointments(response.data.data.appointments);
            }
        } catch (err) {
            console.error('Error fetching appointments:', err);
            setError('Failed to load appointments');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAccept = async (id: string) => {
        setProcessingId(id);
        try {
            await appointmentApi.acceptAppointment(id);
            // Refresh list
            fetchAppointments();
        } catch (err) {
            console.error('Error accepting appointment:', err);
            setError('Failed to accept appointment');
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (id: string) => {
        setProcessingId(id);
        try {
            await appointmentApi.rejectAppointment(id);
            // Refresh list
            fetchAppointments();
        } catch (err) {
            console.error('Error rejecting appointment:', err);
            setError('Failed to reject appointment');
        } finally {
            setProcessingId(null);
        }
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            pending: 'bg-amber-100 text-amber-700',
            accepted: 'bg-emerald-100 text-emerald-700',
            rejected: 'bg-red-100 text-red-700',
        };
        return styles[status as keyof typeof styles] || 'bg-slate-100 text-slate-700';
    };

    return (
        <AuthGuard>
            <RoleGuard allowedRoles={['doctor']}>
                <div className="min-h-screen bg-slate-50">
                    <div className="pt-20 px-4 sm:px-6 lg:px-8 pb-12">
                        <div className="max-w-6xl mx-auto space-y-6">
                            {/* Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div>
                                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
                                        Appointment Requests
                                    </h1>
                                    <p className="text-slate-500 mt-1">
                                        Manage patient appointment requests
                                    </p>
                                </div>
                                <Link
                                    href="/doctor/patients"
                                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg shadow-blue-500/25"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    View Patients
                                </Link>
                            </div>

                            {/* Stats */}
                            {!isLoading && !error && appointments.length > 0 && (
                                <div className="grid grid-cols-3 gap-4">
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

                            {/* Filter Tabs */}
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-1.5 flex gap-1">
                                {(['pending', 'accepted', 'rejected', 'all'] as const).map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setFilter(tab)}
                                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === tab
                                            ? 'bg-blue-600 text-white shadow-sm'
                                            : 'text-slate-600 hover:bg-slate-100'
                                            }`}
                                    >
                                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                    </button>
                                ))}
                            </div>

                            {/* Appointments List */}
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                                {isLoading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                    </div>
                                ) : error ? (
                                    <div className="text-center py-12">
                                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <p className="text-slate-600">{error}</p>
                                    </div>
                                ) : appointments.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <p className="text-slate-500 font-medium">No {filter === 'all' ? '' : filter} appointments</p>
                                        <p className="text-sm text-slate-400 mt-1">Appointment requests will appear here</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
                                        {appointments.map((apt) => (
                                            <div
                                                key={apt._id}
                                                className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
                                            >
                                                <div className="flex items-start gap-4 mb-4">
                                                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-xl flex-shrink-0">
                                                        {apt.patientName.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-slate-800 text-lg">{apt.patientName}</h3>
                                                        <p className="text-sm text-slate-500">{apt.patientEmail}</p>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(apt.status)}`}>
                                                        {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    {formatDateIST(apt.requestedDate)}
                                                    {apt.requestedTime && (
                                                        <span className="ml-1 text-blue-600 font-medium">
                                                            at {formatTime12Hour(apt.requestedTime)}
                                                        </span>
                                                    )}
                                                </div>

                                                {apt.message && (
                                                    <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3 border border-slate-100 mb-4">
                                                        "{apt.message}"
                                                    </p>
                                                )}

                                                {apt.status === 'pending' && (
                                                    <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                                                        <button
                                                            onClick={() => handleAccept(apt._id)}
                                                            disabled={processingId === apt._id}
                                                            className="flex-1 px-4 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                                        >
                                                            {processingId === apt._id ? (
                                                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                            ) : (
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            )}
                                                            Accept
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(apt._id)}
                                                            disabled={processingId === apt._id}
                                                            className="flex-1 px-4 py-2.5 rounded-lg bg-red-100 text-red-700 text-sm font-medium hover:bg-red-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                            Reject
                                                        </button>
                                                    </div>
                                                )}

                                                {apt.status === 'accepted' && (
                                                    <div className="pt-4 border-t border-slate-100">
                                                        <StartVideoCallButton
                                                            appointmentId={apt._id}
                                                            status={apt.status}
                                                            requestedDate={apt.requestedDate}
                                                            className="w-full"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </RoleGuard>
        </AuthGuard>
    );
}
