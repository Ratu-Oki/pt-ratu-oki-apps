import React from 'react';
import styles from './RecentTransactions.module.css';

const RecentTransactions = ({ transactions }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Berhasil':
        return 'success';
      case 'Pending':
        return 'pending';
      case 'Diproses':
        return 'processing';
      default:
        return 'default';
    }
  };

  return (
    <div className={styles.transactionContainer}>
      <div className={styles.transactionHeader}>
        <h3>Transaksi Terbaru</h3>
        <a href="#!" className={styles.viewAllLink}>Lihat Semua</a>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID ORDER</th>
              <th>PELANGGGAN</th>
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
    </div>
  );
};

export default RecentTransactions;
