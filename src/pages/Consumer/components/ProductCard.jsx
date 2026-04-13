import React, { useEffect } from 'react';
import { Card, Button, Badge, Tag } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import styles from './ProductCard.module.css';

/**
 * Product Card Component
 * Menampilkan kartu produk dengan gambar, harga, rating, dan tombol tambah ke keranjang
 * @param {Object} product - Objek produk dengan properti: id, name, grade, image, price, rating, weight, origin
 * @param {Function} onAddToCart - Callback ketika tombol tambah ke keranjang diklik
 */
const ProductCard = ({
  product = {
    id: 1,
    name: 'Vanila Premium Grade B',
    grade: 'Grade B',
    image: 'https://via.placeholder.com/300x300?text=Vanila',
    price: 450000,
    weight: '1 kg',
    origin: 'Madagascar',
    stok: 0,
  },
  onAddToCart = () => { },
}) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  useEffect(() => {
    console.log(product);
  }, [product])

  return (
    <div className={styles.cardWrapper}>
      <Card
        className={styles.card}
        cover={
          <div className={styles.imageContainer}>
            <img
              alt={product.name}
              src={product.image}
              className={styles.image}
            />
            {product.grade && (
              <Badge
                count={product.grade}
                className={styles.gradeBadge}
                style={{
                  backgroundColor: '#FDBF1F',
                  color: '#333',
                  fontWeight: '700',
                  fontSize: '12px',
                  top: '12px',
                  right: '12px',
                }}
              />
            )}
          </div>
        }
        bodyStyle={{ padding: '12px', paddingBottom: '60px' }}
      >
        {/* Product Name */}
        <div className={styles.productName}>{product.name}</div>

        {/* Origin & Weight */}
        <div className={styles.productInfo}>
          <span>{product.origin}</span>
          <span>•</span>
          <span>{product.weight}</span>
        </div>

        {/* Stok */}
        <div className={styles.stockContainer}>
          {product.stok > 10 ? (
            <Tag color="green" style={{ margin: 0 }}>Stok: {product.stok}</Tag>
          ) : product.stok > 0 ? (
            <Tag color="orange" style={{ margin: 0 }}>Stok Terbatas: {product.stok}</Tag>
          ) : (
            <Tag color="red" style={{ margin: 0 }}>Habis</Tag>
          )}
        </div>

        {/* Price */}
        <div className={styles.price}>{formatPrice(product.price)}</div>

        {/* Add to Cart Button */}
        <Button
          type="primary"
          size="large"
          className={styles.addToCartBtn}
          onClick={() => onAddToCart(product.id)}
          icon={<ShoppingCartOutlined />}
        >
          Tambah
        </Button>
      </Card>
    </div>
  );
};

export default ProductCard;
