import React, { useState } from 'react';
import './SignUp.css';
import Assets from '../../assets/images';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { message, Spin } from 'antd';

const SignUp = () => {
  const navigate = useNavigate();
  const { register, loading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    password: '',
    retypePassword: '',
    telepon: '',
    alamat: '',
    role: 'consumer', // Default role
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    clearError();
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    clearError();

    // Validasi
    if (formData.password !== formData.retypePassword) {
      message.error('Password dan Retype Password tidak sesuai!');
      return;
    }

    if (formData.password.length < 6) {
      message.error('Password minimal 6 karakter!');
      return;
    }

    if (formData.nama.length < 3) {
      message.error('Nama minimal 3 karakter!');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await register({
        nama: formData.nama,
        email: formData.email,
        password: formData.password,
        role: 'consumer',
        telepon: formData.telepon || undefined,
        alamat: formData.alamat || undefined,
      });

      if (result.success) {
        setShowSuccess(true);
        message.success('Registrasi berhasil!');

        // Auto redirect after 2 seconds
        setTimeout(() => {
          const roleRoutes = {
            'admin': '/admin/dashboard',
            'consumer': '/consumer',
            'supplier': '/supplier'
          };
          navigate(roleRoutes[result.user.role] || '/');
        }, 2000);
      } else {
        message.error(result.message || 'Registrasi gagal. Silakan coba lagi.');
      }
    } catch (err) {
      message.error('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNavigateToSignIn = () => {
    navigate('/signin');
  };

  const isLoading = loading || isSubmitting;

  return (
    <div className="signup-container">
      {/* Left Side - Branding */}
      <div className="signup-left">
        <div className="signup-left-content">
          <div className="signup-logo">
            <span>RO</span>
            <span className="signup-logo-text">PT Ratu Oki</span>
          </div>

          <h1 className="signup-title">
            Bergabung <span className="highlight">Sekarang</span>
          </h1>

          <p className="signup-description">
            Daftar akun baru Anda untuk mengakses semua fitur dan layanan PT Ratu Oki dengan mudah.
          </p>

          <div className="signup-features">
            <div className="feature-item">
              <div className="feature-icon">
                <img src={Assets.secureImg} alt="security" />
              </div>
              <div className="feature-text">Akun yang aman dan terpercaya</div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <img src={Assets.dashboardImg} alt="dashboard" />
              </div>
              <div className="feature-text">Akses penuh ke semua fitur</div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <img src={Assets.supportImg} alt="support" />
              </div>
              <div className="feature-text">Dukungan pelanggan 24/7</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="signup-right">
        <div className="signup-form-card">
          <h2 className="form-title">Buat Akun Baru</h2>
          <p className="form-subtitle">Silakan isi data diri Anda dengan lengkap</p>

          {/* Form */}
          <form onSubmit={handleSignUp}>
            {/* Full Name Field */}
            <div className="form-group">
              <label className="form-label">
                <img src={Assets.adminImg} alt="name" className="form-icon" />
                Nama Lengkap
              </label>
              <input
                type="text"
                name="nama"
                className="form-input"
                placeholder="Masukkan nama lengkap"
                value={formData.nama}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
            </div>

            {/* Email Field */}
            <div className="form-group">
              <label className="form-label">
                <img src={Assets.emailImg} alt="email" className="form-icon" />
                Email
              </label>
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="contoh@gmail.com"
                value={formData.email}
                onChange={handleInputChange}
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
                name="password"
                className="form-input"
                placeholder="Masukkan password (min 6 karakter)"
                value={formData.password}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
            </div>

            {/* Retype Password Field */}
            <div className="form-group">
              <label className="form-label">
                <img src={Assets.passwordImg} alt="retype-password" className="form-icon" />
                Ulangi Password
              </label>
              <input
                type="password"
                name="retypePassword"
                className="form-input"
                placeholder="Ulangi password"
                value={formData.retypePassword}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
            </div>

            {/* Error message */}
            {error && (
              <div className="error-message" style={{ color: '#e74c3c', marginBottom: '16px', fontSize: '14px' }}>
                {error}
              </div>
            )}

            {/* Sign Up Button */}
            <button type="submit" className="signup-button" disabled={isLoading}>
              {isLoading ? <Spin size="small" /> : 'Daftar'}
            </button>
          </form>




          {/* Sign In Link */}
          <div className="signin-link">
            Sudah punya akun? <a onClick={handleNavigateToSignIn}>Masuk di sini</a>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-icon">✓</div>
            <h2 className="modal-title">Daftar Berhasil!</h2>
            <p className="modal-message">Akun Anda telah berhasil dibuat. Anda akan diarahkan ke dashboard dalam 2 detik...</p>
            <button
              className="modal-button"
              onClick={() => navigate('/signin')}
            >
              Lanjut ke Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignUp;
