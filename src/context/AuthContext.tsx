import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../lib/axios';
import { jwtDecode } from 'jwt-decode';

interface User {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'vendor' | 'user';
    avatar?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string, userData: User) => void;
    logout: () => void;
    checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const login = (token: string, userData: User) => {
        localStorage.setItem('accessToken', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            setUser(null);
            // Optional: Redirect to login
            window.location.href = '/login';
        }
    };

    const checkAuth = async () => {
        setIsLoading(true);
        const token = localStorage.getItem('accessToken');
        const storedUser = localStorage.getItem('user');

        if (!token) {
            setUser(null);
            setIsLoading(false);
            return;
        }

        try {
            // Validate token expiration
            const decoded: any = jwtDecode(token);
            const currentTime = Date.now() / 1000;

            if (decoded.exp < currentTime) {
                // Token expired, try refresh
                try {
                    const res = await api.post('/auth/refresh-token');
                    login(res.data.data.accessToken, res.data.data.user);
                } catch {
                    logout();
                }
            } else {
                // Token valid
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                } else {
                    // Fetch user details if not in local storage
                    const res = await api.get('/auth/me');
                    setUser(res.data.data.user);
                    localStorage.setItem('user', JSON.stringify(res.data.data.user));
                }
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            logout();
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
