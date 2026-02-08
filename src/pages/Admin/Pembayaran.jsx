/**
 * Pembayaran Page
 * Halaman monitoring pembayaran dengan data dari API
 */
import React, { useState, useEffect, useCallback } from 'react';
import styles from './Pembayaran.module.css';
import AdminLayout from './components/AdminLayout';
import MetricsCard from './components/MetricsCard';
import { transactionService } from '../../services/api';
import { Spin, message, Empty } from 'antd';
import { DollarOutlined, ClockCircleOutlined, CloseCircleOutlined, AppstoreOutlined } from '@ant-design/icons';

const Pembayaran = () => {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    total_pembayaran: 0,
    pending_pembayaran: 0,
    gagal_pembayaran: 0,
    total_transaksi: 0
  });

  // Fetch payment data
  const fetchPaymentData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await transactionService.getAllAdmin({
        page: 1,
        limit: 20
      });

      // Handle both array and object response formats
      let transactionsData = [];
      if (Array.isArray(response.data)) {
        transactionsData = response.data;
      } else if (response.data) {
        transactionsData = response.data.transactions || response.data || [];
      }

      setTransactions(transactionsData);

      // Calculate summary from transactions
      const totalPembayaran = transactionsData
        .filter(t => t.status_pembayaran === 'paid' || t.status_pembayaran === 'completed')
        .reduce((sum, t) => sum + (t.total_harga || 0), 0);
      const pendingPembayaran = transactionsData
        .filter(t => t.status_pembayaran === 'pending')
        .reduce((sum, t) => sum + (t.total_harga || 0), 0);
      const gagalPembayaran = transactionsData
        .filter(t => t.status_pembayaran === 'failed' || t.status_pembayaran === 'cancelled')
        .reduce((sum, t) => sum + (t.total_harga || 0), 0);

      setSummary({
        total_pembayaran: totalPembayaran,
        pending_pembayaran: pendingPembayaran,
        gagal_pembayaran: gagalPembayaran,
        total_transaksi: transactionsData.length
      });
    } catch (error) {
      console.error('Error fetching payment data:', error);
      message.error('Gagal memuat data pembayaran');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPaymentData();
  }, [fetchPaymentData]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      paid: '#27AE60',
      completed: '#27AE60',
      pending: '#F39C12',
      failed: '#E74C3C',
      cancelled: '#E74C3C'
    };
    return colors[status] || '#95A5A6';
  };

  const getStatusLabel = (status) => {
    const labels = {
      paid: 'Dibayar',
      completed: 'Selesai',
      pending: 'Menunggu',
      failed: 'Gagal',
      cancelled: 'Dibatalkan'
    };
    return labels[status] || status;
  };

  // Metrics data
  const metrics = [
    {
      id: 1,
      label: 'Total Pembayaran',
      value: formatCurrency(summary.total_pembayaran),
      icon: <DollarOutlined />,
      bgColor: '#2D7A52'
    },
    {
      id: 2,
      label: 'Menunggu Pembayaran',
      value: formatCurrency(summary.pending_pembayaran),
      icon: <ClockCircleOutlined />,
      bgColor: '#E67E22'
    },
    {
      id: 3,
      label: 'Pembayaran Gagal',
      value: formatCurrency(summary.gagal_pembayaran),
      icon: <CloseCircleOutlined />,
      bgColor: '#E74C3C'
    },
    {
      id: 4,
      label: 'Total Transaksi',
      value: summary.total_transaksi.toString(),
      icon: <AppstoreOutlined />,
      bgColor: '#3498DB'
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
      case 'completed':
        return '✓';
      case 'pending':
        return '⏳';
      case 'failed':
      case 'cancelled':
        return '✕';
      default:
        return '•';
    }
  };

  return (
    <AdminLayout headerType="simple" title="Monitoring Pembayaran" subTitle="Data dari transaksi order">
      <div className={styles.pembayaranContainer}>

        {/* Metrics Grid */}
        <div className={styles.metricsGrid}>
          {metrics.map(metric => (
            <MetricsCard key={metric.id} {...metric} />
          ))}
        </div>

        {/* Transactions Table */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 50 }}>
            <Spin size="large" />
          </div>
        ) : transactions.length === 0 ? (
          <Empty description="Belum ada data transaksi" />
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ORDER ID</th>
                  <th>PELANGGAN</th>
                  <th>METODE</th>
                  <th>JUMLAH</th>
                  <th>WAKTU</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td className={styles.orderId}>#{tx.id || tx.order_id}</td>
                    <td>{tx.consumer?.nama || tx.nama_penerima || 'Customer'}</td>
                    <td>{tx.metode_pembayaran || 'Transfer'}</td>
                    <td className={styles.amount}>{formatCurrency(tx.total_harga)}</td>
                    <td>{formatDate(tx.createdAt || tx.tanggal_order)}</td>
                    <td>
                      <span
                        className={styles.statusBadge}
                        style={{ backgroundColor: getStatusColor(tx.status_pembayaran) }}
                      >
                        {getStatusIcon(tx.status_pembayaran)} {getStatusLabel(tx.status_pembayaran)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Pembayaran;
