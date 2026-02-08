import React, { useState } from 'react';
import styles from './DashboardLayout.module.css';
import Sidebar from './Sidebar';
import Header from './Header';
import MetricsCard from './MetricsCard';
import RecentTransactions from './RecentTransactions';
import QuickActions from './QuickActions';
import RecentActivities from './RecentActivities';

const DashboardLayout = () => {
  // Initialize sidebar based on screen size
  const [sidebarOpen, setSidebarOpen] = useState(
    typeof window !== 'undefined' ? window.innerWidth > 480 : true
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
          {/* Welcome Section */}
          <div className={styles.welcomeSection}>
            <h2>Dashboard</h2>
            <p>Selamat datang kembali! Berikut ringkasan bisnis Anda hari ini.</p>
          </div>

          {/* Metrics Grid */}
          <div className={styles.metricsGrid}>
            {metrics.map(metric => (
              <MetricsCard key={metric.id} {...metric} />
            ))}
          </div>

          {/* Main Content Grid */}
          <div className={styles.contentGrid}>
            {/* Left Column - Transactions */}
            <div className={styles.leftColumn}>
              <RecentTransactions transactions={transactions} />
            </div>

            {/* Right Column - Quick Actions and Activities */}
            <div className={styles.rightColumn}>
              <QuickActions />
              <RecentActivities activities={activities} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
