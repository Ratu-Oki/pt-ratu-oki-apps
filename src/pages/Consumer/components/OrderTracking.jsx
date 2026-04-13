import React from 'react';
import { Steps, Divider } from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  InboxOutlined,
  CarOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import styles from './OrderTracking.module.css';

const DEFAULT_TIMELINE = [
  {
    step: 0,
    title: 'Pesanan Dibuat',
    description: 'Pesanan sudah berhasil dibuat.',
  },
  {
    step: 1,
    title: 'Diproses',
    description: 'Pesanan sedang disiapkan.',
  },
  {
    step: 2,
    title: 'Dikemas',
    description: 'Pesanan sedang dikemas.',
  },
  {
    step: 3,
    title: 'Dikirim',
    description: 'Pesanan sedang menuju alamat tujuan.',
  },
  {
    step: 4,
    title: 'Diterima',
    description: 'Pesanan telah diterima.',
  },
];

/**
 * OrderTracking Component
 * Reusable component untuk menampilkan status pesanan dengan visual stepper.
 */
const OrderTracking = ({
  status = 'pending',
  timeline = [],
  vertical = true,
  showTimeline = true,
  className = '',
}) => {
  const getCurrentStep = (orderStatus) => {
    const stepMap = {
      pending: 0,
      paid: 1,
      processing: 1,
      packed: 2,
      shipped: 3,
      awaiting_approval: 4,
      completed: 4,
      cancelled: -1,
    };

    return stepMap[orderStatus] ?? 0;
  };

  const getStepStatus = (orderStatus) => {
    if (orderStatus === 'completed') return 'finish';
    if (orderStatus === 'cancelled') return 'error';
    return 'process';
  };

  const getStepIcon = (stepIndex) => {
    const iconProps = {
      className: `${styles.stepIcon} ${styles[`stepIcon${stepIndex}`]}`,
      style: { fontSize: 20 },
    };

    switch (stepIndex) {
      case 0:
        return <CheckCircleOutlined {...iconProps} />;
      case 1:
        return <ClockCircleOutlined {...iconProps} />;
      case 2:
        return <InboxOutlined {...iconProps} />;
      case 3:
        return <CarOutlined {...iconProps} />;
      case 4:
        return <HomeOutlined {...iconProps} />;
      default:
        return null;
    }
  };

  const getStatusMessage = () => {
    const messages = {
      pending: 'Pesanan Anda sedang menunggu pembayaran.',
      paid: 'Pembayaran diterima. Pesanan masuk ke tahap diproses.',
      processing: 'Pesanan Anda sedang diproses.',
      packed: 'Pesanan Anda sedang dikemas.',
      shipped: 'Pesanan Anda sedang dalam pengiriman.',
      awaiting_approval: 'Barang diperkirakan sudah sampai. Silakan konfirmasi penerimaan pesanan.',
      completed: 'Pesanan Anda telah diterima dengan baik.',
      cancelled: 'Pesanan Anda telah dibatalkan.',
    };

    return messages[status] || 'Status pesanan tidak diketahui.';
  };

  const timelineData = timeline && timeline.length > 0 ? timeline : DEFAULT_TIMELINE;
  const currentStep = getCurrentStep(status);
  const stepStatus = getStepStatus(status);

  const stepsItems = timelineData.map((item, idx) => {
    let itemStatus = 'wait';

    if (status === 'cancelled') {
      itemStatus = idx === 0 ? 'finish' : 'error';
    } else if (status === 'completed' && idx <= currentStep) {
      itemStatus = 'finish';
    } else if (idx < currentStep) {
      itemStatus = 'finish';
    } else if (idx === currentStep && status !== 'cancelled') {
      itemStatus = 'process';
    }

    return {
      title: item.title || `Langkah ${idx + 1}`,
      description: showTimeline && item.time ? (
        <span className={styles.timelineTime}>{item.time}</span>
      ) : item.description ? (
        <span className={styles.timelineDescription}>{item.description}</span>
      ) : (
        <span className={styles.timelinePending}>Menunggu pembaruan...</span>
      ),
      status: itemStatus,
      icon: getStepIcon(idx),
    };
  });

  return (
    <div className={`${styles.orderTrackingContainer} ${className}`}>
      <div className={styles.statusHeader}>
        <div className={styles.statusMessage}>
          <p className={styles.statusText}>{getStatusMessage()}</p>
        </div>
      </div>

      <Divider style={{ margin: '16px 0' }} />

      <div className={styles.stepsContainer}>
        <Steps
          direction={vertical ? 'vertical' : 'horizontal'}
          current={currentStep >= 0 ? currentStep : 0}
          status={stepStatus}
          items={stepsItems}
          className={styles.stepperUi}
        />
      </div>

      {status === 'packed' && (
        <div className={styles.trackingInfo}>
          <p className={styles.infoText}>
            Pesanan sudah selesai disiapkan dan sedang masuk tahap pengemasan.
          </p>
        </div>
      )}

      {status === 'shipped' && (
        <div className={styles.trackingInfo}>
          <p className={styles.infoText}>
            Paket sedang dalam perjalanan menuju alamat tujuan.
          </p>
        </div>
      )}

      {status === 'awaiting_approval' && (
        <div className={styles.trackingInfo}>
          <p className={styles.infoText}>
            Pengiriman selesai. Mohon konfirmasi jika barang sudah sampai dan sesuai pesanan.
          </p>
        </div>
      )}

      {status === 'completed' && (
        <div className={styles.trackingInfo}>
          <p className={styles.successText}>
            Pesanan telah selesai. Terima kasih atas pembelian Anda.
          </p>
        </div>
      )}

      {status === 'cancelled' && (
        <div className={styles.trackingInfo}>
          <p className={styles.errorText}>
            Pesanan telah dibatalkan. Hubungi admin untuk informasi lebih lanjut.
          </p>
        </div>
      )}
    </div>
  );
};

export default OrderTracking;
