import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './QuickActions.module.css';
import { message } from 'antd';
import {
  PlusOutlined,
  FileTextOutlined,
  AreaChartOutlined,
  InboxOutlined
} from '@ant-design/icons';

const QuickActions = () => {
  const navigate = useNavigate();

  const handleAction = (actionId) => {
    switch (actionId) {
      case 1: // Tambah Produk
        navigate('/admin/produk', { state: { openModal: true } });
        break;
      case 2: // Lihat Order
        navigate('/admin/transaksi');
        break;
      case 3: // Download Laporan
        navigate('/admin/laporan');
        break;
      case 4: // Kelola Stok
        navigate('/admin/stok');
        break;
      default:
        message.info('Aksi tidak tersedia');
    }
  };

  const actions = [
    {
      id: 1,
      label: 'Tambah Produk',
      icon: <PlusOutlined />,
      color: '#2d7a52',
      description: 'Tambah produk baru'
    },
    {
      id: 2,
      label: 'Lihat Order',
      icon: <AreaChartOutlined />,
      color: '#8B5A3C',
      description: 'Kelola pesanan'
    },
    {
      id: 3,
      label: 'Download Laporan',
      icon: <FileTextOutlined />,
      color: '#27AE60',
      description: 'Lihat & export laporan'
    },
    {
      id: 4,
      label: 'Kelola Stok',
      icon: <InboxOutlined />,
      color: '#E67E22',
      description: 'Atur persediaan'
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
            onClick={() => handleAction(action.id)}
          >
            <div
              className={styles.actionIcon}
              style={{ backgroundColor: action.color }}
            >
              {action.icon}
            </div>
            <div className={styles.actionContent}>
              <span className={styles.actionLabel}>{action.label}</span>
              <span className={styles.actionDesc}>{action.description}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
