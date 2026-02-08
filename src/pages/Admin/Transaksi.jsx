/**
 * Transaksi Page
 * Halaman manajemen transaksi penjualan dengan data real dari API
 */
import React, { useState, useEffect, useCallback } from 'react';
import styles from './Transaksi.module.css';
import AdminLayout from './components/AdminLayout';
import { transactionService } from '../../services/api';
import { Spin, message, Modal, Select, Button } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

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
  const [updating, setUpdating] = useState(false);

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
  const fetchTransactions = useCallback(async (page = 1) => {
    setLoading(true);
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
      message.error('Gagal memuat data transaksi');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchTerm, pagination.limit]);

  useEffect(() => {
    fetchTransactions(1);
  }, [activeTab]);

  // Handle search
  const handleSearch = () => {
    fetchTransactions(1);
  };

  // Handle status update
  const handleStatusUpdate = async () => {
    if (!statusModal.transaction || !statusModal.newStatus) return;

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

  // Status badge colors
  const getStatusColor = (status) => {
    const colors = {
      pending: '#F39C12',
      paid: '#3498DB',
      shipped: '#9B59B6',
      completed: '#27AE60',
      cancelled: '#E74C3C'
    };
    return colors[status] || '#95A5A6';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'PENDING',
      paid: 'DIBAYAR',
      shipped: 'DIKIRIM',
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
                  transactions.map((transaction) => (
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
                          style={{ backgroundColor: getStatusColor(transaction.status) }}
                        >
                          {getStatusLabel(transaction.status)}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actionButtons}>
                          <button
                            className={styles.actionBtn}
                            title="Detail"
                            onClick={() => message.info(`Detail: ${transaction.invoice_number}`)}
                          >👁</button>
                          <button
                            className={styles.actionBtn}
                            title="Update Status"
                            onClick={() => setStatusModal({
                              visible: true,
                              transaction,
                              newStatus: transaction.status
                            })}
                          >✎</button>
                        </div>
                      </td>
                    </tr>
                  ))
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
        <p>Status saat ini: <strong>{getStatusLabel(statusModal.transaction?.status)}</strong></p>
        <div style={{ marginTop: 16 }}>
          <label>Status Baru:</label>
          <Select
            style={{ width: '100%', marginTop: 8 }}
            value={statusModal.newStatus}
            onChange={(value) => setStatusModal(prev => ({ ...prev, newStatus: value }))}
          >
            <Select.Option value="pending">Pending</Select.Option>
            <Select.Option value="paid">Dibayar</Select.Option>
            <Select.Option value="shipped">Dikirim</Select.Option>
            <Select.Option value="completed">Selesai</Select.Option>
            <Select.Option value="cancelled">Dibatalkan</Select.Option>
          </Select>
        </div>
      </Modal>
    </AdminLayout>
  );
};

export default Transaksi;
