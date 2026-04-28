/**
 * PembayaranSupplier Page
 * Halaman untuk admin mengelola pembayaran ke supplier
 */
import React, { useState, useEffect, useCallback } from 'react';
import styles from './PembayaranSupplier.module.css';
import AdminLayout from './components/AdminLayout';
import MetricsCard from './components/MetricsCard';
import { paymentService, stockService, bankAccountService } from '../../services/api';
import { Spin, message, Modal, Tag, Empty, Tabs, Button, Badge, Form, Input, InputNumber, Alert } from 'antd';
import { DollarOutlined, ClockCircleOutlined, PlusOutlined, WalletOutlined } from '@ant-design/icons';

const PembayaranSupplier = () => {
    const [loading, setLoading] = useState(true);
    const [payments, setPayments] = useState([]);
    const [pendingSupplies, setPendingSupplies] = useState([]);
    const [summary, setSummary] = useState({});
    const [activeTab, setActiveTab] = useState('payments');

    const [payModal, setPayModal] = useState({ visible: false, supply: null });
    const [topupModal, setTopupModal] = useState({ visible: false });
    const [detailModal, setDetailModal] = useState({ visible: false, payment: null });
    const [supplierBankAccounts, setSupplierBankAccounts] = useState([]);
    const [bankLoading, setBankLoading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [topupForm] = Form.useForm();

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [paymentsRes, summaryRes, suppliesRes] = await Promise.all([
                paymentService.getAll({ page: 1, limit: 50 }).catch(() => ({ data: { payments: [] } })),
                paymentService.getSummary().catch(() => ({ data: {} })),
                stockService.getAllSupplies({ status: 'approved' }).catch(() => ({ data: [] }))
            ]);

            let paymentsData = paymentsRes.data?.payments || paymentsRes.data || [];
            if (Array.isArray(paymentsRes.data)) paymentsData = paymentsRes.data;

            setPayments(paymentsData);
            setSummary(summaryRes.data || {});

            let suppliesData = [];
            if (Array.isArray(suppliesRes.data)) {
                suppliesData = suppliesRes.data;
            } else if (suppliesRes.data?.supplies) {
                suppliesData = suppliesRes.data.supplies;
            }

            const approvedSupplies = suppliesData.filter((s) => s.status_produk === 'approved');
            const paidSupplyIds = paymentsData
                .filter((p) => ['pending', 'processing', 'settlement'].includes(p.status))
                .map((p) => p.supply_id);

            setPendingSupplies(approvedSupplies.filter((s) => !paidSupplyIds.includes(s.id)));
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

    useEffect(() => {
        const fetchSupplierBankAccounts = async () => {
            if (!payModal.visible || !payModal.supply?.supplier_id) {
                setSupplierBankAccounts([]);
                return;
            }

            setBankLoading(true);
            try {
                const response = await bankAccountService.getAll({
                    supplier_id: payModal.supply.supplier_id
                });

                const accounts = Array.isArray(response.data) ? response.data : [];
                setSupplierBankAccounts(accounts);
            } catch (error) {
                console.error('Fetch supplier bank accounts error:', error);
                setSupplierBankAccounts([]);
                message.error(error.message || 'Gagal memuat rekening supplier');
            } finally {
                setBankLoading(false);
            }
        };

        fetchSupplierBankAccounts();
    }, [payModal.visible, payModal.supply?.supplier_id]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount || 0);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

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

    const handleCreatePayment = async () => {
        if (!payModal.supply) return;

        setProcessing(true);
        try {
            const defaultBank = supplierBankAccounts.find((account) => account.is_default);

            if (!defaultBank) {
                message.error('Supplier belum memiliki rekening default. Minta supplier mengisi rekening dummy terlebih dahulu.');
                return;
            }

            const response = await paymentService.createFromCompanyBalance({
                supply_id: payModal.supply.id
            });

            const remainingBalance = response.data?.company_balance_remaining;
            const balanceInfo = typeof remainingBalance === 'number'
                ? ` Sisa saldo perusahaan: ${formatCurrency(remainingBalance)}.`
                : '';

            message.success(`Pembayaran supplier berhasil dibuat.${balanceInfo}`);
            setPayModal({ visible: false, supply: null });
            fetchData();
        } catch (error) {
            console.error('Create payment error:', error);
            message.error(error.message || 'Gagal membuat pembayaran');
        } finally {
            setProcessing(false);
        }
    };

    const handleTopupCompanyBalance = async () => {
        try {
            const values = await topupForm.validateFields();
            setProcessing(true);

            const response = await paymentService.topUpCompanyBalance({
                amount: values.amount,
                notes: values.notes || ''
            });

            const companyBalance = response.data?.company_balance;
            const balanceInfo = typeof companyBalance === 'number'
                ? ` Saldo sekarang: ${formatCurrency(companyBalance)}.`
                : '';

            message.success(`Topup saldo perusahaan berhasil.${balanceInfo}`);
            setTopupModal({ visible: false });
            topupForm.resetFields();
            fetchData();
        } catch (error) {
            if (error?.errorFields) return;
            console.error('Topup company balance error:', error);
            message.error(error.message || 'Gagal topup saldo perusahaan');
        } finally {
            setProcessing(false);
        }
    };

    const metrics = [
        {
            id: 1,
            label: 'Saldo Perusahaan',
            value: formatCurrency(summary.company_balance || 0),
            icon: <WalletOutlined />,
            bgColor: '#8E44AD'
        },
        {
            id: 2,
            label: 'Total Settlement',
            value: formatCurrency(summary.total_settlement || 0),
            icon: <DollarOutlined />,
            bgColor: '#27AE60'
        },
        {
            id: 3,
            label: 'Perlu Dibayar',
            value: pendingSupplies.length.toString(),
            icon: <ClockCircleOutlined />,
            bgColor: '#F39C12'
        }
    ];

    const selectedDefaultBank = supplierBankAccounts.find((account) => account.is_default);

    const tabItems = [
        {
            key: 'payments',
            label: (
                <span>
                    Daftar Pembayaran
                    <Badge count={payments.length} offset={[8, 0]} />
                </span>
            )
        },
        {
            key: 'pending',
            label: (
                <span>
                    Supply Belum Dibayar
                    <Badge count={pendingSupplies.length} offset={[8, 0]} />
                </span>
            )
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
                <div className={styles.actionBar}>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setTopupModal({ visible: true })}
                    >
                        Topup Saldo Perusahaan
                    </Button>
                </div>

                <div className={styles.metricsGrid}>
                    {metrics.map((metric) => (
                        <MetricsCard key={metric.id} {...metric} />
                    ))}
                </div>

                <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />

                {activeTab === 'payments' ? (
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
                                                <Button size="small" onClick={() => setDetailModal({ visible: true, payment })}>
                                                    Detail
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                ) : (
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
                                                    onClick={() => setPayModal({ visible: true, supply })}
                                                >
                                                    Bayar
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

            <Modal
                title="Bayar Supplier"
                open={payModal.visible}
                onCancel={() => setPayModal({ visible: false, supply: null })}
                footer={[
                    <Button key="cancel" onClick={() => setPayModal({ visible: false, supply: null })}>
                        Batal
                    </Button>,
                    <Button key="submit" type="primary" loading={processing} onClick={handleCreatePayment}>
                        Buat Pembayaran
                    </Button>
                ]}
                width={480}
            >
                {payModal.supply && (
                    <div>
                        <div style={{ background: '#f5f5f5', padding: 12, borderRadius: 8, marginBottom: 16 }}>
                            <p><strong>Supplier:</strong> {payModal.supply.supplier?.nama}</p>
                            <p><strong>Produk:</strong> {payModal.supply.product?.nama_produk}</p>
                            <p style={{ marginBottom: 0 }}>
                                <strong>Jumlah:</strong> {payModal.supply.jumlah} unit x {formatCurrency(payModal.supply.harga_supply)}
                            </p>
                        </div>
                        <p style={{ fontSize: 20, color: '#27AE60', textAlign: 'center', margin: '16px 0' }}>
                            <strong>Total: {formatCurrency(payModal.supply.jumlah * payModal.supply.harga_supply)}</strong>
                        </p>
                        <div style={{ marginBottom: 16 }}>
                            <strong>Rekening Supplier</strong>
                            {bankLoading ? (
                                <div style={{ marginTop: 8 }}><Spin size="small" /> Memuat rekening...</div>
                            ) : selectedDefaultBank ? (
                                <div style={{ background: '#f5f5f5', padding: 12, borderRadius: 8, marginTop: 8 }}>
                                    <p><strong>Bank:</strong> {selectedDefaultBank.bank_name}</p>
                                    <p><strong>No. Rekening:</strong> {selectedDefaultBank.account_number}</p>
                                    <p><strong>Nama:</strong> {selectedDefaultBank.account_name}</p>
                                    <Tag color="blue">DATA DUMMY</Tag>
                                </div>
                            ) : (
                                <Alert
                                    style={{ marginTop: 8 }}
                                    type="warning"
                                    showIcon
                                    message="Supplier belum memiliki rekening default"
                                    description="Pembayaran bisa dilanjutkan setelah supplier mengisi data rekening dummy dan menjadikannya default."
                                />
                            )}
                        </div>
                        <div style={{ padding: 12, background: '#fff7e6', borderRadius: 8, color: '#8c5a00' }}>
                            Dana pembayaran ini akan dipotong dari saldo internal perusahaan. Data rekening hanya dipakai sebagai catatan pembayaran.
                        </div>
                    </div>
                )}
            </Modal>

            <Modal
                title="Topup Saldo Perusahaan"
                open={topupModal.visible}
                onCancel={() => {
                    setTopupModal({ visible: false });
                    topupForm.resetFields();
                }}
                onOk={handleTopupCompanyBalance}
                confirmLoading={processing}
                okText="Topup"
                cancelText="Batal"
                width={480}
            >
                <Form form={topupForm} layout="vertical">
                    <Form.Item
                        name="amount"
                        label="Nominal Topup"
                        rules={[{ required: true, message: 'Nominal topup harus diisi' }]}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            min={1}
                            formatter={value => `Rp ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value.replace(/Rp\s?|(,*)/g, '')}
                            placeholder="Contoh: 500000"
                        />
                    </Form.Item>
                    <Form.Item name="notes" label="Catatan">
                        <Input.TextArea rows={3} placeholder="Contoh: Topup saldo operasional" />
                    </Form.Item>
                    <div style={{ padding: 12, background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 8, color: '#3f6600' }}>
                        Topup ini menambah saldo internal perusahaan untuk kebutuhan operasional admin.
                    </div>
                </Form>
            </Modal>

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
                            <span>Fee Layanan:</span>
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
                            <span>Pencairan:</span>
                            <Tag color={getDisbursementColor(detailModal.payment.disbursement_status)}>
                                {(detailModal.payment.disbursement_status || 'pending').toUpperCase()}
                            </Tag>
                        </div>
                        <div className={styles.detailRow}>
                            <span>Metode:</span>
                            <strong>{detailModal.payment.payment_type?.toUpperCase() || 'SALDO PERUSAHAAN'}</strong>
                        </div>
                        <div className={styles.detailRow}>
                            <span>Tanggal Bayar:</span>
                            <strong>{formatDate(detailModal.payment.payment_date)}</strong>
                        </div>
                    </div>
                )}
            </Modal>
        </AdminLayout>
    );
};

export default PembayaranSupplier;
