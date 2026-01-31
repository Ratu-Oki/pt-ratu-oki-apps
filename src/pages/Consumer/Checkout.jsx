import React, { useState, useEffect } from 'react';
import { Layout, Row, Col, Card, Form, Input, Select, Button, Radio, Divider, List, Space, message, Spin } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import styles from './Checkout.module.css';
import { transactionService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

/**
 * Checkout Page
 * Halaman pembayaran dengan form pengiriman dan metode pembayaran
 */
const Checkout = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState('transfer');
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      const cart = JSON.parse(savedCart);
      if (cart.length === 0) {
        message.warning('Keranjang kosong. Silakan pilih produk terlebih dahulu.');
        navigate('/consumer');
        return;
      }
      setCartItems(cart);
    } else {
      message.warning('Keranjang kosong. Silakan pilih produk terlebih dahulu.');
      navigate('/consumer');
    }
  }, [navigate]);

  // Pre-fill form with user data
  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        nama_penerima: user.nama,
        no_telepon: user.telepon || '',
        alamat_lengkap: user.alamat || '',
      });
    }
  }, [user, form]);

  const provinces = [
    { label: 'Jawa Barat', value: 'jawa-barat' },
    { label: 'Jawa Tengah', value: 'jawa-tengah' },
    { label: 'Jawa Timur', value: 'jawa-timur' },
    { label: 'DKI Jakarta', value: 'dki-jakarta' },
    { label: 'Sumatera Utara', value: 'sumatera-utara' },
    { label: 'Sumatera Selatan', value: 'sumatera-selatan' },
    { label: 'Kalimantan Timur', value: 'kalimantan-timur' },
    { label: 'Sulawesi Selatan', value: 'sulawesi-selatan' },
  ];

  const districts = [
    { label: 'Bandung', value: 'bandung' },
    { label: 'Cirebon', value: 'cirebon' },
    { label: 'Garut', value: 'garut' },
    { label: 'Jakarta Pusat', value: 'jakarta-pusat' },
    { label: 'Jakarta Selatan', value: 'jakarta-selatan' },
    { label: 'Surabaya', value: 'surabaya' },
  ];

  const paymentMethods = [
    { value: 'transfer', label: 'Transfer Bank', info: 'BCA, Mandiri, BNI, BRI' },
    { value: 'ewallet', label: 'E-Wallet', info: 'GoPay, OVO, DANA, LinkAja' },
    { value: 'cod', label: 'Cash on Delivery', info: 'Bayar saat barang diterima' },
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
  const subtotal = cartItems.reduce((sum, item) => sum + (item.harga_jual || item.price || 0) * (item.qty || 1), 0);
  const shipping = 50000;
  const total = subtotal + shipping;

  /**
   * Handle form submit
   */
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (cartItems.length === 0) {
        message.error('Keranjang kosong');
        return;
      }

      setSubmitting(true);

      // Build transaction data
      const transactionData = {
        items: cartItems.map(item => ({
          product_id: item.id,
          jumlah: item.qty || 1,
          grade: item.grade || 'A'
        })),
        shipping_address: `${values.nama_penerima}, ${values.no_telepon}, ${values.alamat_lengkap}, ${values.kecamatan}, ${values.provinsi}, ${values.kode_pos}`,
        payment_method: paymentMethod,
        notes: values.notes || ''
      };

      const response = await transactionService.create(transactionData);

      if (response.success) {
        message.success('Pesanan berhasil dibuat! Silakan lakukan pembayaran.');

        // Clear cart
        localStorage.removeItem('cart');

        // Redirect to order status
        navigate('/consumer/status-pesanan');
      } else {
        message.error(response.message || 'Gagal membuat pesanan');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      if (error.errorFields) {
        message.error('Silakan lengkapi semua data');
      } else {
        message.error(error.message || 'Gagal membuat pesanan. Silakan coba lagi.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Handle back to cart
   */
  const handleBackToCart = () => {
    navigate('/consumer/cart');
  };

  if (loading) {
    return (
      <Layout className={styles.layout}>
        <Header cartCount={cartItems.length} userName={user?.nama || 'Guest'} />
        <Layout.Content className={styles.content}>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
            <Spin size="large" />
          </div>
        </Layout.Content>
        <Footer />
      </Layout>
    );
  }

  return (
    <Layout className={styles.layout}>
      {/* Header */}
      <Header cartCount={cartItems.reduce((sum, item) => sum + (item.qty || 1), 0)} userName={user?.nama || 'Guest'} />

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
                    <Input placeholder="Nama lengkap penerima" />
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

                  <Form.Item
                    label="Catatan (opsional)"
                    name="notes"
                  >
                    <Input.TextArea placeholder="Catatan untuk penjual..." rows={2} />
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
                          <div className={styles.itemName}>{item.nama_produk || item.name}</div>
                          <div className={styles.itemDetails}>
                            Grade {item.grade || 'A'} • Qty: {item.qty || 1}
                          </div>
                        </div>
                        <div className={styles.itemTotal}>
                          {formatCurrency((item.harga_jual || item.price || 0) * (item.qty || 1))}
                        </div>
                      </div>
                    )}
                  />
                </div>

                <Divider style={{ margin: '16px 0' }} />

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
                    loading={submitting}
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
                    disabled={submitting}
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
