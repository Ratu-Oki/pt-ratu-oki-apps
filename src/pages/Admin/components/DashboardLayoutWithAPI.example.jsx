import React, { useState, useEffect } from 'react';
import styles from './DashboardLayout.module.css';
import Sidebar from './Sidebar';
import Header from './Header';
import MetricsCard from './MetricsCard';
import RecentTransactions from './RecentTransactions';
import QuickActions from './QuickActions';
import RecentActivities from './RecentActivities';

/**
 * DashboardLayoutWithAPI - Dashboard dengan integrasi API
 * File ini adalah CONTOH implementasi dengan API calls
 * 
 * Gunakan file ini sebagai referensi untuk mengganti dummy data dengan real data
 */

const DashboardLayoutWithAPI = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State untuk data
  const [metrics, setMetrics] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [activities, setActivities] = useState([]);

  // API Base URL (sesuaikan dengan backend Anda)
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  /**
   * Fetch data dari semua endpoint
   */
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch semua data secara parallel
      const [metricsRes, transactionsRes, activitiesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/dashboard/metrics`),
        fetch(`${API_BASE_URL}/dashboard/transactions`),
        fetch(`${API_BASE_URL}/dashboard/activities`)
      ]);

      // Check response status
      if (!metricsRes.ok || !transactionsRes.ok || !activitiesRes.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      // Parse JSON
      const metricsData = await metricsRes.json();
      const transactionsData = await transactionsRes.json();
      const activitiesData = await activitiesRes.json();

      // Set state
      setMetrics(metricsData);
      setTransactions(transactionsData);
      setActivities(activitiesData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Loading state
  if (loading) {
    return (
      <div className={styles.dashboardContainer}>
        <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
        <div className={styles.mainContent}>
          <Header onMenuClick={toggleSidebar} />
          <div className={styles.dashboardContent}>
            <div className={styles.loadingPlaceholder}>
              <p>Memuat data dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={styles.dashboardContainer}>
        <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
        <div className={styles.mainContent}>
          <Header onMenuClick={toggleSidebar} />
          <div className={styles.dashboardContent}>
            <div className={styles.errorPlaceholder}>
              <p>Error: {error}</p>
              <button onClick={fetchDashboardData}>Coba Lagi</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            {metrics.length > 0 ? (
              metrics.map(metric => (
                <MetricsCard key={metric.id} {...metric} />
              ))
            ) : (
              <p>Tidak ada data metrics</p>
            )}
          </div>

          {/* Main Content Grid */}
          <div className={styles.contentGrid}>
            {/* Left Column - Transactions */}
            <div className={styles.leftColumn}>
              {transactions.length > 0 ? (
                <RecentTransactions transactions={transactions} />
              ) : (
                <div style={{ background: 'white', padding: '20px', borderRadius: '12px' }}>
                  <p>Tidak ada transaksi terbaru</p>
                </div>
              )}
            </div>

            {/* Right Column - Quick Actions and Activities */}
            <div className={styles.rightColumn}>
              <QuickActions />
              {activities.length > 0 ? (
                <RecentActivities activities={activities} />
              ) : (
                <div style={{ background: 'white', padding: '20px', borderRadius: '12px' }}>
                  <p>Tidak ada aktivitas terbaru</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayoutWithAPI;

/**
 * API RESPONSE FORMAT YANG DIHARAPKAN
 * 
 * GET /api/dashboard/metrics
 * Response:
 * [
 *   {
 *     id: 1,
 *     label: "Total Penjualan",
 *     value: "Rp 45.2M",
 *     change: "+12%",
 *     isPositive: true,
 *     icon: "💰",
 *     bgColor: "#2D7A52"
 *   },
 *   ...
 * ]
 * 
 * GET /api/dashboard/transactions
 * Response:
 * [
 *   {
 *     id: "#ORD-2401",
 *     supplier: "Budi Santoso",
 *     product: "Venda Grade A (500g)",
 *     total: "Rp 4.250.000",
 *     status: "Berhasil"
 *   },
 *   ...
 * ]
 * 
 * GET /api/dashboard/activities
 * Response:
 * [
 *   {
 *     id: 1,
 *     title: "Pesanan #ORD-2401 selesai dikirim",
 *     time: "2 jam yang lalu",
 *     icon: "✅"
 *   },
 *   ...
 * ]
 */
