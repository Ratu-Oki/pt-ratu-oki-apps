/**
 * Stok Page
 * Halaman manajemen stok produk
 */
import React, { useState } from 'react';
import styles from './Stok.module.css';
import AdminLayout from './components/AdminLayout';

const Stok = () => {
  // Stock summary cards
  const stockSummary = [
    {
      id: 1,
      label: 'Produk Stok Rendah',
      value: 5,
      icon: '⚠️',
      bgColor: '#FFB3BA',
      textColor: '#C41C3B'
    },
    {
      id: 2,
      label: 'Produk Menjelang Habis',
      value: 8,
      icon: '⏳',
      bgColor: '#FFEB99',
      textColor: '#B8860B'
    },
    {
      id: 3,
      label: 'Produk',
      value: 45,
      icon: '✓',
      bgColor: '#B3FFB3',
      textColor: '#2D7A52'
    }
  ];

  // Stock data
  const [stocks] = useState([
    {
      id: 1,
      name: 'Vanila Bourbon Premium 100g',
      grade: 'Grade A',
      gradeColor: '#F39C12',
      stock: 82,
      level: 'Tinggi',
      levelColor: '#27AE60',
      status: 'AKTIF',
      statusColor: '#27AE60'
    },
    {
      id: 2,
      name: 'Vanila Tahitian Select 100g',
      grade: 'Grade B',
      gradeColor: '#F39C12',
      stock: 37,
      level: 'Sedang',
      levelColor: '#F39C12',
      status: 'AKTIF',
      statusColor: '#27AE60'
    },
    {
      id: 3,
      name: 'Vanila Planifolia 100g',
      grade: 'Grade C',
      gradeColor: '#95A5A6',
      stock: 8,
      level: 'Rendah',
      levelColor: '#E67E22',
      status: 'AKTIF',
      statusColor: '#27AE60'
    },
    {
      id: 4,
      name: 'Vanila Ekstrak Grade 100g',
      grade: 'Grade D',
      gradeColor: '#8B4513',
      stock: 0,
      level: 'Habis',
      levelColor: '#E74C3C',
      status: 'NONAKTIF',
      statusColor: '#E74C3C'
    },
    {
      id: 5,
      name: 'Vanila Bourbon 250g',
      grade: 'Grade A',
      gradeColor: '#F39C12',
      stock: 58,
      level: 'Tinggi',
      levelColor: '#27AE60',
      status: 'AKTIF',
      statusColor: '#27AE60'
    }
  ]);

  const getStockBarColor = (stock) => {
    if (stock > 50) return '#27AE60';
    if (stock > 20) return '#F39C12';
    if (stock > 0) return '#E67E22';
    return '#E74C3C';
  };

  const actionButton = (
    <button className={styles.addButton}>
      <span className={styles.plusIcon}>+</span> Update Stok
    </button>
  );

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

        {/* Stock Table */}
        <div className={styles.tableSection}>
          <div className={styles.tableHeader}>
            <h4>Daftar Stok Produk</h4>
            <button className={styles.exportBtn}>📥 Export</button>
          </div>

          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>PRODUK</th>
                  <th>GRADE</th>
                  <th>STOK</th>
                  <th>LEVEL</th>
                  <th>STATUS</th>
                  <th>AKSI</th>
                </tr>
              </thead>
              <tbody>
                {stocks.map(stock => (
                  <tr key={stock.id}>
                    <td className={styles.productCell}>{stock.name}</td>
                    <td>
                      <span 
                        className={styles.gradeBadge}
                        style={{ backgroundColor: stock.gradeColor }}
                      >
                        {stock.grade}
                      </span>
                    </td>
                    <td>
                      <div className={styles.stockBar}>
                        <div 
                          className={styles.stockFill}
                          style={{ 
                            width: `${stock.stock}%`,
                            backgroundColor: getStockBarColor(stock.stock)
                          }}
                        />
                        <span className={styles.stockText}>{stock.stock} unit</span>
                      </div>
                    </td>
                    <td>
                      <span 
                        className={styles.levelBadge}
                        style={{ color: stock.levelColor }}
                      >
                        {stock.level}
                      </span>
                    </td>
                    <td>
                      <span 
                        className={styles.statusBadge}
                        style={{ backgroundColor: stock.statusColor }}
                      >
                        {stock.status}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actionButtons}>
                        <button className={styles.actionBtn} title="Edit">✎</button>
                        <button className={styles.actionBtn} title="Delete">🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Stok;
