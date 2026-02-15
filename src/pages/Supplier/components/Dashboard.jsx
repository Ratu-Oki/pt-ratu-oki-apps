import React, { useState, useCallback, useEffect } from 'react';
import { Card, Row, Col, Statistic, Empty, Button, Spin, Space, Tag, Table, message } from 'antd';
import { ShoppingCartOutlined, CheckOutlined, ClockCircleOutlined, CloseCircleOutlined, BankOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { stockService } from '../../../services/api';
import styles from './Dashboard.module.css';

/**
 * Dashboard Component untuk Supplier
 * Menampilkan overview dan statistik supplier
 */
const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    availableProducts: 0,
    totalSupplies: 0,
    pendingSupplies: 0,
    approvedSupplies: 0,
    rejectedSupplies: 0
  });
  const [recentSupplies, setRecentSupplies] = useState([]);

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [productsRes, suppliesRes] = await Promise.all([
        stockService.getAvailableProducts({ page: 1, limit: 100 }).catch(() => ({ data: [] })),
        stockService.getMySupplies({ page: 1, limit: 10 }).catch(() => ({ data: [] }))
      ]);

      const products = productsRes.data || [];
      const supplies = suppliesRes.data || [];

      setRecentSupplies(supplies);
      setStats({
        availableProducts: products.length,
        totalSupplies: supplies.length,
        pendingSupplies: supplies.filter(s => s.status_produk === 'pending').length,
        approvedSupplies: supplies.filter(s => s.status_produk === 'approved').length,
        rejectedSupplies: supplies.filter(s => s.status_produk === 'rejected').length
      });
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

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  // Format date
  const formatDate = (date) => {
    return date ? new Date(date).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }) : '-';
  };

  // Stat Card Component
  const StatCard = ({ title, value, color, icon, suffix }) => (
    <Card className={styles.statCard} style={{ borderLeftColor: color }}>
      <div className={styles.cardContent}>
        <div className={styles.cardIcon} style={{ color }}>
          {icon}
        </div>
        <div className={styles.cardInfo}>
          <p className={styles.cardLabel}>{title}</p>
          <p className={styles.cardValue} style={{ color }}>{value}</p>
          {suffix && <p className={styles.cardSuffix}>{suffix}</p>}
        </div>
      </div>
    </Card>
  );

  // Table columns
  const columns = [
    {
      title: 'Produk',
      dataIndex: ['product', 'nama_produk'],
      key: 'product',
      render: (_, record) => record.product?.nama_produk || 'Produk Baru',
      ellipsis: true
    },
    {
      title: 'Tanggal',
      dataIndex: 'tanggal_supply',
      key: 'tanggal_supply',
      render: (date) => formatDate(date),
      width: 120
    },
    {
      title: 'Jumlah',
      dataIndex: 'jumlah',
      key: 'jumlah',
      align: 'center',
      width: 80
    },
    {
      title: 'Harga',
      dataIndex: 'harga_supply',
      key: 'harga_supply',
      render: (val) => <span style={{ color: '#2d7a52', fontWeight: 600 }}>{formatCurrency(val)}</span>,
      width: 140
    },
    {
      title: 'Status',
      dataIndex: 'status_produk',
      key: 'status_produk',
      render: (status) => {
        const statusConfig = {
          pending: { color: 'orange', label: 'Menunggu', icon: <ClockCircleOutlined /> },
          approved: { color: 'green', label: 'Disetujui', icon: <CheckOutlined /> },
          rejected: { color: 'red', label: 'Ditolak', icon: <CloseCircleOutlined /> }
        };
        const config = statusConfig[status] || { color: 'default', label: status };
        return <Tag icon={config.icon} color={config.color}>{config.label}</Tag>;
      },
      width: 120
    }
  ];

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      {/* Welcome Section */}
      <div className={styles.welcomeSection}>
        <h2>Dashboard Supplier</h2>
        <p>Kelola supplies dan rekening bank Anda dengan mudah</p>
      </div>

      {/* Stats Grid */}
      <Row gutter={[20, 20]} className={styles.statsGrid}>
        <Col xs={24} sm={12} md={8}>
          <StatCard
            title="Produk Tersedia"
            value={stats.availableProducts}
            color="#1890ff"
            icon={<ShoppingCartOutlined style={{ fontSize: 32 }} />}
            suffix="siap di-supply"
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <StatCard
            title="Total Pengajuan"
            value={stats.totalSupplies}
            color="#2d7a52"
            icon={<ShoppingCartOutlined style={{ fontSize: 32 }} />}
            suffix="pengajuan supply"
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <StatCard
            title="Menunggu Persetujuan"
            value={stats.pendingSupplies}
            color="#faad14"
            icon={<ClockCircleOutlined style={{ fontSize: 32 }} />}
            suffix="dalam proses review"
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <StatCard
            title="Disetujui"
            value={stats.approvedSupplies}
            color="#52c41a"
            icon={<CheckOutlined style={{ fontSize: 32 }} />}
            suffix="pengajuan diterima"
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <StatCard
            title="Ditolak"
            value={stats.rejectedSupplies}
            color="#f5222d"
            icon={<CloseCircleOutlined style={{ fontSize: 32 }} />}
            suffix="pengajuan ditolak"
          />
        </Col>
      </Row>

      {/* Quick Actions */}
      <div className={styles.quickActionsSection}>
        <h3>Aksi Cepat</h3>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Button
              block
              size="large"
              type="primary"
              icon={<ShoppingCartOutlined />}
              onClick={() => navigate('/supplier/products')}
            >
              Supply Produk
            </Button>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Button
              block
              size="large"
              onClick={() => navigate('/supplier/bank')}
            >
              <BankOutlined /> Kelola Bank
            </Button>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Button
              block
              size="large"
              onClick={() => navigate('/supplier/settings')}
            >
              ⚙️ Pengaturan
            </Button>
          </Col>
        </Row>
      </div>

      {/* Recent Supplies */}
      <div className={styles.recentSection}>
        <div className={styles.sectionHeader}>
          <h3>Pengajuan Terbaru</h3>
          <Button
            type="link"
            onClick={() => navigate('/supplier/history')}
          >
            Lihat Semua →
          </Button>
        </div>

        {recentSupplies.length === 0 ? (
          <Empty
            description="Belum ada pengajuan supply"
            style={{ padding: '40px 0' }}
          />
        ) : (
          <Card className={styles.tableCard}>
            <Table
              columns={columns}
              dataSource={recentSupplies}
              rowKey="id"
              pagination={false}
              scroll={{ x: 800 }}
              className={styles.table}
            />
          </Card>
        )}
      </div>

      {/* Info Cards */}
      <Row gutter={[24, 24]} style={{ marginTop: 30 }}>
        <Col xs={24} md={12}>
          <Card className={styles.infoCard}>
            <h4>📋 Cara Supply Produk</h4>
            <ol className={styles.infList}>
              <li>Klik menu "Produk Tersedia"</li>
              <li>Pilih produk yang ingin Anda supply</li>
              <li>Isi informasi supply (jumlah, harga, grade)</li>
              <li>Upload foto produk Anda</li>
              <li>Submit pengajuan untuk review admin</li>
            </ol>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card className={styles.infoCard}>
            <h4>🏦 Pentingnya Rekening Bank</h4>
            <p>
              Pastikan Anda telah menambahkan rekening bank untuk menerimakan pembayaran dari admin. Admin akan melakukan
              transfer melalui rekening yang Anda daftarkan sebagai default.
            </p>
            <Button 
              type="primary" 
              size="small"
              onClick={() => navigate('/supplier/bank')}
            >
              Kelola Rekening
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
