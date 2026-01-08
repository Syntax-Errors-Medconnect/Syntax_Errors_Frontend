'use client';

import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { visitApi } from '@/lib/api';
import { Visit } from '@/types/clinical.types';
import Link from 'next/link';

export default function DashboardPage() {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState('');
    const [recentVisits, setRecentVisits] = useState<Visit[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user?.name) {
            setName(user.name);
        }
    }, [user]);

    useEffect(() => {
        const fetchRecentActivity = async () => {
            try {
                if (user?.role === 'doctor') {
                    const response = await visitApi.getDoctorVisits();
                    if (response.data.success) {
                        const weekAgo = new Date();
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        const recent = response.data.data.visits
                            .filter((v: Visit) => new Date(v.createdAt) > weekAgo)
                            .slice(0, 5);
                        setRecentVisits(recent);
                    }
                }
            } catch (err) {
                console.error('Error fetching activity:', err);
            } finally {
                setIsLoading(false);
            }
        };

        if (user) {
            fetchRecentActivity();
        }
    }, [user]);

    const handleSaveProfile = () => {
        // TODO: Implement profile update API
        setIsEditing(false);
    };

    const todayStr = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });

    return (
        <AuthGuard>
            <div className="min-h-screen bg-slate-50">
                <div className="pt-20 px-4 sm:px-6 lg:px-8 pb-12">
                    <div className="max-w-7xl mx-auto space-y-6">

                        {/* Welcome Header */}
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">
                                Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user?.role === 'doctor' ? 'Dr. ' : ''}{user?.name?.split(' ')[0]}
                            </h1>
                            <p className="text-slate-500">{todayStr}</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                            {/* Profile Card */}
                            <div className="lg:col-span-1">
                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                    <div className="bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 py-6 text-center">
                                        <div className="w-20 h-20 mx-auto bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white text-2xl font-bold border-2 border-white/30">
                                            {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
                                        </div>
                                        <h2 className="text-xl font-semibold text-white mt-3">{user?.name}</h2>
                                        <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white">
                                            {user?.role === 'doctor' ? 'Doctor' : 'Patient'}
                                        </span>
                                    </div>

                                    <div className="p-5 space-y-4">
                                        {isEditing ? (
                                            <div className="space-y-3">
                                                <div>
                                                    <label className="text-sm text-slate-500">Name</label>
                                                    <input
                                                        type="text"
                                                        value={name}
                                                        onChange={(e) => setName(e.target.value)}
                                                        className="w-full mt-1 px-3 py-2 border border-slate-200 text-slate-800 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                                    />
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={handleSaveProfile}
                                                        className="flex-1 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700"
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                        onClick={() => setIsEditing(false)}
                                                        className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-200"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div>
                                                    <p className="text-sm text-slate-500">Email</p>
                                                    <p className="font-medium text-slate-800">{user?.email}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-slate-500">Member Since</p>
                                                    <p className="font-medium text-slate-800">
                                                        {user?.createdAt
                                                            ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                                                            : 'Recently joined'}
                                                    </p>
                                                </div>
                                                {user?.role === 'doctor' && user?.specialization && (
                                                    <div>
                                                        <p className="text-sm text-slate-500">Specialization</p>
                                                        <p className="font-medium text-slate-800">{user.specialization}</p>
                                                    </div>
                                                )}
                                                <button
                                                    onClick={() => setIsEditing(true)}
                                                    className="w-full py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center justify-center gap-2"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                    </svg>
                                                    Edit Profile
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Activity */}
                            <div className="lg:col-span-3 space-y-6">
                                {/* Today's Summary - Doctor Only */}
                                {user?.role === 'doctor' && (
                                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                                        <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                            <svg className="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            Today&apos;s Overview
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-violet-50 rounded-lg p-4">
                                                <p className="text-2xl font-bold text-violet-600">0</p>
                                                <p className="text-sm text-slate-600">Appointments Today</p>
                                            </div>
                                            <div className="bg-emerald-50 rounded-lg p-4">
                                                <p className="text-2xl font-bold text-emerald-600">{recentVisits.length}</p>
                                                <p className="text-sm text-slate-600">Recent Summaries</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Recent Activity for Doctors / Quick Actions for Patients / Admin Actions */}
                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                                    <div className="px-5 py-4 border-b border-slate-100">
                                        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                                            <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {user?.role === 'doctor' ? 'Recent Activity' : user?.role === 'admin' ? 'Admin Actions' : 'Quick Actions'}
                                        </h3>
                                    </div>

                                    {user?.role === 'doctor' ? (
                                        // Doctor view - show visit summaries
                                        isLoading ? (
                                            <div className="flex items-center justify-center py-8">
                                                <div className="w-6 h-6 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
                                            </div>
                                        ) : recentVisits.length === 0 ? (
                                            <div className="p-8 text-center text-slate-500">
                                                <svg className="w-12 h-12 mx-auto text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                </svg>
                                                <p>No recent activity</p>
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-slate-100">
                                                {recentVisits.map((visit) => (
                                                    <div key={visit._id} className="px-5 py-4 flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                                            {visit.patientName?.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="font-medium text-slate-800">Visit summary created</p>
                                                            <p className="text-sm text-slate-500">
                                                                Patient: {visit.patientName} • {new Date(visit.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )
                                    ) : user?.role === 'admin' ? (
                                        // Admin view - show manage doctors link
                                        <div className="p-5">
                                            <Link
                                                href="/admin/doctors"
                                                className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:bg-violet-50 transition-colors group"
                                            >
                                                <div className="w-10 h-10 bg-violet-100 group-hover:bg-violet-200 rounded-lg flex items-center justify-center transition-colors">
                                                    <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-slate-800 group-hover:text-violet-700 transition-colors">Manage Doctors</p>
                                                    <p className="text-sm text-slate-500">Add, view, and manage doctor accounts</p>
                                                </div>
                                                <svg className="w-5 h-5 text-slate-400 group-hover:text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </Link>
                                        </div>
                                    ) : (
                                        // Patient view - show quick action links
                                        <div className="p-5 space-y-3">
                                            <Link
                                                href="/patient/doctors"
                                                className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:bg-violet-50 transition-colors group"
                                            >
                                                <div className="w-10 h-10 bg-violet-100 group-hover:bg-violet-200 rounded-lg flex items-center justify-center transition-colors">
                                                    <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-slate-800 group-hover:text-violet-700 transition-colors">Browse Doctors</p>
                                                    <p className="text-sm text-slate-500">Find and connect with healthcare professionals</p>
                                                </div>
                                                <svg className="w-5 h-5 text-slate-400 group-hover:text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </Link>

                                            <Link
                                                href="/patient/book-appointment"
                                                className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:bg-emerald-50 transition-colors group"
                                            >
                                                <div className="w-10 h-10 bg-emerald-100 group-hover:bg-emerald-200 rounded-lg flex items-center justify-center transition-colors">
                                                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                    </svg>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-slate-800 group-hover:text-emerald-700 transition-colors">Book Appointment</p>
                                                    <p className="text-sm text-slate-500">Schedule a visit with a doctor</p>
                                                </div>
                                                <svg className="w-5 h-5 text-slate-400 group-hover:text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthGuard>
    );
}
