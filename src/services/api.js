/**
 * API Service Layer
 * Centralized API client for communicating with the backend
 * Uses js-cookie for token storage
 */

import axios from 'axios';
import Cookies from 'js-cookie';

// Base configuration
const API_BASE_URL = 'https://ratu-oki-backend-production.up.railway.app/api' || 'http://localhost:5000/api';

console.log(API_BASE_URL)
// Create axios instance - DON'T set Authorization here, let interceptor handle it
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000,
});

// Request interceptor - add JWT token from cookie on EVERY request
api.interceptors.request.use(
    (config) => {
        // Get fresh token on each request
        const token = Cookies.get('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            // Remove Authorization header if no token
            delete config.headers.Authorization;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            const status = error.response.status;
            const requestUrl = error.config?.url || '';

            // Check if this is an auth endpoint (login, register, etc.)
            const isAuthEndpoint = requestUrl.includes('/auth/login') ||
                requestUrl.includes('/auth/admin-login') ||
                requestUrl.includes('/auth/register');

            // Only redirect on 401 for non-auth endpoints (token expired while using app)
            if (status === 401 && !isAuthEndpoint) {
                // Token expired or invalid - clear cookies and redirect
                Cookies.remove('token');
                Cookies.remove('user');
                window.location.href = '/signin';
                return Promise.reject(error.response.data);
            }

            // For auth endpoints or other errors, just reject with error data
            return Promise.reject(error.response.data);
        } else if (error.request) {
            // Network error
            return Promise.reject({
                success: false,
                message: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.'
            });
        }
        return Promise.reject(error);
    }
);

// ============================================
// AUTH SERVICES
// ============================================
export const authService = {
    login: async (email, password, role = null) => {
        const payload = { email, password };
        if (role) payload.role = role;
        const response = await api.post('/auth/login', payload);
        return response.data;
    },

    // Admin-specific login with additional security
    adminLogin: async (email, password) => {
        const response = await api.post('/auth/admin-login', { email, password });
        return response.data;
    },

    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },

    getProfile: async () => {
        const response = await api.get('/auth/profile');
        return response.data;
    },

    updateProfile: async (data) => {
        const response = await api.put('/auth/profile', data);
        return response.data;
    },

    changePassword: async (currentPassword, newPassword) => {
        const response = await api.put('/auth/change-password', {
            current_password: currentPassword,
            new_password: newPassword,
        });
        return response.data;
    },

    deleteUser: async (id) => {
        const response = await api.delete(`/auth/users/${id}`);
        return response.data;
    },

    requestEmailChange: async (newEmail) => {
        const response = await api.post('/account-settings/change-email/request', {
            new_email: newEmail,
        });
        return response.data;
    },

    confirmEmailChange: async (newEmail, oldOtp, newOtp) => {
        const response = await api.post('/account-settings/change-email/confirm', {
            new_email: newEmail,
            old_otp: oldOtp,
            new_otp: newOtp,
        });
        return response.data;
    },
};

// ============================================
// PRODUCTS SERVICES
// ============================================
export const productService = {
    getAll: async (params = {}) => {
        const response = await api.get('/products', { params });
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/products/${id}`);
        return response.data;
    },

    getMyProducts: async (params = {}) => {
        const response = await api.get('/products/my-products', { params });
        return response.data;
    },

    getAllAdmin: async (params = {}) => {
        const response = await api.get('/products/admin', { params });
        return response.data;
    },

    create: async (formData) => {
        const response = await api.post('/products', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    update: async (id, formData) => {
        const response = await api.put(`/products/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    updateStatus: async (id, status) => {
        const response = await api.put(`/products/${id}/status`, { status_produk: status });
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/products/${id}`);
        return response.data;
    },

    rate: async (id, rating) => {
        const response = await api.post(`/products/${id}/rate`, { rating });
        return response.data;
    },
};

// ============================================
// SUPPLIER SERVICES
// ============================================
export const supplierService = {
    getAll: async (params = {}) => {
        const response = await api.get('/suppliers', { params });
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/suppliers/${id}`);
        return response.data;
    },

    getStats: async (id) => {
        const response = await api.get(`/suppliers/${id}/stats`);
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('/suppliers', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.put(`/suppliers/${id}`, data);
        return response.data;
    },

    approve: async (id) => {
        const response = await api.put(`/suppliers/${id}/approve`);
        return response.data;
    },

    resetPassword: async (id) => {
        const response = await api.post(`/suppliers/${id}/reset-password`);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/suppliers/${id}`);
        return response.data;
    },
};

export const consumerService = {
    getAll: async (params = {}) => {
        const response = await api.get('/consumers', { params });
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/consumers/${id}`);
        return response.data;
    },

    getStats: async (id) => {
        const response = await api.get(`/consumers/${id}/stats`);
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('/consumers', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.put(`/consumers/${id}`, data);
        return response.data;
    },

    resetPassword: async (id) => {
        const response = await api.post(`/consumers/${id}/reset-password`);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/consumers/${id}`);
        return response.data;
    },
};

// ============================================
// STOCK SERVICES
// ============================================
export const stockService = {
    // Get available products for supplier to supply
    getAvailableProducts: async (params = {}) => {
        const response = await api.get('/stock/available-products', { params });
        return response.data;
    },

    // Supplies - with FormData for image upload
    createSupply: async (formData) => {
        const response = await api.post('/stock/supplies', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    // Create supply with new product (supplier creates product + supply)
    createSupplyNewProduct: async (formData) => {
        const response = await api.post('/stock/supplies/new-product', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    getMySupplies: async (params = {}) => {
        const response = await api.get('/stock/supplies/my-supplies', { params });
        return response.data;
    },

    getAllSupplies: async (params = {}) => {
        const response = await api.get('/stock/supplies', { params });
        return response.data;
    },

    verifySupply: async (id, status, catatan = '') => {
        const response = await api.put(`/stock/supplies/${id}/verify`, { status, catatan });
        return response.data;
    },

    // Stock data
    getTransactions: async (params = {}) => {
        const response = await api.get('/stock/transactions', { params });
        return response.data;
    },

    getFinal: async (params = {}) => {
        const response = await api.get('/stock/final', { params });
        return response.data;
    },

    getSummary: async () => {
        const response = await api.get('/stock/summary');
        return response.data;
    },
};

// ============================================
// TRANSACTION SERVICES
// ============================================
export const transactionService = {
    create: async (data) => {
        const response = await api.post('/transactions', data);
        return response.data;
    },

    // Create transaction with QRIS payment
    createWithPayment: async (data) => {
        const response = await api.post('/transactions/pay', data);
        return response.data;
    },

    getMyTransactions: async (params = {}) => {
        const response = await api.get('/transactions/my-transactions', { params });
        return response.data;
    },

    getAllAdmin: async (params = {}) => {
        const response = await api.get('/transactions/admin', { params });
        return response.data;
    },

    getStats: async () => {
        const response = await api.get('/transactions/stats');
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/transactions/${id}`);
        return response.data;
    },

    updateStatus: async (id, status) => {
        const response = await api.put(`/transactions/${id}/status`, { status });
        return response.data;
    },

    // Get payment status for a transaction
    getPaymentStatus: async (id) => {
        const response = await api.get(`/transactions/${id}/payment-status`);
        return response.data;
    },

    // Approve/Confirm order receipt by consumer
    approveOrder: async (id) => {
        const response = await api.post(`/order/${id}/approve`, {});
        return response.data;
    },
};

