import React, { useState, useEffect } from 'react';
import { Layout, Row, Col, Card, Button, Input, Empty, Divider, message } from 'antd';
import { DeleteOutlined, MinusOutlined, PlusOutlined, ShoppingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import styles from './Cart.module.css';
import { useAuth } from '../../context/AuthContext';

/**
 * Shopping Cart Page
 * Menampilkan daftar produk di keranjang dengan localStorage persistence
 */
const Cart = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState(() => {
    // Initialize from localStorage on mount
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [promoCode, setPromoCode] = useState('');

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  /**
   * Format currency
   */
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  /**
   * Calculate totals
   */
  const subtotal = cartItems.reduce((sum, item) => sum + (item.harga_jual || item.price || 0) * (item.qty || 1), 0);
  const shipping = cartItems.length > 0 ? 50000 : 0;
  const discount = promoCode === 'RATUOKI10' ? subtotal * 0.1 : 0;
  const total = subtotal + shipping - discount;

  /**
   * Handle quantity change
   */
  const handleQtyChange = (itemId, qty) => {
    if (qty <= 0) return;
    setCartItems(cartItems.map(item =>
      (item.id === itemId || item.cartItemId === itemId) ? { ...item, qty } : item
    ));
  };

  /**
   * Handle delete item
   */
  const handleDeleteItem = (itemId) => {
    setCartItems(cartItems.filter(item => item.id !== itemId && item.cartItemId !== itemId));
    message.success('Produk dihapus dari keranjang');
  };

  /**
   * Handle apply promo
   */
  const handleApplyPromo = () => {
    if (promoCode === 'RATUOKI10') {
      message.success('Promo code berhasil diterapkan! Diskon 10%');
    } else if (promoCode) {
      message.error('Kode promo tidak valid');
    } else {
      message.warning('Masukkan kode promo');
    }
  };

  /**
   * Handle checkout
   */
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      message.warning('Keranjang kosong');
      return;
    }
    navigate('/consumer/checkout');
  };

  /**
   * Handle continue shopping
   */
  const handleContinueShopping = () => {
    navigate('/consumer');
  };

  return (
    <Layout className={styles.layout}>
      {/* Header */}
      <Header
        cartCount={cartItems.reduce((sum, item) => sum + (item.qty || 1), 0)}
        userName={user?.nama || 'Guest'}
      />

      {/* Main Content */}
      <Layout.Content className={styles.content}>
        <div className={styles.contentWrapper}>
          {/* Page Header */}
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>Keranjang Belanja</h1>
          </div>

          {cartItems.length === 0 ? (
            <Empty
              description="Keranjang belanja kosong"
              style={{ marginTop: '50px' }}
            >
              <Button type="primary" onClick={handleContinueShopping}>
                Mulai Belanja
              </Button>
            </Empty>
          ) : (
            <Row gutter={[24, 24]}>
              {/* Cart Items */}
              <Col xs={24} lg={16}>
                <Card className={styles.cartCard} bordered={false}>
                  <h2 className={styles.cardTitle}>Daftar Produk ({cartItems.length} item)</h2>
                  <div className={styles.itemsList}>
                    {cartItems.map((item) => (
                      <div key={item.cartItemId || item.id} className={styles.cartItem}>
                        <div className={styles.itemContent}>
                          <div className={styles.itemImage}>
                            {item.image_url ? (
                              <img
                                src={item.image_url}
                                alt={item.nama_produk || item.name}
                                style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }}
                              />
                            ) : (
                              <ShoppingOutlined className={styles.icon} />
                            )}
                          </div>
                          <div className={styles.itemInfo}>
                            <div className={styles.itemName}>{item.nama_produk || item.name}</div>
                            <div className={styles.itemDetails}>
                              Grade {item.grade || 'A'} • {item.lokasi_supplier || item.origin || 'Indonesia'}
                            </div>
                            <div className={styles.itemPrice}>
                              {formatCurrency(item.harga_jual || item.price)}
                            </div>
                          </div>
                        </div>

                        <div className={styles.itemActions}>
                          <div className={styles.qtyControl}>
                            <Button
                              type="text"
                              size="small"
                              icon={<MinusOutlined />}
                              onClick={() => handleQtyChange(item.cartItemId || item.id, (item.qty || 1) - 1)}
                            />
                            <Input
                              type="number"
                              value={item.qty || 1}
                              onChange={(e) => handleQtyChange(item.cartItemId || item.id, parseInt(e.target.value) || 1)}
                              className={styles.qtyInput}
                            />
                            <Button
                              type="text"
                              size="small"
                              icon={<PlusOutlined />}
                              onClick={() => handleQtyChange(item.cartItemId || item.id, (item.qty || 1) + 1)}
                            />
                          </div>
                          <div className={styles.subtotal}>
                            {formatCurrency((item.harga_jual || item.price || 0) * (item.qty || 1))}
                          </div>
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleDeleteItem(item.cartItemId || item.id)}
                            className={styles.deleteBtn}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </Col>

              {/* Order Summary */}
              <Col xs={24} lg={8}>
                <Card className={styles.summaryCard} bordered={false}>
                  <h2 className={styles.cardTitle}>Ringkasan Pesanan</h2>




                  {/* Summary Details */}
                  <div className={styles.summaryDetails}>
                    <div className={styles.summaryRow}>
                      <span>Subtotal ({cartItems.reduce((sum, item) => sum + (item.qty || 1), 0)} item)</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className={styles.summaryRow}>
                      <span>Ongkos Kirim</span>
                      <span>{formatCurrency(shipping)}</span>
                    </div>
                    {discount > 0 && (
                      <div className={styles.summaryRow + ' ' + styles.discount}>
                        <span>Diskon (10%)</span>
                        <span style={{ color: '#e74c3c' }}>-{formatCurrency(discount)}</span>
                      </div>
                    )}
                  </div>

                  <Divider />

                  {/* Total */}
                  <div className={styles.totalRow}>
                    <span className={styles.totalLabel}>Total</span>
                    <span className={styles.totalAmount}>{formatCurrency(total)}</span>
                  </div>

                  {/* Checkout Button */}
                  <Button
                    type="primary"
                    block
                    size="large"
                    onClick={handleCheckout}
                    className={styles.checkoutBtn}
                  >
                    Lanjut ke Pembayaran
                  </Button>

                  {/* Continue Shopping */}
                  <Button
                    type="default"
                    block
                    size="large"
                    onClick={handleContinueShopping}
                    className={styles.continueBtn}
                  >
                    Lanjut Belanja
                  </Button>
                </Card>
              </Col>
            </Row>
          )}
        </div>
      </Layout.Content>

      {/* Footer */}
      <Footer />
    </Layout>
  );
};

export default Cart;
