import React from 'react';
import styles from './QuickActions.module.css';

const QuickActions = () => {
  const actions = [
    {
      id: 1,
      label: 'Tambah Produk',
      icon: '➕',
      color: '#2d7a52'
    },
    {
      id: 2,
      label: 'Lihat Order',
      icon: '📋',
      color: '#8B5A3C'
    },
    {
      id: 3,
      label: 'Download Laporan',
      icon: '⬇️',
      color: '#27AE60'
    },
    {
      id: 4,
      label: 'Kelola Stok',
      icon: '📦',
      color: '#E67E22'
    }
  ];

  return (
    <div className={styles.actionsContainer}>
      <h3 className={styles.actionsTitle}>Aksi Cepat</h3>
      <div className={styles.actionGrid}>
        {actions.map(action => (
          <button 
            key={action.id} 
            className={styles.actionButton}
            style={{ borderTopColor: action.color }}
          >
            <div 
              className={styles.actionIcon}
              style={{ backgroundColor: action.color }}
            >
              {action.icon}
            </div>
            <span className={styles.actionLabel}>{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
