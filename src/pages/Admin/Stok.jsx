/**
 * Stok Page
 * Halaman manajemen stok produk dengan data real dari API
 */
import React, { useState, useEffect, useCallback } from 'react';
import styles from './Stok.module.css';
import AdminLayout from './components/AdminLayout';
import { stockService } from '../../services/api';
import { Spin, message, Modal, Select, Input } from 'antd';

const Stok = () => {
  const [loading, setLoading] = useState(true);
  const [stocks, setStocks] = useState([]);
  const [summary, setSummary] = useState({});
  const [supplies, setSupplies] = useState([]);
  const [verifyModal, setVerifyModal] = useState({ visible: false, supply: null, status: 'approved', catatan: '' });
  const [updating, setUpdating] = useState(false);
  const [activeView, setActiveView] = useState('stock'); // 'stock' or 'supplies'

  // Fetch stock data
  const fetchStockData = useCallback(async () => {
    setLoading(true);
    try {
      const [stockFinal, stockSummary, suppliesData] = await Promise.all([
        stockService.getFinal().catch(() => ({ data: [] })),
        stockService.getSummary().catch(() => ({ data: {} })),
        stockService.getAllSupplies({ page: 1, limit: 50 }).catch(() => ({ data: [] }))
      ]);

      // Handle various response formats for stocks
      let stocksArray = [];
      if (Array.isArray(stockFinal.data)) {
        stocksArray = stockFinal.data;
      } else if (stockFinal.data) {
        stocksArray = stockFinal.data.stocks || stockFinal.data;
      }

      // Handle supplies response
      let suppliesArray = [];
      if (Array.isArray(suppliesData.data)) {
        suppliesArray = suppliesData.data;
      } else if (suppliesData.data) {
        suppliesArray = suppliesData.data.supplies || suppliesData.data;
      }

      setStocks(stocksArray);
      setSummary(stockSummary.data || {});
      setSupplies(suppliesArray);
    } catch (error) {
      console.error('Error fetching stock data:', error);
      message.error('Gagal memuat data stok');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStockData();
  }, [fetchStockData]);

  // Stock summary cards
  const stockSummary = [
    {
      id: 1,
      label: 'Produk Stok Rendah',
      value: summary.low_stock_products || 0,
      icon: '⚠️',
      bgColor: '#FFB3BA',
      textColor: '#C41C3B'
    },
    {
      id: 2,
      label: 'Total Produk',
      value: summary.total_products || 0,
      icon: '📦',
      bgColor: '#FFEB99',
      textColor: '#B8860B'
    },
    {
      id: 3,
      label: 'Total Stok',
      value: summary.total_stock || 0,
      icon: '✓',
      bgColor: '#B3FFB3',
      textColor: '#2D7A52'
    }
  ];

  const getStockBarColor = (stock) => {
    if (stock > 50) return '#27AE60';
    if (stock > 20) return '#F39C12';
    if (stock > 0) return '#E67E22';
    return '#E74C3C';
  };

  const getStockLevel = (quantity) => {
    if (quantity > 50) return { level: 'Tinggi', color: '#27AE60' };
    if (quantity > 20) return { level: 'Sedang', color: '#F39C12' };
    if (quantity > 0) return { level: 'Rendah', color: '#E67E22' };
    return { level: 'Habis', color: '#E74C3C' };
  };

  const getGradeColor = (grade) => {
    const colors = { A: '#F39C12', B: '#3498DB', C: '#95A5A6', D: '#8B4513' };
    return colors[grade] || '#95A5A6';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  // Verify supply
  const handleVerifySupply = async () => {
    if (!verifyModal.supply) return;

    setUpdating(true);
    try {
      await stockService.verifySupply(verifyModal.supply.id, verifyModal.status, verifyModal.catatan);
      message.success('Supply berhasil diverifikasi');
      setVerifyModal({ visible: false, supply: null, status: 'approved', catatan: '' });
      fetchStockData();
    } catch (error) {
      console.error('Error verifying supply:', error);
      message.error(error.message || 'Gagal memverifikasi supply');
    } finally {
      setUpdating(false);
    }
  };

  const actionButton = (
    <div style={{ display: 'flex', gap: '10px' }}>
      <button
        className={styles.addButton}
        style={{ backgroundColor: activeView === 'stock' ? '#2D7A52' : '#6c757d' }}
        onClick={() => setActiveView('stock')}
      >
        📦 Stok
      </button>
      <button
        className={styles.addButton}
        style={{ backgroundColor: activeView === 'supplies' ? '#2D7A52' : '#6c757d' }}
        onClick={() => setActiveView('supplies')}
      >
        📥 Supplies
      </button>
    </div>
  );

  if (loading) {
    return (
      <AdminLayout headerType="simple" title="Manajemen Stok" actionButton={actionButton}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      headerType="simple"
      title="Manajemen Stok"
      actionButton={actionButton}
    >
      <div className={styles.stokContainer}>
        {/* Stock Summary Cards */}
        <div className={styles.summaryGrid}>
          {stockSummary.map(card => (
            <div
              key={card.id}
              className={styles.summaryCard}
              style={{ backgroundColor: card.bgColor }}
            >
              <div className={styles.summaryContent}>
                <span className={styles.summaryIcon}>{card.icon}</span>
                <div className={styles.summaryText}>
                  <div className={styles.summaryLabel}>{card.label}</div>
                  <div
                    className={styles.summaryValue}
                    style={{ color: card.textColor }}
                  >
                    {card.value}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {activeView === 'stock' ? (
          /* Stock Table */
          <div className={styles.tableSection}>
            <div className={styles.tableHeader}>
              <h4>Daftar Stok Produk</h4>
            </div>

            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>PRODUK</th>
                    <th>GRADE</th>
                    <th>STOK</th>
                    <th>LEVEL</th>
                    <th>HARGA</th>
                  </tr>
                </thead>
                <tbody>
                  {stocks.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '50px' }}>
                        Tidak ada data stok
                      </td>
                    </tr>
                  ) : (
                    stocks.map(stock => {
                      const levelInfo = getStockLevel(stock.quantity);
                      return (
                        <tr key={stock.id}>
                          <td className={styles.productCell}>{stock.product?.nama_produk || `Produk #${stock.product_id}`}</td>
                          <td>
                            <span
                              className={styles.gradeBadge}
                              style={{ backgroundColor: getGradeColor(stock.grade) }}
                            >
                              Grade {stock.grade}
                            </span>
                          </td>
                          <td>
                            <div className={styles.stockBar}>
                              <div
                                className={styles.stockFill}
                                style={{
                                  width: `${Math.min(stock.quantity, 100)}%`,
                                  backgroundColor: getStockBarColor(stock.quantity)
                                }}
                              />
                              <span className={styles.stockText}>{stock.quantity} unit</span>
                            </div>
                          </td>
                          <td>
                            <span
                              className={styles.levelBadge}
                              style={{ color: levelInfo.color }}
                            >
                              {levelInfo.level}
                            </span>
                          </td>
                          <td>{formatCurrency(stock.harga)}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Supplies Table */
          <div className={styles.tableSection}>
            <div className={styles.tableHeader}>
              <h4>Daftar Supply (Pending Verification)</h4>
            </div>

            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>SUPPLIER</th>
                    <th>PRODUK</th>
                    <th>JUMLAH</th>
                    <th>GRADE</th>
                    <th>HARGA</th>
                    <th>STATUS</th>
                    <th>AKSI</th>
                  </tr>
                </thead>
                <tbody>
                  {supplies.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '50px' }}>
                        Tidak ada supply
                      </td>
                    </tr>
                  ) : (
                    supplies.map(supply => (
                      <tr key={supply.id}>
                        <td>{supply.supplier?.nama || 'Unknown'}</td>
                        <td>{supply.product?.nama_produk || `Produk #${supply.product_id}`}</td>
                        <td>{supply.jumlah} unit</td>
                        <td>
                          <span
                            className={styles.gradeBadge}
                            style={{ backgroundColor: getGradeColor(supply.grade) }}
                          >
                            Grade {supply.grade}
                          </span>
                        </td>
                        <td>{formatCurrency(supply.harga_supply)}</td>
                        <td>
                          <span
                            className={styles.statusBadge}
                            style={{
                              backgroundColor: supply.status_produk === 'approved' ? '#27AE60'
                                : supply.status_produk === 'rejected' ? '#E74C3C' : '#F39C12'
                            }}
                          >
                            {supply.status_produk?.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          {supply.status_produk === 'pending' && (
                            <button
                              className={styles.actionBtn}
                              onClick={() => setVerifyModal({
                                visible: true,
                                supply,
                                status: 'approved',
                                catatan: ''
                              })}
                            >
                              ✓ Verify
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Verify Supply Modal */}
      <Modal
        title="Verifikasi Supply"
        open={verifyModal.visible}
        onOk={handleVerifySupply}
        onCancel={() => setVerifyModal({ visible: false, supply: null, status: 'approved', catatan: '' })}
        confirmLoading={updating}
        okText="Verifikasi"
        cancelText="Batal"
      >
        <p>Supplier: <strong>{verifyModal.supply?.supplier?.nama}</strong></p>
        <p>Produk: <strong>{verifyModal.supply?.product?.nama_produk}</strong></p>
        <p>Jumlah: <strong>{verifyModal.supply?.jumlah} unit</strong></p>
        <div style={{ marginTop: 16 }}>
          <label>Status:</label>
          <Select
            style={{ width: '100%', marginTop: 8 }}
            value={verifyModal.status}
            onChange={(value) => setVerifyModal(prev => ({ ...prev, status: value }))}
          >
            <Select.Option value="approved">Approved</Select.Option>
            <Select.Option value="rejected">Rejected</Select.Option>
          </Select>
        </div>
        <div style={{ marginTop: 16 }}>
          <label>Catatan:</label>
          <Input.TextArea
            style={{ marginTop: 8 }}
            value={verifyModal.catatan}
            onChange={(e) => setVerifyModal(prev => ({ ...prev, catatan: e.target.value }))}
            placeholder="Catatan verifikasi (opsional)"
            rows={3}
          />
        </div>
      </Modal>
    </AdminLayout>
  );
};

export default Stok;
