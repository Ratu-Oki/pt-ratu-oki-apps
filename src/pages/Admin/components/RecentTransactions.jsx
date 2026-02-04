import React from 'react';
import styles from './RecentTransactions.module.css';
import { Empty } from 'antd';

const RecentTransactions = ({ transactions, onViewAll }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Selesai':
      case 'Berhasil':
        return 'success';
      case 'Pending':
        return 'pending';
      case 'Dibayar':
        return 'paid';
      case 'Dikirim':
        return 'shipped';
      case 'Dibatalkan':
        return 'cancelled';
      default:
        return 'default';
    }
  };

  return (
    <div className={styles.transactionContainer}>
      <div className={styles.transactionHeader}>
        <h3>Transaksi Terbaru</h3>
        <button onClick={onViewAll} className={styles.viewAllLink}>
          Lihat Semua →
        </button>
      </div>

      {transactions.length === 0 ? (
        <div className={styles.emptyState}>
          <Empty description="Belum ada transaksi" />
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID ORDER</th>
                <th>PELANGGAN</th>
                <th>PRODUK</th>
                <th>TOTAL</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className={styles.orderId}>{transaction.id}</td>
                  <td className={styles.supplier}>{transaction.supplier}</td>
                  <td className={styles.product}>
                    <span className={styles.productName}>{transaction.product}</span>
                    {transaction.date && (
                      <span className={styles.productDate}>{transaction.date}</span>
                    )}
                  </td>
                  <td className={styles.total}>{transaction.total}</td>
                  <td>
                    <span className={`${styles.status} ${styles[getStatusColor(transaction.status)]}`}>
                      {transaction.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RecentTransactions;
