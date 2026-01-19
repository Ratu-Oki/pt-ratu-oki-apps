import React, { useState } from 'react';
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
} from 'antd';
import {
  ArrowLeftOutlined,
  PrinterOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import Header from './components/Header';
import Footer from './components/Footer';
import styles from './StatusPesanan.module.css';

/**
 * Status Pesanan Page
 * Menampilkan status dan riwayat pesanan pelanggan
 */
const StatusPesanan = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Mock data pesanan
  const orders = [
    {
      id: 'ORD-2024-001',
      date: '2024-01-15',
      total: 2250000,
      status: 'delivered',
      items: [
        {
          id: 1,
          name: 'Vanila Premium Grade A',
          weight: '1 kg',
          price: 450000,
          qty: 5,
        },
      ],
      timeline: [
        { step: 0, title: 'Pesanan Dibuat', time: '2024-01-15 10:30' },
        { step: 1, title: 'Pembayaran Dikonfirmasi', time: '2024-01-15 11:00' },
        { step: 2, title: 'Diproses', time: '2024-01-15 14:00' },
        { step: 3, title: 'Dikirim', time: '2024-01-16 08:00' },
        { step: 4, title: 'Diterima', time: '2024-01-17 16:30' },
      ],
    },
    {
      id: 'ORD-2024-002',
      date: '2024-01-18',
      total: 1300000,
      status: 'in_transit',
      items: [
        {
          id: 2,
          name: 'Vanila Premium Grade B',
          weight: '1 kg',
          price: 350000,
          qty: 2,
        },
        {
          id: 3,
          name: 'Vanila Extract',
          weight: '500 gram',
          price: 150000,
          qty: 2,
        },
      ],
      timeline: [
        { step: 0, title: 'Pesanan Dibuat', time: '2024-01-18 09:00' },
        { step: 1, title: 'Pembayaran Dikonfirmasi', time: '2024-01-18 09:30' },
        { step: 2, title: 'Diproses', time: '2024-01-18 13:00' },
        { step: 3, title: 'Dikirim', time: '2024-01-19 10:00', pending: false },
        { step: 4, title: 'Diterima', time: null, pending: true },
      ],
    },
    {
      id: 'ORD-2024-003',
      date: '2024-01-20',
      total: 1900000,
      status: 'processing',
      items: [
        {
          id: 5,
          name: 'Vanila Powder',
          weight: '250 gram',
          price: 380000,
          qty: 3,
        },
        {
          id: 6,
          name: 'Vanila Organic',
          weight: '1 kg',
          price: 520000,
          qty: 1,
        },
      ],
      timeline: [
        { step: 0, title: 'Pesanan Dibuat', time: '2024-01-20 08:00' },
        { step: 1, title: 'Pembayaran Dikonfirmasi', time: '2024-01-20 08:15' },
        { step: 2, title: 'Diproses', time: null, pending: true },
        { step: 3, title: 'Dikirim', time: null, pending: true },
        { step: 4, title: 'Diterima', time: null, pending: true },
      ],
    },
  ];

  /**
   * Get status badge with color
   */
  const getStatusBadge = (status) => {
    const statusConfig = {
      delivered: { color: 'success', label: 'Diterima' },
      in_transit: { color: 'processing', label: 'Dalam Pengiriman' },
      processing: { color: 'warning', label: 'Diproses' },
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
   * Render order detail modal
   */
  const renderOrderDetail = (order) => {
    const statusBadge = getStatusBadge(order.status);

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
            current={order.timeline.findIndex((t) => t.pending) - 1}
            status={
              order.status === 'delivered'
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

        {/* Total */}
        <div className={styles.totalSection}>
          <Row justify="end">
            <Col xs={24} sm={12} md={8}>
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
              onClick={() => alert('Download invoice')}
            >
              Download Invoice
            </Button>
          </Space>
        </div>
      </Card>
    );
  };

  return (
    <Layout className={styles.layout}>
      {/* Header */}
      <Header cartCount={0} userName="Budi Santoso" />

      {/* Main Content */}
      <Layout.Content className={styles.content}>
        <div className={styles.contentWrapper}>
          {/* Page Header */}
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>Status Pesanan Saya</h1>
            <p className={styles.pageSubtitle}>
              Pantau status dan detail pesanan Anda di sini
            </p>
          </div>

          {/* Content */}
          <Row gutter={[24, 24]}>
            {/* Orders List */}
            <Col xs={24} lg={selectedOrder ? 12 : 24}>
              <Card className={styles.ordersCard}>
                <h2 className={styles.cardTitle}>Daftar Pesanan</h2>
                {orders.length === 0 ? (
                  <Empty
                    description="Belum ada pesanan"
                    style={{ marginTop: '40px' }}
                  />
                ) : (
                  <Space direction="vertical" style={{ width: '100%' }}>
                    {orders.map((order) => {
                      const statusBadge = getStatusBadge(order.status);
                      return (
                        <Card
                          key={order.id}
                          className={styles.orderCard}
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Row align="middle" justify="space-between">
                            <Col flex="auto">
                              <div>
                                <p className={styles.orderId}>{order.id}</p>
                                <Space>
                                  <span className={styles.orderDate}>
                                    {new Date(order.date).toLocaleDateString(
                                      'id-ID'
                                    )}
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

            {/* Order Detail */}
            {selectedOrder && (
              <Col xs={24} lg={12}>
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
            )}
          </Row>
        </div>
      </Layout.Content>

      {/* Footer */}
      <Footer />
    </Layout>
  );
};

export default StatusPesanan;
