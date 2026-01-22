/**
 * Pembayaran Page
 * Halaman monitoring pembayaran dengan data transaksi
 */
import React, { useState } from 'react';
import styles from './Pembayaran.module.css';
import AdminLayout from './components/AdminLayout';
import MetricsCard from './components/MetricsCard';

const Pembayaran = () => {
  // Metrics data
  const metrics = [
    {
      id: 1,
      label: 'Total Pembayaran',
      value: 'Rp 45.2M',
      change: '+12%',
      isPositive: true,
      icon: '💰',
      bgColor: '#2D7A52'
    },
    {
      id: 2,
      label: 'Menunggu Pembayaran',
      value: 'Rp 2.5M',
      change: '+5%',
      isPositive: true,
      icon: '⏳',
      bgColor: '#E67E22'
    },
    {
      id: 3,
      label: 'Pembayaran Gagal',
      value: 'Rp 850K',
      change: '-3%',
      isPositive: false,
      icon: '❌',
      bgColor: '#E74C3C'
    },
    {
      id: 4,
      label: 'Total Transaksi',
      value: '156',
      change: '+8%',
      isPositive: true,
      icon: '📊',
      bgColor: '#3498DB'
    }
  ];

  // Transaction data
  const [transactions] = useState([
    {
      id: '#ORD-2401',
      customer: 'Budi Santoso',
      method: 'Bank Transfer (BCA)',
      amount: 'Rp 4.400.000',
      time: '13 Jan, 14:35',
      status: 'Sukses',
      statusColor: '#27AE60'
    },
    {
      id: '#ORD-2400',
      customer: 'Siti Rahayu',
      method: 'GCPay',
      amount: 'Rp 8.550.000',
      time: '12 Jan, 10:20',
      status: 'Sukses',
      statusColor: '#27AE60'
    },
    {
      id: '#ORD-2399',
      customer: 'Ahmad Wijaya',
      method: 'Bank Transfer (Mandiri)',
      amount: 'Rp 2.175.000',
      time: '12 Jan, 08:15',
      status: 'Pending',
      statusColor: '#F39C12'
    },
    {
      id: '#ORD-2398',
      customer: 'Dewi Lestari',
      method: 'DANA',
      amount: 'Rp 8.050.000',
      time: '11 Jan, 16:45',
      status: 'Sukses',
      statusColor: '#27AE60'
    },
    {
      id: '#ORD-2397',
      customer: 'Budi Hermawan',
      method: 'Credit Card',
      amount: 'Rp 850.000',
      time: '11 Jan, 14:30',
      status: 'Gagal',
      statusColor: '#E74C3C'
    }
  ]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Sukses':
        return '✓';
      case 'Pending':
        return '⏳';
      case 'Gagal':
        return '✕';
      default:
        return '•';
    }
  };

  return (
    <AdminLayout headerType="simple" title="Monitoring Pembayaran" subTitle="Powered by Midtrans">
      <div className={styles.pembayaranContainer}>

        {/* Metrics Grid */}
        <div className={styles.metricsGrid}>
          {metrics.map(metric => (
            <MetricsCard key={metric.id} {...metric} />
          ))}
        </div>

        {/* Transactions Table */}
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
                <th>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td className={styles.orderId}>{tx.id}</td>
                  <td>{tx.customer}</td>
                  <td>{tx.method}</td>
                  <td className={styles.amount}>{tx.amount}</td>
                  <td>{tx.time}</td>
                  <td>
                    <span 
                      className={styles.statusBadge}
                      style={{ backgroundColor: tx.statusColor }}
                    >
                      {getStatusIcon(tx.status)} {tx.status}
                    </span>
                  </td>
                  <td>
                    <button className={styles.actionBtn}>👁️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Pembayaran;
