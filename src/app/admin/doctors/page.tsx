'use client';

import AuthGuard from '@/components/AuthGuard';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface Doctor {
    _id: string;
    name: string;
    email: string;
    specialization: string | null;
    patientCount: number;
    isActive: boolean;
    createdAt: string;
}

export default function AdminDoctorsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        specialization: '',
    });

    // Check if user is admin
    useEffect(() => {
        if (user && user.role !== 'admin') {
            router.replace('/dashboard');
        }
    }, [user, router]);

    // Fetch doctors
    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const response = await api.get('/api/admin/doctors');
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

        if (user?.role === 'admin') {
            fetchDoctors();
        }
    }, [user]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await api.post('/api/admin/doctors', formData);
            if (response.data.success) {
                setDoctors([response.data.data.doctor, ...doctors]);
                setFormData({ name: '', email: '', password: '', specialization: '' });
                setShowAddForm(false);
                setSuccessMessage('Doctor added successfully!');
                setTimeout(() => setSuccessMessage(null), 3000);
            }
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setError(error.response?.data?.message || 'Failed to create doctor');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteDoctor = async (doctorId: string) => {
        if (!confirm('Are you sure you want to delete this doctor? This will unassign all their patients.')) {
            return;
        }

        try {
            await api.delete(`/api/admin/doctors/${doctorId}`);
            setDoctors(doctors.filter(d => d._id !== doctorId));
            setSuccessMessage('Doctor deleted successfully');
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            console.error('Error deleting doctor:', err);
            setError('Failed to delete doctor');
        }
    };

    // Get greeting based on time
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    const todayStr = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });

    if (user?.role !== 'admin') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h1 className="text-xl font-bold text-slate-800">Access Denied</h1>
                    <p className="text-slate-500 mt-2">You need admin privileges to access this page.</p>
                </div>
            </div>
        );
    }

    return (
        <AuthGuard>
            <div className="min-h-screen bg-slate-50">
                <div className="pt-20 px-4 sm:px-6 lg:px-8 pb-12">
                    <div className="max-w-7xl mx-auto space-y-6">
                        {/* Welcome Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-800">
                                    {getGreeting()}, {user?.name?.split(' ')[0]}
                                </h1>
                                <p className="text-slate-500">{todayStr}</p>
                            </div>
                            <button
                                onClick={() => setShowAddForm(!showAddForm)}
                                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 text-white font-medium hover:bg-violet-700 transition-colors shadow-md"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add Doctor
                            </button>
                        </div>

                        {/* Success Message */}
                        {successMessage && (
                            <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <p className="text-green-800">{successMessage}</p>
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-red-800">{error}</p>
                                <button onClick={() => setError(null)} className="ml-auto text-red-600 hover:text-red-800">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        )}

                        {/* Add Doctor Form */}
                        {showAddForm && (
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                                <h2 className="text-lg font-semibold text-slate-800 mb-4">Add New Doctor</h2>
                                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-slate-800 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                            placeholder="Dr. John Smith"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-slate-800 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                            placeholder="doctor@example.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Password *</label>
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            required
                                            minLength={8}
                                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-slate-800 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Specialization</label>
                                        <input
                                            type="text"
                                            name="specialization"
                                            value={formData.specialization}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-slate-800 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                            placeholder="e.g., Cardiology, Dermatology"
                                        />
                                    </div>
                                    <div className="md:col-span-2 flex gap-3 justify-end mt-2">
                                        <button
                                            type="button"
                                            onClick={() => setShowAddForm(false)}
                                            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="px-6 py-2 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {isSubmitting && (
                                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            )}
                                            Add Doctor
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Doctors List */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100">
                                <h2 className="font-semibold text-slate-800">All Doctors</h2>
                            </div>
                            {isLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="w-8 h-8 border-3 border-violet-600 border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : doctors.length === 0 ? (
                                <div className="p-12 text-center">
                                    <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <h3 className="text-lg font-semibold text-slate-800 mb-1">No doctors yet</h3>
                                    <p className="text-slate-500">Click &quot;Add Doctor&quot; to create the first doctor account</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {doctors.map((doctor) => (
                                        <div
                                            key={doctor._id}
                                            className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group"
                                        >
                                            <div className="flex flex-col items-center text-center">
                                                <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mb-4 group-hover:scale-110 transition-transform duration-200">
                                                    {doctor.name.charAt(0).toUpperCase()}
                                                </div>
                                                <h3 className="font-semibold text-lg text-slate-800 mb-1">Dr. {doctor.name}</h3>
                                                <p className="text-sm text-slate-500 mb-3">{doctor.email}</p>

                                                <span className={`px-3 py-1 rounded-full text-xs font-medium mb-4 ${doctor.specialization
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : 'bg-slate-100 text-slate-500'
                                                    }`}>
                                                    {doctor.specialization || 'No specialization'}
                                                </span>

                                                <div className="w-full pt-4 border-t border-slate-100 mb-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <svg className="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                        <div>
                                                            <p className="text-2xl font-bold text-slate-800">{doctor.patientCount}</p>
                                                            <p className="text-xs text-slate-400">patients</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => handleDeleteDoctor(doctor._id)}
                                                    className="w-full py-2 px-4 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium text-sm"
                                                    title="Delete doctor"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    Delete Doctor
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthGuard>
    );
}
