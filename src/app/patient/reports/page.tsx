'use client';

import AuthGuard from '@/components/AuthGuard';
import RoleGuard from '@/components/RoleGuard';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { visitApi } from '@/lib/api';
import { Visit } from '@/types/clinical.types';

export default function PatientReportsPage() {
    const [visits, setVisits] = useState<Visit[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchVisits = async () => {
            try {
                const response = await visitApi.getVisits();
                if (response.data.success) {
                    setVisits(response.data.data.visits);
                }
            } catch (err) {
                console.error('Error fetching reports:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchVisits();
    }, []);

    return (
        <AuthGuard>
            <RoleGuard allowedRoles={['patient']}>
                <div className="min-h-screen bg-slate-50">
                    <div className="pt-20 px-4 sm:px-6 lg:px-8 pb-12">
                        <div className="max-w-4xl mx-auto">
                            {/* Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                                <div>
                                    <h1 className="text-2xl font-bold text-slate-800">My Medical Reports</h1>
                                    <p className="text-slate-500 mt-1">
                                        {visits.length} report{visits.length !== 1 ? 's' : ''} available
                                    </p>
                                </div>
                            </div>

                            {/* Reports List */}
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                {isLoading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="w-8 h-8 border-3 border-violet-600 border-t-transparent rounded-full animate-spin" />
                                    </div>
                                ) : visits.length === 0 ? (
                                    <div className="p-12 text-center">
                                        <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                        </svg>
                                        <h3 className="text-lg font-semibold text-slate-800 mb-1">No reports yet</h3>
                                        <p className="text-slate-500 mb-4">Your doctor will create reports after your visits</p>
                                        <Link
                                            href="/patient/book-appointment"
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            Book Appointment
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-100">
                                        {visits.map((visit) => (
                                            <Link
                                                key={visit._id}
                                                href={`/visit/${visit._id}`}
                                                className="flex items-center justify-between p-5 hover:bg-slate-50 transition-colors group"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
                                                        {visit.doctorName?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-800">Dr. {visit.doctorName}</p>
                                                        <p className="text-sm text-slate-500">
                                                            {new Date(visit.visitDate).toLocaleDateString('en-US', {
                                                                month: 'long',
                                                                day: 'numeric',
                                                                year: 'numeric',
                                                            })}
                                                        </p>
                                                        {visit.reason && (
                                                            <p className="text-sm text-slate-400 mt-1 line-clamp-1">{visit.reason}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs text-slate-400">
                                                        {new Date(visit.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                    </span>
                                                    <svg className="w-5 h-5 text-slate-400 group-hover:text-violet-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                </div>
            </RoleGuard>
        </AuthGuard>
    );
}
