/**
 * Laporan Page
 * Halaman laporan penjualan dan analisis data
 */
import React from 'react';
import styles from './Laporan.module.css';
import AdminLayout from './components/AdminLayout';

const Laporan = () => {
  return (
    <AdminLayout>
      <div className={styles.laporanPage}>
        <h1>Laporan</h1>
        {/* Content akan ditambahkan nanti */}
      </div>
    </AdminLayout>
  );
};

export default Laporan;
