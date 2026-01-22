/**
 * Pengguna Page
 * Halaman manajemen pengguna dan admin
 */
import React from 'react';
import styles from './Pengguna.module.css';
import AdminLayout from './components/AdminLayout';

const Pengguna = () => {
  return (
    <AdminLayout headerType="simple" title="Pengguna">
      <div className={styles.penggunaPage}>
        <h1>Pengguna</h1>
        {/* Content akan ditambahkan nanti */}
      </div>
    </AdminLayout>
  );
};

export default Pengguna;
