'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getTimeWindowStatus, formatAppointmentTime, formatTimeRemaining, isToday } from '@/lib/timeValidation';

interface StartVideoCallButtonProps {
    appointmentId: string;
    status: string;
    requestedDate: string;
    className?: string;
}

export default function StartVideoCallButton({
    appointmentId,
    status,
    requestedDate,
    className = '',
}: StartVideoCallButtonProps) {
    const [timeStatus, setTimeStatus] = useState(() => getTimeWindowStatus(requestedDate));

    useEffect(() => {
        // Update time status every minute
        const updateStatus = () => {
            setTimeStatus(getTimeWindowStatus(requestedDate));
        };

        // Set up interval to check every minute (60 seconds)
        const interval = setInterval(updateStatus, 60000);

        // Also update immediately
        updateStatus();

        // Cleanup interval on unmount
        return () => clearInterval(interval);
    }, [requestedDate]);

    // Don't show anything if appointment is not accepted
    if (status !== 'accepted') {
        return null;
    }

    // Appointment is accepted, but not within time window
    if (!timeStatus.canStartCall) {
        const appointmentTime = formatAppointmentTime(requestedDate);
        const isTodayAppointment = isToday(requestedDate);

        if (timeStatus.status === 'too-early') {
            return (
                <div className={`flex flex-col gap-2 ${className}`}>
                    <button
                        disabled
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-200 text-slate-500 rounded-lg cursor-not-allowed"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        Call Available Soon
                    </button>
                    <p className="text-xs text-slate-500 text-center">
                        {isTodayAppointment ? (
                            <>Available at {appointmentTime} (in {formatTimeRemaining(timeStatus.minutesUntilAvailable || 0)})</>
                        ) : (
                            <>Scheduled for {new Date(requestedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {appointmentTime}</>
                        )}
                    </p>
                </div>
            );
        }

        if (timeStatus.status === 'expired') {
            return (
                <div className={`flex flex-col gap-2 ${className}`}>
                    <button
                        disabled
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg cursor-not-allowed"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                        Appointment Ended
                    </button>
                    <p className="text-xs text-slate-400 text-center">
                        Call window closed
                    </p>
                </div>
            );
        }
    }

    // Active window - show enabled button
    return (
        <div className={`flex flex-col gap-2 ${className}`}>
            <Link
                href={`/video-call?appointmentId=${appointmentId}`}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm hover:shadow-md"
            >
                <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                </svg>
                Start Video Call
            </Link>
            {timeStatus.minutesUntilExpiry !== undefined && timeStatus.minutesUntilExpiry > 0 && (
                <p className="text-xs text-emerald-600 text-center font-medium">
                    Available for {formatTimeRemaining(timeStatus.minutesUntilExpiry)}
                </p>
            )}
        </div>
    );
}
