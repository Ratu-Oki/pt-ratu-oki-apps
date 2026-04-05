import React, { useState, useCallback, useEffect } from 'react';
import { Card, Table, Tag, message, Empty, Button, Space, Tooltip } from 'antd';
import { ReloadOutlined, EyeOutlined } from '@ant-design/icons';
import { stockService } from '../../../services/api';
import styles from './SupplyHistory.module.css';

/**
 * SupplyHistory Component
 * Menampilkan riwayat supply yang telah diajukan supplier
 */
const SupplyHistory = () => {
  const [supplies, setSupplies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  // Fetch supply history
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await stockService.getMySupplies({ page: 1, limit: 100 });
      const data = response.data || [];
      setSupplies(data);

      // Calculate stats
      const newStats = {
        total: data.length,
        pending: data.filter(s => s.status_produk === 'pending').length,
        approved: data.filter(s => s.status_produk === 'approved').length,
        rejected: data.filter(s => s.status_produk === 'rejected').length
      };
      setStats(newStats);
    } catch (error) {
      console.error('Error fetching supply history:', error);
      message.error('Gagal memuat riwayat supply');
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
      month: 'long',
      day: 'numeric'
    }) : '-';
  };

  // Table columns
  const columns = [
    {
      title: 'Tanggal Supply',
      dataIndex: 'tanggal_supply',
      key: 'tanggal_supply',
      render: (date) => formatDate(date),
      width: 150
    },
    {
      title: 'Produk',
      dataIndex: ['product', 'nama_produk'],
      key: 'product',
      render: (_, record) => record.product?.nama_produk || `Produk #${record.product_id}`,
      ellipsis: true
    },
    {
      title: 'Jumlah',
      dataIndex: 'jumlah',
      key: 'jumlah',
      align: 'center',
      width: 80
    },
    {
      title: 'Berat',
      dataIndex: 'berat',
      key: 'berat',
      render: (berat, record) => record.product?.berat || berat || '-',
      width: 100
    },
    {
      title: 'Grade',
      dataIndex: 'grade',
      key: 'grade',
      render: (grade) => <Tag color="gold">Grade {grade}</Tag>,
      width: 100
    },
    {
      title: 'Harga Penawaran',
      dataIndex: 'harga_supply',
      key: 'harga_supply',
      render: (val) => <span style={{ fontWeight: 600, color: '#2d7a52' }}>{formatCurrency(val)}</span>,
      width: 150
    },
    {
      title: 'Status',
      dataIndex: 'status_produk',
      key: 'status_produk',
      render: (status) => {
        const statusConfig = {
          pending: { color: 'orange', label: 'Menunggu' },
          approved: { color: 'green', label: 'Disetujui' },
          rejected: { color: 'red', label: 'Ditolak' }
        };
        const config = statusConfig[status] || { color: 'default', label: status?.toUpperCase() };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
      width: 120
    },
    {
      title: 'Catatan Admin',
      dataIndex: 'catatan',
      key: 'catatan',
      render: (text) => text || '-',
      ellipsis: true
    }
  ];

  // Stat Card Component
  const StatCard = ({ title, value, color, icon }) => (
    <div className={styles.statCard} style={{ borderLeftColor: color }}>
      <div className={styles.statContent}>
        <p className={styles.statLabel}>{title}</p>
        <p className={styles.statValue} style={{ color }}>{value}</p>
      </div>
    </div>
  );

  return (
    <div className={styles.historyContainer}>
      <div className={styles.header}>
        <div>
          <h2>Riwayat Supply</h2>
          <p>Pantau status pengajuan supply Anda</p>
        </div>
        <Tooltip title="Refresh">
          <Button 
            icon={<ReloadOutlined />} 
            onClick={fetchData}
            loading={loading}
            size="large"
          />
        </Tooltip>
      </div>

      {/* Stats Section */}
      <div className={styles.statsGrid}>
        <StatCard title="Total Supply" value={stats.total} color="#1890ff" />
        <StatCard title="Menunggu" value={stats.pending} color="#faad14" />
        <StatCard title="Disetujui" value={stats.approved} color="#52c41a" />
        <StatCard title="Ditolak" value={stats.rejected} color="#f5222d" />
      </div>

      {/* Table Section */}
      <Card className={styles.tableCard}>
        {supplies.length === 0 ? (
          <Empty 
            description="Belum ada riwayat supply" 
            style={{ paddingTop: '50px', paddingBottom: '50px' }}
          />
        ) : (
          <Table
            columns={columns}
            dataSource={supplies}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              total: supplies.length,
              showSizeChanger: true,
              showQuickJumper: true,
              pageSizeOptions: ['10', '20', '50']
            }}
            scroll={{ x: 1200 }}
            className={styles.table}
          />
        )}
      </Card>
    </div>
  );
};

export default SupplyHistory;
