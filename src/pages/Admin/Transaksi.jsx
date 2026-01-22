/**
 * Transaksi Page
 * Halaman manajemen transaksi penjualan
 */
import React, { useState } from 'react';
import styles from './Transaksi.module.css';
import AdminLayout from './components/AdminLayout';

const Transaksi = () => {
  const [activeTab, setActiveTab] = useState('semua');
  const [searchTerm, setSearchTerm] = useState('');

  // Tab data dengan counts
  const tabs = [
    { id: 'semua', label: 'Semua', count: 156 },
    { id: 'diproses', label: 'Diproses', count: 23 },
    { id: 'dikirim', label: 'Dikirim', count: 38 },
    { id: 'selesai', label: 'Selesai', count: 102 },
    { id: 'dibatalkan', label: 'Dibatalkan', count: 3 }
  ];

  // Data transaksi
  const transactions = [
    {
      id: '#ORD-2401',
      pengguna: { name: 'Budi Santoso', email: 'budi@example.com', avatar: 'BS', color: '#3498DB' },
      produk: 'Vanilla Grade A (300g)',
      total: 'Rp 4.250.000',
      tanggal: '13 Jan 2026',
      status: 'SELESAI',
      statusColor: '#27AE60'
    },
    {
      id: '#ORD-2400',
      pengguna: { name: 'Siti Rahayu', email: 'siti@example.com', avatar: 'SR', color: '#3498DB' },
      produk: 'Vanilla Grade B (1kg)',
      total: 'Rp 8.500.000',
      tanggal: '12 Jan 2026',
      status: 'DIPROSES',
      statusColor: '#F39C12'
    },
    {
      id: '#ORD-2399',
      pengguna: { name: 'Ahmad Wijaya', email: 'ahmad@example.com', avatar: 'AW', color: '#3498DB' },
      produk: 'Vanilla Grade A (250g)',
      total: 'Rp 2.125.000',
      tanggal: '12 Jan 2026',
      status: 'DIKIRIM',
      statusColor: '#3498DB'
    },
    {
      id: '#ORD-2398',
      pengguna: { name: 'Dinar Lestari', email: 'dinar@example.com', avatar: 'DL', color: '#2D7A52' },
      produk: 'Vanilla Grade C (5kg)',
      total: 'Rp 9.000.000',
      tanggal: '11 Jan 2026',
      status: 'SELESAI',
      statusColor: '#27AE60'
    }
  ];

  // Action buttons
  const actionButtons = (
    <div className={styles.actionButtonsGroup}>
      <input 
        type="text"
        placeholder="Cari transaksi..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className={styles.searchInput}
      />
      <button className={styles.filterBtn}>🔍</button>
    </div>
  );

  return (
    <AdminLayout 
      headerType="full" 
      title="Manajemen Transaksi"
      actionButton={actionButtons}
    >
      <div className={styles.transaksiContainer}>
        {/* Tabs */}
        <div className={styles.tabsContainer}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label} <span className={styles.tabCount}>({tab.count})</span>
            </button>
          ))}
        </div>

        {/* Transactions Table */}
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ORDER ID</th>
                <th>PENGGUNA</th>
                <th>PRODUK</th>
                <th>TOTAL</th>
                <th>TANGGAL</th>
                <th>STATUS</th>
                <th>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className={styles.orderIdCell}>{transaction.id}</td>
                  <td className={styles.userCell}>
                    <div className={styles.userInfo}>
                      <div 
                        className={styles.avatar}
                        style={{ backgroundColor: transaction.pengguna.color }}
                      >
                        {transaction.pengguna.avatar}
                      </div>
                      <div className={styles.userDetails}>
                        <div className={styles.userName}>{transaction.pengguna.name}</div>
                        <div className={styles.userEmail}>{transaction.pengguna.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className={styles.produkCell}>{transaction.produk}</td>
                  <td className={styles.totalCell}>{transaction.total}</td>
                  <td className={styles.tanggalCell}>{transaction.tanggal}</td>
                  <td>
                    <span 
                      className={styles.statusBadge}
                      style={{ backgroundColor: transaction.statusColor }}
                    >
                      {transaction.status}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actionButtons}>
                      <button className={styles.actionBtn} title="Detail">👁</button>
                      <button className={styles.actionBtn} title="Edit">✎</button>
                      <button className={styles.actionBtn} title="Hapus">🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className={styles.paginationContainer}>
          <button className={styles.paginationBtn} disabled>❮</button>
          <button className={`${styles.paginationBtn} ${styles.active}`}>1</button>
          <button className={styles.paginationBtn}>2</button>
          <button className={styles.paginationBtn}>3</button>
          <button className={styles.paginationBtn}>❯</button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Transaksi;
