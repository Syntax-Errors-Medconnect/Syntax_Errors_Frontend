'use client';

import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
    const { user } = useAuth();

    return (
        <AuthGuard>
            <div className="min-h-screen bg-slate-50">
                <div className="pt-20 px-4 sm:px-6 lg:px-8 pb-12">
                    <div className="max-w-5xl mx-auto">
                        {/* Welcome Header */}
                        <div className="mb-8">
                            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
                                Welcome back, {user?.name?.split(' ')[0]}!
                            </h1>
                            <p className="text-slate-500 mt-1">
                                Here's an overview of your account
                            </p>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">Account Status</p>
                                        <p className="text-2xl font-bold text-slate-800 mt-1">Active</p>
                                    </div>
                                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">Security Level</p>
                                        <p className="text-2xl font-bold text-slate-800 mt-1">High</p>
                                    </div>
                                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">Last Login</p>
                                        <p className="text-2xl font-bold text-slate-800 mt-1">
                                            {user?.lastLogin
                                                ? new Date(user.lastLogin).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                                : 'Today'}
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Profile Card */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-6">
                            <div className="px-6 py-4 border-b border-slate-200">
                                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Profile Information
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="grid gap-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-slate-100 last:border-0">
                                        <span className="text-sm font-medium text-slate-500 sm:w-40">Full Name</span>
                                        <span className="text-slate-800 font-medium mt-1 sm:mt-0">{user?.name}</span>
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-slate-100 last:border-0">
                                        <span className="text-sm font-medium text-slate-500 sm:w-40">Email Address</span>
                                        <span className="text-slate-800 font-medium mt-1 sm:mt-0">{user?.email}</span>
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-slate-100 last:border-0">
                                        <span className="text-sm font-medium text-slate-500 sm:w-40">User ID</span>
                                        <span className="text-slate-600 font-mono text-sm mt-1 sm:mt-0">{user?._id}</span>
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-center py-3">
                                        <span className="text-sm font-medium text-slate-500 sm:w-40">Status</span>
                                        <span className="inline-flex items-center gap-2 mt-1 sm:mt-0">
                                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                            <span className="text-green-700 font-medium">Active</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Security Features Card */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                            <div className="px-6 py-4 border-b border-slate-200">
                                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                    Security Features
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="grid sm:grid-cols-2 gap-4">
                                    {[
                                        { label: 'JWT Access Token', desc: '15-minute expiry', icon: '🔑' },
                                        { label: 'Refresh Token', desc: '7-day expiry with rotation', icon: '🔄' },
                                        { label: 'HTTP-Only Cookies', desc: 'XSS protection enabled', icon: '🍪' },
                                        { label: 'bcrypt Hashing', desc: '12 salt rounds', icon: '🔐' },
                                    ].map((feature, i) => (
                                        <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                                            <span className="text-xl">{feature.icon}</span>
                                            <div>
                                                <p className="text-slate-800 font-medium">{feature.label}</p>
                                                <p className="text-slate-500 text-sm">{feature.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthGuard>
    );
}
