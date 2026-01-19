import React from 'react';
import { Layout, Row, Col, Divider, Space } from 'antd';
import { PhoneOutlined, MailOutlined, EnvironmentOutlined } from '@ant-design/icons';
import styles from './Footer.module.css';

/**
 * Footer Component
 * Menampilkan informasi perusahaan, navigasi, dan kontak
 */
const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Layout.Footer className={styles.footer}>
      <div className={styles.footerContent}>
        {/* Footer Main Content */}
        <Row gutter={[32, 32]} className={styles.footerGrid}>
          {/* About Company */}
          <Col xs={24} sm={12} md={6}>
            <div className={styles.footerSection}>
              <h3 className={styles.sectionTitle}>PT Ratu Oki</h3>
              <p className={styles.sectionDescription}>
                Penyedia vanila premium berkualitas tinggi dengan standar internasional.
              </p>
              <Space direction="vertical" style={{ marginTop: '12px' }}>
                <span className={styles.contactItem}>
                  <PhoneOutlined /> +62 812-3456-789
                </span>
                <span className={styles.contactItem}>
                  <MailOutlined /> info@ratuoki.com
                </span>
                <span className={styles.contactItem}>
                  <EnvironmentOutlined /> Jl. Vanila No. 123, Bali
                </span>
              </Space>
            </div>
          </Col>

          {/* Products */}
          <Col xs={24} sm={12} md={6}>
            <div className={styles.footerSection}>
              <h3 className={styles.sectionTitle}>Produk</h3>
              <ul className={styles.footerLinks}>
                <li><a href="#catalog">Katalog Produk</a></li>
                <li><a href="#grade-a">Grade A Premium</a></li>
                <li><a href="#grade-b">Grade B Standard</a></li>
                <li><a href="#extract">Vanila Extract</a></li>
              </ul>
            </div>
          </Col>

          {/* Services */}
          <Col xs={24} sm={12} md={6}>
            <div className={styles.footerSection}>
              <h3 className={styles.sectionTitle}>Layanan</h3>
              <ul className={styles.footerLinks}>
                <li><a href="#order">Cara Pemesanan</a></li>
                <li><a href="#shipping">Pengiriman</a></li>
                <li><a href="#guarantee">Garansi Kualitas</a></li>
                <li><a href="#wholesale">Harga Grosir</a></li>
              </ul>
            </div>
          </Col>

          {/* Legal */}
          <Col xs={24} sm={12} md={6}>
            <div className={styles.footerSection}>
              <h3 className={styles.sectionTitle}>Informasi</h3>
              <ul className={styles.footerLinks}>
                <li><a href="#about">Tentang Kami</a></li>
                <li><a href="#privacy">Kebijakan Privasi</a></li>
                <li><a href="#terms">Syarat & Ketentuan</a></li>
                <li><a href="#contact">Hubungi Kami</a></li>
              </ul>
            </div>
          </Col>
        </Row>

        <Divider className={styles.divider} />

        {/* Footer Bottom */}
        <Row align="middle" justify="space-between" className={styles.footerBottom}>
          <Col xs={24} sm={12}>
            <p className={styles.copyright}>
              &copy; {currentYear} PT Ratu Oki. Semua hak dilindungi.
            </p>
          </Col>
          <Col xs={24} sm={12} className={styles.bottomRight}>
            <Space size="large">
              <a href="#payment" className={styles.bottomLink}>Metode Pembayaran</a>
              <a href="#track" className={styles.bottomLink}>Lacak Pesanan</a>
              <a href="#support" className={styles.bottomLink}>Dukungan</a>
            </Space>
          </Col>
        </Row>
      </div>
    </Layout.Footer>
  );
};

export default Footer;
