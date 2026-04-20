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

const PAID_TRANSACTION_STATUSES = new Set(['paid', 'shipped', 'completed']);
const SUCCESSFUL_PAYMENT_STATUSES = new Set(['settlement', 'capture', 'paid']);
const PENDING_PAYMENT_STATUSES = new Set(['pending', 'processing']);
const FAILED_PAYMENT_STATUSES = new Set(['deny', 'cancel', 'cancelled', 'expire', 'failure', 'failed']);

const getPaymentDisplayStatus = (transaction = {}) => {
  const paymentStatus = transaction.payment_status?.toLowerCase();
  const transactionStatus = transaction.status?.toLowerCase();

  if (paymentStatus === 'cancel' || paymentStatus === 'cancelled' || transactionStatus === 'cancelled') return 'cancelled';
  if (paymentStatus === 'deny') return 'deny';
  if (paymentStatus === 'failure' || paymentStatus === 'failed') return 'failed';
  if (paymentStatus === 'expire') return 'expire';
  if (SUCCESSFUL_PAYMENT_STATUSES.has(paymentStatus) || PAID_TRANSACTION_STATUSES.has(transactionStatus)) return 'paid';
  if (paymentStatus === 'processing') return 'processing';
  if (transactionStatus === 'pending') return 'pending';
  if (paymentStatus === 'pending') return 'pending';

  return paymentStatus || transactionStatus || 'unknown';
};

const getPaymentCategory = (transaction = {}) => {
  const paymentStatus = transaction.payment_status?.toLowerCase();
  const transactionStatus = transaction.status?.toLowerCase();

  if (FAILED_PAYMENT_STATUSES.has(paymentStatus) || transactionStatus === 'cancelled') {
    return 'failed';
  }

  if (SUCCESSFUL_PAYMENT_STATUSES.has(paymentStatus) || PAID_TRANSACTION_STATUSES.has(transactionStatus)) {
    return 'paid';
  }

  if (PENDING_PAYMENT_STATUSES.has(paymentStatus) || transactionStatus === 'pending') {
    return 'pending';
  }

  return 'unknown';
};

const buildSummaryFromTransactions = (transactions = []) => {
  return transactions.reduce((acc, transaction) => {
    const category = getPaymentCategory(transaction);
    const amount = Number(transaction.total_harga) || 0;

    acc.total_transaksi += 1;

    if (category === 'paid') {
      acc.total_pembayaran += amount;
      acc.total_pembayaran_count += 1;
    } else if (category === 'pending') {
      acc.pending_pembayaran += amount;
      acc.pending_pembayaran_count += 1;
    } else if (category === 'failed') {
      acc.gagal_pembayaran += amount;
      acc.gagal_pembayaran_count += 1;
    }

    return acc;
  }, {
    total_pembayaran: 0,
    pending_pembayaran: 0,
    gagal_pembayaran: 0,
    total_transaksi: 0,
    total_pembayaran_count: 0,
    pending_pembayaran_count: 0,
    gagal_pembayaran_count: 0
  });
};

const formatPaymentMethod = (method) => {
  const labels = {
    qris: 'QRIS',
    gopay: 'GoPay',
    shopeepay: 'ShopeePay',
    transfer: 'Transfer',
    bank_transfer: 'Transfer Bank',
    cash: 'Tunai'
  };

  if (!method) return '-';

  return labels[method.toLowerCase()] || method;
};

