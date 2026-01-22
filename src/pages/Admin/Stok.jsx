/**
 * Stok Page
 * Halaman manajemen stok produk
 */
import React from 'react';
import styles from './Stok.module.css';
import AdminLayout from './components/AdminLayout';

const Stok = () => {
  return (
    <AdminLayout>
      <div className={styles.stokPage}>
        <h1>Stok</h1>
        {/* Content akan ditambahkan nanti */}
      </div>
    </AdminLayout>
  );
};

export default Stok;
