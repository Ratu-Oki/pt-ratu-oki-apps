import React, { useState } from 'react';
import { Layout, Card, Row, Col, Button, Empty, Tag, Divider, message } from 'antd';
import {
  ShoppingOutlined,
  PrinterOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import Header from './components/Header';
import Footer from './components/Footer';
import styles from './Riwayat.module.css';

/**
 * Riwayat Transaksi Page
 * Menampilkan riwayat transaksi pembelian pelanggan
 */
const Riwayat = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Mock data riwayat transaksi
  const transactions = [
    {
      id: 'ORD-2401',
      date: '13 Januari 2026',
      total: 2400000,
      status: 'completed',
      items: [
        {
          id: 1,
          name: 'Vanila Bourbon Premium',
          grade: 'Grade A',
          weight: '100g',
          origin: 'Teluk Sukabumi',
          price: 1700000,
          qty: 1,
        },
        {
          id: 2,
          name: 'Vanila Planifolia',
          grade: 'Grade B',
          weight: '100g',
          price: 650000,
          qty: 1,
        },
      ],
    },
    {
      id: 'ORD-2398',
      date: '10 Januari 2026',
      total: 2050000,
      status: 'pending',
      items: [
        {
          id: 3,
          name: 'Vanila Bourbon 250g',
          grade: 'Grade A',
          weight: '250g',
          price: 2000000,
          qty: 1,
        },
      ],
    },
    {
      id: 'ORD-2390',
      date: '5 Januari 2026',
      total: 970000,
      status: 'in_transit',
      items: [
        {
          id: 4,
          name: 'Vanila Tahitian Select',
          grade: 'Grade A',
          weight: '100g',
          price: 920000,
          qty: 1,
        },
      ],
    },
  ];

  /**
   * Get status badge dengan warna dan label
   */
  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { color: 'success', label: 'Selesai' },
      in_transit: { color: 'processing', label: 'Diproses' },
      pending: { color: 'warning', label: 'Dikete' },
      cancelled: { color: 'error', label: 'Dibatalkan' },
    };

    return statusConfig[status] || { color: 'default', label: 'Unknown' };
  };

  /**
   * Format currency
   */
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  /**
   * Handle beli lagi
   */
  const handleBuyAgain = (transaction) => {
    message.info('Fitur beli lagi akan segera tersedia');
  };

  /**
   * Handle track order
   */
  const handleTrackOrder = (transactionId) => {
    message.info(`Melacak pesanan: ${transactionId}`);
  };

  /**
   * Handle download invoice
   */
  const handleDownloadInvoice = (transactionId) => {
    message.info(`Download invoice: ${transactionId}`);
  };

  /**
   * Handle print invoice
   */
  const handlePrintInvoice = (transactionId) => {
    message.info(`Print invoice: ${transactionId}`);
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
            <div>
              <h1 className={styles.pageTitle}>Riwayat Transaksi</h1>
              <p className={styles.pageSubtitle}>
                Lihat riwayat pembelian Anda dan lacak status pesanan
              </p>
            </div>
          </div>

          {/* Transactions List */}
          {transactions.length === 0 ? (
            <Empty description="Belum ada riwayat transaksi" style={{ marginTop: '50px' }} />
          ) : (
            <div className={styles.transactionsList}>
              {transactions.map((transaction) => {
                const statusConfig = getStatusBadge(transaction.status);
                const isExpanded = selectedOrder?.id === transaction.id;

                return (
                  <Card
                    key={transaction.id}
                    className={styles.transactionCard}
                    bordered={false}
                    onClick={() =>
                      setSelectedOrder(isExpanded ? null : transaction)
                    }
                  >
                    {/* Transaction Header */}
                    <Row justify="space-between" align="middle" className={styles.transactionHeader}>
                      <Col xs={24} sm={12}>
                        <div>
                          <span className={styles.orderId}>{transaction.id}</span>
                          <span className={styles.orderDate}>• {transaction.date}</span>
                        </div>
                      </Col>
                      <Col xs={24} sm={12} className={styles.headerRight}>
                        <Tag color={statusConfig.color}>{statusConfig.label}</Tag>
                      </Col>
                    </Row>

                    {/* Transaction Items */}
                    <div className={styles.itemsSection}>
                      {transaction.items.map((item, idx) => (
                        <div key={idx} className={styles.itemRow}>
                          <div className={styles.itemInfo}>
                            <ShoppingOutlined className={styles.itemIcon} />
                            <div>
                              <div className={styles.itemName}>{item.name}</div>
                              <div className={styles.itemDetails}>
                                {item.grade} • {item.weight}
                                {item.origin && ` • ${item.origin}`}
                              </div>
                            </div>
                          </div>
                          <div className={styles.itemPrice}>{formatCurrency(item.price)}</div>
                        </div>
                      ))}
                    </div>

                    {/* Total */}
                    <div className={styles.totalRow}>
                      <div className={styles.totalLabel}>Total</div>
                      <div className={styles.totalAmount}>{formatCurrency(transaction.total)}</div>
                    </div>

                    {/* Actions */}
                    <Row gutter={[8, 8]} justify="end" className={styles.actionRow}>
                      {transaction.status === 'completed' && (
                        <>
                          <Col xs={12} sm={6}>
                            <Button
                              type="default"
                              size="small"
                              block
                              icon={<PrinterOutlined />}
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePrintInvoice(transaction.id);
                              }}
                            >
                              Detail
                            </Button>
                          </Col>
                          <Col xs={12} sm={6}>
                            <Button
                              type="primary"
                              size="small"
                              block
                              onClick={(e) => {
                                e.stopPropagation();
                                handleBuyAgain(transaction);
                              }}
                            >
                              Beli Lagi
                            </Button>
                          </Col>
                        </>
                      )}
                      {transaction.status === 'in_transit' && (
                        <Col xs={12} sm={6}>
                          <Button
                            type="primary"
                            size="small"
                            block
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTrackOrder(transaction.id);
                            }}
                          >
                            Lacak
                          </Button>
                        </Col>
                      )}
                      {transaction.status === 'pending' && (
                        <Col xs={24} sm={6}>
                          <Button type="default" size="small" block disabled>
                            Menunggu...
                          </Button>
                        </Col>
                      )}
                    </Row>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </Layout.Content>

      {/* Footer */}
      <Footer />
    </Layout>
  );
};

export default Riwayat;
