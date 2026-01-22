
import React from 'react';
import styles from './Pengaturan.module.css';
import AdminLayout from './components/AdminLayout';

const Pengaturan = () => {
  return (
    <AdminLayout>
      <div className={styles.pengaturanPage}>
        <h1>Pengaturan</h1>
        {/* Content akan ditambahkan nanti */}
      </div>
    </AdminLayout>
  );
};

export default Pengaturan;
