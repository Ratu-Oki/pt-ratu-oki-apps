import React, { useState } from 'react';
import styles from './AdminLayout.module.css';
import Sidebar from './Sidebar';
import Header from './Header';

/**
 * AdminLayout - Layout wrapper untuk halaman admin
 * Menyediakan sidebar, header, dan content area
 * 
 * @param {ReactNode} children - Konten halaman
 * @param {string} headerType - Tipe header: "full" (search + profile) atau "simple" (hanya judul)
 * @param {string} title - Judul halaman (untuk simple header)
 * @param {string} subTitle - Subtitle halaman (untuk simple header)
 */
const AdminLayout = ({ children, headerType = 'full', title, subTitle }) => {
  const [sidebarOpen, setSidebarOpen] = useState(
    typeof window !== 'undefined' ? window.innerWidth > 768 : true
  );

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className={styles.dashboardContainer}>
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
      <div className={styles.mainContent}>
        <Header onMenuClick={toggleSidebar} type={headerType} title={title} subTitle={subTitle} />
        <div className={styles.dashboardContent}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
