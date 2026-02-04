import React, { useState, useEffect, useCallback } from 'react';
import { Layout, Card, Row, Col, Table, Button, Modal, Form, Input, InputNumber, Select, message, Spin, Tag, Tabs, Upload, Statistic, Empty, Image } from 'antd';
import { PlusOutlined, UploadOutlined, LogoutOutlined, ShoppingCartOutlined, HistoryOutlined, InboxOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { stockService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import BankAccountManager from './BankAccountManager';
import './Supplier.css';

/**
 * Supplier Dashboard
 * Halaman dashboard untuk supplier - melihat produk dari admin dan mengajukan supply
 */
const Supplier = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [mySupplies, setMySupplies] = useState([]);
  const [activeTab, setActiveTab] = useState('products');

  // Modal states
  const [supplyModal, setSupplyModal] = useState({ visible: false, product: null });
  const [newProductModal, setNewProductModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [newProductImageFile, setNewProductImageFile] = useState(null);
  const [newProductImagePreview, setNewProductImagePreview] = useState(null);

  // Form
  const [supplyForm] = Form.useForm();
  const [newProductForm] = Form.useForm();

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [productsRes, suppliesRes] = await Promise.all([
        stockService.getAvailableProducts({ page: 1, limit: 100 }).catch(() => ({ data: [] })),
        stockService.getMySupplies({ page: 1, limit: 50 }).catch(() => ({ data: [] }))
      ]);

      setAvailableProducts(productsRes.data || []);
      setMySupplies(suppliesRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      message.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle logout with confirmation
  const handleLogout = () => {
    Modal.confirm({
      title: 'Konfirmasi Logout',
      content: 'Apakah Anda yakin ingin keluar?',
      okText: 'Ya, Keluar',
      cancelText: 'Batal',
      okButtonProps: { danger: true },
      onOk: () => {
        logout();
        message.success('Berhasil logout');
        navigate('/signin');
      }
    });
  };

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
      // Create preview
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

  // Open supply modal for a product
  const handleOpenSupplyModal = (product) => {
    setSupplyModal({ visible: true, product });
    setImageFile(null);
    setImagePreview(null);
    supplyForm.resetFields();
    // Pre-fill harga_supply with product's harga_beli as reference
    supplyForm.setFieldsValue({
      harga_supply: product.harga_beli
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

      message.success('Pengajuan supply berhasil dikirim! Menunggu persetujuan admin.');
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

  // Handle submit new product with supply
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

      if (newProductImageFile) {
        formData.append('image', newProductImageFile);
      }

      await stockService.createSupplyNewProduct(formData);

      message.success('Produk baru dan supply berhasil diajukan! Menunggu persetujuan admin.');
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

  // Product cards for available products
  const ProductCard = ({ product }) => (
    <Card
      hoverable
      className="product-card"
      cover={
        product.image_url ? (
          <img alt={product.nama_produk} src={`${process.env.REACT_APP_API_URL?.replace('/api', '')}${product.image_url}`} style={{ height: 150, objectFit: 'cover' }} />
        ) : (
          <div style={{ height: 150, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <InboxOutlined style={{ fontSize: 48, color: '#ccc' }} />
          </div>
        )
      }
    >
      <Card.Meta
        title={product.nama_produk}
        description={
          <div>
            <div style={{ marginBottom: 8 }}>
              <Tag color={product.status_produk === 'active' ? 'green' : 'orange'}>
                {product.status_produk?.toUpperCase()}
              </Tag>
              <Tag color="blue">Stok: {product.stok}</Tag>
            </div>
            <div style={{ marginBottom: 4 }}>
              <strong>Harga Beli:</strong> {formatCurrency(product.harga_beli)}
            </div>
            <div style={{ marginBottom: 12 }}>
              <strong>Harga Jual:</strong> {formatCurrency(product.harga_jual)}
            </div>
            <Button
              type="primary"
              icon={<ShoppingCartOutlined />}
              block
              onClick={() => handleOpenSupplyModal(product)}
            >
              Supply Produk Ini
            </Button>
          </div>
        }
      />
    </Card>
  );

  // Supply history columns
  const supplyColumns = [
    {
      title: 'Tanggal',
      dataIndex: 'tanggal_supply',
      key: 'tanggal_supply',
      render: (date) => date ? new Date(date).toLocaleDateString('id-ID') : '-'
    },
    {
      title: 'Produk',
      dataIndex: ['product', 'nama_produk'],
      key: 'product',
      render: (_, record) => record.product?.nama_produk || `Produk #${record.product_id}`
    },
    {
      title: 'Jumlah',
      dataIndex: 'jumlah',
      key: 'jumlah',
    },
    {
      title: 'Grade',
      dataIndex: 'grade',
      key: 'grade',
      render: (grade) => <Tag color="gold">Grade {grade}</Tag>
    },
    {
      title: 'Harga Penawaran',
      dataIndex: 'harga_supply',
      key: 'harga_supply',
      render: (val) => formatCurrency(val)
    },
    {
      title: 'Status',
      dataIndex: 'status_produk',
      key: 'status_produk',
      render: (status) => {
        const colors = { pending: 'orange', approved: 'green', rejected: 'red' };
        const labels = { pending: 'Menunggu', approved: 'Disetujui', rejected: 'Ditolak' };
        return <Tag color={colors[status]}>{labels[status] || status?.toUpperCase()}</Tag>;
      }
    },
    {
      title: 'Catatan Admin',
      dataIndex: 'catatan',
      key: 'catatan',
      render: (text) => text || '-'
    }
  ];

  // Tab items
  const tabItems = [
    {
      key: 'products',
      label: (
        <span>
          <InboxOutlined /> Produk Tersedia
        </span>
      ),
      children: (
        <div style={{ padding: '16px 0' }}>
          {availableProducts.length === 0 ? (
            <Empty description="Belum ada produk tersedia dari admin" />
          ) : (
            <Row gutter={[16, 16]}>
              {availableProducts.map(product => (
                <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
                  <ProductCard product={product} />
                </Col>
              ))}
            </Row>
          )}
        </div>
      )
    },
    {
      key: 'history',
      label: (
        <span>
          <HistoryOutlined /> Riwayat Supply
        </span>
      ),
      children: (
        <Card>
          <Table
            columns={supplyColumns}
            dataSource={mySupplies}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        </Card>
      )
    },
    {
      key: 'bank',
      label: (
        <span>
          🏦 Rekening Bank
        </span>
      ),
      children: <BankAccountManager />
    }
  ];

  if (loading && availableProducts.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Header */}
      <Layout.Header style={{ background: '#2D7A52', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ color: '#fff', fontSize: 24, fontWeight: 'bold' }}>RO</span>
          <span style={{ color: '#fff', fontSize: 18 }}>Supplier Dashboard</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ color: '#fff' }}>Halo, {user?.nama || 'Supplier'}</span>
          <Button icon={<LogoutOutlined />} onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </Layout.Header>

      {/* Content */}
      <Layout.Content style={{ padding: 24 }}>
        {/* Stats Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic title="Produk Tersedia" value={availableProducts.length} suffix="produk" />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Total Supply Saya"
                value={mySupplies.length}
                suffix="pengajuan"
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Menunggu Persetujuan"
                value={mySupplies.filter(s => s.status_produk === 'pending').length}
                suffix="pengajuan"
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Info Card with Action Button */}
        <Card style={{ marginBottom: 24, background: '#e6f7ff', borderColor: '#91d5ff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <InboxOutlined style={{ fontSize: 24, color: '#1890ff' }} />
              <div>
                <strong>Cara Kerja:</strong> Pilih produk yang ingin Anda supply, atau <strong>buat produk baru</strong> jika belum ada.
              </div>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setNewProductModal(true);
                setNewProductImageFile(null);
                setNewProductImagePreview(null);
                newProductForm.resetFields();
              }}
              style={{ background: '#52c41a', borderColor: '#52c41a' }}
            >
              Supply Produk Baru
            </Button>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
        />
      </Layout.Content>

      {/* Supply Modal */}
      <Modal
        title={`Supply: ${supplyModal.product?.nama_produk || ''}`}
        open={supplyModal.visible}
        onOk={handleSubmitSupply}
        onCancel={() => {
          setSupplyModal({ visible: false, product: null });
          setImageFile(null);
          setImagePreview(null);
          supplyForm.resetFields();
        }}
        confirmLoading={submitting}
        okText="Kirim Pengajuan"
        cancelText="Batal"
        width={600}
      >
        {supplyModal.product && (
          <div style={{ marginBottom: 16, padding: 12, background: '#f5f5f5', borderRadius: 8 }}>
            <strong>Harga Beli Admin:</strong> {formatCurrency(supplyModal.product.harga_beli)}
            <span style={{ marginLeft: 16 }}>|</span>
            <span style={{ marginLeft: 16 }}><strong>Harga Jual:</strong> {formatCurrency(supplyModal.product.harga_jual)}</span>
          </div>
        )}

        <Form form={supplyForm} layout="vertical">
          <Form.Item
            name="jumlah"
            label="Jumlah yang Disupply"
            rules={[{ required: true, message: 'Jumlah harus diisi' }]}
          >
            <InputNumber style={{ width: '100%' }} min={1} placeholder="Contoh: 100" addonAfter="unit" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="grade"
                label="Kualitas/Grade Produk"
                initialValue="A"
              >
                <Select>
                  <Select.Option value="A">Grade A (Premium)</Select.Option>
                  <Select.Option value="B">Grade B (Standar)</Select.Option>
                  <Select.Option value="C">Grade C (Ekonomi)</Select.Option>
                  <Select.Option value="D">Grade D (Reject)</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="harga_supply"
                label="Harga Penawaran (per unit)"
                rules={[{ required: true, message: 'Harga harus diisi' }]}
                extra="Bisa berbeda dengan harga beli admin (nego)"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={value => `Rp ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/Rp\s?|(,*)/g, '')}
                  min={0}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="pesan"
            label="Pesan untuk Admin (Opsional)"
            extra="Jelaskan kualitas produk atau negosiasi harga"
          >
            <Input.TextArea
              rows={3}
              placeholder="Contoh: Produk segar dari kebun sendiri, bisa nego harga untuk pembelian banyak"
            />
          </Form.Item>

          <Form.Item label="Foto Produk Anda (Opsional)">
            <Upload
              listType="picture-card"
              showUploadList={false}
              beforeUpload={() => false}
              onChange={handleImageChange}
              accept="image/*"
            >
              {imagePreview ? (
                <img src={imagePreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Upload Foto</div>
                </div>
              )}
            </Upload>
            <div style={{ fontSize: 12, color: '#888' }}>Upload foto produk Anda agar admin bisa melihat kualitasnya</div>
          </Form.Item>
        </Form>
      </Modal>

      {/* New Product Modal */}
      <Modal
        title="Supply Produk Baru"
        open={newProductModal}
        onOk={handleSubmitNewProduct}
        onCancel={() => {
          setNewProductModal(false);
          setNewProductImageFile(null);
          setNewProductImagePreview(null);
          newProductForm.resetFields();
        }}
        confirmLoading={submitting}
        okText="Kirim Pengajuan"
        cancelText="Batal"
        width={700}
      >
        <div style={{ marginBottom: 16, padding: 12, background: '#fffbe6', borderRadius: 8, border: '1px solid #ffe58f' }}>
          <strong>Catatan:</strong> Produk baru akan di-review oleh admin sebelum ditampilkan di marketplace.
        </div>

        <Form form={newProductForm} layout="vertical">
          <Form.Item
            name="nama_produk"
            label="Nama Produk"
            rules={[{ required: true, message: 'Nama produk harus diisi' }]}
          >
            <Input placeholder="Contoh: Vanila Premium Grade A" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="jumlah"
                label="Jumlah yang Disupply"
                rules={[{ required: true, message: 'Jumlah harus diisi' }]}
              >
                <InputNumber style={{ width: '100%' }} min={1} placeholder="100" addonAfter="unit" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="harga_supply"
                label="Harga Penawaran (per unit)"
                rules={[{ required: true, message: 'Harga harus diisi' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={value => `Rp ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/Rp\s?|(,*)/g, '')}
                  min={0}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="grade"
                label="Kualitas/Grade"
                initialValue="A"
              >
                <Select>
                  <Select.Option value="A">Grade A (Premium)</Select.Option>
                  <Select.Option value="B">Grade B (Standar)</Select.Option>
                  <Select.Option value="C">Grade C (Ekonomi)</Select.Option>
                  <Select.Option value="D">Grade D (Reject)</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="lokasi_supplier"
            label="Lokasi Anda (Opsional)"
          >
            <Input placeholder="Contoh: Bantul, Yogyakarta" />
          </Form.Item>

          <Form.Item
            name="deskripsi"
            label="Deskripsi Produk (Opsional)"
          >
            <Input.TextArea
              rows={2}
              placeholder="Deskripsi singkat tentang produk..."
            />
          </Form.Item>

          <Form.Item
            name="pesan"
            label="Pesan untuk Admin (Opsional)"
          >
            <Input.TextArea
              rows={2}
              placeholder="Contoh: Produk segar dari kebun sendiri, bisa nego harga untuk pembelian banyak"
            />
          </Form.Item>

          <Form.Item label="Foto Produk (Wajib untuk produk baru)">
            <Upload
              listType="picture-card"
              showUploadList={false}
              beforeUpload={() => false}
              onChange={handleNewProductImageChange}
              accept="image/*"
            >
              {newProductImagePreview ? (
                <img src={newProductImagePreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Upload Foto</div>
                </div>
              )}
            </Upload>
            <div style={{ fontSize: 12, color: '#888' }}>Upload foto produk Anda agar admin bisa melihat kualitasnya</div>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default Supplier;
