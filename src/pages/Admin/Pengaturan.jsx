
import React from 'react';
import styles from './Pengaturan.module.css';
import AdminLayout from './components/AdminLayout';

const Pengaturan = () => {
  return (
    <AdminLayout headerType="simple" title="Pengaturan">
      <div className={styles.pengaturanPage}>
        <h1>Pengaturan</h1>
        {/* Content akan ditambahkan nanti */}
      </div>
    </AdminLayout>
  );
};

export default Pengaturan;
