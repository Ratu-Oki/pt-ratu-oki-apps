import React, { useState } from 'react';
import { Button, Modal, Alert, Spin } from 'antd';
import { CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { transactionService } from '../../../services/api';

/**
 * ConfirmOrderButton Component
 *
 * Reusable button to confirm order receipt when order is already shipped.
 */
const ConfirmOrderButton = ({
  orderId,
  orderStatus,
  actualStatus,
  onOrderConfirmed,
  className = '',
  disabled = false,
}) => {
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const isButtonEnabled = () => {
    if (disabled || !orderStatus) return false;

    const displayStatusKey = orderStatus.toLowerCase().trim();
    const actualStatusKey = actualStatus?.toLowerCase().trim();

    return displayStatusKey === 'awaiting_approval'
      && ['paid', 'diproses/dikemas', 'shipped'].includes(actualStatusKey);
  };

  const handleButtonClick = () => {
    setErrorMessage(null);
    setConfirmModalVisible(true);
  };

  const handleCancel = () => {
    setConfirmModalVisible(false);
    setErrorMessage(null);
  };

  const handleConfirmOrder = async () => {
    if (!orderId) {
      setErrorMessage('ID pesanan tidak ditemukan');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await transactionService.approveOrder(orderId);

      if (response.success) {
        setConfirmModalVisible(false);

        if (typeof onOrderConfirmed === 'function') {
          onOrderConfirmed(response.data);
        }
      } else {
        setErrorMessage(
          response.message || 'Gagal mengkonfirmasi pesanan. Silakan coba lagi.',
        );
      }
    } catch (error) {
      console.error('Error confirming order:', error);
      setErrorMessage(
        error.message || 'Terjadi kesalahan saat mengkonfirmasi pesanan. Periksa koneksi dan coba lagi.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isButtonEnabled()) {
    return null;
  }

  return (
    <>
      <Button
        type="primary"
        size="large"
        block
        icon={<CheckCircleOutlined />}
        onClick={handleButtonClick}
        disabled={isLoading}
        className={className}
        style={{
          background: '#52c41a',
          borderColor: '#52c41a',
          height: 48,
          fontSize: 16,
          fontWeight: 600,
          borderRadius: 8,
        }}
      >
        {isLoading ? (
          <>
            <Spin size="small" style={{ marginRight: 8 }} />
            Memproses...
          </>
        ) : (
          'Pesanan Diterima'
        )}
      </Button>

      <Modal
        title={(
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ExclamationCircleOutlined style={{ fontSize: 24, color: '#faad14' }} />
            <span>Konfirmasi Pesanan</span>
          </div>
        )}
        open={confirmModalVisible}
        onCancel={handleCancel}
        onOk={handleConfirmOrder}
        okText="Ya, Sudah Diterima"
        cancelText="Batal"
        confirmLoading={isLoading}
        centered
        width={450}
        maskClosable={false}
        okButtonProps={{
          style: {
            background: '#52c41a',
            borderColor: '#52c41a',
          },
        }}
      >
        <div style={{ paddingTop: 16 }}>
          <p style={{ fontSize: 16, fontWeight: 500, marginBottom: 16, color: '#262626' }}>
            Apakah Anda yakin bahwa barang sudah sesuai dengan pesanan dan dalam kondisi baik?
          </p>

          <Alert
            message="Sebelum mengkonfirmasi, pastikan:"
            description={(
              <ul style={{ marginBottom: 0, marginTop: 8 }}>
                <li>Barang sesuai dengan pesanan</li>
                <li>Jumlah barang lengkap</li>
                <li>Kemasan dalam kondisi baik</li>
                <li>Tidak ada barang cacat atau rusak</li>
              </ul>
            )}
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          {errorMessage && (
            <Alert
              message="Gagal Mengkonfirmasi Pesanan"
              description={errorMessage}
              type="error"
              showIcon
              closable
              onClose={() => setErrorMessage(null)}
              style={{ marginBottom: 16 }}
            />
          )}

          <p style={{ fontSize: 13, color: '#666', marginTop: 12, marginBottom: 0 }}>
            Setelah dikonfirmasi, pesanan akan ditandai sebagai selesai.
          </p>
        </div>
      </Modal>
    </>
  );
};

export default ConfirmOrderButton;
