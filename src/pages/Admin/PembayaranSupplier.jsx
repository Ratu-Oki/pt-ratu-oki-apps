/**
 * PembayaranSupplier Page
 * Halaman untuk admin mengelola pembayaran ke supplier
 */
import React, { useState, useEffect, useCallback } from 'react';
import styles from './PembayaranSupplier.module.css';
import AdminLayout from './components/AdminLayout';
import MetricsCard from './components/MetricsCard';
import { paymentService, stockService } from '../../services/api';
import { Spin, message, Modal, Select, Input, Tag, Empty, Tabs, Button, Badge } from 'antd';

const PembayaranSupplier = () => {
    const [loading, setLoading] = useState(true);
    const [payments, setPayments] = useState([]);
    const [pendingSupplies, setPendingSupplies] = useState([]);
    const [summary, setSummary] = useState({});
    const [activeTab, setActiveTab] = useState('payments');

    // Modal states
    const [payModal, setPayModal] = useState({ visible: false, supply: null, paymentType: 'qris', step: 1, paymentData: null });
    const [detailModal, setDetailModal] = useState({ visible: false, payment: null });
    const [disbursementModal, setDisbursementModal] = useState({ visible: false, payment: null, status: 'completed', ref: '' });
    const [processing, setProcessing] = useState(false);

    // Fetch data
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [paymentsRes, summaryRes, suppliesRes] = await Promise.all([
                paymentService.getAll({ page: 1, limit: 50 }).catch(() => ({ data: { payments: [] } })),
                paymentService.getSummary().catch(() => ({ data: {} })),
                stockService.getAllSupplies({ status: 'approved' }).catch(() => ({ data: [] }))
            ]);

            // Handle payments response
            let paymentsData = paymentsRes.data?.payments || paymentsRes.data || [];
            if (Array.isArray(paymentsRes.data)) paymentsData = paymentsRes.data;

            setPayments(paymentsData);
            setSummary(summaryRes.data || {});

            // Filter approved supplies that don't have pending/settlement payment
            let suppliesData = [];
            if (Array.isArray(suppliesRes.data)) {
                suppliesData = suppliesRes.data;
            } else if (suppliesRes.data?.supplies) {
                suppliesData = suppliesRes.data.supplies;
            }

            // Filter untuk supply yang sudah approved tapi belum dibayar
            const approvedSupplies = suppliesData.filter(s => s.status_produk === 'approved');
            const paidSupplyIds = paymentsData
                .filter(p => ['pending', 'processing', 'settlement'].includes(p.status))
                .map(p => p.supply_id);

            const unpaidSupplies = approvedSupplies.filter(s => !paidSupplyIds.includes(s.id));
            setPendingSupplies(unpaidSupplies);

        } catch (error) {
            console.error('Error fetching data:', error);
            message.error('Gagal memuat data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount || 0);
    };

    // Format date
    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    // Get status color
    const getStatusColor = (status) => {
        const colors = {
            pending: '#F39C12',
            processing: '#3498DB',
            settlement: '#27AE60',
            expire: '#95A5A6',
            cancel: '#E74C3C',
            deny: '#E74C3C',
            refund: '#9B59B6'
        };
        return colors[status] || '#95A5A6';
    };

    const getDisbursementColor = (status) => {
        const colors = {
            pending: '#F39C12',
            processing: '#3498DB',
            completed: '#27AE60',
            failed: '#E74C3C'
        };
        return colors[status] || '#95A5A6';
    };

    // Create payment
    const handleCreatePayment = async () => {

        setProcessing(true);
        try {
            console.log('Creating payment...');
            const response = await paymentService.create({
                supply_id: payModal.supply.id,
                payment_type: payModal.paymentType
            });

            console.log('Payment response:', response);

            // paymentService.create returns response.data directly
            // so midtrans data is at response.midtrans (not response.data.midtrans)
            const midtransData = response.midtrans || response.data?.midtrans || {};
            console.log('Midtrans data:', midtransData);

            message.success('Pembayaran dibuat, silakan selesaikan pembayaran');

            // Move to step 2 with payment data
            setPayModal(prev => ({
                ...prev,
                step: 2,
                paymentData: midtransData
            }));

        } catch (error) {
            console.log('Error object:', error);
            console.error('Create payment error:', error);
            message.error(error.message || 'Gagal membuat pembayaran');
        } finally {
            setProcessing(false);
        }
    };

    // Update disbursement
    const handleUpdateDisbursement = async () => {
        if (!disbursementModal.payment) return;

        setProcessing(true);
        try {
            await paymentService.updateDisbursement(
                disbursementModal.payment.id,
                disbursementModal.status,
                disbursementModal.ref
            );

            message.success('Status pencairan berhasil diupdate');
            setDisbursementModal({ visible: false, payment: null, status: 'completed', ref: '' });
            fetchData();
        } catch (error) {
            console.error('Update disbursement error:', error);
            message.error(error.message || 'Gagal update pencairan');
        } finally {
            setProcessing(false);
        }
    };

    // Metrics
    const metrics = [
        {
            id: 1,
            label: 'Total Settlement',
            value: formatCurrency(summary.total_settlement || 0),
            icon: '💰',
            bgColor: '#27AE60'
        },
        {
            id: 2,
            label: 'Sudah Dicairkan',
            value: formatCurrency(summary.total_disbursed || 0),
            icon: '✅',
            bgColor: '#2D7A52'
        },
        {
            id: 3,
            label: 'Menunggu Pencairan',
            value: formatCurrency(summary.pending_disbursement || 0),
            icon: '⏳',
            bgColor: '#F39C12'
        },
        {
            id: 4,
            label: 'Perlu Dibayar',
            value: pendingSupplies.length.toString(),
            icon: '📋',
            bgColor: '#3498DB'
        }
    ];

    const tabItems = [
        {
            key: 'payments',
            label: (
                <span>
                    💳 Daftar Pembayaran
                    <Badge count={payments.filter(p => p.status === 'settlement' && p.disbursement_status !== 'completed').length} offset={[8, 0]} />
                </span>
            ),
        },
        {
            key: 'pending',
            label: (
                <span>
                    📦 Supply Belum Dibayar
                    <Badge count={pendingSupplies.length} offset={[8, 0]} />
                </span>
            ),
        }
    ];

    if (loading) {
        return (
            <AdminLayout headerType="simple" title="Pembayaran Supplier">
                <div style={{ display: 'flex', justifyContent: 'center', padding: 50 }}>
                    <Spin size="large" />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout headerType="simple" title="Pembayaran Supplier" subTitle="Kelola pembayaran ke supplier">
            <div className={styles.container}>
                {/* Metrics */}
                <div className={styles.metricsGrid}>
                    {metrics.map(metric => (
                        <MetricsCard key={metric.id} {...metric} />
                    ))}
                </div>

                {/* Tabs */}
                <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />

                {activeTab === 'payments' ? (
                    /* Payments Table */
                    <div className={styles.tableContainer}>
                        {payments.length === 0 ? (
                            <Empty description="Belum ada pembayaran" />
                        ) : (
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>INVOICE</th>
                                        <th>SUPPLIER</th>
                                        <th>SUPPLY</th>
                                        <th>JUMLAH</th>
                                        <th>STATUS</th>
                                        <th>PENCAIRAN</th>
                                        <th>AKSI</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.map((payment) => (
                                        <tr key={payment.id}>
                                            <td className={styles.invoice}>
                                                <span onClick={() => setDetailModal({ visible: true, payment })}>
                                                    {payment.invoice_number}
                                                </span>
                                            </td>
                                            <td>{payment.supplier?.nama || '-'}</td>
                                            <td>Supply #{payment.supply_id}</td>
                                            <td className={styles.amount}>{formatCurrency(payment.amount)}</td>
                                            <td>
                                                <Tag color={getStatusColor(payment.status)}>
                                                    {payment.status?.toUpperCase()}
                                                </Tag>
                                            </td>
                                            <td>
                                                <Tag color={getDisbursementColor(payment.disbursement_status)}>
                                                    {payment.disbursement_status?.toUpperCase()}
                                                </Tag>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: 8 }}>
                                                    <Button
                                                        size="small"
                                                        onClick={() => setDetailModal({ visible: true, payment })}
                                                    >
                                                        Detail
                                                    </Button>
                                                    {payment.status === 'settlement' && payment.disbursement_status !== 'completed' && (
                                                        <Button
                                                            size="small"
                                                            type="primary"
                                                            onClick={() => setDisbursementModal({
                                                                visible: true,
                                                                payment,
                                                                status: 'completed',
                                                                ref: ''
                                                            })}
                                                        >
                                                            Cairkan
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                ) : (
                    /* Pending Supplies Table */
                    <div className={styles.tableContainer}>
                        {pendingSupplies.length === 0 ? (
                            <Empty description="Semua supply sudah dibayar" />
                        ) : (
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>SUPPLIER</th>
                                        <th>PRODUK</th>
                                        <th>JUMLAH</th>
                                        <th>TOTAL</th>
                                        <th>TANGGAL</th>
                                        <th>AKSI</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingSupplies.map((supply) => (
                                        <tr key={supply.id}>
                                            <td>#{supply.id}</td>
                                            <td>{supply.supplier?.nama || '-'}</td>
                                            <td>{supply.product?.nama_produk || `Produk #${supply.product_id}`}</td>
                                            <td>{supply.jumlah} unit</td>
                                            <td className={styles.amount}>
                                                {formatCurrency(supply.jumlah * supply.harga_supply)}
                                            </td>
                                            <td>{formatDate(supply.createdAt)}</td>
                                            <td>
                                                <Button
                                                    type="primary"
                                                    onClick={() => setPayModal({ visible: true, supply, paymentType: 'qris', step: 1, paymentData: null })}
                                                >
                                                    💳 Bayar
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>

            {/* Create Payment Modal - Two Steps */}
            <Modal
                title={payModal.step === 2 ? "Pembayaran" : "Buat Pembayaran"}
                open={payModal.visible}
                onCancel={() => {
                    // Stop polling jika ada
                    if (payModal.pollInterval) clearInterval(payModal.pollInterval);
                    setPayModal({ visible: false, supply: null, paymentType: 'qris', step: 1, paymentData: null, pollInterval: null });
                }}
                footer={payModal.step === 1 ? [
                    <Button key="cancel" onClick={() => setPayModal({ visible: false, supply: null, paymentType: 'qris', step: 1 })}>
                        Batal
                    </Button>,
                    <Button key="submit" type="primary" loading={processing} onClick={handleCreatePayment}>
                        Lanjut Bayar
                    </Button>
                ] : [
                    <Button key="close" onClick={() => {
                        if (payModal.pollInterval) clearInterval(payModal.pollInterval);
                        setPayModal({ visible: false, supply: null, paymentType: 'qris', step: 1, paymentData: null, pollInterval: null });
                        fetchData();
                    }}>
                        Tutup
                    </Button>
                ]}
                width={payModal.step === 2 ? 500 : 450}
            >
                {payModal.step === 1 && payModal.supply && (
                    <div>
                        <div style={{ background: '#f5f5f5', padding: 12, borderRadius: 8, marginBottom: 16 }}>
                            <p><strong>Supplier:</strong> {payModal.supply.supplier?.nama}</p>
                            <p><strong>Produk:</strong> {payModal.supply.product?.nama_produk}</p>
                            <p style={{ marginBottom: 0 }}><strong>Jumlah:</strong> {payModal.supply.jumlah} unit × {formatCurrency(payModal.supply.harga_supply)}</p>
                        </div>
                        <p style={{ fontSize: 20, color: '#27AE60', textAlign: 'center', margin: '16px 0' }}>
                            <strong>Total: {formatCurrency(payModal.supply.jumlah * payModal.supply.harga_supply)}</strong>
                        </p>
                        <div>
                            <label><strong>Pilih Metode Pembayaran:</strong></label>
                            <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                                {[
                                    { value: 'qris', label: 'QRIS', icon: '📱', desc: 'Scan QR Code' },
                                    { value: 'gopay', label: 'GoPay', icon: '💚', desc: 'Redirect' },
                                    { value: 'shopeepay', label: 'ShopeePay', icon: '🧡', desc: 'Redirect' }
                                ].map(method => (
                                    <div
                                        key={method.value}
                                        onClick={() => setPayModal(prev => ({ ...prev, paymentType: method.value }))}
                                        style={{
                                            flex: 1,
                                            padding: 16,
                                            border: payModal.paymentType === method.value ? '2px solid #27AE60' : '1px solid #d9d9d9',
                                            borderRadius: 8,
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                            background: payModal.paymentType === method.value ? '#f6ffed' : '#fff'
                                        }}
                                    >
                                        <div style={{ fontSize: 24 }}>{method.icon}</div>
                                        <div style={{ fontWeight: 600 }}>{method.label}</div>
                                        <div style={{ fontSize: 11, color: '#888' }}>{method.desc}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {payModal.step === 2 && payModal.paymentData && (
                    <div style={{ textAlign: 'center' }}>
                        {/* QRIS - Show QR Code */}
                        {payModal.paymentType === 'qris' && (
                            <div>
                                <p style={{ marginBottom: 16 }}>Scan QR Code berikut dengan aplikasi E-Wallet Anda:</p>
                                {(() => {
                                    // Generate QR URL from qr_string if qr_code_url not available
                                    const qrUrl = payModal.paymentData.qr_code_url ||
                                        (payModal.paymentData.qr_string ?
                                            `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(payModal.paymentData.qr_string)}` :
                                            null);

                                    if (qrUrl) {
                                        return (
                                            <div style={{ background: '#fff', padding: 20, borderRadius: 12, display: 'inline-block', boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}>
                                                <img
                                                    src={qrUrl}
                                                    alt="QR Code"
                                                    style={{ width: 250, height: 250 }}
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.nextSibling.style.display = 'block';
                                                    }}
                                                />
                                                <p style={{ display: 'none', color: '#E74C3C' }}>Gagal memuat QR Code</p>
                                            </div>
                                        );
                                    } else if (payModal.paymentData.payment_url) {
                                        return (
                                            <div>
                                                <p>QR Code tidak tersedia langsung. Silakan buka link berikut:</p>
                                                <Button type="primary" size="large" href={payModal.paymentData.payment_url} target="_blank">
                                                    Buka Halaman Pembayaran
                                                </Button>
                                            </div>
                                        );
                                    } else {
                                        return <p style={{ color: '#F39C12' }}>QR Code tidak tersedia. Silakan coba metode pembayaran lain.</p>;
                                    }
                                })()}
                                <p style={{ marginTop: 16, color: '#888', fontSize: 12 }}>
                                    Total: <strong>{formatCurrency(payModal.supply?.jumlah * payModal.supply?.harga_supply)}</strong>
                                </p>
                            </div>
                        )}

                        {/* E-Wallet - Show Redirect Buttons */}
                        {(payModal.paymentType === 'gopay' || payModal.paymentType === 'shopeepay') && (
                            <div>
                                <div style={{ fontSize: 64, marginBottom: 16 }}>
                                    {payModal.paymentType === 'gopay' ? '💚' : '🧡'}
                                </div>
                                <p style={{ marginBottom: 20 }}>
                                    Klik tombol di bawah untuk melanjutkan pembayaran via {payModal.paymentType === 'gopay' ? 'GoPay' : 'ShopeePay'}
                                </p>
                                {payModal.paymentData.payment_url ? (
                                    <Button
                                        type="primary"
                                        size="large"
                                        style={{
                                            background: payModal.paymentType === 'gopay' ? '#00AA13' : '#EE4D2D',
                                            borderColor: payModal.paymentType === 'gopay' ? '#00AA13' : '#EE4D2D'
                                        }}
                                        href={payModal.paymentData.payment_url}
                                        target="_blank"
                                    >
                                        Bayar dengan {payModal.paymentType === 'gopay' ? 'GoPay' : 'ShopeePay'}
                                    </Button>
                                ) : (
                                    <p style={{ color: '#F39C12' }}>Link pembayaran tidak tersedia. Silakan coba lagi.</p>
                                )}
                                <p style={{ marginTop: 20, color: '#888', fontSize: 12 }}>
                                    Total: <strong>{formatCurrency(payModal.supply?.jumlah * payModal.supply?.harga_supply)}</strong>
                                </p>
                            </div>
                        )}

                        <div style={{ marginTop: 24, padding: 12, background: '#fffbe6', borderRadius: 8 }}>
                            <p style={{ margin: 0, fontSize: 12 }}>
                                ⏳ Status akan diperbarui otomatis setelah pembayaran berhasil
                            </p>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Payment Detail Modal */}
            <Modal
                title="Detail Pembayaran"
                open={detailModal.visible}
                onCancel={() => setDetailModal({ visible: false, payment: null })}
                footer={null}
                width={600}
            >
                {detailModal.payment && (
                    <div className={styles.detailGrid}>
                        <div className={styles.detailRow}>
                            <span>Invoice:</span>
                            <strong>{detailModal.payment.invoice_number}</strong>
                        </div>
                        <div className={styles.detailRow}>
                            <span>Supplier:</span>
                            <strong>{detailModal.payment.supplier?.nama}</strong>
                        </div>
                        <div className={styles.detailRow}>
                            <span>Jumlah:</span>
                            <strong>{formatCurrency(detailModal.payment.amount)}</strong>
                        </div>
                        <div className={styles.detailRow}>
                            <span>Fee Midtrans:</span>
                            <strong>{formatCurrency(detailModal.payment.fee_midtrans)}</strong>
                        </div>
                        <div className={styles.detailRow}>
                            <span>Net Amount:</span>
                            <strong>{formatCurrency(detailModal.payment.net_amount)}</strong>
                        </div>
                        <div className={styles.detailRow}>
                            <span>Status:</span>
                            <Tag color={getStatusColor(detailModal.payment.status)}>
                                {detailModal.payment.status?.toUpperCase()}
                            </Tag>
                        </div>
                        <div className={styles.detailRow}>
                            <span>Metode:</span>
                            <strong>{detailModal.payment.payment_type?.toUpperCase()}</strong>
                        </div>
                        <div className={styles.detailRow}>
                            <span>Tanggal Bayar:</span>
                            <strong>{formatDate(detailModal.payment.payment_date)}</strong>
                        </div>
                        <div className={styles.detailRow}>
                            <span>Disbursement:</span>
                            <Tag color={getDisbursementColor(detailModal.payment.disbursement_status)}>
                                {detailModal.payment.disbursement_status?.toUpperCase()}
                            </Tag>
                        </div>
                        {detailModal.payment.disbursement_date && (
                            <div className={styles.detailRow}>
                                <span>Tanggal Cair:</span>
                                <strong>{formatDate(detailModal.payment.disbursement_date)}</strong>
                            </div>
                        )}
                        {detailModal.payment.supplier_bank_name && (
                            <>
                                <div className={styles.detailRow}>
                                    <span>Bank:</span>
                                    <strong>{detailModal.payment.supplier_bank_name}</strong>
                                </div>
                                <div className={styles.detailRow}>
                                    <span>No. Rekening:</span>
                                    <strong>{detailModal.payment.supplier_bank_account}</strong>
                                </div>
                                <div className={styles.detailRow}>
                                    <span>Atas Nama:</span>
                                    <strong>{detailModal.payment.supplier_account_name}</strong>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </Modal>

            {/* Disbursement Modal */}
            <Modal
                title="Update Pencairan"
                open={disbursementModal.visible}
                onOk={handleUpdateDisbursement}
                onCancel={() => setDisbursementModal({ visible: false, payment: null, status: 'completed', ref: '' })}
                confirmLoading={processing}
                okText="Update"
                cancelText="Batal"
            >
                {disbursementModal.payment && (
                    <div>
                        <p><strong>Invoice:</strong> {disbursementModal.payment.invoice_number}</p>
                        <p><strong>Supplier:</strong> {disbursementModal.payment.supplier?.nama}</p>
                        <p><strong>Jumlah:</strong> {formatCurrency(disbursementModal.payment.net_amount || disbursementModal.payment.amount)}</p>

                        <div style={{ marginTop: 16 }}>
                            <label>Status Pencairan:</label>
                            <Select
                                style={{ width: '100%', marginTop: 8 }}
                                value={disbursementModal.status}
                                onChange={(value) => setDisbursementModal(prev => ({ ...prev, status: value }))}
                            >
                                <Select.Option value="processing">Processing</Select.Option>
                                <Select.Option value="completed">Completed</Select.Option>
                                <Select.Option value="failed">Failed</Select.Option>
                            </Select>
                        </div>

                        <div style={{ marginTop: 16 }}>
                            <label>Referensi Transfer:</label>
                            <Input
                                style={{ marginTop: 8 }}
                                value={disbursementModal.ref}
                                onChange={(e) => setDisbursementModal(prev => ({ ...prev, ref: e.target.value }))}
                                placeholder="No. bukti transfer (opsional)"
                            />
                        </div>
                    </div>
                )}
            </Modal>
        </AdminLayout>
    );
};

export default PembayaranSupplier;
