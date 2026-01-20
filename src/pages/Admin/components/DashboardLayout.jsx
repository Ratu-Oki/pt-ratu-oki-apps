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

  // Dummy data untuk metrics
  const metrics = [
    {
      id: 1,
      label: 'Total Penjualan',
      value: 'Rp 45.2M',
      change: '+12%',
      isPositive: true,
      icon: '💰',
      bgColor: '#2D7A52'
    },
    {
      id: 2,
      label: 'Total Pesanan',
      value: '156',
      change: '+8%',
      isPositive: true,
      icon: '🛍️',
      bgColor: '#8B5A3C'
    },
    {
      id: 3,
      label: 'Produk Aktif',
      value: '48',
      change: '+3%',
      isPositive: true,
      icon: '📦',
      bgColor: '#27AE60'
    },
    {
      id: 4,
      label: 'Pelanggan Baru',
      value: '23',
      change: '-2%',
      isPositive: false,
      icon: '👥',
      bgColor: '#E67E22'
    }
  ];

  // Dummy data untuk transaksi
  const transactions = [
    {
      id: '#ORD-2401',
      supplier: 'Budi Santoso',
      product: 'Venda Grade A (500g)',
      total: 'Rp 4.250.000',
      status: 'Berhasil'
    },
    {
      id: '#ORD-2400',
      supplier: 'Sri Rahayú',
      product: 'Venda Grade B (1kg)',
      total: 'Rp 8.500.000',
      status: 'Pending'
    },
    {
      id: '#ORD-2399',
      supplier: 'Ahmad Wijaya',
      product: 'Venda Grade A (250g)',
      total: 'Rp 2.125.000',
      status: 'Diproses'
    },
    {
      id: '#ORD-2398',
      supplier: 'Dewi Lestari',
      product: 'Venda Grade C (2kg)',
      total: 'Rp 9.000.000',
      status: 'Berhasil'
    }
  ];

  // Dummy data untuk aktivitas
  const activities = [
    {
      id: 1,
      title: 'Pesanan #ORD-2401 selesai dikirim',
      time: '2 jam yang lalu',
      icon: '✅'
    },
    {
      id: 2,
      title: 'Pesanan baru dari Siti Rahayu',
      time: '15 menit yang lalu',
      icon: '📝'
    },
    {
      id: 3,
      title: 'Penambahan baru dari Kellan Sukabumi',
      time: '1 jam yang lalu',
      icon: '🆕'
    },
    {
      id: 4,
      title: 'Supplier baru terdaftar',
      time: '3 jam yang lalu',
      icon: '🤝'
    }
  ];

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
