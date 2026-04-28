/**
 * Produk Page
 * Halaman manajemen produk admin dengan CRUD dan Supply management
 */
import React, { useState, useEffect, useCallback } from 'react';
import styles from './Produk.module.css';
import AdminLayout from './components/AdminLayout';
import { productService, stockService } from '../../services/api';
import { Table, Button, Modal, Form, Input, InputNumber, Select, Space, Tag, message, Tabs, Image, Badge, Checkbox, Upload } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckOutlined, CloseOutlined, WhatsAppOutlined, EyeOutlined, SearchOutlined} from '@ant-design/icons';

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
  const [productImageFile, setProductImageFile] = useState(null);
  const [productImagePreview, setProductImagePreview] = useState(null);
  const [form] = Form.useForm();
  const perluSupply = Form.useWatch('perlu_supply', form);

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

  const toNumber = (value) => Number(value || 0);

  const formatWeight = (record) => {
    if (!record?.berat) return '1 kg';
    const numericWeight = Number(record.berat);
    const displayWeight = Number.isInteger(numericWeight) ? numericWeight : numericWeight.toString();
    return `${displayWeight} ${record.satuan_berat || 'kg'}`;
  };

  const getWeightFields = (record) => {
    if (!record?.berat) {
      return { berat: 1, satuan_berat: 'kg' };
    }

    if (typeof record.berat === 'string') {
      const match = record.berat.match(/^([\d.,]+)\s*(kg|gram)?$/i);
      if (match) {
        return {
          berat: Number(match[1].replace(',', '.')) || 1,
          satuan_berat: (match[2] || record.satuan_berat || 'kg').toLowerCase()
        };
      }
    }

    return {
      berat: Number(record.berat) || 1,
      satuan_berat: record.satuan_berat || 'kg'
    };
  };

  const getSupplyPriceInfo = (supply) => {
    const currentBuyPrice = toNumber(supply?.product?.harga_beli);
    const offeredPrice = toNumber(supply?.harga_supply);
    const isPending = supply?.status_produk === 'pending';
    const displayedBuyPrice = isPending ? offeredPrice : currentBuyPrice;
    const hasChangedPrice = currentBuyPrice !== offeredPrice;

    return {
      currentBuyPrice,
      offeredPrice,
      displayedBuyPrice,
      hasChangedPrice,
      isPending
    };
  };

  const resetProductImage = () => {
    setProductImageFile(null);
    setProductImagePreview(null);
  };

  const handleProductImageChange = (info) => {
    const file = info.file.originFileObj || info.file;
    if (!file) return;

    setProductImageFile(file);
    const reader = new FileReader();
    reader.onload = (event) => setProductImagePreview(event.target.result);
    reader.readAsDataURL(file);
  };

  // Handle add/edit product
  const handleSaveProduct = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const formData = new FormData();
      formData.append('nama_produk', values.nama_produk);
      if (values.perlu_supply !== false) {
        formData.append('harga_beli', values.harga_beli);
      }
      formData.append('harga_jual', values.harga_jual);
      formData.append('grade', values.grade);
      formData.append('berat', values.berat);
      formData.append('satuan_berat', values.satuan_berat);
      formData.append('perlu_supply', String(values.perlu_supply !== false));
      if (values.perlu_supply !== false) {
        formData.append('stok', values.stok || 0);
      }
      if (values.perlu_supply === false) {
        const hasExistingImage = Boolean(productModal.product?.image_url);
        if (!productImageFile && !hasExistingImage) {
          message.error('Gambar produk harus diisi');
          return;
        }
        formData.append('stok', values.stok || 0);
        if (productImageFile) {
          formData.append('image', productImageFile);
        }
      }
      formData.append('lokasi_supplier', values.lokasi_supplier || '');
      formData.append('deskripsi', values.deskripsi || '');

      if (productModal.mode === 'edit' && productModal.product) {
        await productService.update(productModal.product.id, formData);
        message.success('Produk berhasil diupdate');
      } else {
        await productService.create(formData);
        message.success(values.perlu_supply === false
          ? 'Produk admin berhasil ditambahkan dan langsung aktif'
          : 'Produk berhasil ditambahkan (status: pending, stok: 0)');
      }

      setProductModal({ visible: false, mode: 'add', product: null });
      form.resetFields();
      resetProductImage();
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
            <Image src={`${record.image_url}`} width={40} height={40} style={{ objectFit: 'cover', borderRadius: 4 }} />
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
      title: 'Berat',
      dataIndex: 'berat',
      key: 'berat',
      render: (_, record) => formatWeight(record)
    },
    {
      title: 'Grade',
      dataIndex: 'grade',
      key: 'grade',
      render: (grade) => <Tag color="gold">Grade {grade || 'A'}</Tag>
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
            const weightFields = getWeightFields(record);
            setProductModal({ visible: true, mode: 'edit', product: record });
            resetProductImage();
            const productNeedsSupply = record.status_produk === 'pending';
            form.setFieldsValue({
              nama_produk: record.nama_produk,
              perlu_supply: productNeedsSupply,
              harga_beli: record.harga_beli,
              harga_jual: record.harga_jual,
              grade: record.grade || 'A',
              berat: weightFields.berat,
              satuan_berat: weightFields.satuan_berat,
              stok: record.stok || 0,
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
      render: (_, record) => (
        <div>
          <div>{record.product?.nama_produk || `#${record.product_id}`}</div>
          {record.product?.supplier_id && (
            <Tag color="purple" style={{ marginTop: 4 }}>Produk Baru</Tag>
          )}
        </div>
      )
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
      render: (val, record) => {
        const priceInfo = getSupplyPriceInfo(record);

        return (
          <div>
            <div>{formatCurrency(val)}</div>
            {priceInfo.currentBuyPrice > 0 && priceInfo.hasChangedPrice && (
              <small style={{ color: priceInfo.offeredPrice < priceInfo.currentBuyPrice ? 'green' : 'red' }}>
                Harga beli awal: {formatCurrency(priceInfo.currentBuyPrice)}
              </small>
            )}
          </div>
        );
      }
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
      <Button onClick={handleSearch} icon={<SearchOutlined />}></Button>
      <Button type="primary" icon={<PlusOutlined />} onClick={() => {
        setProductModal({ visible: true, mode: 'add', product: null });
        form.resetFields();
        resetProductImage();
        form.setFieldsValue({ perlu_supply: true, grade: 'A', berat: 1, satuan_berat: 'kg', stok: 0 });
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
          resetProductImage();
        }}
        confirmLoading={submitting}
        okText="Simpan"
        cancelText="Batal"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="nama_produk" label="Nama Produk" rules={[{ required: true, message: 'Nama produk harus diisi' }]}>
            <Input placeholder="Contoh: Vanila Premium Grade A" />
          </Form.Item>
          <Form.Item name="perlu_supply" valuePropName="checked" initialValue={true}>
            <Checkbox>Perlu supply dari supplier</Checkbox>
          </Form.Item>
          <Space style={{ width: '100%' }} size="large">
            {perluSupply !== false && (
              <Form.Item name="harga_beli" label="Harga Beli Supplier" rules={[{ required: true, message: 'Harga beli harus diisi' }]}>
                <InputNumber style={{ width: 200 }} formatter={value => `Rp ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={value => value.replace(/Rp\s?|(,*)/g, '')} min={0} />
              </Form.Item>
            )}
            <Form.Item name="harga_jual" label="Harga Jual" rules={[{ required: true, message: 'Harga jual harus diisi' }]}>
              <InputNumber style={{ width: 200 }} formatter={value => `Rp ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={value => value.replace(/Rp\s?|(,*)/g, '')} min={0} />
            </Form.Item>
          </Space>
          <Form.Item
            name="grade"
            label="Grade"
            initialValue="A"
            rules={[{ required: true, message: 'Grade harus dipilih' }]}
          >
            <Select>
              <Select.Option value="A">Grade A (Premium)</Select.Option>
              <Select.Option value="B">Grade B (Standard)</Select.Option>
              <Select.Option value="C">Grade C (Extract)</Select.Option>
              <Select.Option value="D">Grade D</Select.Option>
            </Select>
          </Form.Item>
          <Space style={{ width: '100%' }} size="large" align="start">
            <Form.Item
              name="berat"
              label="Berat Produk"
              rules={[
                { required: true, message: 'Berat produk harus diisi' },
                { type: 'number', min: 0.01, message: 'Berat harus lebih dari 0' }
              ]}
            >
              <InputNumber min={0.01} step={0.01} style={{ width: 200 }} placeholder="Contoh: 1" />
            </Form.Item>
            <Form.Item
              name="satuan_berat"
              label="Satuan"
              initialValue="kg"
              rules={[{ required: true, message: 'Satuan harus dipilih' }]}
            >
              <Select style={{ width: 200 }}>
                <Select.Option value="kg">kg</Select.Option>
                <Select.Option value="gram">gram</Select.Option>
              </Select>
            </Form.Item>
          </Space>
          {perluSupply === false && (
            <>
              <Form.Item
                name="stok"
                label="Stok Awal"
                rules={[
                  { required: true, message: 'Stok awal harus diisi' },
                  { type: 'number', min: 0, message: 'Stok tidak boleh negatif' }
                ]}
              >
                <InputNumber min={0} style={{ width: '100%' }} placeholder="Masukkan stok awal produk admin" />
              </Form.Item>
              <Form.Item label="Gambar Produk" required>
                <Upload
                  beforeUpload={() => false}
                  onChange={handleProductImageChange}
                  maxCount={1}
                  accept="image/*"
                >
                  <Button>Upload Gambar</Button>
                </Upload>
              </Form.Item>
              {productModal.mode === 'edit' && productModal.product?.image_url && !productImagePreview && (
                <div style={{ marginBottom: 16 }}>
                  <Image src={productModal.product.image_url} width={160} style={{ borderRadius: 8 }} />
                </div>
              )}
              {productImagePreview && (
                <div style={{ marginBottom: 16 }}>
                  <Image src={productImagePreview} width={160} style={{ borderRadius: 8 }} />
                </div>
              )}
            </>
          )}
          {perluSupply !== false && (
            <Form.Item
              name="stok"
              label="Kebutuhan Supply (stok)"
              rules={[
                { required: true, message: 'Kebutuhan supply harus diisi' },
                { type: 'number', min: 1, message: 'Kebutuhan supply minimal 1' }
              ]}
            >
              <InputNumber min={1} style={{ width: '100%' }} placeholder="Contoh: 10" addonAfter={form.getFieldValue('satuan_berat') || 'kg'} />
            </Form.Item>
          )}
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
            {(() => {
              const priceInfo = getSupplyPriceInfo(supplyDetailModal.supply);

              return (
                <>
                  <h4>Informasi Produk</h4>
                  <p><strong>Produk:</strong> {supplyDetailModal.supply.product?.nama_produk}</p>
                  <p><strong>Jumlah:</strong> {supplyDetailModal.supply.jumlah} unit</p>
                  <p><strong>Harga Penawaran Supplier:</strong> {formatCurrency(priceInfo.offeredPrice)}</p>
                  <p><strong>Harga Beli Admin Saat Ini:</strong> {formatCurrency(priceInfo.currentBuyPrice)}</p>
                  <p>
                    <strong>Harga Beli Ditampilkan:</strong> {formatCurrency(priceInfo.displayedBuyPrice)}
                    {priceInfo.isPending && priceInfo.hasChangedPrice && (
                      <Tag color="orange" style={{ marginLeft: 8 }}>Menunggu keputusan</Tag>
                    )}
                  </p>
                  {priceInfo.isPending && priceInfo.hasChangedPrice && (
                    <p style={{ background: '#fff7e6', border: '1px solid #ffd591', padding: 12, borderRadius: 8 }}>
                      Harga ini hanya preview untuk admin. Jika supply di-reject, harga produk tetap {formatCurrency(priceInfo.currentBuyPrice)}. Jika di-approve, harga beli produk berubah menjadi {formatCurrency(priceInfo.offeredPrice)}.
                    </p>
                  )}
                  <p><strong>Grade:</strong> {supplyDetailModal.supply.grade}</p>
                </>
              );
            })()}

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
        {verifyModal.supply && (
          <p style={{ color: verifyModal.status === 'approved' ? '#1677ff' : '#cf1322' }}>
            {verifyModal.status === 'approved'
              ? `Jika approve, harga beli produk akan menjadi ${formatCurrency(verifyModal.supply.harga_supply)}.`
              : `Jika reject, harga beli produk tetap ${formatCurrency(verifyModal.supply.product?.harga_beli)}.`}
          </p>
        )}
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
