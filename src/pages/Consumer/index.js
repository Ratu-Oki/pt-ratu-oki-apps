import React, { useState, useEffect, useCallback } from 'react';
import { Layout, Row, Col, message, Affix, Button, Badge, Spin, Modal, Form, Input, Divider, Space, Alert } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ProductGrid from './components/ProductGrid';
import Footer from './components/Footer';
import styles from './Consumer.module.css';
import { productService, authService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

/**
 * Consumer Page
 * Halaman katalog produk untuk konsumen dengan filter, grid produk, dan keranjang
 */
const Consumer = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [usernameValue, setUsernameValue] = useState('');
  const [emailValue, setEmailValue] = useState('');
  const [emailOldOtp, setEmailOldOtp] = useState('');
  const [emailNewOtp, setEmailNewOtp] = useState('');
  const [emailOtpRequested, setEmailOtpRequested] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loadingUsername, setLoadingUsername] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState(() => {
    // Initialize from localStorage
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [filters, setFilters] = useState({
    grades: [],
    priceRange: { min: 0, max: 100000000 },
    search: '',
  });

  useEffect(() => {
    if (user) {
      setUsernameValue(user.nama || '');
      setEmailValue(user.email || '');
    }
  }, [user]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Fetch products from API
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: 1,
        limit: 50,
        search: filters.search || undefined
      };

      const response = await productService.getAll(params);

      // Handle both array and object response formats
      let productsData = [];
      if (Array.isArray(response.data)) {
        productsData = response.data;
      } else if (response.data) {
        productsData = response.data.products || response.data || [];
      }

      // Backend already filters for active & stok > 0, no need to filter again
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
      message.error('Gagal memuat produk');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [filters.search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Filter products based on active filters
  const filteredProducts = products.filter((product) => {
    // Grade filter
    if (filters.grades.length > 0) {
      // Extract grade from product (could be in name or separate field)
      const productGrade = product.grade || 'A';
      const matchesGrade = filters.grades.some(g => g.includes(productGrade));
      if (!matchesGrade) return false;
    }

    // Price filter
    const price = product.harga_jual || 0;
    if (price < filters.priceRange.min || price > filters.priceRange.max) {
      return false;
    }

    return true;
  });

  /**
   * Handle filter change from sidebar
   */
  const handleFilterChange = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  /**
   * Handle search
   */
  const handleSearch = useCallback((searchTerm) => {
    setFilters(prev => ({ ...prev, search: searchTerm }));
  }, []);

  /**
   * Handle add to cart
   */
  const handleAddToCart = useCallback((productId) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      // Check if already in cart
      const existingIndex = cartItems.findIndex(item => item.id === productId);

      if (existingIndex >= 0) {
        // Increase quantity
        const newCart = [...cartItems];
        newCart[existingIndex].qty = (newCart[existingIndex].qty || 1) + 1;
        setCartItems(newCart);
        message.success(`Jumlah ${product.nama_produk} ditambah`);
      } else {
        // Add new item
        setCartItems((prev) => [
          ...prev,
          {
            ...product,
            qty: 1,
            cartItemId: Date.now(),
          },
        ]);
        message.success(`${product.nama_produk} ditambahkan ke keranjang`);
      }
    }
  }, [products, cartItems]);

  /**
   * Navigate to cart
   */
  const handleGoToCart = () => {
    navigate('/consumer/cart');
  };

  // Transform products for ProductGrid component
  const transformedProducts = filteredProducts.map(p => ({
    id: p.id,
    name: p.nama_produk,
    grade: `Grade ${p.grade || 'A'}`,
    image: p.image_url || 'https://via.placeholder.com/300x300?text=No+Image',
    price: p.harga_jual,
    rating: p.rating || 0,
    reviews: p.total_rating || 0,
    weight: '1 kg',
    origin: p.lokasi_supplier || 'Indonesia',
    stok: p.stok
  }));

  return (
    <Layout className={styles.layout}>
      {/* Header */}
      <Header
        cartCount={cartItems.reduce((sum, item) => sum + (item.qty || 1), 0)}
        userName={user?.nama || 'Guest'}
        onProfileClick={() => {
          setUsernameValue(user?.nama || '');
          setEmailValue(user?.email || '');
          setCurrentPassword('');
          setNewPassword('');
          setProfileModalVisible(true);
        }}
        onSearch={handleSearch}
      />

      {/* Main Content */}
      <Layout.Content className={styles.content}>
        <div className={styles.contentWrapper}>
          {/* Page Header */}
          <div className={styles.pageHeader}>
            <div>
              <h1 className={styles.pageTitle}>Katalog Vanila Premium</h1>
              <p className={styles.pageSubtitle}>
                Temukan koleksi vanila berkualitas premium dari berbagai daerah
              </p>
            </div>
          </div>

          {/* Main Layout: Sidebar + Products */}
          <Row gutter={[24, 24]} className={styles.mainLayout}>
            {/* Sidebar Filter */}
            <Col xs={24} md={6} lg={5} xl={4}>
              <Sidebar onFilterChange={handleFilterChange} />
            </Col>

            {/* Products Area */}
            <Col xs={24} md={18} lg={19} xl={20}>
              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
                  <Spin size="large" />
                </div>
              ) : (
                <ProductGrid
                  products={transformedProducts}
                  onAddToCart={handleAddToCart}
                />
              )}
            </Col>
          </Row>
        </div>
      </Layout.Content>

      {/* Footer */}
      <Footer />

      {/* Profile Settings Modal */}
      <Modal
        title="Pengaturan Akun"
        open={profileModalVisible}
        onCancel={() => setProfileModalVisible(false)}
        footer={null}
      >
        <div style={{ marginBottom: 12 }}>
          <h3>Ubah Username</h3>
          <Form layout="vertical">
            <Form.Item>
              <Input value={usernameValue} onChange={(e) => setUsernameValue(e.target.value)} placeholder="Username" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" loading={loadingUsername} onClick={async () => {
                if (!usernameValue) { message.error('Username tidak boleh kosong'); return; }
                setLoadingUsername(true);
                try {
                  await authService.updateProfile({ nama: usernameValue });
                  const profile = await authService.getProfile();
                  if (profile && profile.data) updateUser(profile.data);
                  message.success('Username diperbarui');
                } catch (err) {
                  message.error(err.message || 'Gagal memperbarui username');
                } finally { setLoadingUsername(false); }
              }}>Simpan Username</Button>
            </Form.Item>
          </Form>
        </div>

        <Divider />

        <div style={{ marginBottom: 12 }}>
          <h3>Ubah Email</h3>
          <Form layout="vertical">
            <Form.Item>
              <Input type="email" value={emailValue} onChange={(e) => setEmailValue(e.target.value)} placeholder="Email" />
            </Form.Item>
            {emailOtpRequested && (
              <>
                <Alert
                  type="info"
                  showIcon
                  style={{ marginBottom: 12 }}
                  message="OTP sudah dikirim"
                  description="Masukkan OTP dari email lama dan email baru untuk konfirmasi perubahan email."
                />
                <Form.Item label="OTP Email Lama">
                  <Input
                    value={emailOldOtp}
                    onChange={(e) => setEmailOldOtp(e.target.value)}
                    placeholder="6 digit OTP"
                    maxLength={6}
                  />
                </Form.Item>
                <Form.Item label="OTP Email Baru">
                  <Input
                    value={emailNewOtp}
                    onChange={(e) => setEmailNewOtp(e.target.value)}
                    placeholder="6 digit OTP"
                    maxLength={6}
                  />
                </Form.Item>
              </>
            )}
            <Form.Item>
              {!emailOtpRequested ? (
                <Button
                  type="primary"
                  loading={loadingEmail}
                  onClick={async () => {
                    if (!emailValue) { message.error('Email tidak boleh kosong'); return; }
                    setLoadingEmail(true);
                    try {
                      await authService.requestEmailChange(emailValue);
                      setEmailOtpRequested(true);
                      setEmailOldOtp('');
                      setEmailNewOtp('');
                      message.success('OTP telah dikirim ke email lama dan email baru');
                    } catch (err) {
                      message.error(err.message || 'Gagal mengirim OTP perubahan email');
                    } finally {
                      setLoadingEmail(false);
                    }
                  }}
                >Kirim OTP</Button>
              ) : (
                <Button
                  type="primary"
                  loading={loadingEmail}
                  onClick={async () => {
                    if (!emailValue) { message.error('Email baru tidak boleh kosong'); return; }
                    if (!emailOldOtp || !emailNewOtp) { message.error('OTP email lama dan email baru wajib diisi'); return; }
                    setLoadingEmail(true);
                    try {
                      await authService.confirmEmailChange(emailValue, emailOldOtp, emailNewOtp);
                      const profile = await authService.getProfile();
                      if (profile && profile.data) updateUser(profile.data);
                      setEmailOtpRequested(false);
                      setEmailOldOtp('');
                      setEmailNewOtp('');
                      message.success('Email berhasil diubah');
                    } catch (err) {
                      message.error(err.message || 'Gagal mengonfirmasi perubahan email');
                    } finally {
                      setLoadingEmail(false);
                    }
                  }}
                >Konfirmasi Email</Button>
              )}
            </Form.Item>
          </Form>
        </div>

        <Divider />

        <div>
          <h3>Ubah Password</h3>
          <Form layout="vertical">
            <Form.Item label="Password Saat Ini">
              <Input.Password value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            </Form.Item>
            <Form.Item label="Password Baru">
              <Input.Password value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" loading={loadingPassword} onClick={async () => {
                if (!currentPassword || !newPassword) { message.error('Lengkapi password saat ini dan baru'); return; }
                setLoadingPassword(true);
                try {
                  await authService.changePassword(currentPassword, newPassword);
                  message.success('Password berhasil diubah');
                  setCurrentPassword(''); setNewPassword('');
                } catch (err) {
                  message.error(err.message || 'Gagal mengganti password');
                } finally { setLoadingPassword(false); }
              }}>Simpan Password</Button>
            </Form.Item>
          </Form>
        </div>
      </Modal>

      {/* Floating Cart Button */}
      {cartItems.length > 0 && (
        <Affix style={{ position: 'fixed', bottom: 24, right: 24 }}>
          <Button
            type="primary"
            size="large"
            shape="circle"
            onClick={handleGoToCart}
            style={{
              width: 56,
              height: 56,
              backgroundColor: '#1b5e3f',
              border: 'none',
              boxShadow: '0 4px 12px rgba(27, 94, 63, 0.3)',
            }}
            icon={
              <Badge count={cartItems.reduce((sum, item) => sum + (item.qty || 1), 0)} offset={[-8, 8]}>
                <ShoppingCartOutlined style={{ fontSize: '20px', color: '#fff' }} />
              </Badge>
            }
          />
        </Affix>
      )}
    </Layout>
  );
};

export default Consumer;
