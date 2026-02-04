/**
 * Laporan Page
 * Halaman laporan penjualan dan distribusi dengan data dari API
 */
import React, { useState, useEffect, useCallback } from 'react';
import styles from './Laporan.module.css';
import AdminLayout from './components/AdminLayout';
import { reportService } from '../../services/api';
import { Spin, message, Table, Empty } from 'antd';

const Laporan = () => {
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [selectedReport, setSelectedReport] = useState('semua');
  const [reportData, setReportData] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Fetch report data
  const fetchReportData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await reportService.getSummary({
        period: selectedPeriod,
        report_type: selectedReport
      });

      if (response.success) {
        setReportData(response.data);
      } else {
        message.error(response.message || 'Gagal memuat data laporan');
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
      message.error('Gagal memuat data laporan');
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod, selectedReport]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  // Export to Excel
  const handleExportExcel = async () => {
    setExportLoading(true);
    try {
      const response = await reportService.exportData({
        period: selectedPeriod,
        format: 'json'
      });

      if (response.success) {
        // Convert to CSV and download
        const data = response.data;
        let csvContent = 'Invoice,Tanggal,Consumer,Email,Total,Status,Metode Bayar\n';

        data.transactions.forEach(t => {
          csvContent += `"${t.invoice}","${formatDate(t.tanggal)}","${t.consumer}","${t.email}","${t.total}","${t.status}","${t.metode_bayar || 'N/A'}"\n`;
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `laporan-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();

        message.success('Laporan berhasil diexport');
      }
    } catch (error) {
      console.error('Export error:', error);
      message.error('Gagal export laporan');
    } finally {
      setExportLoading(false);
    }
  };

  // Export to PDF (print-friendly view)
  const handleExportPDF = () => {
    window.print();
  };

  // Get period label
  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case 'today': return 'Hari Ini';
      case 'week': return 'Minggu Ini';
      case 'month': return 'Bulan Ini';
      case 'year': return 'Tahun Ini';
      default: return 'Semua Waktu';
    }
  };

  // Top products columns
  const topProductsColumns = [
    {
      title: 'Produk',
      dataIndex: 'nama_produk',
      key: 'nama_produk',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {record.image_url && (
            <img
              src={record.image_url}
              alt={text}
              style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }}
            />
          )}
          <span>{text}</span>
        </div>
      )
    },
    {
      title: 'Terjual',
      dataIndex: 'total_terjual',
      key: 'total_terjual',
      align: 'right'
    },
    {
      title: 'Pendapatan',
      dataIndex: 'total_pendapatan',
      key: 'total_pendapatan',
      align: 'right',
      render: (val) => formatCurrency(val)
    }
  ];

  if (loading) {
    return (
      <AdminLayout headerType="simple" title="Laporan Penjualan & Distribusi">
        <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}>
          <Spin size="large" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      headerType="simple"
      title="Laporan Penjualan & Distribusi"
    >
      <div className={styles.laporanContainer}>
        {/* Filter Section */}
        <div className={styles.filterSection}>
          <div className={styles.filterGroup}>
            <label htmlFor="period">Periode:</label>
            <select
              id="period"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">Semua Waktu</option>
              <option value="today">Hari Ini</option>
              <option value="week">Minggu Ini</option>
              <option value="month">Bulan Ini</option>
              <option value="year">Tahun Ini</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor="report">Jenis Laporan:</label>
            <select
              id="report"
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="semua">Semua</option>
              <option value="penjualan">Penjualan</option>
              <option value="distribusi">Distribusi</option>
            </select>
          </div>

          <button className={styles.filterBtn} onClick={fetchReportData}>🔍 Filter</button>
        </div>

        {/* Period Info */}
        {reportData?.date_range && (
          <div className={styles.periodInfo}>
            <span>📅 Periode: <strong>{getPeriodLabel()}</strong></span>
            {reportData.date_range.start && (
              <span className={styles.dateRange}>
                ({formatDate(reportData.date_range.start)} - {formatDate(reportData.date_range.end)})
              </span>
            )}
          </div>
        )}

        {/* Metrics Cards */}
        <div className={styles.metricsGrid}>
          {/* Penjualan Card */}
          <div className={styles.metricCard}>
            <div className={styles.metricIcon} style={{ backgroundColor: '#2D7A52' }}>
              📊
            </div>
            <div className={styles.metricContent}>
              <h3>Total Penjualan</h3>
              <p className={styles.metricValue}>
                {formatCurrency(reportData?.penjualan?.total_pendapatan || 0)}
              </p>
              <p className={styles.metricSubtitle}>
                {reportData?.penjualan?.transaksi_selesai || 0} transaksi selesai
              </p>
              <div className={styles.metricDetails}>
                <span>Pending: {reportData?.penjualan?.transaksi_pending || 0}</span>
                <span>Batal: {reportData?.penjualan?.transaksi_cancelled || 0}</span>
              </div>
            </div>
          </div>

          {/* Distribusi Card */}
          <div className={styles.metricCard}>
            <div className={styles.metricIcon} style={{ backgroundColor: '#F39C12' }}>
              📦
            </div>
            <div className={styles.metricContent}>
              <h3>Distribusi Stok</h3>
              <p className={styles.metricValue}>
                {reportData?.distribusi?.stock_out?.quantity || 0} unit
              </p>
              <p className={styles.metricSubtitle}>
                Keluar dari {reportData?.distribusi?.stock_out?.count || 0} transaksi
              </p>
              <div className={styles.metricDetails}>
                <span>Masuk: {reportData?.distribusi?.stock_in?.quantity || 0} unit</span>
              </div>
            </div>
          </div>

          {/* Stok Card */}
          <div className={styles.metricCard}>
            <div className={styles.metricIcon} style={{ backgroundColor: '#3498DB' }}>
              📮
            </div>
            <div className={styles.metricContent}>
              <h3>Nilai Stok</h3>
              <p className={styles.metricValue}>
                {formatCurrency(reportData?.stok?.total_nilai_stok || 0)}
              </p>
              <p className={styles.metricSubtitle}>
                {reportData?.stok?.total_quantity || 0} unit tersedia
              </p>
              <div className={styles.metricDetails}>
                <span className={styles.warning}>
                  ⚠️ {reportData?.stok?.produk_stok_rendah || 0} produk stok rendah
                </span>
              </div>
            </div>
          </div>

          {/* Laba Card */}
          <div className={styles.metricCard}>
            <div className={styles.metricIcon} style={{ backgroundColor: '#9B59B6' }}>
              💰
            </div>
            <div className={styles.metricContent}>
              <h3>Laba Kotor</h3>
              <p className={styles.metricValue}>
                {formatCurrency(reportData?.laba?.laba_kotor || 0)}
              </p>
              <p className={styles.metricSubtitle}>
                Margin {reportData?.laba?.margin_persen || 0}%
              </p>
              <div className={styles.metricDetails}>
                <span>HPP: {formatCurrency(reportData?.laba?.harga_pokok || 0)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Supply Info */}
        <div className={styles.supplySection}>
          <h3>📥 Status Supply</h3>
          <div className={styles.supplyGrid}>
            <div className={styles.supplyItem}>
              <span className={styles.supplyLabel}>Pending</span>
              <span className={styles.supplyValue}>{reportData?.supply?.pending || 0}</span>
            </div>
            <div className={styles.supplyItem}>
              <span className={styles.supplyLabel}>Approved</span>
              <span className={styles.supplyValue}>{reportData?.supply?.approved || 0}</span>
            </div>
            <div className={styles.supplyItem}>
              <span className={styles.supplyLabel}>Nilai Supply</span>
              <span className={styles.supplyValue}>{formatCurrency(reportData?.supply?.total_nilai_supply || 0)}</span>
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className={styles.topProductsSection}>
          <h3>🏆 Produk Terlaris</h3>
          {reportData?.top_products && reportData.top_products.length > 0 ? (
            <Table
              dataSource={reportData.top_products}
              columns={topProductsColumns}
              rowKey="product_id"
              pagination={false}
              size="small"
            />
          ) : (
            <Empty description="Belum ada data produk terlaris" />
          )}
        </div>

        {/* Recent Transactions */}
        <div className={styles.recentSection}>
          <h3>📋 Transaksi Terbaru</h3>
          {reportData?.recent_transactions && reportData.recent_transactions.length > 0 ? (
            <div className={styles.transactionList}>
              {reportData.recent_transactions.slice(0, 5).map((t) => (
                <div key={t.id} className={styles.transactionItem}>
                  <div className={styles.transactionInfo}>
                    <span className={styles.invoiceNumber}>{t.invoice_number}</span>
                    <span className={styles.consumerName}>{t.consumer_name || 'Unknown'}</span>
                  </div>
                  <div className={styles.transactionMeta}>
                    <span className={styles.transactionDate}>{formatDate(t.tanggal)}</span>
                    <span className={styles.transactionAmount}>{formatCurrency(t.total_harga)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Empty description="Belum ada transaksi" />
          )}
        </div>

        {/* Download Section */}
        <div className={styles.downloadSection}>
          <h3>Download Laporan Lengkap</h3>
          <div className={styles.downloadButtons}>
            <button className={styles.downloadBtn} onClick={handleExportPDF}>
              <span className={styles.downloadIcon}>📄</span>
              <div className={styles.downloadInfo}>
                <strong>Laporan PDF</strong>
                <p>Cetak / simpan sebagai PDF</p>
              </div>
            </button>
            <button
              className={styles.downloadBtn}
              onClick={handleExportExcel}
              disabled={exportLoading}
            >
              <span className={styles.downloadIcon}>📊</span>
              <div className={styles.downloadInfo}>
                <strong>Laporan Excel</strong>
                <p>{exportLoading ? 'Mengexport...' : 'Download file CSV'}</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Laporan;
