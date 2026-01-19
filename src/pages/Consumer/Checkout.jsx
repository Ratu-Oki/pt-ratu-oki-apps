import React, { useState } from 'react';
import { Layout, Row, Col, Card, Form, Input, Select, Button, Radio, Divider, List, Space, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import Header from './components/Header';
import Footer from './components/Footer';
import styles from './Checkout.module.css';

/**
 * Checkout Page
 * Halaman pembayaran dengan form pengiriman dan metode pembayaran
 */
const Checkout = () => {
  const [form] = Form.useForm();
  const [paymentMethod, setPaymentMethod] = useState('transfer');

  // Mock cart items
  const cartItems = [
    {
      id: 1,
      name: 'Vanila Bourbon Premium',
      grade: 'Grade A',
      weight: '100g',
      price: 850000,
      qty: 2,
    },
    {
      id: 2,
      name: 'Vanila Planifolia',
      grade: 'Grade B',
      weight: '100g',
      price: 650000,
      qty: 1,
    },
    {
      id: 3,
      name: 'Vanila Bourbon 250g',
      grade: 'Grade A',
      weight: '250g',
      price: 2000000,
      qty: 1,
    },
  ];

  const provinces = [
    { label: 'Jawa Barat', value: 'jawa-barat' },
    { label: 'Jawa Tengah', value: 'jawa-tengah' },
    { label: 'Jawa Timur', value: 'jawa-timur' },
    { label: 'DKI Jakarta', value: 'dki-jakarta' },
  ];

  const districts = [
    { label: 'Bandung', value: 'bandung' },
    { label: 'Cirebon', value: 'cirebon' },
    { label: 'Garut', value: 'garut' },
  ];

  const paymentMethods = [
    { value: 'transfer', label: 'Transfer Bank', info: 'BCA, Mandiri, BNI, BRI' },
    { value: 'ewallet', label: 'E-Wallet', info: 'GoPay, OVO, DANA, LinkAja' },
    { value: 'card', label: 'Kartu Kredit/Debit', info: 'Visa, Mastercard' },
  ];

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
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shipping = 50000;
  const total = subtotal + shipping;

  /**
   * Handle form submit
   */
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      message.success('Pesanan berhasil dibuat! Silakan lakukan pembayaran.');
      console.log('Form values:', values);
      console.log('Payment method:', paymentMethod);
    } catch (error) {
      message.error('Silakan lengkapi semua data');
    }
  };

  /**
   * Handle back to cart
   */
  const handleBackToCart = () => {
    window.location.href = '/consumer/cart';
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
            <h1 className={styles.pageTitle}>PEMBAYARAN</h1>
          </div>

          <Row gutter={[24, 24]}>
            {/* Form Section */}
            <Col xs={24} lg={14}>
              {/* Shipping Address */}
              <Card className={styles.formCard} bordered={false}>
                <h2 className={styles.cardTitle}>Alamat Pengiriman</h2>

                <Form
                  form={form}
                  layout="vertical"
                  className={styles.form}
                  autoComplete="off"
                >
                  <Form.Item
                    label="Nama Penerima"
                    name="nama_penerima"
                    rules={[{ required: true, message: 'Nama penerima harus diisi' }]}
                  >
                    <Input placeholder="Budi Santoso" />
                  </Form.Item>

                  <Form.Item
                    label="Nomor Telepon"
                    name="no_telepon"
                    rules={[{ required: true, message: 'Nomor telepon harus diisi' }]}
                  >
                    <Input placeholder="08123456789" />
                  </Form.Item>

                  <Form.Item
                    label="Alamat Lengkap"
                    name="alamat_lengkap"
                    rules={[{ required: true, message: 'Alamat lengkap harus diisi' }]}
                  >
                    <Input.TextArea placeholder="Jl. Merdeka No. 123, Kelurahan..." rows={3} />
                  </Form.Item>

                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="Provinsi"
                        name="provinsi"
                        rules={[{ required: true, message: 'Provinsi harus dipilih' }]}
                      >
                        <Select placeholder="Pilih Provinsi" options={provinces} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="Kecamatan/Kota"
                        name="kecamatan"
                        rules={[{ required: true, message: 'Kecamatan harus dipilih' }]}
                      >
                        <Select placeholder="Pilih Kecamatan" options={districts} />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    label="Kode Pos"
                    name="kode_pos"
                    rules={[{ required: true, message: 'Kode pos harus diisi' }]}
                  >
                    <Input placeholder="40135" />
                  </Form.Item>
                </Form>
              </Card>

              {/* Payment Method */}
              <Card className={styles.formCard} bordered={false}>
                <h2 className={styles.cardTitle}>Metode Pembayaran</h2>

                <Radio.Group value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} style={{ width: '100%' }}>
                  <div className={styles.paymentOptions}>
                    {paymentMethods.map((method) => (
                      <div key={method.value} className={styles.paymentOption}>
                        <Radio value={method.value} className={styles.radioOption}>
                          <div>
                            <div className={styles.methodLabel}>{method.label}</div>
                            <div className={styles.methodInfo}>{method.info}</div>
                          </div>
                        </Radio>
                      </div>
                    ))}
                  </div>
                </Radio.Group>
              </Card>
            </Col>

            {/* Summary Section */}
            <Col xs={24} lg={10}>
              <Card className={styles.summaryCard} bordered={false}>
                <h2 className={styles.cardTitle}>Ringkasan Pesanan</h2>

                {/* Items List */}
                <div className={styles.itemsList}>
                  <List
                    dataSource={cartItems}
                    renderItem={(item) => (
                      <div className={styles.summaryItem}>
                        <div className={styles.itemInfo}>
                          <div className={styles.itemName}>{item.name}</div>
                          <div className={styles.itemDetails}>
                            {item.grade} • {item.weight} • Qty: {item.qty}
                          </div>
                        </div>
                        <div className={styles.itemTotal}>{formatCurrency(item.price * item.qty)}</div>
                      </div>
                    )}
                  />
                </div>

                <Divider style={{ margin: '16px 0' }} />

                {/* Summary Details */}
                <div className={styles.summaryDetails}>
                  <div className={styles.summaryRow}>
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>Ongkos Kirim</span>
                    <span>{formatCurrency(shipping)}</span>
                  </div>
                </div>

                <Divider style={{ margin: '12px 0' }} />

                {/* Total */}
                <div className={styles.totalRow}>
                  <span className={styles.totalLabel}>Total</span>
                  <span className={styles.totalAmount}>{formatCurrency(total)}</span>
                </div>

                {/* Action Buttons */}
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  <Button
                    type="primary"
                    block
                    size="large"
                    onClick={handleSubmit}
                    className={styles.submitBtn}
                  >
                    Bayar Sekarang
                  </Button>
                  <Button
                    type="default"
                    block
                    size="large"
                    icon={<ArrowLeftOutlined />}
                    onClick={handleBackToCart}
                    className={styles.backBtn}
                  >
                    Kembali ke Keranjang
                  </Button>
                </Space>
              </Card>
            </Col>
          </Row>
        </div>
      </Layout.Content>

      {/* Footer */}
      <Footer />
    </Layout>
  );
};

export default Checkout;
