'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import { chatApi } from '@/lib/api';
import AuthGuard from '@/components/AuthGuard';
import RoleGuard from '@/components/RoleGuard';
import Link from 'next/link';

interface Patient {
    _id: string;
    name: string;
    email: string;
}

interface ChatSession {
    _id: string;
    patientId: string;
    patientName: string;
    title: string;
    createdAt: string;
    updatedAt: string;
}

interface ChatMessage {
    _id: string;
    role: 'user' | 'assistant';
    content: string;
    createdAt: string;
}

export default function DoctorChatPage() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showSidebar, setShowSidebar] = useState(true);
    const [showPatientSelector, setShowPatientSelector] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Fetch patients on mount
    useEffect(() => {
        fetchPatients();
        fetchSessions();
    }, []);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchPatients = async () => {
        try {
            // Use the new filtered endpoint that returns patients with visits OR accepted appointments
            const response = await chatApi.getAvailablePatients();
            if (response.data.success) {
                setPatients(response.data.data.patients);
            }
        } catch (err) {
            console.error('Error fetching patients:', err);
        }
    };

    const fetchSessions = async () => {
        try {
            const response = await chatApi.getSessions();
            if (response.data.success) {
                setSessions(response.data.data.sessions);
            }
        } catch (err) {
            console.error('Error fetching sessions:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const createNewSession = async (patientId: string) => {
        try {
            setIsLoading(true);
            setShowPatientSelector(false);
            const response = await chatApi.createSession(patientId);
            if (response.data.success) {
                const newSession = response.data.data.session;
                setSessions(prev => [newSession, ...prev]);
                setCurrentSession(newSession);
                setMessages([]);
                const patient = patients.find(p => p._id === patientId);
                if (patient) setSelectedPatient(patient);
            }
        } catch (err: unknown) {
            console.error('Error creating session:', err);
            const error = err as { response?: { data?: { message?: string } } };
            setError(error.response?.data?.message || 'Failed to create chat session');
        } finally {
            setIsLoading(false);
        }
    };

    const selectSession = async (session: ChatSession) => {
        setCurrentSession(session);
        setError(null);
        const patient = patients.find(p => p._id === session.patientId);
        if (patient) setSelectedPatient(patient);
        try {
            const response = await chatApi.getMessages(session._id);
            if (response.data.success) {
                setMessages(response.data.data.messages);
            }
        } catch (err) {
            console.error('Error fetching messages:', err);
            setError('Failed to load messages');
        }
    };

    const handleSendMessage = async (e: FormEvent) => {
        e.preventDefault();
        if (!inputMessage.trim() || !currentSession || isSending) return;

        const messageText = inputMessage.trim();
        setInputMessage('');
        setIsSending(true);
        setError(null);

        const tempUserMessage: ChatMessage = {
            _id: 'temp-' + Date.now(),
            role: 'user',
            content: messageText,
            createdAt: new Date().toISOString(),
        };
        setMessages(prev => [...prev, tempUserMessage]);

        try {
            const response = await chatApi.sendMessage(currentSession._id, messageText);
            if (response.data.success) {
                setMessages(prev => {
                    const filtered = prev.filter(m => !m._id.startsWith('temp-'));
                    return [...filtered, response.data.data.userMessage, response.data.data.assistantMessage];
                });
                fetchSessions();
            }
        } catch (err: unknown) {
            console.error('Error sending message:', err);
            const error = err as { response?: { data?: { message?: string } } };
            setError(error.response?.data?.message || 'Failed to send message');
            setMessages(prev => prev.filter(m => !m._id.startsWith('temp-')));
        } finally {
            setIsSending(false);
        }
    };

    const deleteSession = async (sessionId: string) => {
        try {
            await chatApi.deleteSession(sessionId);
            setSessions(prev => prev.filter(s => s._id !== sessionId));
            if (currentSession?._id === sessionId) {
                setCurrentSession(null);
                setMessages([]);
                setSelectedPatient(null);
            }
        } catch (err) {
            console.error('Error deleting session:', err);
        }
    };

    return (
        <AuthGuard>
            <RoleGuard allowedRoles={['doctor']}>
                <div className="min-h-screen bg-slate-50 pt-16">
                    <div className="h-[calc(100vh-4rem)] flex">
                        {/* Sidebar */}
                        <div className={`${showSidebar ? 'w-80' : 'w-0'} transition-all duration-300 bg-white border-r border-slate-200 flex flex-col overflow-hidden`}>
                            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                                <h2 className="font-semibold text-slate-800">Patient Chats</h2>
                                <button
                                    onClick={() => setShowPatientSelector(true)}
                                    className="p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                                    title="New Chat"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                                {isLoading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                    </div>
                                ) : sessions.length === 0 ? (
                                    <p className="text-center text-slate-500 py-8 text-sm">
                                        No chats yet. Select a patient to start.
                                    </p>
                                ) : (
                                    sessions.map(session => (
                                        <div
                                            key={session._id}
                                            className={`group flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors ${currentSession?._id === session._id
                                                ? 'bg-indigo-50 text-indigo-700'
                                                : 'hover:bg-slate-100 text-slate-700'
                                                }`}
                                            onClick={() => selectSession(session)}
                                        >
                                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                                                {session.patientName?.charAt(0).toUpperCase() || 'P'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs text-slate-500 truncate">{session.patientName}</p>
                                                <p className="text-sm truncate">{session.title}</p>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteSession(session._id);
                                                }}
                                                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-100 text-slate-400 hover:text-red-600 transition-all"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="p-3 border-t border-slate-200">
                                <Link
                                    href="/dashboard"
                                    className="flex items-center gap-2 text-sm text-slate-600 hover:text-indigo-600 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                    Back to Dashboard
                                </Link>
                            </div>
                        </div>

                        {/* Main Chat Area */}
                        <div className="flex-1 flex flex-col">
                            {/* Header */}
                            <div className="h-14 px-4 border-b border-slate-200 bg-white flex items-center gap-3">
                                <button
                                    onClick={() => setShowSidebar(!showSidebar)}
                                    className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                                >
                                    <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                </button>
                                {selectedPatient && (
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                                            {selectedPatient.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-800 text-sm">{selectedPatient.name}</p>
                                            <p className="text-xs text-slate-500">{selectedPatient.email}</p>
                                        </div>
                                    </div>
                                )}
                                {!selectedPatient && (
                                    <h1 className="font-semibold text-slate-800">Patient Report Assistant</h1>
                                )}
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {!currentSession ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center">
                                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4">
                                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                        <h2 className="text-xl font-semibold text-slate-800 mb-2">Patient Report Assistant</h2>
                                        <p className="text-slate-500 max-w-md mb-6">
                                            Select a patient to ask questions about their medical reports and visit summaries.
                                        </p>
                                        <button
                                            onClick={() => setShowPatientSelector(true)}
                                            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25"
                                        >
                                            Select Patient
                                        </button>
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="h-full flex items-center justify-center">
                                        <p className="text-slate-500">Send a message to query {selectedPatient?.name}&apos;s reports</p>
                                    </div>
                                ) : (
                                    messages.map(message => (
                                        <div
                                            key={message._id}
                                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-[80%] rounded-2xl px-4 py-3 ${message.role === 'user'
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'bg-white border border-slate-200 text-black'
                                                    }`}
                                            >
                                                <p className="whitespace-pre-wrap">{message.content}</p>
                                                <p className={`text-xs mt-1 ${message.role === 'user' ? 'text-indigo-200' : 'text-slate-400'}`}>
                                                    {new Date(message.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                                {isSending && (
                                    <div className="flex justify-start">
                                        <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="px-4 py-2 bg-red-50 border-t border-red-200 text-red-600 text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Input */}
                            {currentSession && (
                                <div className="p-4 bg-white border-t border-slate-200">
                                    <form onSubmit={handleSendMessage} className="flex gap-3">
                                        <input
                                            type="text"
                                            value={inputMessage}
                                            onChange={(e) => setInputMessage(e.target.value)}
                                            placeholder={`Ask about ${selectedPatient?.name}'s reports...`}
                                            className="flex-1 px-4 py-3 rounded-xl bg-slate-100 border border-slate-200 text-black focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                            disabled={isSending}
                                        />
                                        <button
                                            type="submit"
                                            disabled={!inputMessage.trim() || isSending}
                                            className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isSending ? (
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                                </svg>
                                            )}
                                        </button>
                                    </form>
                                    <p className="text-xs text-slate-400 mt-2 text-center">
                                        Information extracted from patient reports. No medical advice provided.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Patient Selector Modal */}
                    {showPatientSelector && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden">
                                <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                                    <h3 className="font-semibold text-slate-800">Select Patient</h3>
                                    <button
                                        onClick={() => setShowPatientSelector(false)}
                                        className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                                    >
                                        <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="p-4 overflow-y-auto max-h-96">
                                    {patients.length === 0 ? (
                                        <p className="text-center text-slate-500 py-8">
                                            No patients available. Patients will appear here once they have visited you or you&apos;ve accepted their appointment.
                                        </p>
                                    ) : (
                                        <div className="space-y-2">
                                            {patients.map(patient => (
                                                <button
                                                    key={patient._id}
                                                    onClick={() => createNewSession(patient._id)}
                                                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 transition-colors text-left"
                                                >
                                                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                                                        {patient.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-800">{patient.name}</p>
                                                        <p className="text-sm text-slate-500">{patient.email}</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </RoleGuard>
        </AuthGuard>
    );
}
