/**
 * Produk Page
 * Halaman manajemen produk admin dengan CRUD dan Supply management
 */
import React, { useState, useEffect, useCallback } from 'react';
import styles from './Produk.module.css';
import AdminLayout from './components/AdminLayout';
import { productService, stockService } from '../../services/api';
import { Table, Button, Modal, Form, Input, InputNumber, Select, Space, Tag, message, Tabs, Image, Badge } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckOutlined, CloseOutlined, WhatsAppOutlined, EyeOutlined } from '@ant-design/icons';

const Produk = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [supplies, setSupplies] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('products');
  const [productModal, setProductModal] = useState({ visible: false, mode: 'add', product: null });
  const [supplyDetailModal, setSupplyDetailModal] = useState({ visible: false, supply: null });
  const [verifyModal, setVerifyModal] = useState({ visible: false, supply: null, status: 'approved', catatan: '' });
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  // Fetch products
  const fetchProducts = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: pagination.limit,
        search: searchTerm || undefined
      };

      const response = await productService.getAllAdmin(params);

      // Handle both array and object response formats
      let productsData = [];
      let paginationData = { page: 1, limit: 10, total: 0 };

      if (Array.isArray(response.data)) {
        productsData = response.data;
        paginationData.total = response.data.length;
      } else if (response.data) {
        productsData = response.data.products || response.data || [];
        paginationData = response.data.pagination || response.pagination || paginationData;
      }

      setProducts(productsData);
      setPagination({
        page: paginationData.page || page,
        limit: paginationData.limit || 10,
        total: paginationData.total || productsData.length
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      message.error('Gagal memuat data produk');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, pagination.limit]);

  // Fetch supplies
  const fetchSupplies = useCallback(async () => {
    try {
      const response = await stockService.getAllSupplies({ page: 1, limit: 50 });

      let suppliesData = [];
      if (Array.isArray(response.data)) {
        suppliesData = response.data;
      } else if (response.data) {
        suppliesData = response.data.supplies || response.data || [];
      }

      setSupplies(suppliesData);
    } catch (error) {
      console.error('Error fetching supplies:', error);
    }
  }, []);

  useEffect(() => {
    fetchProducts(1);
    fetchSupplies();
  }, []);

  useEffect(() => {
    if (activeTab === 'supplies') {
      fetchSupplies();
    }
  }, [activeTab]);

  // Handle search
  const handleSearch = () => {
    fetchProducts(1);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  // Handle add/edit product
  const handleSaveProduct = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const formData = new FormData();
      formData.append('nama_produk', values.nama_produk);
      formData.append('harga_beli', values.harga_beli);
      formData.append('harga_jual', values.harga_jual);
      formData.append('lokasi_supplier', values.lokasi_supplier || '');
      formData.append('deskripsi', values.deskripsi || '');

      if (productModal.mode === 'edit' && productModal.product) {
        await productService.update(productModal.product.id, formData);
        message.success('Produk berhasil diupdate');
      } else {
        await productService.create(formData);
        message.success('Produk berhasil ditambahkan (status: pending, stok: 0)');
      }

      setProductModal({ visible: false, mode: 'add', product: null });
      form.resetFields();
      fetchProducts(pagination.page);
    } catch (error) {
      console.error('Error saving product:', error);
      message.error(error.message || 'Gagal menyimpan produk');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle status change
  const handleStatusChange = async (productId, newStatus) => {
    try {
      await productService.updateStatus(productId, newStatus);
      message.success(`Status produk berhasil diubah ke ${newStatus}`);
      fetchProducts(pagination.page);
    } catch (error) {
      console.error('Error updating status:', error);
      message.error(error.message || 'Gagal mengubah status');
    }
  };

  // Handle verify supply
  const handleVerifySupply = async () => {
    if (!verifyModal.supply) return;

    setSubmitting(true);
    try {
      await stockService.verifySupply(verifyModal.supply.id, verifyModal.status, verifyModal.catatan);
      message.success(verifyModal.status === 'approved' ? 'Supply berhasil di-approve' : 'Supply ditolak');
      setVerifyModal({ visible: false, supply: null, status: 'approved', catatan: '' });
      fetchSupplies();
      fetchProducts(pagination.page);
    } catch (error) {
      console.error('Error verifying supply:', error);
      message.error(error.message || 'Gagal verifikasi supply');
    } finally {
      setSubmitting(false);
    }
  };

  // Open WhatsApp
  const openWhatsApp = (phone, supplierName, productName) => {
    if (!phone) {
      message.warning('Supplier belum mengisi nomor WhatsApp');
      return;
    }
    // Clean phone number and format for WhatsApp
    let cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '62' + cleanPhone.substring(1);
    }
    const text = encodeURIComponent(`Halo ${supplierName}, saya admin PT Ratu Oki. Mengenai supply produk "${productName}"...`);
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  // Delete product
  const handleDeleteProduct = (productId) => {
    Modal.confirm({
      title: 'Hapus Produk',
      content: 'Apakah Anda yakin ingin menghapus produk ini?',
      okText: 'Hapus',
      okType: 'danger',
      onOk: async () => {
        try {
          await productService.delete(productId);
          message.success('Produk berhasil dihapus');
          fetchProducts(pagination.page);
        } catch (error) {
          message.error(error.message || 'Gagal menghapus produk');
        }
      }
    });
  };

  // Product columns
  const productColumns = [
    {
      title: 'Produk',
      dataIndex: 'nama_produk',
      key: 'nama_produk',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {record.image_url && (
            <Image src={`${process.env.REACT_APP_API_URL?.replace('/api', '')}${record.image_url}`} width={40} height={40} style={{ objectFit: 'cover', borderRadius: 4 }} />
          )}
          <span>{text}</span>
        </div>
      )
    },
    {
      title: 'Harga Beli',
      dataIndex: 'harga_beli',
      key: 'harga_beli',
      render: (val) => formatCurrency(val)
    },
    {
      title: 'Harga Jual',
      dataIndex: 'harga_jual',
      key: 'harga_jual',
      render: (val) => formatCurrency(val)
    },
    {
      title: 'Stok',
      dataIndex: 'stok',
      key: 'stok',
      render: (val) => <Tag color={val > 0 ? 'green' : 'red'}>{val || 0}</Tag>
    },
    {
      title: 'Status',
      dataIndex: 'status_produk',
      key: 'status_produk',
      render: (status, record) => (
        <Select
          value={status}
          onChange={(val) => handleStatusChange(record.id, val)}
          style={{ width: 120 }}
          size="small"
        >
          <Select.Option value="pending"><Tag color="orange">Pending</Tag></Select.Option>
          <Select.Option value="active"><Tag color="green">Active</Tag></Select.Option>
          <Select.Option value="inactive"><Tag color="default">Inactive</Tag></Select.Option>
        </Select>
      )
    },
    {
      title: 'Aksi',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => {
            setProductModal({ visible: true, mode: 'edit', product: record });
            form.setFieldsValue({
              nama_produk: record.nama_produk,
              harga_beli: record.harga_beli,
              harga_jual: record.harga_jual,
              lokasi_supplier: record.lokasi_supplier,
              deskripsi: record.deskripsi
            });
          }} />

        </Space>
      )
    }
  ];

  // Supply columns
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
      render: (_, record) => record.product?.nama_produk || `#${record.product_id}`
    },
    {
      title: 'Supplier',
      dataIndex: ['supplier', 'nama'],
      key: 'supplier',
      render: (_, record) => (
        <div>
          <div>{record.supplier?.nama || 'Unknown'}</div>
          <small style={{ color: '#888' }}>{record.supplier?.email}</small>
        </div>
      )
    },
    {
      title: 'Jumlah',
      dataIndex: 'jumlah',
      key: 'jumlah'
    },
    {
      title: 'Harga',
      dataIndex: 'harga_supply',
      key: 'harga_supply',
      render: (val, record) => (
        <div>
          <div>{formatCurrency(val)}</div>
          {record.product?.harga_beli && val !== record.product.harga_beli && (
            <small style={{ color: val < record.product.harga_beli ? 'green' : 'red' }}>
              vs {formatCurrency(record.product.harga_beli)}
            </small>
          )}
        </div>
      )
    },
    {
      title: 'Grade',
      dataIndex: 'grade',
      key: 'grade',
      render: (grade) => <Tag color="gold">Grade {grade}</Tag>
    },
    {
      title: 'Status',
      dataIndex: 'status_produk',
      key: 'status_produk',
      render: (status) => {
        const colors = { pending: 'orange', approved: 'green', rejected: 'red' };
        return <Tag color={colors[status]}>{status?.toUpperCase()}</Tag>;
      }
    },
    {
      title: 'Aksi',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => setSupplyDetailModal({ visible: true, supply: record })}>
            Detail
          </Button>
          {record.status_produk === 'pending' && (
            <>
              <Button size="small" type="primary" icon={<CheckOutlined />} onClick={() => setVerifyModal({ visible: true, supply: record, status: 'approved', catatan: '' })}>
                Approve
              </Button>
              <Button size="small" danger icon={<CloseOutlined />} onClick={() => setVerifyModal({ visible: true, supply: record, status: 'rejected', catatan: '' })}>
                Reject
              </Button>
            </>
          )}
          {record.supplier?.telepon && (
            <Button
              size="small"
              style={{ background: '#25D366', borderColor: '#25D366', color: 'white' }}
              icon={<WhatsAppOutlined />}
              onClick={() => openWhatsApp(record.supplier?.telepon, record.supplier?.nama, record.product?.nama_produk)}
            />
          )}
        </Space>
      )
    }
  ];

  const pendingSuppliesCount = supplies.filter(s => s.status_produk === 'pending').length;

  // Tab items
  const tabItems = [
    {
      key: 'products',
      label: 'Semua Produk',
      children: (
        <Table
          columns={productColumns}
          dataSource={products}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            onChange: (page) => fetchProducts(page)
          }}
        />
      )
    },
    {
      key: 'supplies',
      label: (
        <Badge count={pendingSuppliesCount} offset={[10, 0]}>
          <span>Supply Masuk</span>
        </Badge>
      ),
      children: (
        <Table
          columns={supplyColumns}
          dataSource={supplies}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      )
    }
  ];

  const actionButtons = (
    <div style={{ display: 'flex', gap: 8 }}>
      <Input
        placeholder="Cari produk..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onPressEnter={handleSearch}
        style={{ width: 200 }}
      />
      <Button onClick={handleSearch}>🔍</Button>
      <Button type="primary" icon={<PlusOutlined />} onClick={() => {
        setProductModal({ visible: true, mode: 'add', product: null });
        form.resetFields();
      }}>
        Tambah Produk
      </Button>
    </div>
  );

  return (
    <AdminLayout headerType="full" title="Manajemen Produk" actionButton={actionButtons}>
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />

      {/* Product Modal */}
      <Modal
        title={productModal.mode === 'edit' ? 'Edit Produk' : 'Tambah Produk Baru'}
        open={productModal.visible}
        onOk={handleSaveProduct}
        onCancel={() => {
          setProductModal({ visible: false, mode: 'add', product: null });
          form.resetFields();
        }}
        confirmLoading={submitting}
        okText="Simpan"
        cancelText="Batal"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="nama_produk" label="Nama Produk" rules={[{ required: true, message: 'Nama produk harus diisi' }]}>
            <Input placeholder="Contoh: Vanila Premium Grade A" />
          </Form.Item>
          <Space style={{ width: '100%' }} size="large">
            <Form.Item name="harga_beli" label="Harga Beli" rules={[{ required: true, message: 'Harga beli harus diisi' }]}>
              <InputNumber style={{ width: 200 }} formatter={value => `Rp ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={value => value.replace(/Rp\s?|(,*)/g, '')} min={0} />
            </Form.Item>
            <Form.Item name="harga_jual" label="Harga Jual" rules={[{ required: true, message: 'Harga jual harus diisi' }]}>
              <InputNumber style={{ width: 200 }} formatter={value => `Rp ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={value => value.replace(/Rp\s?|(,*)/g, '')} min={0} />
            </Form.Item>
          </Space>
          <Form.Item name="lokasi_supplier" label="Lokasi">
            <Input placeholder="Contoh: Jakarta" />
          </Form.Item>
          <Form.Item name="deskripsi" label="Deskripsi">
            <Input.TextArea rows={3} placeholder="Deskripsi produk..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Supply Detail Modal */}
      <Modal
        title="Detail Supply"
        open={supplyDetailModal.visible}
        onCancel={() => setSupplyDetailModal({ visible: false, supply: null })}
        footer={[
          supplyDetailModal.supply?.supplier?.whatsapp && (
            <Button
              key="wa"
              style={{ background: '#25D366', borderColor: '#25D366', color: 'white' }}
              icon={<WhatsAppOutlined />}
              onClick={() => openWhatsApp(
                supplyDetailModal.supply?.supplier?.whatsapp,
                supplyDetailModal.supply?.supplier?.nama,
                supplyDetailModal.supply?.product?.nama_produk
              )}
            >
              WhatsApp Supplier
            </Button>
          ),
          <Button key="close" onClick={() => setSupplyDetailModal({ visible: false, supply: null })}>Tutup</Button>
        ]}
        width={600}
      >
        {supplyDetailModal.supply && (
          <div>
            <h4>Informasi Produk</h4>
            <p><strong>Produk:</strong> {supplyDetailModal.supply.product?.nama_produk}</p>
            <p><strong>Jumlah:</strong> {supplyDetailModal.supply.jumlah} unit</p>
            <p><strong>Harga Penawaran:</strong> {formatCurrency(supplyDetailModal.supply.harga_supply)}</p>
            <p><strong>Harga Beli Admin:</strong> {formatCurrency(supplyDetailModal.supply.product?.harga_beli)}</p>
            <p><strong>Grade:</strong> {supplyDetailModal.supply.grade}</p>

            <h4 style={{ marginTop: 16 }}>Informasi Supplier</h4>
            <p><strong>Nama:</strong> {supplyDetailModal.supply.supplier?.nama}</p>
            <p><strong>Email:</strong> {supplyDetailModal.supply.supplier?.email}</p>
            <p><strong>WhatsApp:</strong> {supplyDetailModal.supply.supplier?.telepon || '-'}</p>

            {supplyDetailModal.supply.pesan && (
              <>
                <h4 style={{ marginTop: 16 }}>Pesan dari Supplier</h4>
                <p style={{ background: '#f5f5f5', padding: 12, borderRadius: 8 }}>{supplyDetailModal.supply.pesan}</p>
              </>
            )}

            {supplyDetailModal.supply.image_url && (
              <>
                <h4 style={{ marginTop: 16 }}>Foto Produk</h4>
                <Image src={`${supplyDetailModal.supply.image_url}`} width={200} />
              </>
            )}
          </div>
        )}
      </Modal>

      {/* Verify Modal */}
      <Modal
        title={verifyModal.status === 'approved' ? 'Approve Supply' : 'Reject Supply'}
        open={verifyModal.visible}
        onOk={handleVerifySupply}
        onCancel={() => setVerifyModal({ visible: false, supply: null, status: 'approved', catatan: '' })}
        confirmLoading={submitting}
        okText={verifyModal.status === 'approved' ? 'Approve' : 'Reject'}
        okButtonProps={{ danger: verifyModal.status === 'rejected' }}
      >
        <p><strong>Produk:</strong> {verifyModal.supply?.product?.nama_produk}</p>
        <p><strong>Jumlah:</strong> {verifyModal.supply?.jumlah} unit</p>
        <p><strong>Harga:</strong> {formatCurrency(verifyModal.supply?.harga_supply)}</p>
        <div style={{ marginTop: 16 }}>
          <label>Catatan untuk Supplier:</label>
          <Input.TextArea
            rows={3}
            value={verifyModal.catatan}
            onChange={(e) => setVerifyModal(prev => ({ ...prev, catatan: e.target.value }))}
            placeholder="Tambahkan catatan jika perlu..."
          />
        </div>
      </Modal>
    </AdminLayout>
  );
};

export default Produk;
