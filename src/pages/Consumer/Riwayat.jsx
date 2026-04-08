import React, { useState, useEffect, useCallback } from 'react';
import { Layout, Card, Table, Tag, Button, Empty, Spin, message, Modal } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import styles from './Riwayat.module.css';
import { transactionService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  getTrackingDisplayStatus,
  getTrackingStatusConfig,
} from '../../utils/orderTrackingSimulation';

/**
 * Riwayat Page
 * Halaman riwayat transaksi consumer
 */
const Riwayat = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [detailModal, setDetailModal] = useState({ visible: false, transaction: null });
  const [trackingNow, setTrackingNow] = useState(Date.now());

  // Fetch transactions
  const fetchTransactions = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const response = await transactionService.getMyTransactions({ page, limit: pagination.limit });
      
      const transactionsData = response.data || [];
      const paginationData = response.pagination || {};

      setTransactions(transactionsData);
      setPagination({
        page: paginationData.current_page || 1,
        limit: paginationData.per_page || 10,
        total: paginationData.total_items || 0
      });
    } catch (error) {
      console.error('Error fetching transactions:', error);
      message.error('Gagal memuat riwayat transaksi');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.limit]);

  useEffect(() => {
    fetchTransactions(1);
  }, [fetchTransactions]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTrackingNow(Date.now());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  // Get cart count from localStorage
  const getCartCount = () => {
    const cart = localStorage.getItem('cart');
    if (cart) {
      return JSON.parse(cart).reduce((sum, item) => sum + (item.qty || 1), 0);
    }
    return 0;
  };

  // Status config
  const getStatusConfig = (status) => {
    return getTrackingStatusConfig(status);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Handle cancel order
  const handleCancelOrder = async (transactionId) => {
    Modal.confirm({
      title: 'Batalkan Pesanan',
      content: 'Apakah Anda yakin ingin membatalkan pesanan ini?',
      okText: 'Ya, Batalkan',
      okType: 'danger',
      cancelText: 'Tidak',
      onOk: async () => {
        try {
          await transactionService.updateStatus(transactionId, 'cancelled');
          message.success('Pesanan berhasil dibatalkan');
          fetchTransactions(pagination.page);
        } catch (error) {
          console.error('Error cancelling order:', error);
          message.error(error.message || 'Gagal membatalkan pesanan');
        }
      }
    });
  };

  // Table columns
  const columns = [
    {
      title: 'Invoice',
      dataIndex: 'invoice_number',
      key: 'invoice_number',
      render: (text) => <span style={{ fontWeight: 600 }}>{text}</span>
    },
    {
      title: 'Tanggal',
      dataIndex: 'tanggal_transaksi',
      key: 'tanggal_transaksi',
      render: (date) => formatDate(date)
    },
    {
      title: 'Total',
      dataIndex: 'total_harga',
      key: 'total_harga',
      render: (amount) => <span style={{ fontWeight: 600, color: '#2D7A52' }}>{formatCurrency(amount)}</span>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (_, record) => {
        const displayStatus = getTrackingDisplayStatus(record, trackingNow);
        const config = getStatusConfig(displayStatus);
        return <Tag color={config.color}>{config.label}</Tag>;
      }
    },
    {
      title: 'Aksi',
      key: 'action',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => setDetailModal({ visible: true, transaction: record })}
          >
            Detail
          </Button>
          {record.status === 'pending' && (
            <Button
              danger
              size="small"
              onClick={() => handleCancelOrder(record.id)}
            >
              Batalkan
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <Layout className={styles.layout}>
      {/* Header */}
      <Header cartCount={getCartCount()} userName={user?.nama || 'Guest'} />

      {/* Main Content */}
      <Layout.Content className={styles.content}>
        <div className={styles.contentWrapper}>
          {/* Page Header */}
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>Riwayat Pesanan</h1>
            <p className={styles.pageSubtitle}>
              Lihat semua riwayat transaksi Anda
            </p>
          </div>

          {/* Transactions Table */}
          <Card className={styles.tableCard} bordered={false}>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
                <Spin size="large" />
              </div>
            ) : transactions.length === 0 ? (
              <Empty
                description="Belum ada transaksi"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                <Button type="primary" onClick={() => navigate('/consumer')}>
                  Mulai Belanja
                </Button>
              </Empty>
            ) : (
              <Table
                columns={columns}
                dataSource={transactions}
                rowKey="id"
                pagination={{
                  current: pagination.page,
                  pageSize: pagination.limit,
                  total: pagination.total,
                  onChange: (page) => fetchTransactions(page)
                }}
              />
            )}
          </Card>
        </div>
      </Layout.Content>

      {/* Footer */}
      <Footer />

      {/* Detail Modal */}
      <Modal
        title={`Detail Pesanan - ${detailModal.transaction?.invoice_number}`}
        open={detailModal.visible}
        onCancel={() => setDetailModal({ visible: false, transaction: null })}
        footer={[
          <Button key="close" onClick={() => setDetailModal({ visible: false, transaction: null })}>
            Tutup
          </Button>
        ]}
        width={600}
      >
        {detailModal.transaction && (
          <div>
            <p><strong>Tanggal:</strong> {formatDate(detailModal.transaction.tanggal_transaksi)}</p>
            <p><strong>Status:</strong> <Tag color={getStatusConfig(getTrackingDisplayStatus(detailModal.transaction, trackingNow)).color}>
              {getStatusConfig(getTrackingDisplayStatus(detailModal.transaction, trackingNow)).label}
            </Tag></p>
            <p><strong>Alamat Pengiriman:</strong> {detailModal.transaction.shipping_address}</p>
            <p><strong>Metode Pembayaran:</strong> {detailModal.transaction.payment_method || '-'}</p>

            <h4 style={{ marginTop: 16 }}>Produk:</h4>
            {detailModal.transaction.details?.map((detail, idx) => (
              <div key={idx} style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                <p style={{ margin: 0 }}>{detail.product?.nama_produk || `Produk #${detail.product_id}`}</p>
                <p style={{ margin: 0, color: '#666' }}>
                  {detail.jumlah} x {formatCurrency(detail.harga_satuan)} = {formatCurrency(detail.subtotal)}
                </p>
              </div>
            ))}

            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '2px solid #2D7A52' }}>
              <p style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>
                Total: {formatCurrency(detailModal.transaction.total_harga)}
              </p>
            </div>

            {detailModal.transaction.notes && (
              <p style={{ marginTop: 16 }}><strong>Catatan:</strong> {detailModal.transaction.notes}</p>
            )}
          </div>
        )}
      </Modal>
    </Layout>
  );
};

export default Riwayat;
