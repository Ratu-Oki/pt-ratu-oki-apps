/**
 * Pengguna Page
 * Halaman manajemen pengguna dan admin
 */
import React, { useState } from 'react';
import styles from './Pengguna.module.css';
import AdminLayout from './components/AdminLayout';

const Pengguna = () => {
  const [activeTab, setActiveTab] = useState('semua');

  // Tab data with counts
  const tabs = [
    { id: 'semua', label: 'Semua', count: 1085 },
    { id: 'admin', label: 'Admin', count: 1 },
    { id: 'karyawan', label: 'Karyawan', count: 1228 },
    { id: 'supplier', label: 'Supplier', count: 2323 }
  ];

  const actionButton = (
    <button className={styles.addButton}>
      <span className={styles.plusIcon}>+</span> Tambah Pengguna
    </button>
  );

  // User data
  const users = [
    {
      id: 1,
      name: 'Admin Utama',
      email: 'admin@example.com',
      role: 'Admin',
      roleColor: '#2D7A52',
      joinDate: '1 Jan 2024',
      status: 'AKTIF',
      statusColor: '#27AE60',
      avatar: 'AU'
    },
    {
      id: 2,
      name: 'Budi Santoso',
      email: 'budi@example.com',
      role: 'Karyawan',
      roleColor: '#3498DB',
      joinDate: '5 Des 2025',
      status: 'AKTIF',
      statusColor: '#27AE60',
      avatar: 'BS'
    },
    {
      id: 3,
      name: 'Pak Joko',
      email: 'joko@example.com',
      role: 'Supplier',
      roleColor: '#F39C12',
      joinDate: '10 Nov 2025',
      status: 'AKTIF',
      statusColor: '#27AE60',
      avatar: 'PJ'
    },
    {
      id: 4,
      name: 'Siti Rahayu',
      email: 'siti@example.com',
      role: 'Karyawan',
      roleColor: '#3498DB',
      joinDate: '20 Sep 2025',
      status: 'NONAKTIF',
      statusColor: '#E74C3C',
      avatar: 'SR'
    }
  ];

  return (
    <AdminLayout 
      headerType="simple" 
      title="Manajemen Pengguna"
      actionButton={actionButton}
    >
      <div className={styles.penggunaContainer}>
        {/* Header with Add Button */}
        <div className={styles.headerSection}>
          <div className={styles.titleRow}>
            
           
              
            
          </div>

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
        </div>

        {/* Users Table */}
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>PENGGUNA</th>
                <th>ROLE</th>
                <th>TANGGAL BERGABUNG</th>
                <th>STATUS</th>
                <th>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td className={styles.userCell}>
                    <div className={styles.userInfo}>
                      <div 
                        className={styles.avatar}
                        style={{ backgroundColor: user.roleColor }}
                      >
                        {user.avatar}
                      </div>
                      <div className={styles.userDetails}>
                        <div className={styles.userName}>{user.name}</div>
                        <div className={styles.userEmail}>{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span 
                      className={styles.roleBadge}
                      style={{ backgroundColor: user.roleColor }}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td>{user.joinDate}</td>
                  <td>
                    <span 
                      className={styles.statusBadge}
                      style={{ backgroundColor: user.statusColor }}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actionButtons}>
                      <button className={styles.actionBtn} title="Edit">✎</button>
                      <button className={styles.actionBtn} title="Delete">🗑</button>
                    </div>
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

export default Pengguna;
