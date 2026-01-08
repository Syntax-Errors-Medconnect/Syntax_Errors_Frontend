'use client';

import { useState, useEffect, use } from 'react';
import { visitApi } from '@/lib/api';
import AuthGuard from '@/components/AuthGuard';
import RoleGuard from '@/components/RoleGuard';
import Link from 'next/link';

interface Visit {
    _id: string;
    patientId: string;
    patientName: string;
    doctorId: string;
    doctorName: string;
    visitDate: string;
    visitTime?: string;
    reason?: string;
    diagnosis?: string;
    solution?: string;
    medicinePrescribed?: string;
    fullSummary?: string;
    summary?: string;
    createdAt: string;
    updatedAt: string;
}

interface PatientInfo {
    name: string;
    email: string;
}

export default function PatientTimelinePage({
    params,
}: {
    params: Promise<{ patientId: string }>;
}) {
    const resolvedParams = use(params);
    const [visits, setVisits] = useState<Visit[]>([]);
    const [patientInfo, setPatientInfo] = useState<PatientInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPatientVisits = async () => {
            try {
                const response = await visitApi.getPatientVisits(resolvedParams.patientId);
                if (response.data.success) {
                    setVisits(response.data.data.visits);
                    // Get patient info from first visit if available
                    if (response.data.data.visits.length > 0) {
                        setPatientInfo({
                            name: response.data.data.visits[0].patientName,
                            email: '', // Not included in visit data
                        });
                    }
                }
            } catch (err) {
                console.error('Error fetching patient visits:', err);
                setError('Failed to load patient timeline');
            } finally {
                setIsLoading(false);
            }
        };

        fetchPatientVisits();
    }, [resolvedParams.patientId]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <AuthGuard>
            <RoleGuard allowedRoles={['doctor']}>
                <div className="min-h-screen bg-slate-50">
                    <div className="pt-20 px-4 sm:px-6 lg:px-8 pb-12">
                        <div className="max-w-4xl mx-auto space-y-6">
                            {/* Back Button */}
                            <Link
                                href="/doctor/patients"
                                className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Back to Patients
                            </Link>

                            {/* Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                                        {patientInfo?.name?.charAt(0).toUpperCase() || 'P'}
                                    </div>
                                    <div>
                                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
                                            {patientInfo?.name || 'Patient'} Timeline
                                        </h1>
                                        <p className="text-slate-500 mt-1">
                                            {visits.length} visit{visits.length !== 1 ? 's' : ''} recorded
                                        </p>
                                    </div>
                                </div>
                                <Link
                                    href={`/create-visit?patientId=${resolvedParams.patientId}`}
                                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 shadow-lg shadow-emerald-500/25"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Add Visit Summary
                                </Link>
                            </div>

                            {/* Timeline */}
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
                            ) : visits.length === 0 ? (
                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
                                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                    </div>
                                    <p className="text-slate-500 font-medium">No visits recorded yet</p>
                                    <p className="text-sm text-slate-400 mt-1">
                                        Create the first visit summary for this patient
                                    </p>
                                </div>
                            ) : (
                                <div className="relative">
                                    {/* Timeline Line */}
                                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-indigo-500 to-purple-500" />

                                    <div className="space-y-6">
                                        {visits.map((visit, index) => (
                                            <div key={visit._id} className="relative pl-16">
                                                {/* Timeline Dot */}
                                                <div className="absolute left-4 -translate-x-1/2 w-5 h-5 rounded-full bg-white border-4 border-blue-500 shadow-sm" />

                                                <Link
                                                    href={`/visit/${visit._id}`}
                                                    className="block bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md hover:border-blue-200 transition-all group"
                                                >
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
                                                                    Visit #{visits.length - index}
                                                                </span>
                                                                <span className="text-sm text-slate-500">
                                                                    {formatDate(visit.visitDate)}
                                                                </span>
                                                            </div>
                                                            <p className="text-slate-700 line-clamp-3">
                                                                {visit.reason || visit.fullSummary || visit.summary || 'No details available'}
                                                            </p>
                                                        </div>
                                                        <svg className="w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </div>
                                                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-4 text-sm text-slate-500">
                                                        <span className="flex items-center gap-1.5">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            Created {new Date(visit.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                        </span>
                                                    </div>
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </RoleGuard>
        </AuthGuard>
    );
}
