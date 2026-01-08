'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">

    </div>
  );
}
