'use client';

import AuthGuard from '@/components/AuthGuard';
import { useState, useEffect } from 'react';
import { visitApi } from '@/lib/api';

interface Doctor {
    _id: string;
    name: string;
    email: string;
    specialization: string | null;
    patientCount: number;
}

export default function DoctorsPage() {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const response = await visitApi.getDoctors();
                if (response.data.success) {
                    setDoctors(response.data.data.doctors as Doctor[]);
                }
            } catch (err) {
                console.error('Error fetching doctors:', err);
                setError('Failed to load doctors');
            } finally {
                setIsLoading(false);
            }
        };

        fetchDoctors();
    }, []);

    const filteredDoctors = doctors.filter(doctor =>
        doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doctor.specialization && doctor.specialization.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <AuthGuard>
            <div className="min-h-screen bg-slate-50">
                <div className="pt-20 px-4 sm:px-6 lg:px-8 pb-12">
                    <div className="max-w-4xl mx-auto">
                        {/* Header */}
                        <div className="mb-6">
                            <h1 className="text-2xl font-bold text-slate-800">Find a Doctor</h1>
                            <p className="text-slate-500 mt-1">Browse our network of healthcare professionals</p>
                        </div>

                        {/* Search */}
                        <div className="mb-6">
                            <div className="relative">
                                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Search by name or specialization..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 text-slate-800 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        {/* Doctors List */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="w-8 h-8 border-3 border-violet-600 border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : error ? (
                                <div className="p-8 text-center">
                                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <p className="text-slate-600">{error}</p>
                                </div>
                            ) : filteredDoctors.length === 0 ? (
                                <div className="p-12 text-center">
                                    <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <h3 className="text-lg font-semibold text-slate-800 mb-1">No doctors found</h3>
                                    <p className="text-slate-500">
                                        {searchQuery ? 'Try adjusting your search' : 'No doctors available at the moment'}
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {filteredDoctors.map((doctor) => (
                                        <div
                                            key={doctor._id}
                                            className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-lg hover:-translate-y-1 hover:border-violet-300 transition-all duration-200 group"
                                        >
                                            <div className="flex flex-col items-center text-center">
                                                <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mb-4 group-hover:scale-110 transition-transform duration-200">
                                                    {doctor.name.charAt(0).toUpperCase()}
                                                </div>
                                                <h3 className="font-semibold text-lg text-slate-800 mb-2">Dr. {doctor.name}</h3>
                                                {doctor.specialization && (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 mb-3">
                                                        {doctor.specialization}
                                                    </span>
                                                )}
                                                <p className="text-sm text-slate-500 mb-2">{doctor.email}</p>
                                                <p className="text-xs text-slate-400 mb-4">
                                                    {doctor.patientCount} patient{doctor.patientCount !== 1 ? 's' : ''}
                                                </p>

                                                <a
                                                    href={`mailto:${doctor.email}`}
                                                    className="w-full py-2 px-4 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors flex items-center justify-center gap-2 font-medium text-sm"
                                                    title="Email doctor"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                    </svg>
                                                    Email Doctor
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Stats */}
                        {!isLoading && !error && (
                            <div className="mt-4 text-center text-sm text-slate-500">
                                Showing {filteredDoctors.length} of {doctors.length} doctor{doctors.length !== 1 ? 's' : ''}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthGuard>
    );
}
