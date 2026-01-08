// Clinical Visit Summary Types

export interface Patient {
    _id: string;
    name: string;
    email: string;
    dateOfBirth?: string;
    lastVisit?: string;
    totalVisits: number;
}

export interface Doctor {
    _id: string;
    name: string;
    email: string;
    specialty?: string;
}

export interface Visit {
    _id: string;
    patientId: string;
    patientName: string;
    doctorId: string;
    doctorName: string;
    visitDate: string;
    visitTime?: string;
    reason?: string;
    diagnosis?: string;
    solution?: string;
    medicinePrescribed?: string;
    fullSummary?: string;
    // Legacy field for backwards compatibility
    summary?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateVisitData {
    patientId: string;
    patientName: string;
    visitDate: string;
    visitTime?: string;
    reason: string;
    diagnosis?: string;
    solution: string;
    medicinePrescribed?: string;
    fullSummary: string;
}

export interface AISearchResult {
    visitId: string;
    visitDate: string;
    doctorName: string;
    patientName: string;
    snippet: string;
    relevanceScore: number;
}

export interface VisitListResponse {
    success: boolean;
    data: {
        visits: Visit[];
        total: number;
    };
}

export interface PatientListResponse {
    success: boolean;
    data: {
        patients: Patient[];
        total: number;
    };
}

export interface VisitDetailResponse {
    success: boolean;
    data: {
        visit: Visit;
    };
}

export interface AISearchResponse {
    success: boolean;
    data: {
        results: AISearchResult[];
        query: string;
    };
}

// Appointment Types
export interface Appointment {
    _id: string;
    patientId: string;
    patientName: string;
    patientEmail?: string;
    doctorId: string;
    doctorName: string;
    status: 'pending' | 'accepted' | 'rejected';
    requestedDate: string;
    message: string;
    createdAt: string;
}

export interface AppointmentListResponse {
    success: boolean;
    data: {
        appointments: Appointment[];
        total: number;
        pendingCount?: number;
    };
}

export interface AppointmentDetailResponse {
    success: boolean;
    data: {
        appointment: Appointment;
    };
}

export interface PendingCountResponse {
    success: boolean;
    data: {
        count: number;
    };
}
