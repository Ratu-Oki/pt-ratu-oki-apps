/**
 * Transaksi Page
 * Halaman daftar transaksi
 */
import React from 'react';
import styles from './Transaksi.module.css';
import AdminLayout from './components/AdminLayout';

const Transaksi = () => {
  return (
    <AdminLayout>
      <div className={styles.transaksiPage}>
        <h1>Transaksi</h1>
        {/* Content akan ditambahkan nanti */}
      </div>
    </AdminLayout>
  );
};

export default Transaksi;
