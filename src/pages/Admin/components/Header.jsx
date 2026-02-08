import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Dropdown, Modal, message } from 'antd';
import { LogoutOutlined, UserOutlined, NotificationOutlined  } from '@ant-design/icons';
import { useAuth } from '../../../context/AuthContext';
import styles from './Header.module.css';

/**
 * Header Component
 * @param {function} onMenuClick - Callback untuk toggle sidebar
 * @param {string} title - Judul halaman (optional, untuk type="simple")
 * @param {string} subTitle - Subtitle atau label tambahan (optional)
 * @param {string} type - Tipe header: "full" (dengan search + profile) atau "simple" (hanya judul)
 * @param {React.ReactNode} actionButton - Action button untuk ditampilkan di sisi kanan header
 */
const Header = ({ onMenuClick, title, subTitle, type = 'full', actionButton }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();


  const handleLogout = () => {
    Modal.confirm({
      title: 'Konfirmasi Logout',
      content: 'Apakah Anda yakin ingin keluar?',
      okText: 'Ya, Keluar',
      cancelText: 'Batal',
      okButtonProps: { danger: true },
      onOk: () => {
        logout();
        message.success('Berhasil logout');
        navigate('/signin');
      }
    });
  };


  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <header className={styles.header}>
      {type === 'full' ? (
        <>
          {/* Full Header with Search and Profile */}
          <div className={styles.headerLeft}>
            <button
              className={styles.menuButton}
              onClick={onMenuClick}
              aria-label="Toggle sidebar"
            >
              ☰
            </button>
            {actionButton && actionButton}
          </div>

          <div className={styles.headerRight}>
            <button className={styles.notificationButton}>
              <span className={styles.notificationIcon}><NotificationOutlined /></span>
            </button>

            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
              <button className={styles.userButton}>
                <span className={styles.userIcon}><UserOutlined /></span>
                <span className={styles.userName}>{user?.nama || 'Admin'}</span>
              </button>
            </Dropdown>
          </div>
        </>
      ) : (
        <>
          {/* Simple Header with Title and optional SubTitle */}
          <div className={styles.headerLeft}>
            <button
              className={styles.menuButton}
              onClick={onMenuClick}
              aria-label="Toggle sidebar"
            >
              ☰
            </button>
            {title && (
              <div className={styles.titleSection}>
                <h2 className={styles.pageTitle}>{title}</h2>
              </div>
            )}
          </div>

          <div className={styles.headerRight}>
            {subTitle && <p className={styles.pageSubtitle}>{subTitle}</p>}
            {actionButton && actionButton}
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
              <button className={styles.userButton} style={{ marginLeft: '16px' }}>
                <span className={styles.userIcon}>👤</span>
                <span className={styles.userName}>{user?.nama || 'Admin'}</span>
              </button>
            </Dropdown>
          </div>
        </>
      )}
    </header>
  );
};

export default Header;
