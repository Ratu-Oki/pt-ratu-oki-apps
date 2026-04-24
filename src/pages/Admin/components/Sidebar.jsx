import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Modal, message } from 'antd';
import { useAuth } from '../../../context/AuthContext';
import { BarChartOutlined,
  AppstoreOutlined,
  CreditCardOutlined,
  DollarOutlined,
  TeamOutlined,
  StockOutlined,
  UserOutlined,
  FileTextOutlined,
  SettingOutlined, 
  LogoutOutlined } from '@ant-design/icons';
import styles from './Sidebar.module.css';

const Sidebar = ({ isOpen, onToggle, isCollapsed = false }) => {
  const [collapsed, setCollapsed] = useState(isCollapsed);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

const menuItems = [
  { id: 1, label: 'Dashboard', icon: <BarChartOutlined />, path: '/admin/dashboard' },
  { id: 2, label: 'Produk', icon: <AppstoreOutlined />, path: '/admin/produk' },
  { id: 3, label: 'Transaksi', icon: <CreditCardOutlined />, path: '/admin/transaksi' },
  { id: 4, label: 'Pembayaran', icon: <DollarOutlined />, path: '/admin/pembayaran' },
  { id: 5, label: 'Bayar Supplier', icon: <TeamOutlined />, path: '/admin/pembayaran-supplier' },
  { id: 6, label: 'Stok', icon: <StockOutlined />, path: '/admin/stok' }
  ];

  const footerMenuItems = [
  { id: 1, label: 'Pengguna', icon: <UserOutlined />, path: '/admin/pengguna' },
  { id: 2, label: 'Laporan', icon: <FileTextOutlined />, path: '/admin/laporan' }
  ];

  const accountMenuItems = [
  { id: 1, label: 'Pengaturan', icon: <SettingOutlined />, path: '/admin/pengaturan' }
  ];

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  const isActive = (path) => location.pathname === path;

  // Handle logout with confirmation modal
  const handleLogout = () => {
    Modal.confirm({
      title: 'Konfirmasi Logout',
      content: 'Apakah Anda yakin ingin keluar dari admin panel?',
      okText: 'Ya, Keluar',
      cancelText: 'Batal',
      okButtonProps: { danger: true },
      onOk: () => {
        logout();
        message.success('Berhasil logout');
        navigate('/signin');
      }
    });
  };

  return (
    <>
      {/* Sidebar Overlay Mobile */}
      {isOpen && (
        <div
          className={styles.sidebarOverlay}
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''} ${collapsed ? styles.collapsed : ''}`}>
        {/* Logo Section */}
        <div className={styles.logoSection}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}></span>
            {!collapsed && (
              <img
                src="/Logo-PTRATUOKI.png"
                alt="PT Ratu Oki"
                className={styles.logoImage}
              />
            )}
          </div>
          <button
            className={styles.closeButton}
            onClick={onToggle}
            title="Close Sidebar"
            aria-label="Close Sidebar"
          >
            ✕
          </button>
          <button
            className={styles.collapseButton}
            onClick={toggleCollapse}
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            aria-label={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            ☰
          </button>
        </div>

        {/* Menu Section */}
        <nav className={styles.menuContainer}>
          <div className={styles.menuSection}>
            {!collapsed && <p className={styles.menuLabel}>MENU UTAMA</p>}
            {menuItems.map(item => (
              <Link
                key={item.id}
                to={item.path}
                className={`${styles.menuItem} ${isActive(item.path) ? styles.active : ''}`}
                title={collapsed ? item.label : ''}
                onClick={onToggle}
              >
                <span className={styles.menuIcon}>{item.icon}</span>
                {!collapsed && <span className={styles.menuText}>{item.label}</span>}
              </Link>
            ))}
          </div>

          <div className={styles.menuSection}>
            {!collapsed && <p className={styles.menuLabel}>MENU LAINNYA</p>}
            {footerMenuItems.map(item => (
              <Link
                key={item.id}
                to={item.path}
                className={`${styles.menuItem} ${isActive(item.path) ? styles.active : ''}`}
                title={collapsed ? item.label : ''}
                onClick={onToggle}
              >
                <span className={styles.menuIcon}>{item.icon}</span>
                {!collapsed && <span className={styles.menuText}>{item.label}</span>}
              </Link>
            ))}
          </div>

          <div className={styles.menuSection}>
            {!collapsed && <p className={styles.menuLabel}>AKUN</p>}
            {accountMenuItems.map(item => (
              <Link
                key={item.id}
                to={item.path}
                className={`${styles.menuItem} ${isActive(item.path) ? styles.active : ''}`}
                title={collapsed ? item.label : ''}
                onClick={onToggle}
              >
                <span className={styles.menuIcon}>{item.icon}</span>
                {!collapsed && <span className={styles.menuText}>{item.label}</span>}
              </Link>
            ))}
            {/* Logout Button */}
            <button
              className={styles.menuItem}
              onClick={handleLogout}
              title={collapsed ? 'Keluar' : ''}
              style={{
                width: '90%',
                textAlign: 'left',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#e74c3c'
              }}
            >
              <span className={styles.menuIcon}><LogoutOutlined /></span>
              {!collapsed && <span className={styles.menuText}>Keluar</span>}
            </button>
          </div>
        </nav>

        {/* User Profile Section */}
        <div className={styles.userSection}>
          {!collapsed && (
            <div className={styles.userInfo}>
              <p className={styles.userName}>{user?.nama || 'Admin'}</p>
              <p className={styles.userRole}>Administrator</p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
