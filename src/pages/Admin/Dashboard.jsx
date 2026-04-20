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
import { transactionService, productService, stockService } from '../../services/api';
import { Spin, message } from 'antd';
import {
  ClockCircleOutlined,
  CreditCardOutlined,
  CarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CommentOutlined,
  DollarOutlined,
  AppstoreOutlined,
  DatabaseOutlined,
  ArrowDownOutlined,
  WalletOutlined,
  SendOutlined,
 
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
      // Fetch all data in parallel including stock summary
      const [transactionStats, recentTransactions, productList, stockSummary] = await Promise.all([
        transactionService.getStats().catch(() => ({ data: {} })),
        transactionService.getAllAdmin({ page: 1, limit: 10 }).catch(() => ({ data: { transactions: [] } })),
        productService.getAllAdmin({ page: 1, limit: 100 }).catch(() => ({ data: { products: [] } })),
        stockService.getSummary().catch(() => ({ data: {} }))
      ]);

      // Build metrics from stats
      const stats = transactionStats.data || {};
      const summary = stockSummary.data || {};

      // Count active products from product list if not in stats
      let activeProductCount = stats.active_products || 0;
      if (!activeProductCount && productList.data) {
        const products = productList.data.products || productList.data || [];
        activeProductCount = products.filter(p => p.status_produk === 'active').length;
      }

      // Barang keluar = jumlah item yang benar-benar terjual
      const totalItemsMovedOut = summary.items_sold_total || stats.total_items_sold || 0;
      const todayItemsMovedOut = summary.items_sold_today || stats.today?.items_sold || 0;

      // Stok gudang = supply yang sudah dibayar supplier dikurangi barang yang sudah terjual
      const warehouseStock = summary.warehouse_stock || summary.total_stock || 0;

      setMetrics([
        {
          id: 1,
          label: 'Total Penjualan',
          value: formatCurrency(stats.total_revenue || stats.monthly?.revenue || 0),
          change: stats.today?.revenue > 0 ? `+${formatCurrency(stats.today.revenue)} hari ini` : 'Hari ini Rp 0',
          isPositive: (stats.today?.revenue || 0) > 0,
          icon: <DollarOutlined />,
          bgColor: '#2D7A52'
        },
        {
          id: 2,
          label: 'Saldo Perusahaan',
          value: formatCurrency(stats.company_balance || 0),
          change: 'Penjualan - bayar supplier',
          isPositive: (stats.company_balance || 0) >= 0,
          icon: <WalletOutlined />,
          bgColor: '#8E44AD'
        },
        {
          id: 3,
          label: 'Bayar Supplier',
          value: formatCurrency(stats.total_supplier_paid || 0),
          change: stats.monthly_supplier_paid > 0 ? `${formatCurrency(stats.monthly_supplier_paid)} bulan ini` : 'Rp 0 bulan ini',
          isPositive: false,
          icon: <SendOutlined />,
          bgColor: '#C0392B'
        },
        {
          id: 4,
          label: 'Barang Keluar',
          value: String(totalItemsMovedOut),
          change: todayItemsMovedOut > 0 ? `+${todayItemsMovedOut} hari ini` : 'Hari ini 0',
          isPositive: todayItemsMovedOut > 0,
          icon: <ArrowDownOutlined />,
          bgColor: '#D35400'
        },
        {
          id: 5,
          label: 'Stok Gudang',
          value: String(warehouseStock),
          change: `${formatNumber(summary.paid_stock_quantity || warehouseStock)} stok dibayar supplier`,
          isPositive: warehouseStock > 0,
          icon: <DatabaseOutlined />,
          bgColor: '#27AE60'
        },
        {
          id: 6,
          label: 'Produk Aktif',
          value: String(activeProductCount),
          change: `${stats.total_products || activeProductCount} total produk`,
          isPositive: true,
          icon: <AppstoreOutlined />,
          bgColor: '#2980B9'
        },
        {
          id: 7,
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
        { id: 2, label: 'Saldo Perusahaan', value: 'Rp 0', change: 'Penjualan - bayar supplier', isPositive: true, icon: <WalletOutlined />, bgColor: '#8E44AD' },
        { id: 3, label: 'Bayar Supplier', value: 'Rp 0', change: 'Rp 0 bulan ini', isPositive: false, icon: <SendOutlined />, bgColor: '#C0392B' },
        { id: 4, label: 'Barang Keluar', value: '0', change: 'Hari ini 0', isPositive: true, icon: <ArrowDownOutlined />, bgColor: '#D35400' },
        { id: 5, label: 'Stok Gudang', value: '0', change: '0 stok dibayar supplier', isPositive: true, icon: <DatabaseOutlined />, bgColor: '#27AE60' },
        { id: 6, label: 'Produk Aktif', value: '0', change: '0 total produk', isPositive: true, icon:<AppstoreOutlined />, bgColor: '#2980B9' },
        { id: 7, label: 'Pending Transaksi', value: '0', change: 'Semua selesai', isPositive: true, icon:<ClockCircleOutlined />, bgColor: '#E67E22' }
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

  // Real-time polling: Auto-refresh metrics every 10 seconds when dashboard is active
  useEffect(() => {
    const pollingInterval = setInterval(() => {
      fetchDashboardData();
    }, 10000); // 10 seconds polling interval

    return () => {
      // Cleanup: Clear interval when component unmounts or when polling settings change
      clearInterval(pollingInterval);
    };
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
