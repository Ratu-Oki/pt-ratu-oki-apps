import React, { useState } from 'react';
import './SignIn.css';
import Assets from '../../assets/images';
import { useNavigate } from 'react-router-dom';

const SignIn = () => {
  const navigate = useNavigate();
  const [activeRole, setActiveRole] = useState('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keepLogin, setKeepLogin] = useState(false);

  const handleSignIn = (e) => {
    e.preventDefault();
    console.log('SignIn dengan role:', activeRole, 'Email:', email, 'Password:', password);
    // TODO: Implementasi login logic di sini
  };

  const getRoleIcon = (role) => {
    switch(role) {
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

  return (
    <div className="signin-container">
      {/* Left Side - Branding */}
      <div className="signin-left">
        <div className="signin-left-content">
          <div className="signin-logo">
            <span>RO</span>
            <span className="signin-logo-text">PT Ratu Oki</span>
          </div>

          <h1 className="signin-title">
            Selamat Datang <span className="highlight">Kembali</span>
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
          <p className="form-subtitle">Silakan isi dan masukkan kredensial Anda</p>

          {/* Role Tabs */}
          <div className="role-tabs">
            <button
              className={`tab-button ${activeRole === 'admin' ? 'active' : ''}`}
              onClick={() => setActiveRole('admin')}
            >
              <span className="tab-icon">{getRoleIcon('admin')}</span>
              <span>Admin</span>
            </button>
            <button
              className={`tab-button ${activeRole === 'pengguna' ? 'active' : ''}`}
              onClick={() => setActiveRole('pengguna')}
            >
              <span className="tab-icon">{getRoleIcon('pengguna')}</span>
              <span>Pengguna</span>
            </button>
            <button
              className={`tab-button ${activeRole === 'supplier' ? 'active' : ''}`}
              onClick={() => setActiveRole('supplier')}
            >
              <span className="tab-icon">{getRoleIcon('supplier')}</span>
              <span>Supplier</span>
            </button>
          </div>

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
                className="form-input"
                placeholder="contoh@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                className="form-input"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Footer Options */}
            <div className="form-footer">
              <label className="keep-login">
                <input
                  type="checkbox"
                  checked={keepLogin}
                  onChange={(e) => setKeepLogin(e.target.checked)}
                />
                <span>Ingat saya</span>
              </label>
              <a className="forgot-password" href="#forgot">Lupa password?</a>
            </div>

            {/* Sign In Button */}
            <button type="submit" className="signin-button">
              Masuk
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

          {/* Signup Link */}
          <div className="signup-link">
            Belum punya akun? <a onClick={() => navigate('/signup')}>Daftar sekarang</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
