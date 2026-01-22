import React from 'react';
import styles from './Header.module.css';

/**
 * Header Component
 * @param {function} onMenuClick - Callback untuk toggle sidebar
 * @param {string} title - Judul halaman (optional, untuk type="simple")
 * @param {string} subTitle - Subtitle atau label tambahan (optional)
 * @param {string} type - Tipe header: "full" (dengan search + profile) atau "simple" (hanya judul)
 * @param {React.ReactNode} actionButton - Action button untuk ditampilkan di sisi kanan header
 */
const Header = ({ onMenuClick, title, subTitle, type = 'full', actionButton }) => {
  return (
    <header className={styles.header}>
      {type === 'full' ? (
        <>
          {/* Full Header with Search and Profile */}
          <div className={styles.headerLeft}>
            <button 
              className={styles.menuButton} 
              onClick={onMenuClick}
              aria-label="Toggle sidebar"
            >
              ☰
            </button>
            <div className={styles.searchBar}>
              <span className={styles.searchIcon}>🔍</span>
              <input 
                type="text" 
                placeholder="Cari produk, transaksi, pengguna..." 
                className={styles.searchInput}
              />
            </div>
          </div>

          <div className={styles.headerRight}>
            <button className={styles.notificationButton}>
              <span className={styles.notificationIcon}>🔔</span>
              <span className={styles.notificationBadge}>3</span>
            </button>

            <button className={styles.userButton}>
              <span className={styles.userIcon}>👤</span>
              <span className={styles.userName}>Admin User</span>
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Simple Header with Title and optional SubTitle */}
          <div className={styles.headerLeft}>
            <button 
              className={styles.menuButton} 
              onClick={onMenuClick}
              aria-label="Toggle sidebar"
            >
              ☰
            </button>
            {title && (
              <div className={styles.titleSection}>
                <h2 className={styles.pageTitle}>{title}</h2>
              </div>
            )}
          </div>

          <div className={styles.headerRight}>
            {subTitle && <p className={styles.pageSubtitle}>{subTitle}</p>}
            {actionButton && actionButton}
          </div>
        </>
      )}
    </header>
  );
};

export default Header;
