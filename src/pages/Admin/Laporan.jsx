/**
 * Laporan Page
 * Halaman laporan penjualan dan distribusi dengan data dari API
 */
import React, { useState, useEffect, useCallback } from 'react';
import styles from './Laporan.module.css';
import AdminLayout from './components/AdminLayout';
import { transactionService, stockService } from '../../services/api';
import { Spin, message } from 'antd';

const Laporan = () => {
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [selectedReport, setSelectedReport] = useState('semua');
  const [reportData, setReportData] = useState({
    penjualan: { total: 0, count: 0 },
    distribusi: { total: 0, count: 0 },
    stok: { total: 0, count: 0 },
    laba: { total: 0, margin: 0 }
  });

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  // Fetch report data
  const fetchReportData = useCallback(async () => {
    setLoading(true);
    try {
      const [transactionsRes, stockRes] = await Promise.all([
        transactionService.getAllAdmin({ page: 1, limit: 100 }).catch(() => ({ data: [] })),
        stockService.getSummary().catch(() => ({ data: {} }))
      ]);

      // Handle transactions data
      let transactions = [];
      if (Array.isArray(transactionsRes.data)) {
        transactions = transactionsRes.data;
      } else if (transactionsRes.data) {
        transactions = transactionsRes.data.transactions || transactionsRes.data || [];
      }

      // Calculate totals
      const completedOrders = transactions.filter(t =>
        t.status_pembayaran === 'paid' || t.status_pembayaran === 'completed'
      );
      const totalPenjualan = completedOrders.reduce((sum, t) => sum + (t.total_harga || 0), 0);

      // Stock data
      const stockData = stockRes.data || {};

      setReportData({
        penjualan: {
          total: totalPenjualan,
          count: completedOrders.length
        },
        distribusi: {
          total: stockData.today_transactions || 0,
          count: transactions.length
        },
        stok: {
          total: stockData.total_stock_value || 0,
          count: stockData.low_stock_products || 0
        },
        laba: {
          total: Math.round(totalPenjualan * 0.35), // Estimated 35% margin
          margin: 35
        }
      });
    } catch (error) {
      console.error('Error fetching report data:', error);
      message.error('Gagal memuat data laporan');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  // Export ke PDF
  const handleExportPDF = () => {
    message.info('Fitur export PDF akan segera tersedia');
  };

  // Export ke Excel
  const handleExportExcel = () => {
    message.info('Fitur export Excel akan segera tersedia');
  };

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
              <option value="januari-2026">Januari 2026</option>
              <option value="desember-2025">Desember 2025</option>
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

        {/* Metrics Cards */}
        <div className={styles.metricsGrid}>
          <div className={styles.metricCard}>
            <div className={styles.metricIcon} style={{ backgroundColor: '#2D7A52' }}>
              📊
            </div>
            <div className={styles.metricContent}>
              <h3>Total Penjualan</h3>
              <p className={styles.metricValue}>{formatCurrency(reportData.penjualan.total)}</p>
              <p className={styles.metricSubtitle}>{reportData.penjualan.count} transaksi selesai</p>
              <div className={styles.metricButtons}>
                <button className={styles.btnExcel} onClick={handleExportExcel}>📊 Excel</button>
                <button className={styles.btnPdf} onClick={handleExportPDF}>📄 PDF</button>
              </div>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricIcon} style={{ backgroundColor: '#F39C12' }}>
              📦
            </div>
            <div className={styles.metricContent}>
              <h3>Total Transaksi</h3>
              <p className={styles.metricValue}>{reportData.distribusi.count}</p>
              <p className={styles.metricSubtitle}>{reportData.distribusi.total} transaksi hari ini</p>
              <div className={styles.metricButtons}>
                <button className={styles.btnExcel} onClick={handleExportExcel}>📊 Excel</button>
                <button className={styles.btnPdf} onClick={handleExportPDF}>📄 PDF</button>
              </div>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricIcon} style={{ backgroundColor: '#3498DB' }}>
              📮
            </div>
            <div className={styles.metricContent}>
              <h3>Nilai Stok</h3>
              <p className={styles.metricValue}>{formatCurrency(reportData.stok.total)}</p>
              <p className={styles.metricSubtitle}>{reportData.stok.count} produk stok rendah</p>
              <div className={styles.metricButtons}>
                <button className={styles.btnExcel} onClick={handleExportExcel}>📊 Excel</button>
                <button className={styles.btnPdf} onClick={handleExportPDF}>📄 PDF</button>
              </div>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricIcon} style={{ backgroundColor: '#9B59B6' }}>
              💰
            </div>
            <div className={styles.metricContent}>
              <h3>Estimasi Laba</h3>
              <p className={styles.metricValue}>{formatCurrency(reportData.laba.total)}</p>
              <p className={styles.metricSubtitle}>Margin ~{reportData.laba.margin}%</p>
              <div className={styles.metricButtons}>
                <button className={styles.btnExcel} onClick={handleExportExcel}>📊 Excel</button>
                <button className={styles.btnPdf} onClick={handleExportPDF}>📄 PDF</button>
              </div>
            </div>
          </div>
        </div>

        {/* Download Section */}
        <div className={styles.downloadSection}>
          <h3>Download Laporan Lengkap</h3>
          <div className={styles.downloadButtons}>
            <button className={styles.downloadBtn} onClick={handleExportPDF}>
              <span className={styles.downloadIcon}>📄</span>
              <div className={styles.downloadInfo}>
                <strong>Laporan PDF</strong>
                <p>Lihat dalam format PDF</p>
              </div>
            </button>
            <button className={styles.downloadBtn} onClick={handleExportExcel}>
              <span className={styles.downloadIcon}>📊</span>
              <div className={styles.downloadInfo}>
                <strong>Laporan Excel</strong>
                <p>Edit dan analisis data</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Laporan;
