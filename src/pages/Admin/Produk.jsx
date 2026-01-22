/**
 * Produk Page
 * Halaman manajemen produk
 */
import React from 'react';
import styles from './Produk.module.css';
import AdminLayout from './components/AdminLayout';

const Produk = () => {
  return (
    <AdminLayout>
      <div className={styles.produkPage}>
        <h1>Produk</h1>
        {/* Content akan ditambahkan nanti */}
      </div>
    </AdminLayout>
  );
};

export default Produk;
