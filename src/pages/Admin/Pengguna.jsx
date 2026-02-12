/**
 * Pengguna Page
 * Halaman manajemen pengguna (suppliers) dengan data real dari API
 */
import React, { useState, useEffect, useCallback  } from 'react';
import styles from './Pengguna.module.css';
import AdminLayout from './components/AdminLayout';
import { authService, supplierService } from '../../services/api';
import { Spin, message, Modal, Input, Select, Button} from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const Pengguna = () => {
  const [loading, setLoading] = useState(true);
  const [suppliers, setSuppliers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [editModal, setEditModal] = useState({ visible: false, supplier: null });
  const [updating, setUpdating] = useState(false);

  // Tabs
  const tabs = [
    { id: 'all', label: 'Semua' },
    { id: 'active', label: 'Aktif' },
    { id: 'pending', label: 'Pending' },
    { id: 'inactive', label: 'Nonaktif' }
  ];

  // Fetch suppliers
  const fetchSuppliers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: pagination.limit,
        search: searchTerm || undefined,
        status: activeTab !== 'all' ? activeTab : undefined
      };

      const response = await supplierService.getAll(params);

      // Handle both array and object response formats
      let suppliersData = [];
      let paginationData = { page: 1, limit: 10, total: 0 };

      if (Array.isArray(response.data)) {
        suppliersData = response.data;
        paginationData.total = response.data.length;
      } else if (response.data) {
        suppliersData = response.data.suppliers || response.data.users || response.data || [];
        paginationData = response.data.pagination || response.pagination || paginationData;
      }

      setSuppliers(suppliersData);
      setPagination({
        page: paginationData.page || page,
        limit: paginationData.limit || 10,
        total: paginationData.total || suppliersData.length
      });
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      message.error('Gagal memuat data supplier');
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchTerm, pagination.limit]);

  useEffect(() => {
    fetchSuppliers(1);
  }, [activeTab]);

  // Handle search
  const handleSearch = () => {
    fetchSuppliers(1);
  };

  // Handle approve supplier
  const handleApprove = async (supplierId) => {
    try {
      await supplierService.approve(supplierId);
      message.success('Supplier berhasil diaktifkan');
      fetchSuppliers(pagination.page);
    } catch (error) {
      console.error('Error approving supplier:', error);
      message.error(error.message || 'Gagal mengaktifkan supplier');
    }
  };

  // Handle update supplier
  const handleUpdate = async () => {
    if (!editModal.supplier) return;

    setUpdating(true);
    try {
      await supplierService.update(editModal.supplier.id, {
        nama: editModal.supplier.nama,
        telepon: editModal.supplier.telepon,
        alamat: editModal.supplier.alamat,
        status: editModal.supplier.status
      });
      message.success('Supplier berhasil diupdate');
      setEditModal({ visible: false, supplier: null });
      fetchSuppliers(pagination.page);
    } catch (error) {
      console.error('Error updating supplier:', error);
      message.error(error.message || 'Gagal mengupdate supplier');
    } finally {
      setUpdating(false);
    }
  };

  // Handle reset password
  const handleResetPassword = async (supplierId) => {
    Modal.confirm({
      title: 'Reset Password',
      content: 'Apakah Anda yakin ingin mereset password supplier ini?',
      onOk: async () => {
        try {
          await supplierService.resetPassword(supplierId);
          message.success('Password berhasil direset');
        } catch (error) {
          console.error('Error resetting password:', error);
          message.error(error.message || 'Gagal mereset password');
        }
      }
    });
  };

  // Handle delete
  const handleDelete = async (supplierId) => {
    Modal.confirm({
      title: 'Hapus Supplier',
      content: 'Apakah Anda yakin ingin menghapus supplier ini?',
      okText: 'Hapus',
      okType: 'danger',
      onOk: async () => {
        try {
          await authService.deleteUser(supplierId);
          message.success('Akun berhasil dihapus');
          fetchSuppliers(pagination.page);
        } catch (error) {
          console.error('Error deleting supplier:', error);
          message.error(error.message || 'Gagal menghapus akun');
        }
      }
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      active: '#27AE60',
      inactive: '#E74C3C',
      pending: '#F39C12'
    };
    return colors[status] || '#95A5A6';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const actionButtons = (
    <div className={styles.actionButtonsGroup}>
      <input
        type="text"
        placeholder="Cari supplier..."
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
      title="Manajemen Pengguna (Supplier)"
      actionButton={actionButtons}
    >
      <div className={styles.penggunaContainer}>
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

        {/* Suppliers Table */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
            <Spin size="large" />
          </div>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>SUPPLIER</th>
                  <th>EMAIL</th>
                  <th>TELEPON</th>
                  <th>ALAMAT</th>
                  <th>TANGGAL DAFTAR</th>
                  <th>STATUS</th>
                  <th>AKSI</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '50px' }}>
                      Tidak ada data supplier
                    </td>
                  </tr>
                ) : (
                  suppliers.map((supplier) => (
                    <tr key={supplier.id}>
                      <td className={styles.userCell}>
                        <div className={styles.userInfo}>
                          <div
                            className={styles.avatar}
                            style={{ backgroundColor: '#3498DB' }}
                          >
                            {supplier.nama?.charAt(0)?.toUpperCase() || 'S'}
                          </div>
                          <div className={styles.userName}>{supplier.nama}</div>
                        </div>
                      </td>
                      <td>{supplier.email}</td>
                      <td>{supplier.telepon || '-'}</td>
                      <td className={styles.addressCell}>{supplier.alamat || '-'}</td>
                      <td>{formatDate(supplier.createdAt)}</td>
                      <td>
                        <span
                          className={styles.statusBadge}
                          style={{ backgroundColor: getStatusColor(supplier.status) }}
                        >
                          {supplier.status?.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actionButtons}>
                          {supplier.status === 'pending' && (
                            <button
                              className={styles.actionBtn}
                              title="Approve"
                              onClick={() => handleApprove(supplier.id)}
                            >✓</button>
                          )}
                          <button
                            className={styles.actionBtn}
                            title="Edit"
                            onClick={() => setEditModal({ visible: true, supplier: { ...supplier } })}
                          >✎</button>
                          <button
                            className={styles.actionBtn}
                            title="Reset Password"
                            onClick={() => handleResetPassword(supplier.id)}
                          >🔑</button>
                          <button
                            className={styles.actionBtn}
                            title="Hapus"
                            onClick={() => handleDelete(supplier.id)}
                          >🗑</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Supplier Modal */}
      <Modal
        title="Edit Supplier"
        open={editModal.visible}
        onOk={handleUpdate}
        onCancel={() => setEditModal({ visible: false, supplier: null })}
        confirmLoading={updating}
        okText="Simpan"
        cancelText="Batal"
      >
        {editModal.supplier && (
          <>
            <div style={{ marginBottom: 16 }}>
              <label>Nama:</label>
              <Input
                style={{ marginTop: 8 }}
                value={editModal.supplier.nama}
                onChange={(e) => setEditModal(prev => ({
                  ...prev,
                  supplier: { ...prev.supplier, nama: e.target.value }
                }))}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label>Telepon:</label>
              <Input
                style={{ marginTop: 8 }}
                value={editModal.supplier.telepon || ''}
                onChange={(e) => setEditModal(prev => ({
                  ...prev,
                  supplier: { ...prev.supplier, telepon: e.target.value }
                }))}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label>Alamat:</label>
              <Input.TextArea
                style={{ marginTop: 8 }}
                value={editModal.supplier.alamat || ''}
                onChange={(e) => setEditModal(prev => ({
                  ...prev,
                  supplier: { ...prev.supplier, alamat: e.target.value }
                }))}
                rows={3}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label>Status:</label>
              <Select
                style={{ width: '100%', marginTop: 8 }}
                value={editModal.supplier.status}
                onChange={(value) => setEditModal(prev => ({
                  ...prev,
                  supplier: { ...prev.supplier, status: value }
                }))}
              >
                <Select.Option value="active">Active</Select.Option>
                <Select.Option value="inactive">Inactive</Select.Option>
                <Select.Option value="pending">Pending</Select.Option>
              </Select>
            </div>
          </>
        )}
      </Modal>
    </AdminLayout>
  );
};

export default Pengguna;
