import React, { useState, useCallback, useEffect } from 'react';
import { Card, Row, Col, Statistic, Empty, Button, Spin, Space, Tag, Table, message, Modal } from 'antd';
import { ShoppingCartOutlined, CheckOutlined, ClockCircleOutlined, CloseCircleOutlined, BankOutlined, PlusOutlined, ArrowUpOutlined, DatabaseOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { stockService, paymentService } from '../../../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
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
    rejectedSupplies: 0,
    totalItemsSupplied: 0,
    totalInventoryValue: 0
  });
  const [recentSupplies, setRecentSupplies] = useState([]);
  const [walletSummary, setWalletSummary] = useState({ saldo: 0, chartData: [] });
  const [withdrawing, setWithdrawing] = useState(false);

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [productsRes, suppliesRes, walletRes] = await Promise.all([
        stockService.getAvailableProducts({ page: 1, limit: 100 }).catch(() => ({ data: [] })),
        stockService.getMySupplies({ page: 1, limit: 10 }).catch(() => ({ data: [] })),
        paymentService.getWalletSummary().catch(() => ({ data: { saldo: 0, chartData: [] } }))
      ]);

      const products = productsRes.data || [];
      const supplies = suppliesRes.data || [];
      const wallet = walletRes.data || { saldo: 0, chartData: [] };

      // Calculate total items supplied (sum of jumlah for approved supplies)
      const approvedSuppliesList = supplies.filter(s => s.status_produk === 'approved');
      const totalItemsSupplied = approvedSuppliesList.reduce((sum, s) => sum + (s.jumlah || 0), 0);
      
      // Calculate total inventory value (sum of harga_supply * jumlah for approved supplies)
      const totalInventoryValue = approvedSuppliesList.reduce((sum, s) => sum + ((s.harga_supply || 0) * (s.jumlah || 0)), 0);

      setRecentSupplies(supplies);
      setWalletSummary(wallet);
      setStats({
        availableProducts: products.length,
        totalSupplies: supplies.length,
        pendingSupplies: supplies.filter(s => s.status_produk === 'pending').length,
        approvedSupplies: approvedSuppliesList.length,
        rejectedSupplies: supplies.filter(s => s.status_produk === 'rejected').length,
        totalItemsSupplied: totalItemsSupplied,
        totalInventoryValue: totalInventoryValue
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

  // Handle withdraw funds
  const handleWithdraw = () => {
    Modal.confirm({
      title: 'Konfirmasi Cairkan Dana',
      content: `Apakah Anda yakin ingin mencairkan saldo sebesar ${formatCurrency(walletSummary.saldo)}? Dana akan ditransfer ke rekening default Anda.`,
      okText: 'Cairkan Sekarang',
      cancelText: 'Batal',
      onOk: async () => {
        setWithdrawing(true);
        try {
          const res = await paymentService.withdrawFunds();
          message.success('Penarikan dana berhasil diproses sebesar ' + formatCurrency(res.data.withdrawn_amount));
          fetchData();
        } catch (error) {
          message.error(error.message || 'Gagal mencairkan dana. Pastikan Anda sudah mengatur rekening bank utama.');
        } finally {
          setWithdrawing(false);
        }
      }
    });
  };

  // Real-time polling: Auto-refresh inventory metrics every 10 seconds when dashboard is active
  useEffect(() => {
    const pollingInterval = setInterval(() => {
      fetchData();
    }, 10000); // 10 seconds polling interval

    return () => {
      // Cleanup: Clear interval when component unmounts
      clearInterval(pollingInterval);
    };
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
      title: 'Harga Penawaran',
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

      {/* Wallet / Saldo Section */}
      <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={8}>
          <Card className={styles.walletCard} style={{ background: 'linear-gradient(135deg, #2d7a52 0%, #1e5a3a 100%)', color: 'white', borderRadius: 12, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h3 style={{ color: 'rgba(255,255,255,0.8)', margin: 0 }}>Saldo Tersedia</h3>
            <div style={{ fontSize: '32px', fontWeight: 'bold', margin: '15px 0' }}>
              {formatCurrency(walletSummary?.saldo || 0)}
            </div>
            <Button 
              type="primary" 
              size="large"
              style={{ background: '#fff', color: '#2d7a52', border: 'none', fontWeight: 'bold', width: '100%', marginTop: 'auto' }}
              onClick={handleWithdraw}
              loading={withdrawing}
              disabled={!walletSummary?.saldo || walletSummary.saldo <= 0}
            >
              Cairkan Dana
            </Button>
          </Card>
        </Col>
        <Col xs={24} md={16}>
          <Card title="Riwayat Pendapatan" style={{ borderRadius: 12, height: '100%' }} bodyStyle={{ padding: '20px 24px 0 24px' }}>
            {walletSummary?.chartData && walletSummary.chartData.length > 0 ? (
              <div style={{ width: '100%', height: 220 }}>
                <ResponsiveContainer>
                  <LineChart data={walletSummary.chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#8c8c8c'}} />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#8c8c8c'}}
                      tickFormatter={(value) => `Rp${value >= 1000000 ? (value/1000000).toFixed(1) + 'M' : value/1000 + 'k'}`} 
                    />
                    <RechartsTooltip 
                      formatter={(value) => [formatCurrency(value), 'Pendapatan']}
                      labelFormatter={(label) => `Tanggal: ${label}`}
                      contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Line type="monotone" dataKey="amount" stroke="#2d7a52" strokeWidth={3} dot={{ r: 4, fill: '#2d7a52', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} name="Pendapatan" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Empty description="Belum ada riwayat pendapatan" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              </div>
            )}
          </Card>
        </Col>
      </Row>

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
        <Col xs={24} sm={12} md={8}>
          <StatCard
            title="Total Barang Dikirim"
            value={stats.totalItemsSupplied}
            color="#9254de"
            icon={<ArrowUpOutlined style={{ fontSize: 32 }} />}
            suffix="unit disupply"
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <StatCard
            title="Nilai Inventory"
            value={formatCurrency(stats.totalInventoryValue)}
            color="#13c2c2"
            icon={<DatabaseOutlined style={{ fontSize: 32 }} />}
            suffix="total inventory"
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
              <li>Isi informasi supply (jumlah, harga penawaran, grade)</li>
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
