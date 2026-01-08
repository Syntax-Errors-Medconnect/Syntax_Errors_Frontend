'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import AuthGuard from '@/components/AuthGuard';
import { videoCallApi } from '@/lib/api';

// Dynamically import VideoCallRoom with no SSR
const VideoCallRoom = dynamic(() => import('@/components/VideoCallRoom'), {
    ssr: false,
    loading: () => (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-white text-lg">Loading video call...</p>
            </div>
        </div>
    ),
});

function VideoCallContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const appointmentId = searchParams.get('appointmentId');

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [callData, setCallData] = useState<{
        token: string;
        channelName: string;
        appId: string;
        uid: string;
        videoCallId: string;
    } | null>(null);

    useEffect(() => {
        if (!appointmentId) {
            setError('No appointment ID provided');
            setIsLoading(false);
            return;
        }

        const initializeCall = async () => {
            try {
                // Generate token
                const response = await videoCallApi.generateToken(appointmentId);

                if (response.data.success) {
                    setCallData(response.data.data);

                    // Start the call
                    await videoCallApi.startCall(response.data.data.videoCallId);
                } else {
                    setError('Failed to initialize video call');
                }
            } catch (err: any) {
                console.error('Video call initialization error:', err);
                setError(
                    err.response?.data?.message || 'Failed to start video call'
                );
            } finally {
                setIsLoading(false);
            }
        };

        initializeCall();
    }, [appointmentId]);

    const handleCallEnd = async (transcription?: any[]) => {
        if (callData?.videoCallId) {
            try {
                // Send transcription to backend
                await videoCallApi.endCall(callData.videoCallId, transcription);
                console.log(`✅ Call ended, transcription saved: ${transcription?.length || 0} segments`);
            } catch (error) {
                console.error('Error ending call:', error);
            }
        }
        router.push('/dashboard');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-white text-lg">Initializing video call...</p>
                </div>
            </div>
        );
    }

    if (error || !callData) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="bg-white rounded-xl p-8 max-w-md text-center">
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
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">
                        Unable to Start Call
                    </h2>
                    <p className="text-slate-600 mb-6">{error}</p>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <VideoCallRoom
            appId={callData.appId}
            channelName={callData.channelName}
            token={callData.token}
            uid={callData.uid}
            onCallEnd={handleCallEnd}
        />
    );
}

export default function VideoCallPage() {
    return (
        <AuthGuard>
            <Suspense fallback={
                <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-white text-lg">Loading...</p>
                    </div>
                </div>
            }>
                <VideoCallContent />
            </Suspense>
        </AuthGuard>
    );
}
