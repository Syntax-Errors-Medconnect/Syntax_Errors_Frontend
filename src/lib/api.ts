import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import {
    CreateVisitData,
    VisitListResponse,
    PatientListResponse,
    VisitDetailResponse,
    AISearchResponse,
} from '@/types/clinical.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Important: Send cookies with requests
    headers: {
        'Content-Type': 'application/json',
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

        // If error is 401 and we haven't retried yet
        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            originalRequest.url !== '/api/auth/refresh' &&
            originalRequest.url !== '/api/auth/login' &&
            originalRequest.url !== '/api/auth/me'
        ) {
            if (isRefreshing) {
                // If already refreshing, queue this request
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(() => api(originalRequest))
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Attempt to refresh token
                await api.post('/api/auth/refresh');
                processQueue(null);
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError as AxiosError);
                // Don't redirect here - let the AuthContext handle it
                // This prevents infinite reload loops
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
    register: (data: { name: string; email: string; password: string }) =>
        api.post('/api/auth/register', data),

    login: (data: { email: string; password: string }) =>
        api.post('/api/auth/login', data),

    logout: () => api.post('/api/auth/logout'),

    refresh: () => api.post('/api/auth/refresh'),

    getMe: () => api.get('/api/auth/me'),

    logoutAll: () => api.post('/api/auth/logout-all'),
};

// Clinical Visit API functions
export const visitApi = {
    // Get visits for the authenticated patient
    getVisits: () => api.get<VisitListResponse>('/api/patient/visits'),

    // Get all visits created by doctor
    getDoctorVisits: () => api.get<VisitListResponse>('/api/doctor/visits'),

    // Get visits for a specific patient (doctor only)
    getPatientVisits: (patientId: string) =>
        api.get<VisitListResponse>(`/api/doctor/patients/${patientId}/visits`),

    // Get single visit by ID
    getVisitById: (visitId: string) =>
        api.get<VisitDetailResponse>(`/api/visit-summary/${visitId}`),

    // Create a new visit (doctor only)
    createVisit: (data: CreateVisitData) =>
        api.post<VisitDetailResponse>('/api/visit-summary', {
            patientId: data.patientId,
            visitDate: data.visitDate,
            summaryText: data.summary,
        }),

    // Get list of assigned patients (doctor only)
    getPatients: () => api.get<PatientListResponse>('/api/doctor/patients'),

    // Get list of all doctors (patient only)
    getDoctors: () => api.get<{ success: boolean; data: { doctors: { _id: string; name: string; email: string; patientCount: number }[]; total: number } }>('/api/doctors'),

    // Assign patient to a doctor (patient only)
    assignDoctor: (doctorId: string) =>
        api.post('/api/patient/assign-doctor', { doctorId }),

    // AI Search through visit summaries (doctor only)
    searchSummaries: (query: string, patientId?: string) =>
        api.post<AISearchResponse>('/api/ai/retrieve-summary', {
            patientId,
            query,
        }),
};
