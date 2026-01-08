'use client';

import { useState, useEffect } from 'react';
import { visitApi } from '@/lib/api';
import AuthGuard from '@/components/AuthGuard';
import RoleGuard from '@/components/RoleGuard';
import Link from 'next/link';

interface Patient {
    _id: string;
    name: string;
    email: string;
    totalVisits: number;
    lastVisit?: string | null;
}

export default function DoctorPatientsPage() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const response = await visitApi.getPatients();
                if (response.data.success) {
                    setPatients(response.data.data.patients);
                }
            } catch (err) {
                console.error('Error fetching patients:', err);
                setError('Failed to load patients');
            } finally {
                setIsLoading(false);
            }
        };

        fetchPatients();
    }, []);

    const filteredPatients = patients.filter(
        (patient) =>
            patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            patient.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                                        My Patients
                                    </h1>
                                    <p className="text-slate-500 mt-1">
                                        View and manage your patient list
                                    </p>
                                </div>
                                <Link
                                    href="/doctor/appointments"
                                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold hover:from-amber-600 hover:to-orange-600 transition-all duration-200 shadow-lg shadow-amber-500/25"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    Appointments
                                </Link>
                            </div>

                            {/* Search */}
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search patients by name or email..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                />
                            </div>

                            {/* Patients Grid */}
                            {isLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : error ? (
                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
                                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <p className="text-slate-600">{error}</p>
                                </div>
                            ) : filteredPatients.length === 0 ? (
                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
                                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <p className="text-slate-500 font-medium">
                                        {searchQuery ? 'No patients found' : 'No patients yet'}
                                    </p>
                                    <p className="text-sm text-slate-400 mt-1">
                                        {searchQuery
                                            ? 'Try a different search term'
                                            : 'Accept appointment requests to add patients'}
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {filteredPatients.map((patient) => (
                                        <Link
                                            key={patient._id}
                                            href={`/doctor/patients/${patient._id}`}
                                            className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md hover:border-blue-200 transition-all group"
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0 group-hover:scale-105 transition-transform">
                                                    {patient.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="font-semibold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                                                        {patient.name}
                                                    </h3>
                                                    <p className="text-sm text-slate-500 truncate">
                                                        {patient.email}
                                                    </p>
                                                    <div className="flex items-center gap-4 mt-3">
                                                        <span className="text-sm text-slate-600 flex items-center gap-1.5">
                                                            <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                            </svg>
                                                            {patient.totalVisits} visit{patient.totalVisits !== 1 ? 's' : ''}
                                                        </span>
                                                    </div>
                                                    {patient.lastVisit && (
                                                        <p className="text-xs text-slate-400 mt-2">
                                                            Last visit: {new Date(patient.lastVisit).toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric',
                                                            })}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                                                <span className="text-sm text-blue-600 font-medium group-hover:text-blue-700">
                                                    View Timeline
                                                </span>
                                                <svg className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </RoleGuard>
        </AuthGuard>
    );
}
