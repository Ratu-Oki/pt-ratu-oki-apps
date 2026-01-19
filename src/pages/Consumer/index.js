import React, { useState, useCallback } from 'react';
import { Layout, Row, Col, PageHeader, message, Affix, Button, Badge } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ProductGrid from './components/ProductGrid';
import Footer from './components/Footer';
import styles from './Consumer.module.css';

/**
 * Consumer Page
 * Halaman katalog produk untuk konsumen dengan filter, grid produk, dan keranjang
 */
const Consumer = () => {
  const [cartItems, setCartItems] = useState([]);
  const [filters, setFilters] = useState({
    grades: ['Grade A (Premium)'],
    priceRange: { min: 0, max: 100000000 },
    weights: ['1 kg'],
  });

  // Mock product data
  const allProducts = [
    {
      id: 1,
      name: 'Vanila Premium Grade A',
      grade: 'Grade A',
      image: 'https://via.placeholder.com/300x300?text=Vanila+A',
      price: 450000,
      rating: 4.5,
      reviews: 128,
      weight: '1 kg',
      origin: 'Madagascar',
    },
    {
      id: 2,
      name: 'Vanila Premium Grade B',
      grade: 'Grade B',
      image: 'https://via.placeholder.com/300x300?text=Vanila+B',
      price: 350000,
      rating: 4.3,
      reviews: 95,
      weight: '1 kg',
      origin: 'Tahiti',
    },
    {
      id: 3,
      name: 'Vanila Premium Grade C',
      grade: 'Grade C',
      image: 'https://via.placeholder.com/300x300?text=Vanila+C',
      price: 280000,
      rating: 4.0,
      reviews: 76,
      weight: '1 kg',
      origin: 'Madagascar',
    },
    {
      id: 4,
      name: 'Vanila Extract',
      grade: 'Extract',
      image: 'https://via.placeholder.com/300x300?text=Extract',
      price: 150000,
      rating: 4.4,
      reviews: 112,
      weight: '500 gram',
      origin: 'Mexico',
    },
    {
      id: 5,
      name: 'Vanila Powder',
      grade: 'Grade A',
      image: 'https://via.placeholder.com/300x300?text=Powder',
      price: 380000,
      rating: 4.6,
      reviews: 142,
      weight: '250 gram',
      origin: 'Madagascar',
    },
    {
      id: 6,
      name: 'Vanila Organic',
      grade: 'Grade A',
      image: 'https://via.placeholder.com/300x300?text=Organic',
      price: 520000,
      rating: 4.7,
      reviews: 156,
      weight: '1 kg',
      origin: 'Bali',
    },
  ];

  // Filter products based on active filters
  const filteredProducts = allProducts.filter((product) => {
    const isGradeMatch = filters.grades.some((grade) =>
      product.grade.includes(grade.split(' ')[0])
    );
    const isPriceMatch =
      product.price >= filters.priceRange.min &&
      product.price <= filters.priceRange.max;
    const isWeightMatch = filters.weights.includes(product.weight);

    return isGradeMatch && isPriceMatch && isWeightMatch;
  });

  /**
   * Handle filter change from sidebar
   */
  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  /**
   * Handle add to cart
   */
  const handleAddToCart = useCallback((productId) => {
    const product = allProducts.find((p) => p.id === productId);
    if (product) {
      setCartItems((prev) => [
        ...prev,
        {
          ...product,
          cartItemId: Date.now(),
        },
      ]);
      message.success(`${product.name} ditambahkan ke keranjang`);
    }
  }, []);

  /**
   * Navigate to cart/checkout
   */
  // const handleGoToCart = () => {
  //   message.info('Fitur keranjang akan segera hadir');
  // };

  return (
    <Layout className={styles.layout}>
      {/* Header */}
      <Header cartCount={cartItems.length} userName="Budi Santoso" />

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
              <ProductGrid
                products={filteredProducts}
                onAddToCart={handleAddToCart}
              />
            </Col>
          </Row>
        </div>
      </Layout.Content>

      {/* Footer */}
      <Footer />

      {/* Floating Cart Button */}
      {cartItems.length > 0 && (
        <Affix style={{ position: 'fixed', bottom: 24, right: 24 }}>
          {/* <Button
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
              <Badge count={cartItems.length} offset={[-8, 8]}>
                <ShoppingCartOutlined style={{ fontSize: '20px', color: '#fff' }} />
              </Badge>
            }
          /> */}
        </Affix>
      )}
    </Layout>
  );
};

export default Consumer;
