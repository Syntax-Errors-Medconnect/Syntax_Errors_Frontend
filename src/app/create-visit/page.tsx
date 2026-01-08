'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import RoleGuard from '@/components/RoleGuard';
import { visitApi } from '@/lib/api';
import { Patient } from '@/types/clinical.types';
import Link from 'next/link';

export default function CreateReportPage() {
    const router = useRouter();

    const [patients, setPatients] = useState<Patient[]>([]);
    const [isLoadingPatients, setIsLoadingPatients] = useState(true);
    const [patientError, setPatientError] = useState<string | null>(null);

    // Form fields
    const [selectedPatientId, setSelectedPatientId] = useState('');
    const [patientName, setPatientName] = useState('');
    const [visitDate, setVisitDate] = useState('');
    const [visitTime, setVisitTime] = useState('');
    const [reason, setReason] = useState('');
    const [diagnosis, setDiagnosis] = useState('');
    const [solution, setSolution] = useState('');
    const [medicinePrescribed, setMedicinePrescribed] = useState('');
    const [fullSummary, setFullSummary] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    // Fetch patients on mount
    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const response = await visitApi.getPatients();
                if (response.data.success) {
                    setPatients(response.data.data.patients);
                }
            } catch (err) {
                console.error('Error fetching patients:', err);
                setPatientError('Failed to load patients');
            } finally {
                setIsLoadingPatients(false);
            }
        };

        fetchPatients();
    }, []);

    // Auto-fill patient name when patient is selected
    const handlePatientSelect = (id: string) => {
        setSelectedPatientId(id);
        const patient = patients.find(p => p._id === id);
        if (patient) {
            setPatientName(patient.name);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSubmitError(null);

        if (!selectedPatientId || !patientName || !reason || !solution || !fullSummary) {
            setSubmitError('Please fill in all required fields');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await visitApi.createVisit({
                patientId: selectedPatientId,
                patientName,
                visitDate: visitDate || new Date().toISOString(),
                visitTime,
                reason,
                diagnosis,
                solution,
                medicinePrescribed,
                fullSummary,
            });

            if (response.data.success) {
                setSubmitSuccess(true);
                // Redirect to the new visit after a short delay
                setTimeout(() => {
                    router.push(`/visit/${response.data.data.visit._id}`);
                }, 1500);
            }
        } catch (err) {
            console.error('Error creating report:', err);
            setSubmitError('Failed to create patient report. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Get today's date in YYYY-MM-DD format for the date input
    const today = new Date().toISOString().split('T')[0];

    return (
        <AuthGuard>
            <RoleGuard allowedRoles={['doctor']}>
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

                            {/* Form Card */}
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                                {/* Header */}
                                <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-violet-50 to-fuchsia-50 rounded-t-xl">
                                    <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                        <svg className="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Create Patient Report
                                    </h1>
                                    <p className="text-sm text-slate-500 mt-1">
                                        Fill in the patient visit details below
                                    </p>
                                </div>

                                {/* Success Message */}
                                {submitSuccess && (
                                    <div className="m-6 p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 flex items-center gap-3">
                                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <div>
                                            <p className="font-medium">Report created successfully!</p>
                                            <p className="text-sm">Redirecting to view the report...</p>
                                        </div>
                                    </div>
                                )}

                                {/* Form */}
                                {!submitSuccess && (
                                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                        {/* Patient Selection Section */}
                                        <div className="bg-slate-50 rounded-xl p-4 space-y-4">
                                            <h2 className="font-semibold text-slate-700 flex items-center gap-2">
                                                <svg className="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                Patient Information
                                            </h2>

                                            {/* Patient Selector */}
                                            <div>
                                                <label htmlFor="patient" className="block text-sm font-medium text-slate-700 mb-2">
                                                    Select Patient <span className="text-red-500">*</span>
                                                </label>
                                                {isLoadingPatients ? (
                                                    <div className="flex items-center gap-2 py-3 px-4 rounded-xl bg-white border border-slate-200">
                                                        <div className="w-4 h-4 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
                                                        <span className="text-slate-500">Loading patients...</span>
                                                    </div>
                                                ) : patientError ? (
                                                    <div className="py-3 px-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                                                        {patientError}
                                                    </div>
                                                ) : (
                                                    <select
                                                        id="patient"
                                                        value={selectedPatientId}
                                                        onChange={(e) => handlePatientSelect(e.target.value)}
                                                        required
                                                        className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                                                    >
                                                        <option value="">Choose a patient...</option>
                                                        {patients.map((patient) => (
                                                            <option key={patient._id} value={patient._id}>
                                                                {patient.name} ({patient.email})
                                                            </option>
                                                        ))}
                                                    </select>
                                                )}
                                            </div>

                                            {/* Patient Name */}
                                            <div>
                                                <label htmlFor="patientName" className="block text-sm font-medium text-slate-700 mb-2">
                                                    Patient Name <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    id="patientName"
                                                    type="text"
                                                    value={patientName}
                                                    onChange={(e) => setPatientName(e.target.value)}
                                                    required
                                                    placeholder="Patient's full name"
                                                    className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                                                />
                                            </div>
                                        </div>

                                        {/* Visit Date & Time */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label htmlFor="visitDate" className="block text-sm font-medium text-slate-700 mb-2">
                                                    Visit Date <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    id="visitDate"
                                                    type="date"
                                                    value={visitDate}
                                                    onChange={(e) => setVisitDate(e.target.value)}
                                                    max={today}
                                                    required
                                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="visitTime" className="block text-sm font-medium text-slate-700 mb-2">
                                                    Visit Time
                                                </label>
                                                <input
                                                    id="visitTime"
                                                    type="time"
                                                    value={visitTime}
                                                    onChange={(e) => setVisitTime(e.target.value)}
                                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                                                />
                                            </div>
                                        </div>

                                        {/* Reason for Visit */}
                                        <div>
                                            <label htmlFor="reason" className="block text-sm font-medium text-slate-700 mb-2">
                                                Reason for Visit <span className="text-red-500">*</span>
                                            </label>
                                            <textarea
                                                id="reason"
                                                value={reason}
                                                onChange={(e) => setReason(e.target.value)}
                                                required
                                                rows={2}
                                                placeholder="Why did the patient visit? (e.g., symptoms, complaints)"
                                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all resize-none"
                                            />
                                        </div>

                                        {/* Diagnosis */}
                                        <div>
                                            <label htmlFor="diagnosis" className="block text-sm font-medium text-slate-700 mb-2">
                                                Diagnosis
                                            </label>
                                            <textarea
                                                id="diagnosis"
                                                value={diagnosis}
                                                onChange={(e) => setDiagnosis(e.target.value)}
                                                rows={2}
                                                placeholder="Your findings and diagnosis"
                                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all resize-none"
                                            />
                                        </div>

                                        {/* Solution/Treatment */}
                                        <div>
                                            <label htmlFor="solution" className="block text-sm font-medium text-slate-700 mb-2">
                                                Solution / Treatment <span className="text-red-500">*</span>
                                            </label>
                                            <textarea
                                                id="solution"
                                                value={solution}
                                                onChange={(e) => setSolution(e.target.value)}
                                                required
                                                rows={2}
                                                placeholder="Recommended treatment, procedures, or advice given"
                                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all resize-none"
                                            />
                                        </div>

                                        {/* Medicine Prescribed */}
                                        <div>
                                            <label htmlFor="medicine" className="block text-sm font-medium text-slate-700 mb-2">
                                                Medicine Prescribed
                                            </label>
                                            <textarea
                                                id="medicine"
                                                value={medicinePrescribed}
                                                onChange={(e) => setMedicinePrescribed(e.target.value)}
                                                rows={2}
                                                placeholder="List of medicines, dosage, and duration"
                                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all resize-none"
                                            />
                                        </div>

                                        {/* Full Summary */}
                                        <div>
                                            <label htmlFor="fullSummary" className="block text-sm font-medium text-slate-700 mb-2">
                                                Full Patient Summary <span className="text-red-500">*</span>
                                            </label>
                                            <textarea
                                                id="fullSummary"
                                                value={fullSummary}
                                                onChange={(e) => setFullSummary(e.target.value)}
                                                required
                                                rows={5}
                                                placeholder="Complete clinical summary including all relevant details, observations, and follow-up instructions..."
                                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all resize-none"
                                            />
                                            <p className="text-xs text-slate-400 mt-1.5">
                                                {fullSummary.length} characters
                                            </p>
                                        </div>

                                        {/* Error Message */}
                                        {submitError && (
                                            <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-3">
                                                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                {submitError}
                                            </div>
                                        )}

                                        {/* Submit Button */}
                                        <div className="flex gap-3 pt-2">
                                            <Link
                                                href="/doctor/reports"
                                                className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-600 font-semibold text-center hover:bg-slate-50 transition-colors"
                                            >
                                                Cancel
                                            </Link>
                                            <button
                                                type="submit"
                                                disabled={isSubmitting || isLoadingPatients}
                                                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold hover:from-violet-700 hover:to-fuchsia-700 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isSubmitting ? (
                                                    <span className="flex items-center justify-center gap-2">
                                                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                        Creating...
                                                    </span>
                                                ) : (
                                                    'Create Report'
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </RoleGuard>
        </AuthGuard>
    );
}
