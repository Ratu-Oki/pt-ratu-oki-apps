import React from 'react';
import styles from './MetricsCard.module.css';

const MetricsCard = ({ label, value, change, isPositive, icon, bgColor }) => {
  return (
    <div className={styles.card} style={{ borderTopColor: bgColor }}>
      <div className={styles.cardHeader}>
        <div 
          className={styles.iconContainer} 
          style={{ backgroundColor: bgColor }}
        >
          {icon}
        </div>
        <span className={`${styles.changeLabel} ${isPositive ? styles.positive : styles.negative}`}>
          {isPositive ? '↑' : '↓'} {change}
        </span>
      </div>

      <div className={styles.cardContent}>
        <p className={styles.label}>{label}</p>
        <p className={styles.value}>{value}</p>
      </div>
    </div>
  );
};

export default MetricsCard;
