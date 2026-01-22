/**
 * Pembayaran Page
 * Halaman monitoring pembayaran dengan data transaksi
 */
import React from 'react';
import styles from './Pembayaran.module.css';
import AdminLayout from './components/AdminLayout';

const Pembayaran = () => {
  return (
    <AdminLayout>
      <div className={styles.pembayaranPage}>
        <h1>Pembayaran</h1>
        {/* Content akan ditambahkan nanti */}
      </div>
    </AdminLayout>
  );
};

export default Pembayaran;
