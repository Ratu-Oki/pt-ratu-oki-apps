import React, { useState, useEffect, useCallback } from 'react';
import {
  Layout,
  Card,
  Row,
  Col,
  Steps,
  Table,
  Badge,
  Space,
  Button,
  Empty,
  Divider,
  Spin,
  message,
} from 'antd';
import {
  ArrowLeftOutlined,
  PrinterOutlined,
  DownloadOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import styles from './StatusPesanan.module.css';
import { transactionService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

/**
 * Status Pesanan Page
 * Menampilkan status dan detail pesanan pelanggan dengan data dari API
 */
const StatusPesanan = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await transactionService.getMyTransactions({ page: 1, limit: 20 });
      const data = response.data || {};

      // Transform transactions to orders with timeline
      const transformedOrders = (data.transactions || []).map(tx => ({
        id: tx.invoice_number,
        dbId: tx.id,
        date: tx.tanggal_transaksi,
        total: tx.total_harga,
        status: tx.status,
        shippingAddress: tx.shipping_address,
        paymentMethod: tx.payment_method,
        items: (tx.details || []).map(detail => ({
          id: detail.id,
          name: detail.product?.nama_produk || `Produk #${detail.product_id}`,
          weight: '1 kg',
          price: detail.harga_satuan,
          qty: detail.jumlah,
        })),
        timeline: buildTimeline(tx),
      }));

      setOrders(transformedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      message.error('Gagal memuat status pesanan');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Build timeline based on transaction status
  const buildTimeline = (tx) => {
    const statusOrder = ['pending', 'paid', 'shipped', 'completed'];
    const currentIndex = statusOrder.indexOf(tx.status);

    const steps = [
      { step: 0, title: 'Pesanan Dibuat', status: 'pending' },
      { step: 1, title: 'Pembayaran Dikonfirmasi', status: 'paid' },
      { step: 2, title: 'Diproses & Dikirim', status: 'shipped' },
      { step: 3, title: 'Diterima', status: 'completed' },
    ];

    return steps.map((step, idx) => {
      if (tx.status === 'cancelled') {
        return {
          ...step,
          time: idx === 0 ? formatDateTime(tx.createdAt) : null,
          pending: idx > 0,
          cancelled: true
        };
      }

      const isCompleted = idx <= currentIndex;
      return {
        ...step,
        time: isCompleted ? formatDateTime(tx.updatedAt) : null,
        pending: !isCompleted
      };
    });
  };

  // Format date time
  const formatDateTime = (dateStr) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Get cart count
  const getCartCount = () => {
    const cart = localStorage.getItem('cart');
    if (cart) return JSON.parse(cart).reduce((sum, item) => sum + (item.qty || 1), 0);
    return 0;
  };

  /**
   * Get status badge with color
   */
  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { color: 'success', label: 'Diterima' },
      shipped: { color: 'processing', label: 'Dalam Pengiriman' },
      paid: { color: 'warning', label: 'Diproses' },
      pending: { color: 'default', label: 'Menunggu Pembayaran' },
      cancelled: { color: 'error', label: 'Dibatalkan' },
    };
    return statusConfig[status] || { color: 'default', label: 'Tidak Diketahui' };
  };

  /**
   * Format currency
   */
  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  /**
   * Get current step based on status
   */
  const getCurrentStep = (status) => {
    const stepMap = {
      pending: 0,
      paid: 1,
      shipped: 2,
      completed: 3,
      cancelled: -1
    };
    return stepMap[status] ?? 0;
  };

  /**
   * Render order detail
   */
  const renderOrderDetail = (order) => {
    const statusBadge = getStatusBadge(order.status);
    const currentStep = getCurrentStep(order.status);

    return (
      <Card className={styles.orderDetail}>
        {/* Order Header */}
        <div className={styles.orderDetailHeader}>
          <div>
            <h2 className={styles.orderDetailTitle}>Pesanan {order.id}</h2>
            <p className={styles.orderDetailDate}>
              Tanggal Pesanan: {new Date(order.date).toLocaleDateString('id-ID')}
            </p>
          </div>
          <Badge
            status={statusBadge.color}
            text={
              <span className={styles.statusLabel}>{statusBadge.label}</span>
            }
          />
        </div>

        <Divider />

        {/* Timeline */}
        <div className={styles.timelineSection}>
          <h3 className={styles.sectionTitle}>Status Pengiriman</h3>
          <Steps
            direction="vertical"
            current={currentStep}
            status={
              order.status === 'completed'
                ? 'finish'
                : order.status === 'cancelled'
                  ? 'error'
                  : 'process'
            }
            items={order.timeline.map((item) => ({
              title: item.title,
              description: item.time ? (
                <span className={styles.timelineTime}>{item.time}</span>
              ) : (
                <span className={styles.timelinePending}>
                  Menunggu pembaruan...
                </span>
              ),
            }))}
          />
        </div>

        <Divider />

        {/* Items */}
        <div className={styles.itemsSection}>
          <h3 className={styles.sectionTitle}>Rincian Pesanan</h3>
          <Table
            columns={[
              {
                title: 'Produk',
                dataIndex: 'name',
                key: 'name',
                render: (text, record) => (
                  <div>
                    <div className={styles.itemName}>{text}</div>
                    <div className={styles.itemWeight}>{record.weight}</div>
                  </div>
                ),
              },
              {
                title: 'Harga',
                dataIndex: 'price',
                key: 'price',
                render: (price) => formatPrice(price),
              },
              {
                title: 'Jumlah',
                dataIndex: 'qty',
                key: 'qty',
                align: 'center',
              },
              {
                title: 'Subtotal',
                dataIndex: 'subtotal',
                key: 'subtotal',
                render: (_, record) => formatPrice(record.price * record.qty),
              },
            ]}
            dataSource={order.items}
            pagination={false}
            rowKey="id"
            bordered={false}
            className={styles.itemsTable}
          />
        </div>

        {/* Shipping Address */}
        {order.shippingAddress && (
          <>
            <Divider />
            <div>
              <h3 className={styles.sectionTitle}>Alamat Pengiriman</h3>
              <p style={{ color: '#666' }}>{order.shippingAddress}</p>
            </div>
          </>
        )}

        {/* Total */}
        <div className={styles.totalSection}>
          <Row justify="end">
            <Col xs={24} sm={20} md={16} lg={12}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Row justify="space-between">
                  <span>Subtotal:</span>
                  <span>{formatPrice(order.total * 0.9)}</span>
                </Row>
                <Row justify="space-between">
                  <span>Ongkir:</span>
                  <span>{formatPrice(order.total * 0.1)}</span>
                </Row>
                <Divider style={{ margin: '8px 0' }} />
                <Row justify="space-between" className={styles.totalAmount}>
                  <span>Total:</span>
                  <span>{formatPrice(order.total)}</span>
                </Row>
              </Space>
            </Col>
          </Row>
        </div>

        {/* Actions */}
        <div className={styles.orderActions}>
          <Space>
            <Button
              type="default"
              icon={<PrinterOutlined />}
              onClick={() => window.print()}
            >
              Cetak
            </Button>
            <Button
              type="default"
              icon={<DownloadOutlined />}
              onClick={() => message.info('Fitur download invoice akan segera tersedia')}
            >
              Download Invoice
            </Button>
          </Space>
        </div>
      </Card>
    );
  };

  if (loading) {
    return (
      <Layout className={styles.layout}>
        <Header cartCount={getCartCount()} userName={user?.nama || 'Guest'} />
        <Layout.Content className={styles.content}>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
            <Spin size="large" />
          </div>
        </Layout.Content>
        <Footer />
      </Layout>
    );
  }

  return (
    <Layout className={styles.layout}>
      {/* Header */}
      <Header cartCount={getCartCount()} userName={user?.nama || 'Guest'} />

      {/* Main Content */}
      <Layout.Content className={styles.content}>
        <div className={styles.contentWrapper}>
          {/* Page Header */}
          <div className={styles.pageHeader}>
            {!selectedOrder ? (
              <>
                <h1 className={styles.pageTitle}>Status Pesanan Saya</h1>
                <p className={styles.pageSubtitle}>
                  Pantau status dan detail pesanan Anda di sini
                </p>
              </>
            ) : (
              <>
                <h1 className={styles.pageTitle}>Detail Pesanan</h1>
              </>
            )}
          </div>

          {/* Content */}
          {!selectedOrder ? (
            // List Pesanan
            <Row gutter={[24, 24]}>
              <Col xs={24}>
                <Card className={styles.ordersCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h2 className={styles.cardTitle}>Daftar Pesanan</h2>
                    <Button
                      icon={<ReloadOutlined />}
                      onClick={fetchOrders}
                      loading={loading}
                    >
                      Refresh
                    </Button>
                  </div>
                  {orders.length === 0 ? (
                    <Empty
                      description="Belum ada pesanan"
                      style={{ marginTop: '40px' }}
                    >
                      <Button type="primary" onClick={() => navigate('/consumer')}>
                        Mulai Belanja
                      </Button>
                    </Empty>
                  ) : (
                    <Space direction="vertical" style={{ width: '100%' }}>
                      {orders.map((order) => {
                        const statusBadge = getStatusBadge(order.status);
                        return (
                          <Card
                            key={order.id}
                            className={styles.orderCard}
                            onClick={() => setSelectedOrder(order)}
                            style={{ cursor: 'pointer' }}
                            hoverable
                          >
                            <Row align="middle" justify="space-between">
                              <Col flex="auto">
                                <div>
                                  <p className={styles.orderId}>{order.id}</p>
                                  <Space>
                                    <span className={styles.orderDate}>
                                      {new Date(order.date).toLocaleDateString('id-ID')}
                                    </span>
                                    <Badge
                                      status={statusBadge.color}
                                      text={statusBadge.label}
                                    />
                                  </Space>
                                </div>
                              </Col>
                              <Col>
                                <p className={styles.orderTotal}>
                                  {formatPrice(order.total)}
                                </p>
                              </Col>
                            </Row>
                          </Card>
                        );
                      })}
                    </Space>
                  )}
                </Card>
              </Col>
            </Row>
          ) : (
            // Detail Pesanan
            <Row gutter={[24, 24]}>
              <Col xs={24}>
                <Button
                  type="text"
                  icon={<ArrowLeftOutlined />}
                  onClick={() => setSelectedOrder(null)}
                  className={styles.backButton}
                >
                  Kembali
                </Button>
                {renderOrderDetail(selectedOrder)}
              </Col>
            </Row>
          )}
        </div>
      </Layout.Content>

      {/* Footer */}
      <Footer />
    </Layout>
  );
};

export default StatusPesanan;
