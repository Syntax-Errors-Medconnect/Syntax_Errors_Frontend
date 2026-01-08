'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface RoleGuardProps {
    children: React.ReactNode;
    allowedRoles: ('doctor' | 'patient' | 'admin')[];
    fallbackPath?: string;
}

export default function RoleGuard({
    children,
    allowedRoles,
    fallbackPath = '/dashboard',
}: RoleGuardProps) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    const hasAccess = user && allowedRoles.includes(user.role);

    useEffect(() => {
        if (!isLoading && !hasAccess) {
            router.push(fallbackPath);
        }
    }, [hasAccess, isLoading, router, fallbackPath]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-500">Loading...</p>
                </div>
            </div>
        );
    }

    if (!hasAccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                            className="w-8 h-8 text-red-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-slate-800 mb-2">Access Denied</h2>
                    <p className="text-slate-500">You don&apos;t have permission to view this page.</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
