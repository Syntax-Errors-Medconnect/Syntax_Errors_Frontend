'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, LoginCredentials, RegisterCredentials } from '@/types/auth.types';
import { authApi } from '@/lib/api';
import { AxiosError } from 'axios';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (credentials: RegisterCredentials) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Check auth status on mount
    const checkAuth = useCallback(async () => {
        try {
            const response = await authApi.getMe();
            if (response.data.success) {
                setUser(response.data.data.user);
            }
        } catch {
            // User is not authenticated
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const login = async (credentials: LoginCredentials) => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await authApi.login(credentials);
            if (response.data.success) {
                setUser(response.data.data.user);
            }
        } catch (err) {
            const error = err as AxiosError<{ message: string }>;
            const message = error.response?.data?.message || 'Login failed';
            setError(message);
            throw new Error(message);
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (credentials: RegisterCredentials) => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await authApi.register(credentials);
            if (response.data.success) {
                setUser(response.data.data.user);
            }
        } catch (err) {
            const error = err as AxiosError<{ message: string }>;
            const message = error.response?.data?.message || 'Registration failed';
            setError(message);
            throw new Error(message);
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            await authApi.logout();
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            // Always clear user state regardless of API success
            setUser(null);
        }
    };

    const clearError = () => setError(null);

    const refreshUser = async () => {
        try {
            const response = await authApi.getMe();
            if (response.data.success) {
                setUser(response.data.data.user);
            }
        } catch (err) {
            console.error('Error refreshing user:', err);
        }
    };

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        register,
        logout,
        refreshUser,
        clearError,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
