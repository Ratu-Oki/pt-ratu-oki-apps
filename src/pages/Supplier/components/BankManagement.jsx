import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, message, Tag, Space, Popconfirm, Empty } from 'antd';
import { PlusOutlined, CheckOutlined, StarOutlined, DeleteOutlined, BankOutlined } from '@ant-design/icons';
import { bankAccountService } from '../../../services/api';
import styles from './BankManagement.module.css';

/**
 * BankManagement Component
 * Komponen untuk supplier mengelola rekening bank
 */
const BankManagement = () => {
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
                bankAccountService.getAll(),
                bankAccountService.getSupportedBanks()
            ]);

            const accounts = Array.isArray(accountsRes?.data) ? accountsRes.data : [];
            const banks = Array.isArray(banksRes?.data) ? banksRes.data : [];

            setBankAccounts(accounts);
            setSupportedBanks(banks);
        } catch (error) {
            console.error('Error fetching bank accounts:', error);
            message.error(error?.message || 'Gagal memuat data rekening');
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
                    <BankOutlined style={{ color: '#2d7a52', fontSize: 18 }} />
                    <span style={{ fontWeight: 500 }}>{text}</span>
                </Space>
            ),
            width: 200
        },
        {
            title: 'Nama Akun',
            dataIndex: 'account_name',
            key: 'account_name',
            ellipsis: true
        },
        {
            title: 'Nomor Rekening',
            dataIndex: 'account_number',
            key: 'account_number',
            render: (text) => <code>{text}</code>,
            width: 180
        },
        {
            title: 'Default',
            dataIndex: 'is_default',
            key: 'is_default',
            align: 'center',
            render: (isDefault) => (
                isDefault ? (
                    <Tag color="green" icon={<CheckOutlined />}>Default</Tag>
                ) : (
                    <Tag>-</Tag>
                )
            ),
            width: 120
        },
        {
            title: 'Aksi',
            key: 'aksi',
            align: 'center',
            fixed: 'right',
            width: 180,
            render: (_, record) => (
                <Space>
                    {!record.is_default && (
                        <Button
                            type="text"
                            icon={<StarOutlined />}
                            size="small"
                            onClick={() => handleSetDefault(record.id)}
                            title="Jadikan Default"
                        >
                            Set Default
                        </Button>
                    )}
                    <Popconfirm
                        title="Hapus Rekening"
                        description="Apakah Anda yakin ingin menghapus rekening ini?"
                        okText="Ya"
                        cancelText="Batal"
                        onConfirm={() => handleDelete(record.id)}
                    >
                        <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            size="small"
                        >
                            Hapus
                        </Button>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div className={styles.bankManagementContainer}>
            <div className={styles.header}>
                <div>
                    <h2>Kelola Rekening Bank</h2>
                    <p>Tambahkan dan kelola rekening bank untuk pembayaran dari admin</p>
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    size="large"
                    onClick={() => {
                        setModalVisible(true);
                        form.resetFields();
                    }}
                >
                    Tambah Rekening
                </Button>
            </div>

            {/* Bank Accounts Table */}
            <Card className={styles.tableCard}>
                {bankAccounts.length === 0 ? (
                    <Empty 
                        description="Belum ada rekening bank" 
                        style={{ paddingTop: '50px', paddingBottom: '50px' }}
                    />
                ) : (
                    <Table
                        columns={columns}
                        dataSource={bankAccounts}
                        rowKey="id"
                        loading={loading}
                        pagination={{ pageSize: 10 }}
                        scroll={{ x: 1200 }}
                        className={styles.table}
                    />
                )}
            </Card>

            {/* Add Bank Modal */}
            <Modal
                title={
                    <Space>
                        <BankOutlined />
                        <span>Tambah Rekening Bank Baru</span>
                    </Space>
                }
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                onOk={handleAddBankAccount}
                confirmLoading={submitting}
                width={600}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        label="Nama Bank"
                        name="bank_name"
                        rules={[{ required: true, message: 'Pilih bank' }]}
                    >
                        <Select placeholder="Pilih bank">
                            {supportedBanks.map(bank => (
                                <Select.Option key={bank.code} value={bank.name}>
                                    {bank.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Nama Pemilik Rekening"
                        name="account_name"
                        rules={[{ required: true, message: 'Nama pemilik harus diisi' }]}
                    >
                        <Input placeholder="Nama sesuai dengan rekening bank" />
                    </Form.Item>

                    <Form.Item
                        label="Nomor Rekening"
                        name="account_number"
                        rules={[
                            { required: true, message: 'Nomor rekening harus diisi' },
                            { pattern: /^\d{10,}$/, message: 'Nomor rekening minimal 10 digit' }
                        ]}
                    >
                        <Input placeholder="Masukkan nomor rekening (hanya angka)" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default BankManagement;
