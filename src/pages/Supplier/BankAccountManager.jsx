import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, message, Tag, Space, Popconfirm } from 'antd';
import { PlusOutlined, CheckOutlined, StarOutlined, DeleteOutlined, BankOutlined } from '@ant-design/icons';
import { bankAccountService } from '../../services/api';

/**
 * BankAccountManager Component
 * Komponen untuk supplier mengelola rekening bank
 */
const BankAccountManager = () => {
    const [loading, setLoading] = useState(true);
    const [bankAccounts, setBankAccounts] = useState([]);
    const [supportedBanks, setSupportedBanks] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form] = Form.useForm();

    // Fetch data
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [accountsRes, banksRes] = await Promise.all([
                bankAccountService.getAll().catch(() => ({ data: [] })),
                bankAccountService.getSupportedBanks().catch(() => ({ data: [] }))
            ]);

            let accounts = accountsRes.data || [];
            if (Array.isArray(accountsRes.data)) accounts = accountsRes.data;

            setBankAccounts(accounts);
            setSupportedBanks(banksRes.data || []);
        } catch (error) {
            console.error('Error fetching bank accounts:', error);
            message.error('Gagal memuat data rekening');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Handle add bank account
    const handleAddBankAccount = async () => {
        try {
            const values = await form.validateFields();
            setSubmitting(true);

            // Find bank code from selected bank
            const selectedBank = supportedBanks.find(b => b.name === values.bank_name);

            await bankAccountService.create({
                bank_name: values.bank_name,
                bank_code: selectedBank?.code || '',
                account_number: values.account_number,
                account_name: values.account_name
            });

            message.success('Rekening berhasil ditambahkan');
            setModalVisible(false);
            form.resetFields();
            fetchData();
        } catch (error) {
            console.error('Error adding bank account:', error);
            message.error(error.message || 'Gagal menambahkan rekening');
        } finally {
            setSubmitting(false);
        }
    };

    // Handle set default
    const handleSetDefault = async (id) => {
        try {
            await bankAccountService.setDefault(id);
            message.success('Rekening berhasil dijadikan default');
            fetchData();
        } catch (error) {
            message.error('Gagal mengubah rekening default');
        }
    };

    // Handle delete
    const handleDelete = async (id) => {
        try {
            await bankAccountService.delete(id);
            message.success('Rekening berhasil dihapus');
            fetchData();
        } catch (error) {
            message.error('Gagal menghapus rekening');
        }
    };

    // Table columns
    const columns = [
        {
            title: 'Bank',
            dataIndex: 'bank_name',
            key: 'bank_name',
            render: (text) => (
                <Space>
                    <BankOutlined />
                    <span>{text}</span>
                </Space>
            )
        },
        {
            title: 'No. Rekening',
            dataIndex: 'account_number',
            key: 'account_number',
        },
        {
            title: 'Atas Nama',
            dataIndex: 'account_name',
            key: 'account_name',
        },
        {
            title: 'Status',
            key: 'status',
            render: (_, record) => (
                <Space>
                    {record.is_default && <Tag color="blue">Default</Tag>}
                    {record.is_verified ? (
                        <Tag color="green">Terverifikasi</Tag>
                    ) : (
                        <Tag color="orange">Menunggu Verifikasi</Tag>
                    )}
                </Space>
            )
        },
        {
            title: 'Aksi',
            key: 'action',
            render: (_, record) => (
                <Space>
                    {!record.is_default && (
                        <Button
                            size="small"
                            icon={<StarOutlined />}
                            onClick={() => handleSetDefault(record.id)}
                        >
                            Jadikan Default
                        </Button>
                    )}
                    <Popconfirm
                        title="Hapus Rekening?"
                        description="Rekening ini akan dihapus permanen"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Ya, Hapus"
                        cancelText="Batal"
                    >
                        <Button size="small" danger icon={<DeleteOutlined />}>
                            Hapus
                        </Button>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <Card
            title={
                <Space>
                    <BankOutlined />
                    <span>Rekening Bank Saya</span>
                </Space>
            }
            extra={
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                        setModalVisible(true);
                        form.resetFields();
                    }}
                >
                    Tambah Rekening
                </Button>
            }
        >
            <div style={{ marginBottom: 16, padding: 12, background: '#fffbe6', borderRadius: 8, border: '1px solid #ffe58f' }}>
                <strong>📌 Info:</strong> Rekening bank digunakan untuk pencairan pembayaran dari admin.
                Pastikan data rekening benar agar pembayaran tidak bermasalah.
            </div>

            <Table
                columns={columns}
                dataSource={bankAccounts}
                rowKey="id"
                loading={loading}
                pagination={false}
                locale={{ emptyText: 'Belum ada rekening bank. Silakan tambahkan rekening.' }}
            />

            {/* Add Bank Account Modal */}
            <Modal
                title="Tambah Rekening Bank"
                open={modalVisible}
                onOk={handleAddBankAccount}
                onCancel={() => {
                    setModalVisible(false);
                    form.resetFields();
                }}
                confirmLoading={submitting}
                okText="Simpan"
                cancelText="Batal"
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="bank_name"
                        label="Nama Bank"
                        rules={[{ required: true, message: 'Pilih bank' }]}
                    >
                        <Select
                            showSearch
                            placeholder="Pilih bank"
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                            options={supportedBanks.map(bank => ({
                                value: bank.name,
                                label: bank.name
                            }))}
                        />
                    </Form.Item>

                    <Form.Item
                        name="account_number"
                        label="Nomor Rekening"
                        rules={[
                            { required: true, message: 'Nomor rekening harus diisi' },
                            { pattern: /^[0-9]+$/, message: 'Nomor rekening hanya boleh angka' }
                        ]}
                    >
                        <Input placeholder="Contoh: 1234567890" />
                    </Form.Item>

                    <Form.Item
                        name="account_name"
                        label="Nama Pemilik Rekening"
                        rules={[{ required: true, message: 'Nama pemilik harus diisi' }]}
                    >
                        <Input placeholder="Sesuai buku tabungan" />
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};

export default BankAccountManager;