const Pembayaran = () => {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    total_pembayaran: 0,
    pending_pembayaran: 0,
    gagal_pembayaran: 0,
    total_transaksi: 0,
    total_pembayaran_count: 0,
    pending_pembayaran_count: 0,
    gagal_pembayaran_count: 0
  });

  const fetchPaymentData = useCallback(async () => {
    setLoading(true);

    try {
      const [transactionsResponse, statsResponse] = await Promise.all([
        transactionService.getAllAdmin({
          page: 1,
          limit: 20
        }),
        transactionService.getStats().catch(() => ({ data: {} }))
      ]);

      let transactionsData = [];
      if (Array.isArray(transactionsResponse.data)) {
        transactionsData = transactionsResponse.data;
      } else if (transactionsResponse.data) {
        transactionsData = transactionsResponse.data.transactions || transactionsResponse.data || [];
      }

      setTransactions(transactionsData);

      const stats = statsResponse.data || {};
      const paymentSummary = stats.payment_summary || {};
      const fallbackSummary = buildSummaryFromTransactions(transactionsData);

      setSummary({
        total_pembayaran: paymentSummary.total_paid_amount ?? stats.total_pembayaran ?? fallbackSummary.total_pembayaran,
        pending_pembayaran: paymentSummary.pending_amount ?? stats.pending_pembayaran ?? fallbackSummary.pending_pembayaran,
        gagal_pembayaran: paymentSummary.failed_amount ?? stats.gagal_pembayaran ?? fallbackSummary.gagal_pembayaran,
        total_transaksi: stats.total_transactions ?? fallbackSummary.total_transaksi,
        total_pembayaran_count: paymentSummary.total_paid_transactions ?? stats.successful_payment_count ?? fallbackSummary.total_pembayaran_count,
        pending_pembayaran_count: paymentSummary.pending_transactions ?? stats.pending_payment_count ?? fallbackSummary.pending_pembayaran_count,
        gagal_pembayaran_count: paymentSummary.failed_transactions ?? stats.failed_payment_count ?? fallbackSummary.gagal_pembayaran_count
      });
    } catch (error) {
      console.error('Error fetching payment data:', error);
      message.error('Gagal memuat data pembayaran');
      setTransactions([]);
      setSummary({
        total_pembayaran: 0,
        pending_pembayaran: 0,
        gagal_pembayaran: 0,
        total_transaksi: 0,
        total_pembayaran_count: 0,
        pending_pembayaran_count: 0,
        gagal_pembayaran_count: 0
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPaymentData();
  }, [fetchPaymentData]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';

    return new Date(dateStr).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      paid: '#27AE60',
      processing: '#3498DB',
      pending: '#F39C12',
      failed: '#E74C3C',
      cancelled: '#E74C3C',
      deny: '#C0392B',
      expire: '#7F8C8D',
      unknown: '#95A5A6'
    };

    return colors[status] || '#95A5A6';
  };

  const getStatusLabel = (status) => {
    const labels = {
      paid: 'Lunas',
      processing: 'Diproses',
      pending: 'Menunggu',
      failed: 'Gagal',
      cancelled: 'Dibatalkan',
      deny: 'Ditolak',
      expire: 'Kedaluwarsa',
      unknown: 'Tidak diketahui'
    };

    return labels[status] || status;
  };

  const metrics = [
    {
      id: 1,
      label: 'Total Pembayaran',
      value: formatCurrency(summary.total_pembayaran),
      change: `${summary.total_pembayaran_count} transaksi berhasil`,
      isPositive: summary.total_pembayaran > 0,
      icon: <DollarOutlined />,
      bgColor: '#2D7A52'
    },
    {
      id: 2,
      label: 'Menunggu Pembayaran',
      value: formatCurrency(summary.pending_pembayaran),
      change: `${summary.pending_pembayaran_count} transaksi menunggu`,
      isPositive: summary.pending_pembayaran_count === 0,
      icon: <ClockCircleOutlined />,
      bgColor: '#E67E22'
    },
    {
      id: 3,
      label: 'Pembayaran Gagal',
      value: formatCurrency(summary.gagal_pembayaran),
      change: `${summary.gagal_pembayaran_count} transaksi gagal`,
      isPositive: summary.gagal_pembayaran_count === 0,
      icon: <CloseCircleOutlined />,
      bgColor: '#E74C3C'
    },
    {
      id: 4,
      label: 'Total Transaksi',
      value: summary.total_transaksi.toString(),
      change: `${transactions.length} data terbaru ditampilkan`,
      isPositive: true,
      icon: <AppstoreOutlined />,
      bgColor: '#3498DB'
    }
  ];

  return (
    <AdminLayout headerType="simple" title="Monitoring Pembayaran" subTitle="Data dari transaksi order">
      <div className={styles.pembayaranContainer}>
        <div className={styles.metricsGrid}>
          {metrics.map((metric) => (
            <MetricsCard key={metric.id} {...metric} />
          ))}
        </div>

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
                {transactions.map((transaction) => {
                  const displayStatus = getPaymentDisplayStatus(transaction);

                  return (
                    <tr key={transaction.id || transaction.invoice_number}>
                      <td className={styles.orderId}>{transaction.invoice_number || `#${transaction.id || transaction.order_id}`}</td>
                      <td>{transaction.consumer?.nama || transaction.nama_penerima || 'Customer'}</td>
                      <td>{formatPaymentMethod(transaction.payment_method || transaction.metode_pembayaran)}</td>
                      <td className={styles.amount}>{formatCurrency(transaction.total_harga)}</td>
                      <td>{formatDate(transaction.tanggal_transaksi || transaction.createdAt || transaction.tanggal_order)}</td>
                      <td>
                        <span
                          className={styles.statusBadge}
                          style={{ backgroundColor: getStatusColor(displayStatus) }}
                        >
                          {getStatusLabel(displayStatus)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Pembayaran;
