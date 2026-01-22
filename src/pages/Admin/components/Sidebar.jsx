import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Sidebar.module.css';

const Sidebar = ({ isOpen, onToggle, isCollapsed = false }) => {
  const [collapsed, setCollapsed] = useState(isCollapsed);
  const location = useLocation();

  const menuItems = [
    { id: 1, label: 'Dashboard', icon: '📊', path: '/admin/dashboard' },
    { id: 2, label: 'Produk', icon: '📦', path: '/admin/produk' },
    { id: 3, label: 'Transaksi', icon: '💳', path: '/admin/transaksi' },
    { id: 4, label: 'Pembayaran', icon: '💰', path: '/admin/pembayaran' },
    { id: 5, label: 'Stok', icon: '📈', path: '/admin/stok' }
  ];

  const footerMenuItems = [
    { id: 1, label: 'Pengguna', icon: '👥', path: '/admin/pengguna' },
    { id: 2, label: 'Laporan', icon: '📄', path: '/admin/laporan' }
  ];

  const accountMenuItems = [
    { id: 1, label: 'Pengaturan', icon: '⚙️', path: '/admin/pengaturan' },
    { id: 2, label: 'Keluar', icon: '🚪', path: '/signin' }
  ];

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  const isActive = (path) => location.pathname === path;

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
            <span className={styles.logoIcon}>🌾</span>
            {!collapsed && <span className={styles.logoText}>PT Ratu Oki</span>}
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
          </div>
        </nav>

        {/* User Profile Section */}
        <div className={styles.userSection}>
          {!collapsed && (
            <div className={styles.userInfo}>
              <p className={styles.userName}>Admin User</p>
              <p className={styles.userRole}>Administrator</p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
