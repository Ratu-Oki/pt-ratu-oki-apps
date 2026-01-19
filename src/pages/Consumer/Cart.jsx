import React, { useState } from 'react';
import { Layout, Row, Col, Card, Button, Input, Space, Empty, Divider, message } from 'antd';
import { DeleteOutlined, MinusOutlined, PlusOutlined, ShoppingOutlined } from '@ant-design/icons';
import Header from './components/Header';
import Footer from './components/Footer';
import styles from './Cart.module.css';

/**
 * Shopping Cart Page
 * Menampilkan daftar produk di keranjang dan ringkasan pesanan
 */
const Cart = () => {
  // Mock cart items
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: 'Vanila Bourbon Premium',
      grade: 'Grade A',
      weight: '100g',
      origin: 'Teluk Sukabumi',
      price: 850000,
      qty: 2,
      image: 'https://via.placeholder.com/80x80?text=Vanila+A',
    },
    {
      id: 2,
      name: 'Vanila Planifolia',
      grade: 'Grade B',
      weight: '100g',
      origin: 'Malang',
      price: 650000,
      qty: 1,
      image: 'https://via.placeholder.com/80x80?text=Vanila+B',
    },
    
  ]);

  const [promoCode, setPromoCode] = useState('');

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
   * Calculate subtotal
   */
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shipping = 50000;
  const discount = promoCode ? subtotal * 0.1 : 0;
  const total = subtotal + shipping - discount;

  /**
   * Handle quantity change
   */
  const handleQtyChange = (id, qty) => {
    if (qty <= 0) return;
    setCartItems(cartItems.map(item => 
      item.id === id ? { ...item, qty } : item
    ));
  };

  /**
   * Handle delete item
   */
  const handleDeleteItem = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id));
    message.success('Produk dihapus dari keranjang');
  };

//   /**
//    * Handle apply promo
//    */
//   const handleApplyPromo = () => {
//     if (promoCode) {
//       message.success(`Promo code "${promoCode}" diterapkan!`);
//     } else {
//       message.warning('Masukkan kode promo');
//     }
//   };

  /**
   * Handle checkout
   */
  const handleCheckout = () => {
    window.location.href = '/consumer/checkout';
  };

  return (
    <Layout className={styles.layout}>
      {/* Header */}
      <Header cartCount={cartItems.length} userName="Budi Santoso" />

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
            />
          ) : (
            <Row gutter={[24, 24]}>
              {/* Cart Items */}
              <Col xs={24} lg={16}>
                <Card className={styles.cartCard} bordered={false}>
                  <h2 className={styles.cardTitle}>Daftar Produk</h2>
                  <div className={styles.itemsList}>
                    {cartItems.map((item) => (
                      <div key={item.id} className={styles.cartItem}>
                        <div className={styles.itemContent}>
                          <div className={styles.itemImage}>
                            <ShoppingOutlined className={styles.icon} />
                          </div>
                          <div className={styles.itemInfo}>
                            <div className={styles.itemName}>{item.name}</div>
                            <div className={styles.itemDetails}>
                              {item.grade} • {item.weight} • {item.origin}
                            </div>
                            <div className={styles.itemPrice}>{formatCurrency(item.price)}</div>
                          </div>
                        </div>

                        <div className={styles.itemActions}>
                          <div className={styles.qtyControl}>
                            <Button
                              type="text"
                              size="small"
                              icon={<MinusOutlined />}
                              onClick={() => handleQtyChange(item.id, item.qty - 1)}
                            />
                            <Input
                              type="number"
                              value={item.qty}
                              onChange={(e) => handleQtyChange(item.id, parseInt(e.target.value) || 1)}
                              className={styles.qtyInput}
                            />
                            <Button
                              type="text"
                              size="small"
                              icon={<PlusOutlined />}
                              onClick={() => handleQtyChange(item.id, item.qty + 1)}
                            />
                          </div>
                          <div className={styles.subtotal}>
                            {formatCurrency(item.price * item.qty)}
                          </div>
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleDeleteItem(item.id)}
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

                  {/* Promo Code */}
                  {/* <div className={styles.promoSection}>
                    <Space.Compact style={{ width: '100%' }}>
                      <Input
                        placeholder="Kode Promo"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className={styles.promoInput}
                      />
                      <Button
                        type="primary"
                        onClick={handleApplyPromo}
                        className={styles.promoBtn}
                      >
                        Terapkan
                      </Button>
                    </Space.Compact>
                  </div> */}

                  {/* Summary Details */}
                  <div className={styles.summaryDetails}>
                    <div className={styles.summaryRow}>
                      <span>Subtotal ({cartItems.length} item)</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className={styles.summaryRow}>
                      <span>Ongkos Kirim</span>
                      <span>{formatCurrency(shipping)}</span>
                    </div>
                    {discount > 0 && (
                      <div className={styles.summaryRow + ' ' + styles.discount}>
                        <span>Diskon</span>
                        <span>-{formatCurrency(discount)}</span>
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
                    onClick={() => window.location.href = '/consumer'}
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
