/**
 * Protected Route Component
 * Wraps routes that require authentication
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spin } from 'antd';

/**
 * ProtectedRoute - Requires user to be authenticated
 */
export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { isAuthenticated, loading, user } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh'
            }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/signin" state={{ from: location }} replace />;
    }

    // Check role if allowedRoles specified
    if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
        // Redirect to appropriate dashboard based on role
        const roleRedirects = {
            admin: '/admin/dashboard',
            consumer: '/consumer',
            supplier: '/supplier',
        };
        return <Navigate to={roleRedirects[user?.role] || '/signin'} replace />;
    }

    return children;
};

/**
 * PublicRoute - Redirects authenticated users to their dashboard
 */
export const PublicRoute = ({ children }) => {
    const { isAuthenticated, loading, user } = useAuth();

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh'
            }}>
                <Spin size="large" />
            </div>
        );
    }

    if (isAuthenticated) {
        // Redirect to appropriate dashboard
        const roleRedirects = {
            admin: '/admin/dashboard',
            consumer: '/consumer',
            supplier: '/supplier',
        };
        return <Navigate to={roleRedirects[user?.role] || '/'} replace />;
    }

    return children;
};

export default ProtectedRoute;
