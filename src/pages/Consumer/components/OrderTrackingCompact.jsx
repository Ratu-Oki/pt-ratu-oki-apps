import React from 'react';
import { Steps } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, CarOutlined, HomeOutlined } from '@ant-design/icons';
import styles from './OrderTrackingCompact.module.css';

/**
 * OrderTrackingCompact Component
 * Compact horizontal version of OrderTracking for limited space (Cart, Checkout pages)
 * 
 * Props:
 * - status: string - Order status (pending, paid, shipped, completed, cancelled)
 * - showLabel: boolean - Show step labels (default: false for compact view)
 * - className: string - Additional CSS class
 * 
 * Example:
 * <OrderTrackingCompact status="paid" showLabel={false} />
 */
const OrderTrackingCompact = ({
  status = 'pending',
  showLabel = false,
  className = ''
}) => {
  const getCurrentStep = (orderStatus) => {
    const stepMap = {
      pending: 0,
      paid: 1,
      shipped: 2,
      completed: 3,
      cancelled: -1
    };
    return stepMap[orderStatus] ?? 0;
  };

  const getStepStatus = (orderStatus) => {
    if (orderStatus === 'completed') return 'finish';
    if (orderStatus === 'cancelled') return 'error';
    return 'process';
  };

  const currentStep = getCurrentStep(status);
  const stepStatus = getStepStatus(status);

  const stepsItems = [
    {
      title: showLabel ? 'Diproses' : null,
      icon: <CheckCircleOutlined className={styles.icon} />,
    },
    {
      title: showLabel ? 'Pembayaran' : null,
      icon: <ClockCircleOutlined className={styles.icon} />,
    },
    {
      title: showLabel ? 'Sedang Dikirim' : null,
      icon: <CarOutlined className={styles.icon} />,
    },
    {
      title: showLabel ? 'Tiba di Tujuan' : null,
      icon: <HomeOutlined className={styles.icon} />,
    },
  ];

  return (
    <div className={`${styles.compactContainer} ${className}`}>
      <Steps
        direction="horizontal"
        current={currentStep >= 0 ? currentStep : 0}
        status={stepStatus}
        items={stepsItems}
        labelPlacement="vertical"
        className={styles.compactSteps}
        size="small"
      />
    </div>
  );
};

export default OrderTrackingCompact;
