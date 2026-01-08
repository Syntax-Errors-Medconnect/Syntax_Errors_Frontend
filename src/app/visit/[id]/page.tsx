'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import { visitApi } from '@/lib/api';
import { Visit } from '@/types/clinical.types';
import Link from 'next/link';

export default function VisitDetailPage() {
    const params = useParams();
    const visitId = params.id as string;

    const [visit, setVisit] = useState<Visit | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchVisit = async () => {
            try {
                const response = await visitApi.getVisitById(visitId);
                if (response.data.success) {
                    setVisit(response.data.data.visit);
                }
            } catch (err) {
                console.error('Error fetching report:', err);
                setError('Failed to load patient report');
            } finally {
                setIsLoading(false);
            }
        };

        if (visitId) {
            fetchVisit();
        }
    }, [visitId]);

    if (isLoading) {
        return (
            <AuthGuard>
                <div className="min-h-screen flex items-center justify-center bg-slate-50">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
                        <p className="text-slate-500">Loading patient report...</p>
                    </div>
                </div>
            </AuthGuard>
        );
    }

    if (error || !visit) {
        return (
            <AuthGuard>
                <div className="min-h-screen bg-slate-50">
                    <div className="pt-20 px-4 sm:px-6 lg:px-8 pb-12">
                        <div className="max-w-3xl mx-auto">
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h2 className="text-xl font-semibold text-slate-800 mb-2">
                                    {error || 'Report Not Found'}
                                </h2>
                                <p className="text-slate-500 mb-6">
                                    The patient report you&apos;re looking for could not be loaded.
                                </p>
                                <Link
                                    href="/dashboard"
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 text-white font-medium hover:bg-slate-700 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                    Back to Dashboard
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </AuthGuard>
        );
    }

    return (
        <AuthGuard>
            <div className="min-h-screen bg-slate-50">
                <div className="pt-20 px-4 sm:px-6 lg:px-8 pb-12">
                    <div className="max-w-3xl mx-auto">
                        {/* Back Button */}
                        <Link
                            href="/doctor/reports"
                            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-6 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Reports
                        </Link>

                        {/* Report Card */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                            {/* Header */}
                            <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-violet-50 to-fuchsia-50 rounded-t-xl">
                                <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                    <svg className="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Patient Report
                                </h1>
                            </div>

                            {/* Report Details */}
                            <div className="p-6 space-y-6">
                                {/* Patient and Doctor Info */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                                        <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-500">Patient</p>
                                            <p className="font-semibold text-slate-800">{visit.patientName}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-500">Doctor</p>
                                            <p className="font-semibold text-slate-800">Dr. {visit.doctorName}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Date and Time */}
                                <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">Visit Date & Time</p>
                                        <p className="font-semibold text-slate-800">
                                            {new Date(visit.visitDate).toLocaleDateString('en-US', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                            {visit.visitTime && ` at ${visit.visitTime}`}
                                        </p>
                                    </div>
                                </div>

                                {/* Reason for Visit */}
                                {visit.reason && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                                            <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Reason for Visit
                                        </h3>
                                        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                                            <p className="text-slate-700 whitespace-pre-wrap">{visit.reason}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Diagnosis */}
                                {visit.diagnosis && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                                            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                            </svg>
                                            Diagnosis
                                        </h3>
                                        <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                                            <p className="text-slate-700 whitespace-pre-wrap">{visit.diagnosis}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Solution/Treatment */}
                                {visit.solution && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                                            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Treatment / Solution
                                        </h3>
                                        <div className="p-4 rounded-xl bg-green-50 border border-green-200">
                                            <p className="text-slate-700 whitespace-pre-wrap">{visit.solution}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Medicine Prescribed */}
                                {visit.medicinePrescribed && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                                            <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                            </svg>
                                            Medicine Prescribed
                                        </h3>
                                        <div className="p-4 rounded-xl bg-purple-50 border border-purple-200">
                                            <p className="text-slate-700 whitespace-pre-wrap">{visit.medicinePrescribed}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Full Summary */}
                                {(visit.fullSummary || visit.summary) && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                                            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                                            </svg>
                                            Full Summary
                                        </h3>
                                        <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
                                            <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                                                {visit.fullSummary || visit.summary}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Metadata */}
                                <div className="pt-4 border-t border-slate-100">
                                    <p className="text-xs text-slate-400">
                                        Record created: {new Date(visit.createdAt).toLocaleString('en-US')}
                                        {visit.updatedAt !== visit.createdAt && (
                                            <> • Last updated: {new Date(visit.updatedAt).toLocaleString('en-US')}</>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthGuard>
    );
}
