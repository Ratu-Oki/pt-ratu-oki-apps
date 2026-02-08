/**
 * Dashboard Page
 * Halaman utama dashboard admin dengan data real dari API
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from './components/AdminLayout';
import styles from './components/AdminLayout.module.css';
import MetricsCard from './components/MetricsCard';
import RecentTransactions from './components/RecentTransactions';
import QuickActions from './components/QuickActions';
import RecentActivities from './components/RecentActivities';
import { transactionService, productService } from '../../services/api';
import { Spin, message } from 'antd';
import {
  ClockCircleOutlined,
  CreditCardOutlined,
  CarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CommentOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  AppstoreOutlined,
 
} from '@ant-design/icons';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [activities, setActivities] = useState([]);

  // Helper functions
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString('id-ID');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Pending',
      paid: 'Dibayar',
      shipped: 'Dikirim',
      completed: 'Selesai',
      cancelled: 'Dibatalkan'
    };
    return labels[status] || status;
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <ClockCircleOutlined />,
      paid: <CreditCardOutlined />,
      shipped: <CarOutlined />,
      completed: <CheckCircleOutlined />,
      cancelled: <CloseCircleOutlined />
    };
    return icons[status] || <CommentOutlined />;
  };

  const formatRelativeTime = (dateStr) => {
    if (!dateStr) return 'Baru saja';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit yang lalu`;
    if (diffHours < 24) return `${diffHours} jam yang lalu`;
    return `${diffDays} hari yang lalu`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all data in parallel
      const [transactionStats, recentTransactions, productList] = await Promise.all([
        transactionService.getStats().catch(() => ({ data: {} })),
        transactionService.getAllAdmin({ page: 1, limit: 10 }).catch(() => ({ data: { transactions: [] } })),
        productService.getAllAdmin({ page: 1, limit: 100 }).catch(() => ({ data: { products: [] } }))
      ]);

      // Build metrics from stats
      const stats = transactionStats.data || {};

      // Count active products from product list if not in stats
      let activeProductCount = stats.active_products || 0;
      if (!activeProductCount && productList.data) {
        const products = productList.data.products || productList.data || [];
        activeProductCount = products.filter(p => p.status_produk === 'active').length;
      }

      setMetrics([
        {
          id: 1,
          label: 'Total Penjualan',
          value: `Rp ${formatNumber(stats.total_revenue || stats.monthly?.revenue || 0)}`,
          change: stats.today?.revenue > 0 ? `+Rp ${formatNumber(stats.today.revenue)} hari ini` : 'Hari ini Rp 0',
          isPositive: (stats.today?.revenue || 0) > 0,
          icon: <DollarOutlined />,
          bgColor: '#2D7A52'
        },
        {
          id: 2,
          label: 'Total Pesanan',
          value: String(stats.total_transactions || stats.monthly?.transactions || 0),
          change: stats.today?.transactions > 0 ? `+${stats.today.transactions} hari ini` : 'Hari ini 0',
          isPositive: (stats.today?.transactions || 0) > 0,
          icon: <ShoppingCartOutlined />,
          bgColor: '#8B5A3C'
        },
        {
          id: 3,
          label: 'Produk Aktif',
          value: String(activeProductCount),
          change: `${stats.total_products || activeProductCount} total produk`,
          isPositive: true,
          icon:<AppstoreOutlined />,
          bgColor: '#27AE60'
        },
        {
          id: 4,
          label: 'Pending Transaksi',
          value: String(stats.pending_transactions || 0),
          change: stats.pending_transactions > 0 ? 'Perlu ditindak' : 'Semua selesai',
          isPositive: (stats.pending_transactions || 0) === 0,
          icon: <ClockCircleOutlined />,
          bgColor: '#E67E22'
        }
      ]);

      // Build transactions for table
      let txList = [];
      if (recentTransactions.data) {
        txList = recentTransactions.data.transactions || recentTransactions.data || [];
      }

      setTransactions(txList.map(tx => ({
        id: tx.invoice_number || `#ORD-${tx.id}`,
        supplier: tx.consumer?.nama || 'Unknown',
        product: tx.details?.[0]?.product?.nama_produk || 'Mixed Products',
        total: formatCurrency(tx.total_harga || 0),
        status: getStatusLabel(tx.status),
        date: formatDate(tx.tanggal_transaksi || tx.createdAt),
        rawStatus: tx.status
      })));

      // Build activities from recent transactions
      setActivities(txList.slice(0, 4).map((tx, idx) => ({
        id: idx + 1,
        title: `${getStatusLabel(tx.status)} - ${tx.invoice_number || `Order #${tx.id}`}`,
        time: formatRelativeTime(tx.updatedAt || tx.createdAt),
        icon: getStatusIcon(tx.status)
      })));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      message.error('Gagal memuat data dashboard');
      // Set fallback data
      setMetrics([
        { id: 1, label: 'Total Penjualan', value: 'Rp 0', change: 'Hari ini Rp 0', isPositive: true, icon: <DollarOutlined />, bgColor: '#2D7A52' },
        { id: 2, label: 'Total Pesanan', value: '0', change: 'Hari ini 0', isPositive: true, icon: <ShoppingCartOutlined />, bgColor: '#8B5A3C' },
        { id: 3, label: 'Produk Aktif', value: '0', change: '0 total produk', isPositive: true, icon:<AppstoreOutlined />, bgColor: '#27AE60' },
        { id: 4, label: 'Pending Transaksi', value: '0', change: 'Semua selesai', isPositive: true, icon:<ClockCircleOutlined />, bgColor: '#E67E22' }
      ]);
      setTransactions([]);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Handle view all transactions
  const handleViewAllTransactions = () => {
    navigate('/admin/transaksi');
  };

  if (loading) {
    return (
      <AdminLayout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <Spin size="large" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
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
          <RecentTransactions
            transactions={transactions}
            onViewAll={handleViewAllTransactions}
          />
        </div>

        {/* Right Column - Quick Actions and Activities */}
        <div className={styles.rightColumn}>
          <QuickActions />
          <RecentActivities activities={activities} />
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
