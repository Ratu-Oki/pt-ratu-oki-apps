import React from 'react';
import styles from './Header.module.css';

const Header = ({ onMenuClick }) => {
  return (
    <header className={styles.header}>
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
    </header>
  );
};

export default Header;
