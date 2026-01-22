import React, { useState } from 'react';
import styles from './AdminLayout.module.css';
import Sidebar from './Sidebar';
import Header from './Header';

/**
 * AdminLayout - Layout wrapper untuk halaman admin
 * Menyediakan sidebar, header, dan content area
 */
const AdminLayout = ({ children }) => {
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
        <Header onMenuClick={toggleSidebar} />
        <div className={styles.dashboardContent}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
