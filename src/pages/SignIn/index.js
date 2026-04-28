import React, { useState } from 'react';
import './SignIn.css';
import Assets from '../../assets/images';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const SignIn = () => {
  const navigate = useNavigate();
  const { login, adminLogin, loading, error, clearError } = useAuth();
  const [activeRole, setActiveRole] = useState('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keepLogin, setKeepLogin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleSignIn = async (e) => {
    e.preventDefault();
    clearError();
    setLocalError('');
    setIsSubmitting(true);

    // Validasi input
    if (!email.trim()) {
      setLocalError('Email tidak boleh kosong');
      setIsSubmitting(false);
      return;
    }

    if (!password.trim()) {
      setLocalError('Password tidak boleh kosong');
      setIsSubmitting(false);
      return;
    }

    try {
      let result;

      // Use specific login method based on selected role
      if (activeRole === 'admin') {
        result = await adminLogin(email, password);
      } else {
        result = await login(email, password);
      }

      if (result.success) {
        // Navigate based on user role from API response
        const roleRoutes = {
          'admin': '/admin/dashboard',
          'consumer': '/consumer',
          'supplier': '/supplier'
        };

        const userRole = result.user.role;

        // Verify role matches selected tab for security
        if (activeRole === 'admin' && userRole !== 'admin') {
          setLocalError('Akun ini bukan akun admin. Silakan gunakan tab yang sesuai.');
          return;
        }

        navigate(roleRoutes[userRole] || '/');
      } else {
        const errorMessage = result.message || 'Login gagal. Periksa email dan password Anda.';
        setLocalError(errorMessage);
      }
    } catch (err) {
      console.error('Login error:', err);

      let errorMessage = 'Terjadi kesalahan. Silakan coba lagi.';

      if (err.message) {
        errorMessage = err.message;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }

      if (errorMessage.includes('Network') || errorMessage.includes('network')) {
        errorMessage = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
      }

      setLocalError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clear error when role changes
  const handleRoleChange = (role) => {
    setActiveRole(role);
    setLocalError('');
    clearError();
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <img src={Assets.adminImg} alt="admin" />;
      case 'pengguna':
        return <img src={Assets.konsumenImg} alt="pengguna" />;
      case 'supplier':
        return <img src={Assets.containerImg} alt="supplier" />;
      default:
        return <img src={Assets.adminImg} alt="admin" />;
    }
  };

  const isLoading = loading || isSubmitting;
  const displayError = localError || error;

  return (
    <div className="signin-container">
      {/* Left Side - Branding */}
      <div className="signin-left">
        <div className="signin-left-content">
          <div className="signin-logo">
            <img
              src="/Logo-PTRATUOKI.png"
              alt="PT Ratu Oki"
              className="signin-logo-image"
            />
          </div>

          <h1 className="signin-title">
            Selamat Datang <span className="highlight">Rivan</span>
          </h1>

          <p className="signin-description">
            Masuk ke akun Anda untuk mengakses dashboard, melakukan transaksi, dan mengubah biaya rantai pasokan Anda.
          </p>

          <div className="signin-features">
            <div className="feature-item">
              <div className="feature-icon">
                <img src={Assets.secureImg} alt="security" />
              </div>
              <div className="feature-text">Transaksi aman dengan Multipas</div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <img src={Assets.dashboardImg} alt="dashboard" />
              </div>
              <div className="feature-text">Dashboard lengkap untuk semua role</div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <img src={Assets.supportImg} alt="support" />
              </div>
              <div className="feature-text">Support 24/7 untuk intra kami</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="signin-right">
        <div className="signin-form-card">
          <h2 className="form-title">Masuk ke Akun</h2>
          <p className="form-subtitle">Silakan pilih role dan masukkan kredensial Anda</p>

          {/* Role Tabs */}
          <div className="role-tabs">
            <button
              className={`tab-button ${activeRole === 'admin' ? 'active' : ''}`}
              onClick={() => handleRoleChange('admin')}
            >
              <span className="tab-icon">{getRoleIcon('admin')}</span>
              <span>Admin</span>
            </button>
            <button
              className={`tab-button ${activeRole === 'pengguna' ? 'active' : ''}`}
              onClick={() => handleRoleChange('pengguna')}
            >
              <span className="tab-icon">{getRoleIcon('pengguna')}</span>
              <span>Pengguna</span>
            </button>
            <button
              className={`tab-button ${activeRole === 'supplier' ? 'active' : ''}`}
              onClick={() => handleRoleChange('supplier')}
            >
              <span className="tab-icon">{getRoleIcon('supplier')}</span>
              <span>Supplier</span>
            </button>
          </div>

          {/* Security notice for admin */}
          {activeRole === 'admin' && (
            <div className="admin-notice">
              🔒 Login admin menggunakan jalur keamanan khusus
            </div>
          )}

          {/* Error Alert - Custom CSS Alert */}
          {displayError && (
            <div className="error-alert">
              <div className="error-alert-icon">⚠️</div>
              <div className="error-alert-content">
                <div className="error-alert-title">Login Gagal</div>
                <div className="error-alert-message">{displayError}</div>
              </div>
              <button
                className="error-alert-close"
                onClick={() => {
                  setLocalError('');
                  clearError();
                }}
              >
                ✕
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSignIn}>
            {/* Email Field */}
            <div className="form-group">
              <label className="form-label">
                <img src={Assets.emailImg} alt="email" className="form-icon" />
                Email
              </label>
              <input
                type="email"
                className={`form-input ${displayError ? 'input-error' : ''}`}
                placeholder="contoh@gmail.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (localError) setLocalError('');
                }}
                required
                disabled={isLoading}
              />
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label className="form-label">
                <img src={Assets.passwordImg} alt="password" className="form-icon" />
                Password
              </label>
              <input
                type="password"
                className={`form-input ${displayError ? 'input-error' : ''}`}
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (localError) setLocalError('');
                }}
                required
                disabled={isLoading}
              />
            </div>

            {/* Footer Options */}
            <div className="form-footer">
              <label className="keep-login">
                <input
                  type="checkbox"
                  checked={keepLogin}
                  onChange={(e) => setKeepLogin(e.target.checked)}
                  disabled={isLoading}
                />
                <span>Ingat saya</span>
              </label>
              <a className="forgot-password" href="#forgot">Lupa password?</a>
            </div>

            {/* Sign In Button */}
            <button type="submit" className="signin-button" disabled={isLoading}>
              {isLoading ? (
                <span className="loading-spinner"></span>
              ) : (
                'Masuk'
              )}
            </button>
          </form>



          {/* Signup Link - Only for non-admin */}
          {activeRole !== 'admin' && (
            <div className="signup-link">
              Belum punya akun? <a onClick={() => navigate('/signup')}>Daftar sekarang</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignIn;
