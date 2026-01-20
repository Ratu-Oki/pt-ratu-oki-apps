import React, { useState } from 'react';
import styles from './Sidebar.module.css';

const Sidebar = ({ isOpen, onToggle, isCollapsed = false }) => {
  const [collapsed, setCollapsed] = useState(isCollapsed);

  const menuItems = [
    { id: 1, label: 'Dashboard', icon: '📊', isActive: true },
    { id: 2, label: 'Produk', icon: '📦', isActive: false },
    { id: 3, label: 'Transaksi', icon: '💳', isActive: false },
    { id: 4, label: 'Pembayaran', icon: '💰', isActive: false },
    { id: 5, label: 'Stok', icon: '📈', isActive: false }
  ];

  const footerMenuItems = [
    { id: 1, label: 'Pengguna', icon: '👥', isActive: false },
    { id: 2, label: 'Laporan', icon: '📄', isActive: false }
  ];

  const accountMenuItems = [
    { id: 1, label: 'Pengaturan', icon: '⚙️', isActive: false },
    { id: 2, label: 'Keluar', icon: '🚪', isActive: false }
  ];

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
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
              <a
                key={item.id}
                href="#!"
                className={`${styles.menuItem} ${item.isActive ? styles.active : ''}`}
                title={collapsed ? item.label : ''}
              >
                <span className={styles.menuIcon}>{item.icon}</span>
                {!collapsed && <span className={styles.menuText}>{item.label}</span>}
              </a>
            ))}
          </div>

          <div className={styles.menuSection}>
            {!collapsed && <p className={styles.menuLabel}>MENU LAINNYA</p>}
            {footerMenuItems.map(item => (
              <a
                key={item.id}
                href="#!"
                className={styles.menuItem}
                title={collapsed ? item.label : ''}
              >
                <span className={styles.menuIcon}>{item.icon}</span>
                {!collapsed && <span className={styles.menuText}>{item.label}</span>}
              </a>
            ))}
          </div>

          <div className={styles.menuSection}>
            {!collapsed && <p className={styles.menuLabel}>AKUN</p>}
            {accountMenuItems.map(item => (
              <a
                key={item.id}
                href="#!"
                className={styles.menuItem}
                title={collapsed ? item.label : ''}
              >
                <span className={styles.menuIcon}>{item.icon}</span>
                {!collapsed && <span className={styles.menuText}>{item.label}</span>}
              </a>
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
