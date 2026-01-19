import React, { useState } from 'react';
import './SignUp.css';
import Assets from '../../assets/images';
import { useNavigate } from 'react-router-dom';

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    retypePassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSignUp = (e) => {
    e.preventDefault();
    
    // Validasi
    if (formData.password !== formData.retypePassword) {
      alert('Password dan Retype Password tidak sesuai!');
      return;
    }

    console.log('Sign Up Data:', formData);
    // Show success modal
    setShowSuccess(true);
    
    // Auto redirect after 2 seconds
    setTimeout(() => {
      navigate('/signin');
    }, 2000);
  };

  const handleNavigateToSignIn = () => {
    navigate('/signin');
  };

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
                name="fullName"
                className="form-input"
                placeholder="Masukkan nama lengkap"
                value={formData.fullName}
                onChange={handleInputChange}
                required
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
                placeholder="Masukkan password"
                value={formData.password}
                onChange={handleInputChange}
                required
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
              />
              
              
            </div>

            {/* Sign Up Button */}
            <button type="submit" className="signup-button">
              Daftar
            </button>
          </form>

          {/* Social Login */}
          <div className="social-login">
            <div className="social-divider">atau</div>
            <div className="social-buttons">
              <button type="button" className="social-button">
                <img src={Assets.googleImg} alt="google" className="social-icon" />
                Google
              </button>
              <button type="button" className="social-button">
                <img src={Assets.facebookImg} alt="facebook" className="social-icon" />
                Facebook
              </button>
            </div>
          </div>

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
            <p className="modal-message">Akun Anda telah berhasil dibuat. Anda akan diarahkan ke halaman login dalam 2 detik...</p>
            <button 
              className="modal-button"
              onClick={() => navigate('/signin')}
            >
              Kembali ke Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignUp;
