import React, { useMemo } from 'react';
import { Layout, Menu, Badge, Space, Drawer, Button, Tooltip } from 'antd';
import { ShoppingCartOutlined, UserOutlined, MenuOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Header.module.css';

const { Header: AntHeader } = Layout;

/**
 * Header Component
 * Navigation bar dengan logo, menu, cart, dan user profile
 */
const Header = ({ cartCount = 7, userName = 'Budi S.' }) => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const location = useLocation();

  const menuItems = [
    { key: 'catalog', label: <Link to="/consumer">Katalog</Link> },
    { key: 'history', label: <Link to="/consumer/riwayat">Riwayat</Link> },
    { key: 'status', label: <Link to="/consumer/status-pesanan">Status Pesanan</Link> },
  ];

  const getSelectedKey = () => {
    if (location.pathname === '/consumer/status-pesanan') {
      return ['status'];
    }
    if (location.pathname === '/consumer/riwayat') {
      return ['history'];
    }
    if (location.pathname === '/consumer/cart') {
      return [];
    }
    return ['catalog'];
  };

  const handleMenuClick = ({ key }) => {
    setDrawerVisible(false);
  };

  return (
    <AntHeader className={styles.header}>
      <div className={styles.headerContainer}>
  
        <div className={styles.logoSection}>
          <Link to="/consumer" style={{ textDecoration: 'none' }}>
            <div className={styles.logo}>
              <span className={styles.logoIcon}>🟢</span>
              <span className={styles.logoText}>PT Ratu Oki</span>
            </div>
          </Link>
        </div>

        <Menu
          mode="horizontal"
          items={menuItems}
          onClick={handleMenuClick}
          selectedKeys={getSelectedKey()}
          selectable={true}
          multiple={false}
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

      
        <Space size="large" className={styles.headerRight}>
     
          <Tooltip title={`${cartCount} item dalam keranjang`}>
            <Link to="/consumer/cart" style={{ textDecoration: 'none' }}>
              <Badge count={cartCount} color="#ff4d4f" size="small">
                <ShoppingCartOutlined
                  style={{
                    fontSize: '24px',
                    color: location.pathname === '/consumer/cart' ? '#1b5e3f' : 'white',
                    cursor: 'pointer',
                    transition: 'color 0.3s',
                  }}
                />
              </Badge>
            </Link>
          </Tooltip>

          <div className={styles.userProfile}>
            <UserOutlined style={{ fontSize: '20px', color: '#1b5e3f' }} />
            <span>{userName}</span>
          </div>

       
          <Button
            type="text"
            icon={<MenuOutlined style={{ fontSize: '20px' }} />}
            onClick={() => setDrawerVisible(true)}
            className={styles.mobileMenuBtn}
            style={{ color: 'white' }}
          />
        </Space>

    
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
            selectedKeys={getSelectedKey()}
            style={{ border: 'none' }}
          />
        </Drawer>
      </div>
    </AntHeader>
  );
};

export default Header;
