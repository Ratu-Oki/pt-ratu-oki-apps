import React from 'react';
import { Steps } from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  InboxOutlined,
  CarOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import styles from './OrderTrackingCompact.module.css';

const OrderTrackingCompact = ({
  status = 'pending',
  showLabel = false,
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

  const currentStep = getCurrentStep(status);
  const stepStatus = getStepStatus(status);

  const stepsItems = [
    {
      title: showLabel ? 'Dibuat' : null,
      icon: <CheckCircleOutlined className={styles.icon} />,
    },
    {
      title: showLabel ? 'Proses' : null,
      icon: <ClockCircleOutlined className={styles.icon} />,
    },
    {
      title: showLabel ? 'Kemas' : null,
      icon: <InboxOutlined className={styles.icon} />,
    },
    {
      title: showLabel ? 'Kirim' : null,
      icon: <CarOutlined className={styles.icon} />,
    },
    {
      title: showLabel ? 'Tiba' : null,
      icon: <HomeOutlined className={styles.icon} />,
    },
  ].map((item, index) => {
    let itemStatus = 'wait';

    if (status === 'cancelled') {
      itemStatus = index === 0 ? 'finish' : 'error';
    } else if (status === 'completed' && index <= currentStep) {
      itemStatus = 'finish';
    } else if (index < currentStep) {
      itemStatus = 'finish';
    } else if (index === currentStep) {
      itemStatus = 'process';
    }

    return {
      ...item,
      status: itemStatus,
    };
  });

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
