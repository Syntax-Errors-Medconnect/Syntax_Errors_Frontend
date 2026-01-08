import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import {
    CreateVisitData,
    VisitListResponse,
    PatientListResponse,
    VisitDetailResponse,
    AISearchResponse,
} from "@/types/clinical.types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

if (!process.env.NEXT_PUBLIC_API_URL) {
    console.warn("NEXT_PUBLIC_API_URL is not set, using default:", API_BASE_URL);
}

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Important: Send cookies with requests
    headers: {
        "Content-Type": "application/json",
    },
});

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve();
        }
    });
    failedQueue = [];
};

// Response interceptor for handling token refresh
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
            _retry?: boolean;
        };

        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            originalRequest.url !== "/api/auth/refresh" &&
            originalRequest.url !== "/api/auth/login"
        ) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(() => api(originalRequest))
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                await api.post("/api/auth/refresh");
                processQueue(null);
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError as AxiosError);
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;

// Auth API functions
export const authApi = {
    register: (data: {
        name: string;
        email: string;
        password: string;
        role: "doctor" | "patient";
    }) => api.post("/api/auth/register", data),

    login: (data: { email: string; password: string }) =>
        api.post("/api/auth/login", data),

    logout: () => api.post("/api/auth/logout"),

    refresh: () => api.post("/api/auth/refresh"),

    getMe: () => api.get("/api/auth/me"),

    logoutAll: () => api.post("/api/auth/logout-all"),
};

// Clinical Visit API functions
export const visitApi = {
    // Get visits for the authenticated patient
    getVisits: () => api.get<VisitListResponse>("/api/patient/visits"),

    // Get all visits created by doctor
    getDoctorVisits: () => api.get<VisitListResponse>("/api/doctor/visits"),

    // Get visits for a specific patient (doctor only)
    getPatientVisits: (patientId: string) =>
        api.get<VisitListResponse>(`/api/doctor/patients/${patientId}/visits`),

    // Get single visit by ID
    getVisitById: (visitId: string) =>
        api.get<VisitDetailResponse>(`/api/visit-summary/${visitId}`),

    // Create a new report (doctor only)
    createVisit: (data: CreateVisitData) =>
        api.post<VisitDetailResponse>("/api/visit-summary", {
            patientId: data.patientId,
            patientName: data.patientName,
            visitDate: data.visitDate,
            visitTime: data.visitTime,
            reason: data.reason,
            diagnosis: data.diagnosis,
            solution: data.solution,
            medicinePrescribed: data.medicinePrescribed,
            fullSummary: data.fullSummary,
        }),

    // Get list of assigned patients (doctor only)
    getPatients: () => api.get<PatientListResponse>("/api/doctor/patients"),

    // Get list of all doctors (patient only)
    getDoctors: () =>
        api.get<{
            success: boolean;
            data: {
                doctors: {
                    _id: string;
                    name: string;
                    email: string;
                    patientCount: number;
                }[];
                total: number;
            };
        }>("/api/doctors"),

    // Assign patient to a doctor (patient only)
    assignDoctor: (doctorId: string) =>
        api.post("/api/patient/assign-doctor", { doctorId }),

    // AI Search through visit summaries (doctor only)
    searchSummaries: (query: string, patientId?: string) =>
        api.post<AISearchResponse>("/api/ai/retrieve-summary", {
            patientId,
            query,
        }),
};

// Appointment API functions
export const appointmentApi = {
    // Create appointment request (patient only)
    createAppointment: (
        doctorId: string,
        requestedDate: string,
        message?: string
    ) => api.post("/api/appointments", { doctorId, requestedDate, message }),

    // Get doctor's appointments (doctor only)
    getDoctorAppointments: (status?: string) =>
        api.get<{
            success: boolean;
            data: {
                appointments: Array<{
                    _id: string;
                    patientId: string;
                    patientName: string;
                    patientEmail: string;
                    doctorId: string;
                    doctorName: string;
                    status: string;
                    requestedDate: string;
                    message: string;
                    createdAt: string;
                }>;
                total: number;
                pendingCount: number;
            };
        }>(`/api/appointments/doctor${status ? `?status=${status}` : ""}`),

    // Get patient's appointments (patient only)
    getPatientAppointments: () =>
        api.get<{
            success: boolean;
            data: {
                appointments: Array<{
                    _id: string;
                    patientId: string;
                    patientName: string;
                    doctorId: string;
                    doctorName: string;
                    status: string;
                    requestedDate: string;
                    message: string;
                    createdAt: string;
                }>;
                total: number;
            };
        }>("/api/appointments/patient"),

    // Accept appointment (doctor only)
    acceptAppointment: (appointmentId: string) =>
        api.put(`/api/appointments/${appointmentId}/accept`),

    // Reject appointment (doctor only)
    rejectAppointment: (appointmentId: string) =>
        api.put(`/api/appointments/${appointmentId}/reject`),

    // Get pending count for badge (doctor only)
    getPendingCount: () =>
        api.get<{ success: boolean; data: { count: number } }>(
            "/api/appointments/doctor/count"
        ),
};

// Chat session types
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

// Chat API functions
export const chatApi = {
    // Get available patients for chat (doctor only)
    getAvailablePatients: () =>
        api.get<{ success: boolean; data: { patients: Array<{ _id: string; name: string; email: string }>; total: number } }>('/api/chat/patients'),

    // Create a new chat session
    createSession: (patientId?: string) =>
        api.post<{ success: boolean; data: { session: ChatSession } }>('/api/chat/sessions', { patientId }),

    // Get user's chat sessions
    getSessions: () =>
        api.get<{ success: boolean; data: { sessions: ChatSession[]; total: number } }>('/api/chat/sessions'),

    // Get messages for a session
    getMessages: (sessionId: string) =>
        api.get<{ success: boolean; data: { messages: ChatMessage[] } }>(`/api/chat/sessions/${sessionId}/messages`),

    // Send a message and get AI response
    sendMessage: (sessionId: string, message: string) =>
        api.post<{ success: boolean; data: { userMessage: ChatMessage; assistantMessage: ChatMessage } }>(
            `/api/chat/sessions/${sessionId}/messages`,
            { message }
        ),

    // Delete a chat session
    deleteSession: (sessionId: string) =>
        api.delete(`/api/chat/sessions/${sessionId}`),
};
