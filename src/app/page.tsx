  'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <div className="min-h-screen bg-violet-50 overflow-hidden">
      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="min-h-screen flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center w-full py-12">

            {/* Left - Text Content */}
            <div className="text-left animate-[fadeInLeft_0.8s_ease-out]">
              {/* Logo badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-violet-100 rounded-full mb-6 animate-[fadeInDown_0.6s_ease-out]">
                <div className="w-5 h-5 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-violet-700 tracking-wide">MedConnect</span>
              </div>

              {/* Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold mb-5 tracking-tight text-slate-900 leading-tight animate-[fadeInUp_0.7s_ease-out]">
                Healthcare<br />made simple
              </h1>

              {/* Description */}
              <p className="text-lg text-slate-600 mb-8 max-w-md leading-relaxed animate-[fadeInUp_0.8s_ease-out]">
                Book appointments, connect with doctors, and manage your health records — all in one place.
              </p>

              {/* Buttons */}
              <div className="flex flex-wrap gap-3 animate-[fadeInUp_0.9s_ease-out]">
                {isLoading ? (
                  <div className="h-12 w-36 rounded-xl bg-slate-200 animate-pulse" />
                ) : isAuthenticated ? (
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium transition-all duration-300 shadow-md shadow-violet-500/20 hover:shadow-lg hover:shadow-violet-500/30 hover:-translate-y-0.5"
                  >
                    Go to Dashboard
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/register"
                      className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium transition-all duration-300 shadow-md shadow-violet-500/20 hover:shadow-lg hover:shadow-violet-500/30 hover:-translate-y-0.5"
                    >
                      Get Started
                    </Link>
                    <Link
                      href="/login"
                      className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 font-medium transition-all duration-300"
                    >
                      Sign In
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Right - Features Illustration */}
            <div className="relative flex justify-center lg:justify-end animate-[fadeInRight_0.8s_ease-out]">
              <div className="relative w-full max-w-md lg:max-w-lg">
                {/* Background blob */}
                <div className="absolute inset-0 bg-gradient-to-br from-violet-200 to-fuchsia-200 rounded-3xl transform rotate-3 scale-105 animate-[float_6s_ease-in-out_infinite]" />

                {/* Features Card */}
                <div className="relative bg-white rounded-2xl shadow-xl p-6 sm:p-8">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 tracking-tight">Features</p>
                      <p className="text-sm text-slate-500">What we offer</p>
                    </div>
                  </div>

                  {/* Feature Items */}
                  <div className="space-y-4">
                    {/* Feature 1 - Book Appointments */}
                    <div className="group flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:bg-violet-50 hover:scale-[1.02] transition-all duration-300">
                      <div className="w-11 h-11 bg-violet-100 group-hover:bg-violet-200 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:rotate-6">
                        <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-slate-800 group-hover:text-violet-700 transition-colors">Book Appointments</p>
                        <p className="text-sm text-slate-500">Schedule visits easily</p>
                      </div>
                    </div>

                    {/* Feature 2 - Find Doctors */}
                    <div className="group flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:scale-[1.02] transition-all duration-300">
                      <div className="w-11 h-11 bg-emerald-100 group-hover:bg-emerald-200 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:rotate-6">
                        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-slate-800 group-hover:text-emerald-700 transition-colors">Find Doctors</p>
                        <p className="text-sm text-slate-500">Connect with specialists</p>
                      </div>
                    </div>

                    {/* Feature 3 - Health Records */}
                    <div className="group flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:bg-blue-50 hover:scale-[1.02] transition-all duration-300">
                      <div className="w-11 h-11 bg-blue-100 group-hover:bg-blue-200 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:rotate-6">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-slate-800 group-hover:text-blue-700 transition-colors">Health Records</p>
                        <p className="text-sm text-slate-500">All records in one place</p>
                      </div>
                    </div>

                    {/* Feature 4 - Secure Platform */}
                    <div className="group flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:bg-amber-50 hover:scale-[1.02] transition-all duration-300">
                      <div className="w-11 h-11 bg-amber-100 group-hover:bg-amber-200 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:rotate-6">
                        <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-slate-800 group-hover:text-amber-700 transition-colors">Secure Platform</p>
                        <p className="text-sm text-slate-500">Your data is protected</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Custom animations */}
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: rotate(3deg) translateY(0);
          }
          50% {
            transform: rotate(3deg) translateY(-10px);
          }
        }
      `}</style>
    </div>
  );
}
