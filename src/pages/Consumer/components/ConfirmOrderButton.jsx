import React, { useState } from 'react';
import { Button, Modal, Alert, Spin } from 'antd';
import { CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { transactionService } from '../../../services/api';

/**
 * ConfirmOrderButton Component
 * 
 * Reusable button to confirm order receipt when order is in transit or delivered.
 * Shows confirmation modal before sending API request.
 * 
 * Props:
 * - orderId: string - Transaction ID/invoice number
 * - orderStatus: string - Current order status (diproses, sedang-dikirim, tiba-tujuan, selesai)
 * - onOrderConfirmed: function - Callback when order is successfully confirmed
 * - className: string - Additional CSS class
 * - disabled: boolean - Disable button (default: false)
 * 
 * Statuses:
 * - "diproses" (being processed) → Button disabled/hidden
 * - "sedang-dikirim" (in transit) → Button enabled ✅
 * - "tiba-tujuan" (arrived) → Button enabled ✅
 * - "selesai" (completed) → Button disabled (already confirmed)
 * 
 * Example:
 * <ConfirmOrderButton
 *   orderId="INV-001"
 *   orderStatus="sedang-dikirim"
 *   onOrderConfirmed={() => {
 *     // Refresh order data or update UI
 *     fetchOrders();
 *   }}
 * />
 */
const ConfirmOrderButton = ({
  orderId,
  orderStatus,
  onOrderConfirmed,
  className = '',
  disabled = false
}) => {
  // Local state management
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  /**
   * Determine if button should be enabled based on order status
   * Enabled only when: sedang-dikirim OR tiba-tujuan
   * Disabled when: diproses, selesai, or custom disabled prop
   */
  const isButtonEnabled = () => {
    if (disabled) return false;
    if (!orderStatus) return false;

    const statusKey = orderStatus.toLowerCase().trim();
    const enabledStatuses = ['sedang-dikirim', 'tiba-tujuan', 'in-transit', 'arrived'];

    return enabledStatuses.includes(statusKey);
  };

  /**
   * Handle button click - show confirmation modal
   */
  const handleButtonClick = () => {
    setErrorMessage(null); // Clear previous errors
    setConfirmModalVisible(true);
  };

  /**
   * Cancel confirmation - just close modal
   */
  const handleCancel = () => {
    setConfirmModalVisible(false);
    setErrorMessage(null);
  };

  /**
   * Confirm order receipt - call backend API
   * Flow:
   * 1. Show loading state
   * 2. Call POST /approve-order
   * 3. On success: close modal + trigger callback to refresh UI
   * 4. On error: show error message to user
   */
  const handleConfirmOrder = async () => {
    if (!orderId) {
      setErrorMessage('ID pesanan tidak ditemukan');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Call backend to confirm order receipt
      const response = await transactionService.approveOrder(orderId);

      if (response.success) {
        // Success - close modal and trigger callback
        setConfirmModalVisible(false);

        // Call parent callback to refresh order data
        if (onOrderConfirmed && typeof onOrderConfirmed === 'function') {
          onOrderConfirmed(response.data);
        }
      } else {
        // Backend returned error in response
        setErrorMessage(
          response.message || 'Gagal mengkonfirmasi pesanan. Silakan coba lagi.'
        );
      }
    } catch (error) {
      // Network or unhandled error
      console.error('Error confirming order:', error);
      setErrorMessage(
        error.message || 'Terjadi kesalahan saat mengkonfirmasi pesanan. Periksa koneksi dan coba lagi.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Button should be visible only if enabled (not in initial states)
  const shouldShowButton = isButtonEnabled();

  if (!shouldShowButton) {
    return null; // Hide button when not applicable
  }

  return (
    <>
      {/* Main Button */}
      <Button
        type="primary"
        size="large"
        block
        icon={<CheckCircleOutlined />}
        onClick={handleButtonClick}
        disabled={isLoading}
        className={className}
        style={{
          background: '#52c41a', // Success green color
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
          '✓ Pesanan Diterima'
        )}
      </Button>

      {/* Confirmation Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ExclamationCircleOutlined style={{ fontSize: 24, color: '#faad14' }} />
            <span>Konfirmasi Pesanan</span>
          </div>
        }
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
        {/* Modal Content */}
        <div style={{ paddingTop: 16 }}>
          {/* Main Question */}
          <p style={{ fontSize: 16, fontWeight: 500, marginBottom: 16, color: '#262626' }}>
            Apakah Anda yakin bahwa barang sudah sesuai dengan pesanan dan dalam kondisi baik?
          </p>

          {/* Checklist */}
          <Alert
            message="Sebelum mengkonfirmasi, pastikan:"
            description={
              <ul style={{ marginBottom: 0, marginTop: 8 }}>
                <li>Barang sesuai dengan pesanan</li>
                <li>Jumlah barang lengkap</li>
                <li>Kemasan dalam kondisi baik</li>
                <li>Tidak ada barang cacat atau rusak</li>
              </ul>
            }
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          {/* Error Message if any */}
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

          {/* Info Message */}
          <p style={{ fontSize: 13, color: '#666', marginTop: 12, marginBottom: 0 }}>
            💡 Setelah dikonfirmasi, pesanan akan ditandai sebagai selesai.
          </p>
        </div>
      </Modal>
    </>
  );
};

export default ConfirmOrderButton;
