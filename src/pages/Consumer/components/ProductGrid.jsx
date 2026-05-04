import React, { useState, useMemo } from 'react';
import { Row, Col, Pagination, Empty, Space } from 'antd';
import ProductCard from './ProductCard';
import styles from './ProductGrid.module.css';

/**
 * Product Grid Component
 * Menampilkan grid produk dengan pagination dan responsive layout
 * @param {Array} products - Array produk yang akan ditampilkan
 * @param {Function} onAddToCart - Callback ketika produk ditambahkan ke keranjang
 */
const ProductGrid = ({
  products = [
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
      name: 'Vanila Grade D',
      grade: 'Grade D',
      image: 'https://via.placeholder.com/300x300?text=Vanila+D',
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
  ],
  onAddToCart = () => {},
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Calculate pagination
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return products.slice(startIndex, endIndex);
  }, [products, currentPage]);

  const totalPages = Math.ceil(products.length / itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll ke atas untuk better UX
    window.scrollTo({ top: 200, behavior: 'smooth' });
  };

  if (products.length === 0) {
    return <Empty description="Produk tidak ditemukan" style={{ margin: '40px 0' }} />;
  }

  return (
    <div className={styles.gridContainer}>
      {/* Product Grid */}
      <Row gutter={[16, 16]} className={styles.productGrid}>
        {paginatedProducts.map((product) => (
          <Col key={product.id} xs={24} sm={12} md={8} lg={8}>
            <ProductCard product={product} onAddToCart={onAddToCart} />
          </Col>
        ))}
      </Row>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={styles.paginationContainer}>
          <Pagination
            current={currentPage}
            total={products.length}
            pageSize={itemsPerPage}
            onChange={handlePageChange}
            showSizeChanger={false}
            showTotal={(total) => `Total ${total} Produk`}
            pageSizeOptions={[9]}
            className={styles.pagination}
          />
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