// ============================================
// SUPPLIER PAYMENT SERVICES (Admin-Supplier)
// ============================================
export const paymentService = {
    // Create payment for approved supply
    create: async (data) => {
        const response = await api.post('/payments', data);
        console.log(response)
        return response.data;
    },

    // Create supplier payment from company balance
    createFromCompanyBalance: async (data) => {
        const response = await api.post('/payments', data);
        return response.data;
    },

    // Get all payments (admin sees all, supplier sees own)
    getAll: async (params = {}) => {
        const response = await api.get('/payments', { params });
        return response.data;
    },

    // Get payment by ID
    getById: async (id) => {
        const response = await api.get(`/payments/${id}`);
        return response.data;
    },

    // Get payment summary/statistics
    getSummary: async () => {
        const response = await api.get('/payments/summary');
        return response.data;
    },

    // Process refund (admin only)
    refund: async (id, reason = '') => {
        const response = await api.post(`/payments/${id}/refund`, { reason });
        return response.data;
    },

    // Update disbursement status (admin only)
    updateDisbursement: async (id, disbursement_status, disbursement_ref = '') => {
        const response = await api.patch(`/payments/${id}/disbursement`, {
            disbursement_status,
            disbursement_ref
        });
        return response.data;
    },

    // Get wallet summary for supplier
    getWalletSummary: async () => {
        const response = await api.get('/payments/wallet-summary');
        return response.data;
    },

    // Withdraw funds for supplier
    withdrawFunds: async () => {
        const response = await api.post('/payments/withdraw');
        return response.data;
    },
};

// ============================================
// SUPPLIER BANK ACCOUNT SERVICES
// ============================================
export const bankAccountService = {
    // Get supported banks list
    getSupportedBanks: async () => {
        const response = await api.get('/payments/banks/supported');
        return response.data;
    },

    // Get bank accounts (supplier sees own, admin can filter)
    getAll: async (params = {}) => {
        const response = await api.get('/payments/bank-accounts', { params });
        return response.data;
    },

    // Add new bank account
    create: async (data) => {
        const response = await api.post('/payments/bank-accounts', data);
        return response.data;
    },

    // Update bank account
    update: async (id, data) => {
        const response = await api.put(`/payments/bank-accounts/${id}`, data);
        return response.data;
    },

    // Set as default
    setDefault: async (id) => {
        const response = await api.patch(`/payments/bank-accounts/${id}/default`);
        return response.data;
    },

    // Verify bank account (admin only)
    verify: async (id, is_verified) => {
        const response = await api.patch(`/payments/bank-accounts/${id}/verify`, { is_verified });
        return response.data;
    },

    // Delete bank account
    delete: async (id) => {
        const response = await api.delete(`/payments/bank-accounts/${id}`);
        return response.data;
    },
};

// ============================================
// REPORT SERVICES (Admin)
// ============================================
export const reportService = {
    // Get comprehensive report summary
    getSummary: async (params = {}) => {
        const response = await api.get('/reports/summary', { params });
        return response.data;
    },

    // Export report data
    exportData: async (params = {}) => {
        const response = await api.get('/reports/export', { params });
        return response.data;
    },
};

// ============================================
// HEALTH CHECK
// ============================================
export const healthCheck = async () => {
    const response = await api.get('/health');
    return response.data;
};

export default api;
