export interface User {
    _id: string;
    name: string;
    email: string;
    isActive: boolean;
    lastLogin?: string;
    createdAt: string;
    updatedAt: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    data?: {
        user: User;
    };
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterCredentials {
    name: string;
    email: string;
    password: string;
}

export interface ApiError {
    success: false;
    message: string;
    code: string;
    errors?: string[];
}
