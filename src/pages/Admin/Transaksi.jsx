/**
 * Transaksi Page
 * Halaman manajemen transaksi penjualan dengan data real dari API
 */
import React, { useState, useEffect, useCallback } from 'react';
import styles from './Transaksi.module.css';
import AdminLayout from './components/AdminLayout';
import { transactionService } from '../../services/api';
import { Spin, message, Modal, Select, Button, Divider, Tag } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import {
  getTrackingDisplayStatus,
  getTrackingStatusConfig,
} from '../../utils/orderTrackingSimulation';

const Transaksi = () => {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [activeTab, setActiveTab] = useState('semua');
  const [searchTerm, setSearchTerm] = useState('');
  const [tabCounts, setTabCounts] = useState({
    semua: 0,
    diproses: 0,
    dikirim: 0,
    selesai: 0,
    dibatalkan: 0
  });
  const [statusModal, setStatusModal] = useState({ visible: false, transaction: null, newStatus: '' });
  const [detailModal, setDetailModal] = useState({ visible: false, transaction: null });
  const [detailLoading, setDetailLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [trackingNow, setTrackingNow] = useState(Date.now());

  const adminEditableStatusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'paid', label: 'Dibayar' },
    { value: 'shipped', label: 'Dikirim' },
    { value: 'cancelled', label: 'Dibatalkan' }
  ];

  // Tab data
  const tabs = [
    { id: 'semua', label: 'Semua', status: null },
    { id: 'pending', label: 'Pending', status: 'pending' },
    { id: 'diproses', label: 'Dibayar', status: 'paid' },
    { id: 'dikirim', label: 'Dikirim', status: 'shipped' },
    { id: 'selesai', label: 'Selesai', status: 'completed' },
    { id: 'dibatalkan', label: 'Dibatalkan', status: 'cancelled' }
  ];

  // Fetch transactions
  const fetchTransactions = useCallback(async (page = 1, options = {}) => {
    const { silent = false } = options;

    if (!silent) {
      setLoading(true);
    }

    try {
      const params = {
        page,
        limit: pagination.limit,
        search: searchTerm || undefined,
      };

      // Filter by status if not 'semua'
      const selectedTab = tabs.find(t => t.id === activeTab);
      if (selectedTab?.status) {
        params.status = selectedTab.status;
      }

      const response = await transactionService.getAllAdmin(params);

      // Handle both array and object response formats
      let transactionsData = [];
      let paginationData = { page: 1, limit: 10, total: 0, totalPages: 1 };

      if (Array.isArray(response.data)) {
        transactionsData = response.data;
        paginationData.total = response.data.length;
        paginationData.totalPages = Math.ceil(response.data.length / pagination.limit);
      } else if (response.data) {
        transactionsData = response.data.transactions || response.data || [];
        paginationData = response.data.pagination || response.pagination || paginationData;
      }

      setTransactions(transactionsData);
      setPagination({
        page: paginationData.page || page,
        limit: paginationData.limit || 10,
        total: paginationData.total || transactionsData.length,
        totalPages: paginationData.totalPages || 1
      });

      // Update counts (approximate from total if no separate count endpoint)
      if (activeTab === 'semua') {
        setTabCounts(prev => ({ ...prev, semua: paginationData.total || transactionsData.length }));
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      if (!silent) {
        message.error('Gagal memuat data transaksi');
        setTransactions([]);
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [activeTab, searchTerm, pagination.limit]);

  useEffect(() => {
    fetchTransactions(1);
  }, [activeTab]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTrackingNow(Date.now());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchTransactions(pagination.page, { silent: true });
    }, 5000);

    return () => clearInterval(intervalId);
  }, [fetchTransactions, pagination.page]);

  useEffect(() => {
    if (!statusModal.visible || !statusModal.transaction) return;

    const freshTransaction = transactions.find(tx => tx.id === statusModal.transaction.id);
    if (freshTransaction && freshTransaction !== statusModal.transaction) {
      setStatusModal(prev => ({
        ...prev,
        transaction: freshTransaction,
        newStatus: prev.newStatus || (freshTransaction.status === 'completed' ? '' : freshTransaction.status),
      }));
    }
  }, [transactions, statusModal.visible, statusModal.transaction]);

  useEffect(() => {
    if (!detailModal.visible || !detailModal.transaction) return;

    const freshTransaction = transactions.find(tx => tx.id === detailModal.transaction.id);
    if (freshTransaction && freshTransaction !== detailModal.transaction) {
      setDetailModal(prev => ({
        ...prev,
        transaction: {
          ...prev.transaction,
          ...freshTransaction,
        },
      }));
    }
  }, [transactions, detailModal.visible, detailModal.transaction]);

  // Handle search
  const handleSearch = () => {
    fetchTransactions(1);
  };

  // Handle status update
  const handleStatusUpdate = async () => {
    if (!statusModal.transaction || !statusModal.newStatus) return;

    if (statusModal.newStatus === 'completed') {
      message.error('Status selesai hanya dapat dikonfirmasi oleh pelanggan.');
      return;
    }

    setUpdating(true);
    try {
      await transactionService.updateStatus(statusModal.transaction.id, statusModal.newStatus);
      message.success('Status berhasil diupdate');
      setStatusModal({ visible: false, transaction: null, newStatus: '' });
      fetchTransactions(pagination.page);
    } catch (error) {
      console.error('Error updating status:', error);
      message.error(error.message || 'Gagal mengupdate status');
    } finally {
      setUpdating(false);
    }
  };

  const handleShowDetail = async (transaction) => {
    setDetailModal({ visible: true, transaction });
    setDetailLoading(true);

    try {
      const response = await transactionService.getById(transaction.id);
      setDetailModal({ visible: true, transaction: response.data || transaction });
    } catch (error) {
      console.error('Error fetching transaction detail:', error);
      message.error(error.message || 'Gagal memuat detail transaksi');
    } finally {
      setDetailLoading(false);
    }
  };

  const getDisplayStatus = (transaction) => {
    return getTrackingDisplayStatus(transaction, trackingNow);
  };

  // Status badge colors
  const getStatusColor = (status) => {
    const colors = {
      pending: '#F39C12',
      paid: '#3498DB',
      processing: '#3498DB',
      packed: '#F39C12',
      shipped: '#9B59B6',
      awaiting_approval: '#2D7A52',
      completed: '#27AE60',
      cancelled: '#E74C3C'
    };
    return colors[status] || '#95A5A6';
  };

  const getStatusLabel = (status) => {
    const trackingConfig = getTrackingStatusConfig(status);
    if (trackingConfig?.label) {
      return trackingConfig.label.toUpperCase();
    }

    const labels = {
      pending: 'PENDING',
      paid: 'DIBAYAR',
      processing: 'DIPROSES',
      packed: 'DIKEMAS',
      shipped: 'DIKIRIM',
      awaiting_approval: 'MENUNGGU PERSETUJUAN',
      completed: 'SELESAI',
      cancelled: 'DIBATALKAN'
    };
    return labels[status] || status?.toUpperCase();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatWeight = (product) => {
    if (!product?.berat) return '-';
    const weight = Number(product.berat);
    return `${Number.isInteger(weight) ? weight : weight.toString()} ${product.satuan_berat || 'kg'}`;
  };

  // Action buttons
  const actionButtons = (
    <div className={styles.actionButtonsGroup}>
      <input
        type="text"
        placeholder="Cari transaksi..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        className={styles.searchInput}
      />
      <Button onClick={handleSearch} icon={<SearchOutlined />}></Button>
    </div>
  );

  return (
    <AdminLayout
      headerType="full"
      title="Manajemen Transaksi"
      actionButton={actionButtons}
    >
      <div className={styles.transaksiContainer}>
        {/* Tabs */}
        <div className={styles.tabsContainer}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Transactions Table */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
            <Spin size="large" />
          </div>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ORDER ID</th>
                  <th>PENGGUNA</th>
                  <th>PRODUK</th>
                  <th>TOTAL</th>
                  <th>TANGGAL</th>
                  <th>STATUS</th>
                  <th>AKSI</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '50px' }}>
                      Tidak ada transaksi
                    </td>
                  </tr>
                ) : (
                  transactions.map((transaction) => {
                    const displayStatus = getDisplayStatus(transaction);

                    return (
                    <tr key={transaction.id}>
                      <td className={styles.orderIdCell}>{transaction.invoice_number}</td>
                      <td className={styles.userCell}>
                        <div className={styles.userInfo}>
                          <div
                            className={styles.avatar}
                            style={{ backgroundColor: '#3498DB' }}
                          >
                            {transaction.consumer?.nama?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div className={styles.userDetails}>
                            <div className={styles.userName}>{transaction.consumer?.nama || 'Unknown'}</div>
                            <div className={styles.userEmail}>{transaction.consumer?.email || '-'}</div>
                          </div>
                        </div>
                      </td>
                      <td className={styles.produkCell}>
                        {transaction.details?.length > 0
                          ? `${transaction.details[0]?.product?.nama_produk || 'Product'} ${transaction.details.length > 1 ? `(+${transaction.details.length - 1} lainnya)` : ''}`
                          : '-'
                        }
                      </td>
                      <td className={styles.totalCell}>{formatCurrency(transaction.total_harga)}</td>
                      <td className={styles.tanggalCell}>{formatDate(transaction.tanggal_transaksi)}</td>
                      <td>
                        <span
                          className={styles.statusBadge}
                          style={{ backgroundColor: getStatusColor(displayStatus) }}
                        >
                          {getStatusLabel(displayStatus)}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actionButtons}>
                          <button
                            className={styles.actionBtn}
                            title="Detail"
                            onClick={() => handleShowDetail(transaction)}
                          >👁</button>
                          <button
                            className={styles.actionBtn}
                            title="Update Status"
                            onClick={() => setStatusModal({
                              visible: true,
                              transaction,
                              newStatus: transaction.status === 'completed' ? '' : transaction.status
                            })}
                          >✎</button>
                        </div>
                      </td>
                    </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && (
          <div className={styles.paginationContainer}>
            <button
              className={styles.paginationBtn}
              disabled={pagination.page <= 1}
              onClick={() => fetchTransactions(pagination.page - 1)}
            >❮</button>
            {[...Array(Math.min(5, pagination.totalPages))].map((_, idx) => {
              const pageNum = idx + 1;
              return (
                <button
                  key={pageNum}
                  className={`${styles.paginationBtn} ${pagination.page === pageNum ? styles.active : ''}`}
                  onClick={() => fetchTransactions(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              className={styles.paginationBtn}
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchTransactions(pagination.page + 1)}
            >❯</button>
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      <Modal
        title="Update Status Transaksi"
        open={statusModal.visible}
        onOk={handleStatusUpdate}
        onCancel={() => setStatusModal({ visible: false, transaction: null, newStatus: '' })}
        confirmLoading={updating}
        okText="Update"
        cancelText="Batal"
      >
        <p>Invoice: <strong>{statusModal.transaction?.invoice_number}</strong></p>
        <p>
          Status saat ini:{' '}
          <strong>{getStatusLabel(getDisplayStatus(statusModal.transaction))}</strong>
        </p>
        <p style={{ color: '#8c8c8c', fontSize: 12, marginTop: -6 }}>
          Status ini sinkron dengan tampilan pelanggan dan diperbarui otomatis.
        </p>
        <div style={{ marginTop: 16 }}>
          <label>Ubah Status Manual:</label>
          <Select
            style={{ width: '100%', marginTop: 8 }}
            value={statusModal.newStatus}
            placeholder="Pilih status baru"
            onChange={(value) => setStatusModal(prev => ({ ...prev, newStatus: value }))}
          >
            {adminEditableStatusOptions.map(option => (
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))}
          </Select>
          <p style={{ marginTop: 8, color: '#8c8c8c', fontSize: 12 }}>
            Status selesai hanya bisa dikonfirmasi oleh pelanggan saat pesanan diterima.
          </p>
        </div>
      </Modal>

      {/* Transaction Detail Modal */}
      <Modal
        title="Detail Transaksi"
        open={detailModal.visible}
        onCancel={() => setDetailModal({ visible: false, transaction: null })}
        footer={[
          <Button key="close" onClick={() => setDetailModal({ visible: false, transaction: null })}>
            Tutup
          </Button>
        ]}
        width={760}
      >
        <Spin spinning={detailLoading}>
          {detailModal.transaction && (
            <div className={styles.detailContent}>
              <div className={styles.detailGrid}>
                <div className={styles.detailItem}>
                  <span>Invoice</span>
                  <strong>{detailModal.transaction.invoice_number}</strong>
                </div>
                <div className={styles.detailItem}>
                  <span>Status</span>
                  <Tag color={getStatusColor(getDisplayStatus(detailModal.transaction))}>
                    {getStatusLabel(getDisplayStatus(detailModal.transaction))}
                  </Tag>
                </div>
                <div className={styles.detailItem}>
                  <span>Pembayaran</span>
                  <strong>{detailModal.transaction.payment_status || '-'}</strong>
                </div>
                <div className={styles.detailItem}>
                  <span>Tanggal</span>
                  <strong>{formatDateTime(detailModal.transaction.tanggal_transaksi)}</strong>
                </div>
              </div>

              <Divider />

              <h4>Data Consumer</h4>
              <div className={styles.detailGrid}>
                <div className={styles.detailItem}>
                  <span>Nama</span>
                  <strong>{detailModal.transaction.consumer?.nama || '-'}</strong>
                </div>
                <div className={styles.detailItem}>
                  <span>Email</span>
                  <strong>{detailModal.transaction.consumer?.email || '-'}</strong>
                </div>
                <div className={styles.detailItem}>
                  <span>Telepon</span>
                  <strong>{detailModal.transaction.consumer?.telepon || '-'}</strong>
                </div>
              </div>

              <div className={styles.addressBox}>
                <span>Alamat Pengiriman</span>
                <p>{detailModal.transaction.shipping_address || '-'}</p>
              </div>

              <Divider />

              <h4>Produk Dibeli</h4>
              <div className={styles.itemsTable}>
                <table>
                  <thead>
                    <tr>
                      <th>Produk</th>
                      <th>Grade</th>
                      <th>Berat</th>
                      <th>Qty</th>
                      <th>Harga</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(detailModal.transaction.details || []).map((detail) => (
                      <tr key={detail.id}>
                        <td>{detail.product?.nama_produk || `Produk #${detail.product_id}`}</td>
                        <td>Grade {detail.grade || 'A'}</td>
                        <td>{formatWeight(detail.product)}</td>
                        <td>{detail.jumlah}</td>
                        <td>{formatCurrency(detail.harga_satuan)}</td>
                        <td>{formatCurrency(detail.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className={styles.totalDetail}>
                <span>Total Transaksi</span>
                <strong>{formatCurrency(detailModal.transaction.total_harga)}</strong>
              </div>

              {detailModal.transaction.notes && (
                <div className={styles.addressBox}>
                  <span>Catatan</span>
                  <p>{detailModal.transaction.notes}</p>
                </div>
              )}
            </div>
          )}
        </Spin>
      </Modal>
    </AdminLayout>
  );
};

export default Transaksi;
