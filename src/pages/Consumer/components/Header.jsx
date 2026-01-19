import React, { useMemo } from 'react';
import { Layout, Menu, Badge, Space, Drawer, Button, Tooltip } from 'antd';
import { ShoppingCartOutlined, UserOutlined, MenuOutlined } from '@ant-design/icons';
import { useState } from 'react';
import styles from './Header.module.css';

const { Header: AntHeader } = Layout;

/**
 * Header Component
 * Navigation bar dengan logo, menu, cart, dan user profile
 */
const Header = ({ cartCount = 7, userName = 'Budi S.' }) => {
  const [drawerVisible, setDrawerVisible] = useState(false);

  const menuItems = [
    { key: 'home', label: 'Beranda' },
    { key: 'catalog', label: 'Katalog' },
    { key: 'history', label: 'Riwayat' },
    { key: 'status', label: 'Status Pesanan' },
  ];

  const handleMenuClick = ({ key }) => {
    console.log('Menu clicked:', key);
    setDrawerVisible(false);
  };

  return (
    <AntHeader className={styles.header}>
      <div className={styles.headerContainer}>
        {/* Logo Section */}
        <div className={styles.logoSection}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>🟢</span>
            <span className={styles.logoText}>PT Ratu Oki</span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <Menu
          mode="horizontal"
          items={menuItems}
          onClick={handleMenuClick}
          className={styles.desktopMenu}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: 'white',
            flex: 1,
            marginLeft: '24px',
          }}
          itemLabelStyle={{ color: 'white' }}
        />

        {/* Right Section */}
        <Space size="large" className={styles.headerRight}>
          {/* Cart Icon */}
          <Tooltip title={`${cartCount} item dalam keranjang`}>
            <Badge count={cartCount} color="#ff4d4f" size="small">
              <ShoppingCartOutlined
                style={{
                  fontSize: '24px',
                  color: 'white',
                  cursor: 'pointer',
                }}
              />
            </Badge>
          </Tooltip>

          {/* User Profile */}
          <div className={styles.userProfile}>
            <UserOutlined style={{ fontSize: '20px', color: '#1b5e3f' }} />
            <span>{userName}</span>
          </div>

          {/* Mobile Menu Button */}
          <Button
            type="text"
            icon={<MenuOutlined style={{ fontSize: '20px' }} />}
            onClick={() => setDrawerVisible(true)}
            className={styles.mobileMenuBtn}
            style={{ color: 'white' }}
          />
        </Space>

        {/* Mobile Drawer Menu */}
        <Drawer
          placement="right"
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
          title="Menu"
          width={250}
        >
          <Menu
            mode="vertical"
            items={menuItems}
            onClick={handleMenuClick}
            style={{ border: 'none' }}
          />
        </Drawer>
      </div>
    </AntHeader>
  );
};

export default Header;
