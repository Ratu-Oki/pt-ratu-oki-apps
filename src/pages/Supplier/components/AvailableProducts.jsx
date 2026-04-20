import React, { useState, useCallback, useEffect } from 'react';
import { Card, Row, Col, Button, Modal, Form, Input, InputNumber, Select, message, Tag, Upload, Space, Empty } from 'antd';
import { PlusOutlined, InboxOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { stockService } from '../../../services/api';
import styles from './AvailableProducts.module.css';

/**
 * AvailableProducts Component
 * Menampilkan produk yang tersedia dari admin dan memungkinkan supplier untuk supply
 */
const AvailableProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [supplyModal, setSupplyModal] = useState({ visible: false, product: null });
  const [newProductModal, setNewProductModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [newProductImageFile, setNewProductImageFile] = useState(null);
  const [newProductImagePreview, setNewProductImagePreview] = useState(null);

  const [supplyForm] = Form.useForm();
  const [newProductForm] = Form.useForm();

  // Fetch available products
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await stockService.getAvailableProducts({ page: 1, limit: 100 });
      setProducts(response.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      message.error('Gagal memuat produk');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  // Handle image upload
  const handleImageChange = (info) => {
    const file = info.file.originFileObj || info.file;
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  // Handle new product image upload
  const handleNewProductImageChange = (info) => {
    const file = info.file.originFileObj || info.file;
    if (file) {
      setNewProductImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setNewProductImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  // Open supply modal
  const handleOpenSupplyModal = (product) => {
    setSupplyModal({ visible: true, product });
    setImageFile(null);
    setImagePreview(null);
    supplyForm.resetFields();
    // Set default values
    supplyForm.setFieldsValue({
      jumlah: 1,
      harga_supply: product.harga_beli,
      grade: 'A'
    });
  };

  // Handle submit supply
  const handleSubmitSupply = async () => {
    try {
      const values = await supplyForm.validateFields();
      setSubmitting(true);

      const formData = new FormData();
      formData.append('product_id', supplyModal.product.id);
      formData.append('jumlah', values.jumlah);
      formData.append('harga_supply', values.harga_supply);
      formData.append('grade', values.grade || 'A');
      formData.append('pesan', values.pesan || '');

      if (imageFile) {
        formData.append('image', imageFile);
      }

      await stockService.createSupply(formData);
      message.success('Pengajuan supply berhasil dikirim!');
      setSupplyModal({ visible: false, product: null });
      setImageFile(null);
      setImagePreview(null);
      supplyForm.resetFields();
      fetchData();
    } catch (error) {
      console.error('Error submitting supply:', error);
      message.error(error.message || 'Gagal mengajukan supply');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle submit new product
  const handleSubmitNewProduct = async () => {
    try {
      const values = await newProductForm.validateFields();
      setSubmitting(true);

      const formData = new FormData();
      formData.append('nama_produk', values.nama_produk);
      formData.append('jumlah', values.jumlah);
      formData.append('harga_supply', values.harga_supply);
      formData.append('grade', values.grade || 'A');
      formData.append('pesan', values.pesan || '');
      formData.append('lokasi_supplier', values.lokasi_supplier || '');
      formData.append('deskripsi', values.deskripsi || '');
      formData.append('berat', values.berat || '1 kg');

      if (newProductImageFile) {
        formData.append('image', newProductImageFile);
      }

      await stockService.createSupplyNewProduct(formData);
      message.success('Produk baru dan supply berhasil diajukan!');
      setNewProductModal(false);
      setNewProductImageFile(null);
      setNewProductImagePreview(null);
      newProductForm.resetFields();
      fetchData();
    } catch (error) {
      console.error('Error submitting new product:', error);
      message.error(error.message || 'Gagal mengajukan produk baru');
    } finally {
      setSubmitting(false);
    }
  };

  // Product Card Component
  const ProductCard = ({ product }) => (
    <Card
      hover
      className={styles.productCard}
      cover={
        product.image_url ? (
          <img alt={product.nama_produk} src={product.image_url} style={{ height: 200, objectFit: 'cover' }} />
        ) : (
          <div style={{ height: 200, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <InboxOutlined style={{ fontSize: 48, color: '#ccc' }} />
          </div>
        )
      }
    >
      <Card.Meta
        title={
          <div className={styles.cardTitle}>
            <h3>{product.nama_produk}</h3>
          </div>
        }
        description={
          <div className={styles.cardDescription}>
            <div className={styles.tags}>
              <Tag color={product.status_produk === 'active' ? 'green' : 'orange'}>
                {product.status_produk?.toUpperCase()}
              </Tag>
              <Tag color="blue">Stok: {product.stok}</Tag>
            </div>
            <div className={styles.priceSection}>
              <div className={styles.priceRow}>
                <span className={styles.label}>Harga Beli:</span>
                <span className={styles.price}>{formatCurrency(product.harga_beli)}</span>
              </div>
            </div>
            <Button
              type="primary"
              icon={<ShoppingCartOutlined />}
              block
              onClick={() => handleOpenSupplyModal(product)}
              className={styles.supplyBtn}
            >
              Supply Produk Ini
            </Button>
          </div>
        }
      />
    </Card>
  );

  return (
    <div className={styles.productsContainer}>
      <div className={styles.header}>
        <div>
          <h2>Produk Tersedia</h2>
          <p>Supply produk dari admin untuk dijual kepada konsumen</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={() => {
            setNewProductModal(true);
            newProductForm.resetFields();
          }}
        >
          Ajukan Produk Baru
        </Button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <p>Memuat produk...</p>
        </div>
      ) : products.length === 0 ? (
        <Empty description="Belum ada produk tersedia dari admin" style={{ marginTop: '50px' }} />
      ) : (
        <Row gutter={[24, 24]}>
          {products.map(product => (
            <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
              <ProductCard product={product} />
            </Col>
          ))}
        </Row>
      )}

      {/* Supply Modal */}
      <Modal
        title={`Supply: ${supplyModal.product?.nama_produk}`}
        open={supplyModal.visible}
        onCancel={() => setSupplyModal({ visible: false, product: null })}
        onOk={handleSubmitSupply}
        confirmLoading={submitting}
        width={800}
      >
        <Form form={supplyForm} layout="vertical">
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Jumlah (unit) *"
                name="jumlah"
                rules={[
                  { required: true, message: 'Jumlah harus diisi' },
                  { type: 'number', min: 1, message: 'Minimal 1 unit' }
                ]}
              >
                <InputNumber 
                  min={1} 
                  defaultValue={1}
                  placeholder="Berapa unit?"
                  style={{ width: '100%' }} 
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Harga Penawaran (Rp) *"
                name="harga_supply"
                rules={[
                  { required: true, message: 'Harga penawaran harus diisi' },
                  { type: 'number', min: 0, message: 'Harga tidak boleh negatif' }
                ]}
              >
                <InputNumber 
                  min={0}
                  placeholder="Masukkan harga penawaran per unit"
                  style={{ width: '100%' }} 
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Grade"
                name="grade"
                initialValue="A"
              >
                <Select>
                  <Select.Option value="A">Grade A (Premium)</Select.Option>
                  <Select.Option value="B">Grade B (Standard)</Select.Option>
                  <Select.Option value="C">Grade C (Extract)</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Pesan / Catatan"
            name="pesan"
          >
            <Input.TextArea rows={3} placeholder="Catatan untuk admin..." />
          </Form.Item>

          <Form.Item
            label="Foto / Bukti Product"
            valuePropName="fileList"
            getValueFromEvent={(e) => e?.fileList}
          >
            <Upload
              onChange={handleImageChange}
              maxCount={1}
              accept="image/*"
            >
              <Button>Upload Foto</Button>
            </Upload>
          </Form.Item>

          {imagePreview && (
            <div style={{ marginBottom: 16 }}>
              <img src={imagePreview} alt="preview" style={{ maxWidth: '100%', maxHeight: '300px' }} />
            </div>
          )}
        </Form>
      </Modal>

      {/* New Product Modal */}
      <Modal
        title="Ajukan Produk Baru"
        open={newProductModal}
        onCancel={() => setNewProductModal(false)}
        onOk={handleSubmitNewProduct}
        confirmLoading={submitting}
        width={800}
      >
        <Form form={newProductForm} layout="vertical">
          <Form.Item
            label="Nama Produk"
            name="nama_produk"
            rules={[{ required: true, message: 'Nama produk harus diisi' }]}
          >
            <Input placeholder="Masukkan nama produk baru" />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Jumlah (unit) *"
                name="jumlah"
                rules={[
                  { required: true, message: 'Jumlah harus diisi' },
                  { type: 'number', min: 1, message: 'Minimal 1 unit' }
                ]}
              >
                <InputNumber 
                  min={1} 
                  defaultValue={1}
                  placeholder="Berapa unit?"
                  style={{ width: '100%' }} 
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Harga Penawaran (Rp) *"
                name="harga_supply"
                rules={[
                  { required: true, message: 'Harga penawaran harus diisi' },
                  { type: 'number', min: 0, message: 'Harga tidak boleh negatif' }
                ]}
              >
                <InputNumber 
                  min={0}
                  placeholder="Masukkan harga penawaran per unit"
                  style={{ width: '100%' }} 
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Grade"
                name="grade"
                initialValue="A"
              >
                <Select>
                  <Select.Option value="A">Grade A (Premium)</Select.Option>
                  <Select.Option value="B">Grade B (Standard)</Select.Option>
                  <Select.Option value="C">Grade C (Extract)</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Berat Produk *"
                name="berat"
                rules={[{ required: true, message: 'Berat harus diisi' }]}
              >
                <Input placeholder="Contoh: 1 kg, 500 gram" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={24}>
              <Form.Item
                label="Lokasi Supplier"
                name="lokasi_supplier"
              >
                <Input placeholder="Lokasi" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Deskripsi"
            name="deskripsi"
          >
            <Input.TextArea rows={2} placeholder="Deskripsi produk..." />
          </Form.Item>

          <Form.Item
            label="Pesan / Catatan"
            name="pesan"
          >
            <Input.TextArea rows={3} placeholder="Catatan untuk admin..." />
          </Form.Item>

          <Form.Item
            label="Foto Produk"
            valuePropName="fileList"
            getValueFromEvent={(e) => e?.fileList}
          >
            <Upload
              onChange={handleNewProductImageChange}
              maxCount={1}
              accept="image/*"
            >
              <Button>Upload Foto</Button>
            </Upload>
          </Form.Item>

          {newProductImagePreview && (
            <div style={{ marginBottom: 16 }}>
              <img src={newProductImagePreview} alt="preview" style={{ maxWidth: '100%', maxHeight: '300px' }} />
            </div>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default AvailableProducts;
