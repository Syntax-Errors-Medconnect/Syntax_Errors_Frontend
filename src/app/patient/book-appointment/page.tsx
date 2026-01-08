'use client';

import { useState, useEffect } from 'react';
import { visitApi, appointmentApi } from '@/lib/api';
import AuthGuard from '@/components/AuthGuard';
import RoleGuard from '@/components/RoleGuard';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Doctor {
    _id: string;
    name: string;
    email: string;
    specialization?: string | null;
    patientCount: number;
}

export default function BookAppointmentPage() {
    const router = useRouter();
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Form state
    const [selectedDoctor, setSelectedDoctor] = useState<string>('');
    const [requestedDate, setRequestedDate] = useState<string>('');
    const [message, setMessage] = useState<string>('');

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const response = await visitApi.getDoctors();
                if (response.data.success) {
                    setDoctors(response.data.data.doctors);
                }
            } catch (err) {
                console.error('Error fetching doctors:', err);
                setError('Failed to load doctors');
            } finally {
                setIsLoading(false);
            }
        };

        fetchDoctors();

        // Set default date to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setRequestedDate(tomorrow.toISOString().split('T')[0]);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedDoctor || !requestedDate) {
            setError('Please select a doctor and date');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            await appointmentApi.createAppointment(selectedDoctor, requestedDate, message);
            setSuccessMessage('Appointment request sent successfully!');

            // Redirect after showing success
            setTimeout(() => {
                router.push('/dashboard');
            }, 2000);
        } catch (err: unknown) {
            console.error('Error creating appointment:', err);
            const error = err as { response?: { data?: { message?: string } } };
            setError(error.response?.data?.message || 'Failed to create appointment');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AuthGuard>
            <RoleGuard allowedRoles={['patient']}>
                <div className="min-h-screen bg-slate-50">
                    <div className="pt-20 px-4 sm:px-6 lg:px-8 pb-12">
                        <div className="max-w-2xl mx-auto space-y-6">
                            {/* Back Button */}
                            <Link
                                href="/dashboard"
                                className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Back to Dashboard
                            </Link>

                            {/* Header */}
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
                                    Book an Appointment
                                </h1>
                                <p className="text-slate-500 mt-1">
                                    Request an appointment with a doctor
                                </p>
                            </div>

                            {/* Success Message */}
                            {successMessage && (
                                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="font-medium text-emerald-800">{successMessage}</p>
                                        <p className="text-sm text-emerald-600">Redirecting to dashboard...</p>
                                    </div>
                                </div>
                            )}

                            {/* Error/Warning Message */}
                            {error && (
                                <div className={`rounded-xl p-4 flex items-center gap-3 ${error.toLowerCase().includes('pending')
                                    ? 'bg-amber-50 border border-amber-200'
                                    : 'bg-red-50 border border-red-200'
                                    }`}>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${error.toLowerCase().includes('pending')
                                        ? 'bg-amber-100'
                                        : 'bg-red-100'
                                        }`}>
                                        <svg className={`w-5 h-5 ${error.toLowerCase().includes('pending')
                                            ? 'text-amber-600'
                                            : 'text-red-600'
                                            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            {error.toLowerCase().includes('pending') ? (
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                            ) : (
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            )}
                                        </svg>
                                    </div>
                                    <div>
                                        <p className={`font-medium ${error.toLowerCase().includes('pending')
                                            ? 'text-amber-800'
                                            : 'text-red-800'
                                            }`}>
                                            {error.toLowerCase().includes('pending') ? 'Pending Request Exists' : 'Error'}
                                        </p>
                                        <p className={`text-sm ${error.toLowerCase().includes('pending')
                                            ? 'text-amber-600'
                                            : 'text-red-600'
                                            }`}>
                                            {error}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
                                {/* Doctor Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Select Doctor *
                                    </label>
                                    {isLoading ? (
                                        <div className="flex items-center justify-center py-8">
                                            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                        </div>
                                    ) : doctors.length === 0 ? (
                                        <p className="text-slate-500 text-center py-4">No doctors available</p>
                                    ) : (
                                        <div className="grid gap-3">
                                            {doctors.map((doctor) => (
                                                <label
                                                    key={doctor._id}
                                                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedDoctor === doctor._id
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : 'border-slate-200 hover:border-slate-300'
                                                        }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="doctor"
                                                        value={doctor._id}
                                                        checked={selectedDoctor === doctor._id}
                                                        onChange={(e) => setSelectedDoctor(e.target.value)}
                                                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                                    />
                                                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                                                        {doctor.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-medium text-slate-800">Dr. {doctor.name}</p>
                                                        {doctor.specialization && (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 mt-1">
                                                                {doctor.specialization}
                                                            </span>
                                                        )}
                                                        <p className="text-sm text-slate-500 mt-0.5">{doctor.email}</p>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Date Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Preferred Date *
                                    </label>
                                    <input
                                        type="date"
                                        value={requestedDate}
                                        onChange={(e) => setRequestedDate(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                    />
                                </div>

                                {/* Message */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Message (Optional)
                                    </label>
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Describe your symptoms or reason for visit..."
                                        rows={4}
                                        maxLength={500}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none"
                                    />
                                    <p className="text-xs text-slate-400 mt-1 text-right">
                                        {message.length}/500 characters
                                    </p>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !selectedDoctor || !requestedDate}
                                    className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Sending Request...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            Request Appointment
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </RoleGuard>
        </AuthGuard>
    );
}
