/**
 * Laporan Page
 * Halaman laporan penjualan dan distribusi
 */
import React, { useState } from 'react';
import styles from './Laporan.module.css';
import AdminLayout from './components/AdminLayout';

const Laporan = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('januari-2024');
  const [selectedReport, setSelectedReport] = useState('semua');

  // Data laporan
  const reportData = {
    penjualan: {
      total: 'Rp 45.250.000',
      subtitle: '102 transaksi bulan ini',
      icon: '📊'
    },
    distribusi: {
      total: '1.250 kg',
      subtitle: 'Semua distribusi',
      icon: '📦'
    },
    pengemasan: {
      total: '890 kg',
      subtitle: 'Dari 2022-2024',
      icon: '📮'
    },
    laba: {
      total: 'Rp 15.800.000',
      subtitle: 'Margin 35%',
      icon: '💰'
    }
  };

  // Export ke PDF
  const handleExportPDF = () => {
    alert('Mengekspor ke PDF... (Fitur akan diintegrasikan dengan jsPDF/React-PDF)');
    // Implementasi real: gunakan jsPDF atau react-pdf
  };

  // Export ke Excel
  const handleExportExcel = () => {
    alert('Mengekspor ke Excel... (Fitur akan diintegrasikan dengan XLSX)');
    // Implementasi real: gunakan xlsx library
  };

  // Button untuk actionButton di AdminLayout
  const actionButtons = (
    <div className={styles.actionButtonsGroup}>
    </div>
  );

  return (
    <AdminLayout 
      headerType="simple" 
      title="Laporan Penjualan & Distribusi"
      actionButton={actionButtons}
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
              <option value="januari-2024">Januari 2024</option>
              <option value="februari-2024">Februari 2024</option>
              <option value="maret-2024">Maret 2024</option>
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

          <button className={styles.filterBtn}>🔍 Filter</button>
        </div>

        {/* Metrics Cards */}
        <div className={styles.metricsGrid}>
          <div className={styles.metricCard}>
            <div className={styles.metricIcon} style={{ backgroundColor: '#2D7A52' }}>
              {reportData.penjualan.icon}
            </div>
            <div className={styles.metricContent}>
              <h3>Total Penjualan</h3>
              <p className={styles.metricValue}>{reportData.penjualan.total}</p>
              <p className={styles.metricSubtitle}>{reportData.penjualan.subtitle}</p>
              <div className={styles.metricButtons}>
                <button className={styles.btnExcel}>📊 Excel</button>
                <button className={styles.btnPdf}>📄 PDF</button>
              </div>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricIcon} style={{ backgroundColor: '#F39C12' }}>
              {reportData.distribusi.icon}
            </div>
            <div className={styles.metricContent}>
              <h3>Total Distribusi</h3>
              <p className={styles.metricValue}>{reportData.distribusi.total}</p>
              <p className={styles.metricSubtitle}>{reportData.distribusi.subtitle}</p>
              <div className={styles.metricButtons}>
                <button className={styles.btnExcel}>📊 Excel</button>
                <button className={styles.btnPdf}>📄 PDF</button>
              </div>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricIcon} style={{ backgroundColor: '#3498DB' }}>
              {reportData.pengemasan.icon}
            </div>
            <div className={styles.metricContent}>
              <h3>Total Pengemasan</h3>
              <p className={styles.metricValue}>{reportData.pengemasan.total}</p>
              <p className={styles.metricSubtitle}>{reportData.pengemasan.subtitle}</p>
              <div className={styles.metricButtons}>
                <button className={styles.btnExcel}>📊 Excel</button>
                <button className={styles.btnPdf}>📄 PDF</button>
              </div>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricIcon} style={{ backgroundColor: '#9B59B6' }}>
              {reportData.laba.icon}
            </div>
            <div className={styles.metricContent}>
              <h3>Laba Kotor</h3>
              <p className={styles.metricValue}>{reportData.laba.total}</p>
              <p className={styles.metricSubtitle}>{reportData.laba.subtitle}</p>
              <div className={styles.metricButtons}>
                <button className={styles.btnExcel}>📊 Excel</button>
                <button className={styles.btnPdf}>📄 PDF</button>
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
