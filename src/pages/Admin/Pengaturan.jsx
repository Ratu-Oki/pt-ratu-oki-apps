
import React, { useEffect, useState, useCallback } from 'react';
import styles from './Pengaturan.module.css';
import AdminLayout from './components/AdminLayout';
import { authService, supplierService, consumerService } from '../../services/api';
import { Button, Input, Select, message, Spin, Modal } from 'antd';

const Pengaturan = () => {
  const [activeTab, setActiveTab] = useState('create');

  // Create account form
  const [creating, setCreating] = useState(false);
  const [createData, setCreateData] = useState({ nama: '', email: '', password: '', role: 'consumer', telepon: '', alamat: '' });

  // Consumers
  const [consumers, setConsumers] = useState([]);
  const [loadingConsumers, setLoadingConsumers] = useState(false);

  // Suppliers
  const [suppliers, setSuppliers] = useState([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);

  const fetchConsumers = useCallback(async () => {
    setLoadingConsumers(true);
    try {
      const res = await consumerService.getAll({ page: 1, limit: 100 });
      const data = res?.data || res?.consumers || res || [];
      setConsumers(Array.isArray(data) ? data : (data.consumers || data));
    } catch (err) {
      console.error('fetchConsumers', err);
      message.error('Gagal memuat data consumer');
      setConsumers([]);
    } finally {
      setLoadingConsumers(false);
    }
  }, []);

  const fetchSuppliers = useCallback(async () => {
    setLoadingSuppliers(true);
    try {
      const res = await supplierService.getAll({ page: 1, limit: 100 });
      const data = res?.data || res?.suppliers || res || [];
      setSuppliers(Array.isArray(data) ? data : (data.suppliers || data));
    } catch (err) {
      console.error('fetchSuppliers', err);
      message.error('Gagal memuat data supplier');
      setSuppliers([]);
    } finally {
      setLoadingSuppliers(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'consumers') fetchConsumers();
    if (activeTab === 'suppliers') fetchSuppliers();
  }, [activeTab, fetchConsumers, fetchSuppliers]);

  const handleCreateAccount = async () => {
    if (!createData.email || !createData.password || !createData.nama) {
      return message.error('Nama, email, dan password wajib diisi');
    }

    setCreating(true);
    try {
      const payload = { ...createData };
      await authService.register(payload);
      message.success('Akun berhasil dibuat');
      setCreateData({ nama: '', email: '', password: '', role: 'consumer', telepon: '', alamat: '' });
      // Refresh lists
      if (payload.role === 'consumer') fetchConsumers();
      if (payload.role === 'supplier') fetchSuppliers();
    } catch (err) {
      console.error('create account', err);
      message.error(err?.message || 'Gagal membuat akun');
    } finally {
      setCreating(false);
    }
  };

  const handleResetPassword = async (id, role) => {
    Modal.confirm({
      title: 'Reset password',
      content: 'Reset password untuk user ini?',
      onOk: async () => {
        try {
          if (role === 'supplier') {
            await supplierService.resetPassword(id);
          } else {
            await consumerService.resetPassword(id);
          }
          message.success('Permintaan reset password dikirim');
        } catch (err) {
          console.error('reset password', err);
          const errMsg = err && (err.message || err.msg || err.error || err?.data?.message || (typeof err === 'string' ? err : JSON.stringify(err))) || 'Gagal reset password';
          message.error(errMsg);
        }
      }
    });
  };

  const handleDelete = async (id, role) => {
    Modal.confirm({
      title: 'Hapus akun',
      content: 'Apakah Anda yakin ingin menghapus akun ini?',
      okType: 'danger',
      onOk: async () => {
        try {
          if (role === 'supplier') await supplierService.delete(id);
          else await consumerService.delete(id);
          message.success('Akun berhasil dihapus');
          if (role === 'supplier') fetchSuppliers(); else fetchConsumers();
        } catch (err) {
          console.error('delete user', err);
          const errMsg = err && (err.message || err.msg || err.error || err?.data?.message || (typeof err === 'string' ? err : JSON.stringify(err))) || 'Gagal menghapus akun';
          message.error(errMsg);
        }
      }
    });
  };

  return (
    <AdminLayout headerType="full" title="Pengaturan Admin">
      <div className={styles.pengaturanPage}>
        <div className={styles.tabBar}>
          <button className={activeTab === 'create' ? styles.activeTab : ''} onClick={() => setActiveTab('create')}>Buat Akun</button>
          <button className={activeTab === 'consumers' ? styles.activeTab : ''} onClick={() => setActiveTab('consumers')}>Kelola Consumer</button>
          <button className={activeTab === 'suppliers' ? styles.activeTab : ''} onClick={() => setActiveTab('suppliers')}>Kelola Supplier</button>
        </div>

        <div style={{ marginTop: 16 }}>
          {activeTab === 'create' && (
            <div className={styles.createCard}>
              <h3>Buat Akun Baru</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Input placeholder="Nama" value={createData.nama} onChange={(e) => setCreateData(prev => ({ ...prev, nama: e.target.value }))} />
                <Input placeholder="Email" value={createData.email} onChange={(e) => setCreateData(prev => ({ ...prev, email: e.target.value }))} />
                <Input placeholder="Telepon" value={createData.telepon} onChange={(e) => setCreateData(prev => ({ ...prev, telepon: e.target.value }))} />
                <Select value={createData.role} onChange={(val) => setCreateData(prev => ({ ...prev, role: val }))}>
                  <Select.Option value="consumer">Consumer</Select.Option>
                  <Select.Option value="supplier">Supplier</Select.Option>
                </Select>
                <Input.Password placeholder="Password" value={createData.password} onChange={(e) => setCreateData(prev => ({ ...prev, password: e.target.value }))} />
                <Input.TextArea placeholder="Alamat" value={createData.alamat} onChange={(e) => setCreateData(prev => ({ ...prev, alamat: e.target.value }))} />
              </div>
              <div style={{ marginTop: 12 }}>
                <Button type="primary" onClick={handleCreateAccount} loading={creating}>Buat Akun</Button>
              </div>
            </div>
          )}

          {activeTab === 'consumers' && (
            <div>
              {loadingConsumers ? <Spin /> : (
                <div className={styles.listContainer}>
                  {consumers.length === 0 ? (<div>Tidak ada consumer</div>) : (
                    <table className={styles.table}>
                      <thead>
                        <tr><th>Nama</th><th>Email</th><th>Telepon</th><th>Tanggal</th><th>Aksi</th></tr>
                      </thead>
                      <tbody>
                        {consumers.map(c => (
                          <tr key={c.id || c._id}>
                            <td>{c.nama}</td>
                            <td>{c.email}</td>
                            <td>{c.telepon || '-'}</td>
                            <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                            <td>
                              <Button size="small" onClick={() => handleResetPassword(c.id || c._id, 'consumer')}>Reset PW</Button>
                              <Button size="small" danger style={{ marginLeft: 8 }} onClick={() => handleDelete(c.id || c._id, 'consumer')}>Hapus</Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'suppliers' && (
            <div>
              {loadingSuppliers ? <Spin /> : (
                <div className={styles.listContainer}>
                  {suppliers.length === 0 ? (<div>Tidak ada supplier</div>) : (
                    <table className={styles.table}>
                      <thead>
                        <tr><th>Nama</th><th>Email</th><th>Telepon</th><th>Status</th><th>Aksi</th></tr>
                      </thead>
                      <tbody>
                        {suppliers.map(s => (
                          <tr key={s.id || s._id}>
                            <td>{s.nama}</td>
                            <td>{s.email}</td>
                            <td>{s.telepon || '-'}</td>
                            <td>{s.status}</td>
                            <td>
                              {s.status === 'pending' && <Button size="small" onClick={() => supplierService.approve(s.id || s._id).then(() => { message.success('Supplier diapprove'); fetchSuppliers(); }).catch(() => message.error('Gagal approve'))}>Approve</Button>}
                              <Button size="small" onClick={() => handleResetPassword(s.id || s._id, 'supplier')}>Reset PW</Button>
                              <Button size="small" danger style={{ marginLeft: 8 }} onClick={() => handleDelete(s.id || s._id, 'supplier')}>Hapus</Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Pengaturan;
