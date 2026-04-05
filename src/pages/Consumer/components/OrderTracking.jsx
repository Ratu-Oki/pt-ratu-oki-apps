import React from 'react';
import { Steps, Space, Divider } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, CarOutlined, HomeOutlined } from '@ant-design/icons';
import styles from './OrderTracking.module.css';

/**
 * OrderTracking Component
 * Reusable component untuk menampilkan status pesanan dengan visual stepper
 * 
 * Props:
 * - status: string - Status pesanan dari API (pending, paid, shipped, completed, cancelled)
 * - timeline: array - Array timeline dengan struktur { title, time, cancelled }
 * - vertical: boolean - Tampilkan steps secara vertikal (default: true)
 * - showTimeline: boolean - Tampilkan timeline dengan waktu (default: true)
 * 
 * Example:
 * <OrderTracking 
 *   status="shipped" 
 *   timeline={[...]}
 *   vertical={true}
 * />
 */
const OrderTracking = ({
  status = 'pending',
  timeline = [],
  vertical = true,
  showTimeline = true,
  className = ''
}) => {
  /**
   * Get current step index based on status
   */
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

  /**
   * Get step status for Ant Design Steps component
   */
  const getStepStatus = (orderStatus) => {
    if (orderStatus === 'completed') return 'finish';
    if (orderStatus === 'cancelled') return 'error';
    return 'process';
  };

  /**
   * Build default timeline if not provided
   * Default format: Pesanan → Pembayaran → Pengiriman → Diterima
   */
  const buildDefaultTimeline = () => {
    return [
      { 
        step: 0, 
        title: 'Pesanan Dibuat', 
        description: 'Pesanan telah diterima',
        status: 'pending' 
      },
      { 
        step: 1, 
        title: 'Pembayaran Dikonfirmasi', 
        description: 'Pembayaran telah diverifikasi',
        status: 'paid' 
      },
      { 
        step: 2, 
        title: 'Sedang Dikirim', 
        description: 'Paket sedang dalam perjalanan',
        status: 'shipped' 
      },
      { 
        step: 3, 
        title: 'Tiba di Tujuan', 
        description: 'Pesanan telah diterima',
        status: 'completed' 
      }
    ];
  };

  // Use provided timeline or build default
  const timelineData = timeline && timeline.length > 0 ? timeline : buildDefaultTimeline();
  const currentStep = getCurrentStep(status);
  const stepStatus = getStepStatus(status);

  /**
   * Transform timeline to Ant Design Steps format
   */
  const stepsItems = timelineData.map((item, idx) => {
    // Determine if step is completed, current, or pending
    let stepState = 'wait';
    if (idx < currentStep) {
      stepState = 'finish';
    } else if (idx === currentStep && status !== 'cancelled') {
      stepState = 'process';
    } else if (status === 'cancelled') {
      stepState = 'error';
    }

    return {
      title: item.title || `Langkah ${idx + 1}`,
      description: showTimeline && item.time ? (
        <span className={styles.timelineTime}>
          {item.time}
        </span>
      ) : item.description ? (
        <span className={styles.timelineDescription}>
          {item.description}
        </span>
      ) : (
        <span className={styles.timelinePending}>
          Menunggu pembaruan...
        </span>
      ),
      status: stepState,
      icon: getStepIcon(idx, stepState)
    };
  });

  /**
   * Get icon for each step
   */
  const getStepIcon = (stepIndex, stepState) => {
    const iconProps = {
      className: `${styles.stepIcon} ${styles[`stepIcon${stepIndex}`]}`,
      style: { fontSize: 20 }
    };

    switch (stepIndex) {
      case 0:
        return <CheckCircleOutlined {...iconProps} />;
      case 1:
        return <ClockCircleOutlined {...iconProps} />;
      case 2:
        return <CarOutlined {...iconProps} />;
      case 3:
        return <HomeOutlined {...iconProps} />;
      default:
        return null;
    }
  };

  /**
   * Get visual status message
   */
  const getStatusMessage = () => {
    const messages = {
      pending: 'Pesanan Anda sedang menunggu pembayaran.',
      paid: 'Pembayaran telah diterima. Pesanan sedang diproses.',
      shipped: 'Pesanan Anda sedang dalam pengiriman.',
      completed: 'Pesanan Anda telah diterima dengan baik.',
      cancelled: 'Pesanan Anda telah dibatalkan.'
    };
    return messages[status] || 'Status pesanan tidak diketahui.';
  };

  return (
    <div className={`${styles.orderTrackingContainer} ${className}`}>
      {/* Status Header */}
      <div className={styles.statusHeader}>
        <div className={styles.statusMessage}>
          <p className={styles.statusText}>{getStatusMessage()}</p>
        </div>
      </div>

      <Divider style={{ margin: '16px 0' }} />

      {/* Steps/Timeline */}
      <div className={styles.stepsContainer}>
        <Steps
          direction={vertical ? 'vertical' : 'horizontal'}
          current={currentStep >= 0 ? currentStep : 0}
          status={stepStatus}
          items={stepsItems}
          className={styles.stepperUi}
        />
      </div>

      {/* Additional Info */}
      {status === 'shipped' && (
        <div className={styles.trackingInfo}>
          <p className={styles.infoText}>
            🚚 Paket sedang dalam perjalanan menuju alamat tujuan.
          </p>
        </div>
      )}

      {status === 'completed' && (
        <div className={styles.trackingInfo}>
          <p className={styles.successText}>
            ✓ Pesanan telah diterima. Terima kasih atas pembelian Anda!
          </p>
        </div>
      )}

      {status === 'cancelled' && (
        <div className={styles.trackingInfo}>
          <p className={styles.errorText}>
            ✗ Pesanan telah dibatalkan. Hubungi admin untuk informasi lebih lanjut.
          </p>
        </div>
      )}
    </div>
  );
};

export default OrderTracking;
