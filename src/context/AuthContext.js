/**
 * Authentication Context
 * Provides authentication state and methods throughout the app
 * Uses js-cookie for secure token storage with 1-day expiration
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import { authService } from '../services/api';

const AuthContext = createContext(null);

// Cookie configuration
const COOKIE_OPTIONS = {
    expires: 1, // 1 day
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax'
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Initialize auth state from cookies
    useEffect(() => {
        const initAuth = async () => {
            const token = Cookies.get('token');
            const savedUser = Cookies.get('user');

            if (token && savedUser) {
                try {
                    // Verify token by fetching profile
                    const response = await authService.getProfile();
                    setUser(response.data);
                    // Update user cookie with fresh data
                    Cookies.set('user', JSON.stringify(response.data), COOKIE_OPTIONS);
                } catch (err) {
                    // Token invalid, clear cookies
                    Cookies.remove('token');
                    Cookies.remove('user');
                    setUser(null);
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    /**
     * Login user with role support (admin, supplier, consumer)
     */
    const login = useCallback(async (email, password, role = null) => {
        setLoading(true);
        setError(null);
        try {
            const response = await authService.login(email, password, role);
            const { user: userData, token } = response.data;

            // Store in cookies with 1-day expiration
            Cookies.set('token', token, COOKIE_OPTIONS);
            Cookies.set('user', JSON.stringify(userData), COOKIE_OPTIONS);
            setUser(userData);

            return { success: true, user: userData };
        } catch (err) {
            const message = err.message || 'Login gagal. Silakan coba lagi.';
            setError(message);
            return { success: false, message };
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Admin login with additional security check
     */
    const adminLogin = useCallback(async (email, password) => {
        setLoading(true);
        setError(null);
        try {
            const response = await authService.adminLogin(email, password);
            const { user: userData, token } = response.data;

            // Verify this is an admin account
            if (userData.role !== 'admin') {
                throw new Error('Akses ditolak. Hanya admin yang dapat masuk.');
            }

            // Store in cookies with 1-day expiration
            Cookies.set('token', token, COOKIE_OPTIONS);
            Cookies.set('user', JSON.stringify(userData), COOKIE_OPTIONS);
            setUser(userData);

            return { success: true, user: userData };
        } catch (err) {
            const message = err.message || 'Login admin gagal. Silakan coba lagi.';
            setError(message);
            return { success: false, message };
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Register new user
     */
    const register = useCallback(async (userData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await authService.register(userData);
            const { user: newUser, token } = response.data;

            // Store in cookies with 1-day expiration
            Cookies.set('token', token, COOKIE_OPTIONS);
            Cookies.set('user', JSON.stringify(newUser), COOKIE_OPTIONS);
            setUser(newUser);

            return { success: true, user: newUser };
        } catch (err) {
            const message = err.message || 'Registrasi gagal. Silakan coba lagi.';
            setError(message);
            return { success: false, message };
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Logout user
     */
    const logout = useCallback(() => {
        Cookies.remove('token');
        Cookies.remove('user');
        setUser(null);
        setError(null);
    }, []);

    /**
     * Update user data in state and cookies
     */
    const updateUser = useCallback((updatedUserData) => {
        const newUser = { ...user, ...updatedUserData };
        setUser(newUser);
        // Update cookie with new user data
        Cookies.set('user', JSON.stringify(newUser), {
            expires: 1,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Lax'
        });
    }, [user]);

    /**
     * Clear error state
     */
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    /**
     * Check if user has specific role
     */
    const hasRole = useCallback((role) => {
        if (Array.isArray(role)) {
            return role.includes(user?.role);
        }
        return user?.role === role;
    }, [user]);

    /**
     * Check if user is authenticated
     */
    const isAuthenticated = !!user;

    /**
     * Check if user is admin
     */
    const isAdmin = user?.role === 'admin';

    /**
     * Check if user is supplier
     */
    const isSupplier = user?.role === 'supplier';

    /**
     * Check if user is consumer
     */
    const isConsumer = user?.role === 'consumer';

    const value = {
        user,
        loading,
        error,
        isAuthenticated,
        isAdmin,
        isSupplier,
        isConsumer,
        login,
        adminLogin,
        register,
        logout,
        updateUser,
        clearError,
        hasRole,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
