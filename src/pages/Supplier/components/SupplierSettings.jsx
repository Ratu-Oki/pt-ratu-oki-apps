import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Form, Input, Button, Alert, Divider, Space, message } from 'antd';
import { UserOutlined, SaveOutlined, KeyOutlined } from '@ant-design/icons';
import { authService } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import styles from './SupplierSettings.module.css';

/**
 * SupplierSettings Component
 * Manage supplier account settings: username, email, password
 */
const SupplierSettings = () => {
  const { user, updateUser } = useAuth();
  const [usernameForm] = Form.useForm();
  const [emailForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  const [loadingUsername, setLoadingUsername] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [emailOtpRequested, setEmailOtpRequested] = useState(false);
  const [pendingNewEmail, setPendingNewEmail] = useState('');
  const [oldOtp, setOldOtp] = useState('');
  const [newOtp, setNewOtp] = useState('');

  // Initialize forms with user data
  useEffect(() => {
    if (user) {
      usernameForm.setFieldsValue({
        current_username: user.username || 'N/A'
      });
      emailForm.setFieldsValue({
        current_email: user.email || 'N/A'
      });
    }
  }, [user, usernameForm, emailForm]);

  // Format dan helpers
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  // Handle change username
  const handleChangeUsername = async (values) => {
    try {
      if (!values.new_username) {
        message.error('Username baru harus diisi');
        return;
      }

      if (values.new_username === user.username || values.new_username === user.email) {
        message.error('Username baru harus berbeda dengan username sebelumnya');
        return;
      }

      setLoadingUsername(true);
      const response = await authService.updateProfile({ username: values.new_username });

      if (response && response.success) {
        try {
          const profile = await authService.getProfile();
          if (profile && profile.data) {
            updateUser(profile.data);
            usernameForm.setFieldsValue({ current_username: profile.data.username || values.new_username, new_username: '' });
          }
        } catch (err) {
          updateUser({ username: values.new_username });
          usernameForm.setFieldsValue({ current_username: values.new_username, new_username: '' });
        }

        message.success('Username berhasil diubah');
      } else {
        message.error((response && response.message) || 'Gagal mengubah username');
      }
    } catch (error) {
      console.error('Error changing username:', error);
      message.error(error.message || 'Gagal mengubah username. Silakan coba lagi.');
    } finally {
      setLoadingUsername(false);
    }
  };

  // Handle change email
  const handleChangeEmail = async (values) => {
    try {
      const newEmail = values?.new_email;
      if (!newEmail) {
        message.error('Email baru harus diisi');
        return;
      }

      setLoadingEmail(true);
      await authService.requestEmailChange(newEmail);
      setEmailOtpRequested(true);
      setPendingNewEmail(newEmail);
      setOldOtp('');
      setNewOtp('');
      message.success('OTP telah dikirim ke email lama dan email baru');
    } catch (error) {
      console.error('Error requesting email change:', error);
      message.error(error.message || 'Gagal mengirim OTP perubahan email');
    } finally {
      setLoadingEmail(false);
    }
  };

  const handleConfirmEmailChange = async () => {
    try {
      if (!pendingNewEmail) {
        message.error('Email baru tidak ditemukan. Silakan kirim OTP terlebih dahulu.');
        return;
      }

      if (!oldOtp || !newOtp) {
        message.error('OTP email lama dan email baru wajib diisi');
        return;
      }

      setLoadingEmail(true);
      await authService.confirmEmailChange(pendingNewEmail, oldOtp, newOtp);

      try {
        const profile = await authService.getProfile();
        if (profile && profile.data) {
          updateUser(profile.data);
          emailForm.setFieldsValue({ current_email: profile.data.email || pendingNewEmail, new_email: '' });
        }
      } catch {
        // ignore
      }

      setEmailOtpRequested(false);
      setPendingNewEmail('');
      setOldOtp('');
      setNewOtp('');
      message.success('Email berhasil diubah');
    } catch (error) {
      console.error('Error confirming email change:', error);
      message.error(error.message || 'Gagal mengonfirmasi perubahan email');
    } finally {
      setLoadingEmail(false);
    }
  };

  // Handle change password
  const handleChangePassword = async (values) => {
    try {
      if (!values.current_password || !values.new_password || !values.confirm_password) {
        message.error('Semua field harus diisi');
        return;
      }

      if (values.new_password !== values.confirm_password) {
        message.error('Password baru dan konfirmasi password harus sama');
        return;
      }

      if (values.new_password === values.current_password) {
        message.error('Password baru harus berbeda dengan password sebelumnya');
        return;
      }

      if (values.new_password.length < 6) {
        message.error('Password baru harus minimal 6 karakter');
        return;
      }

      setLoadingPassword(true);
      const response = await authService.changePassword(
        values.current_password,
        values.new_password
      );

      if (response.success) {
        message.success('Password berhasil diubah');
        passwordForm.resetFields();
      } else {
        message.error(response.message || 'Gagal mengubah password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      message.error(error.message || 'Password saat ini salah atau terjadi kesalahan');
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <div className={styles.settingsContainer}>
      <div className={styles.header}>
        <div>
          <h2>Pengaturan Akun</h2>
          <p>Kelola username, email, dan password akun Anda</p>
        </div>
      </div>

      <Alert
        message="Keamanan Akun"
        description="Pastikan username dan password Anda aman. Password minimal 6 karakter. Selalu logout pada perangkat yang tidak Anda gunakan."
        type="info"
        showIcon
        style={{ marginBottom: 30 }}
        closable
      />

      <Row gutter={[24, 24]}>
        {/* Change Username Section */}
        <Col xs={24} md={12}>
          <Card
            title={
              <Space>
                <UserOutlined />
                <span>Ubah Username</span>
              </Space>
            }
            className={styles.card}
          >
            <Form
              form={usernameForm}
              layout="vertical"
              onFinish={handleChangeUsername}
            >
              <Form.Item
                label="Username Saat Ini"
                name="current_username"
              >
                <Input
                  disabled
                  prefix={<UserOutlined />}
                />
              </Form.Item>

              <Divider />

              <Form.Item
                label="Username Baru"
                name="new_username"
                rules={[
                  {
                    required: true,
                    message: 'Username baru harus diisi'
                  },
                  {
                    min: 3,
                    message: 'Username minimal 3 karakter'
                  },
                  {
                    max: 20,
                    message: 'Username maksimal 20 karakter'
                  },
                  {
                    pattern: /^[a-zA-Z0-9_-]+$/,
                    message: 'Username hanya boleh mengandung huruf, angka, underscore, dan dash'
                  }
                ]}
              >
                <Input
                  placeholder="Masukkan username baru"
                  prefix={<UserOutlined />}
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  icon={<SaveOutlined />}
                  loading={loadingUsername}
                >
                  Simpan Username
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* Change Email Section */}
        <Col xs={24} md={12}>
          <Card
            title={
              <Space>
                <UserOutlined />
                <span>Ubah Email</span>
              </Space>
            }
            className={styles.card}
          >
            <Form
              form={emailForm}
              layout="vertical"
              onFinish={handleChangeEmail}
            >
              <Form.Item
                label="Email Saat Ini"
                name="current_email"
              >
                <Input
                  disabled
                  type="email"
                  prefix={<UserOutlined />}
                />
              </Form.Item>

              <Divider />

              <Form.Item
                label="Email Baru"
                name="new_email"
                rules={[
                  {
                    required: true,
                    message: 'Email baru harus diisi'
                  },
                  {
                    type: 'email',
                    message: 'Format email tidak valid'
                  }
                ]}
              >
                <Input
                  placeholder="Masukkan email baru"
                  type="email"
                  prefix={<UserOutlined />}
                />
              </Form.Item>

              {emailOtpRequested && (
                <>
                  <Alert
                    type="info"
                    showIcon
                    style={{ marginBottom: 12 }}
                    message="OTP sudah dikirim"
                    description="Masukkan OTP dari email lama dan email baru untuk konfirmasi perubahan email."
                  />

                  <Form.Item label="OTP Email Lama">
                    <Input
                      value={oldOtp}
                      onChange={(e) => setOldOtp(e.target.value)}
                      placeholder="6 digit OTP"
                      maxLength={6}
                    />
                  </Form.Item>

                  <Form.Item label="OTP Email Baru">
                    <Input
                      value={newOtp}
                      onChange={(e) => setNewOtp(e.target.value)}
                      placeholder="6 digit OTP"
                      maxLength={6}
                    />
                  </Form.Item>
                </>
              )}

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  icon={<SaveOutlined />}
                  loading={loadingEmail}
                >
                  {emailOtpRequested ? 'Kirim Ulang OTP' : 'Kirim OTP'}
                </Button>
              </Form.Item>

              {emailOtpRequested && (
                <Form.Item>
                  <Button
                    type="primary"
                    block
                    onClick={handleConfirmEmailChange}
                    loading={loadingEmail}
                  >
                    Konfirmasi Email
                  </Button>
                </Form.Item>
              )}
            </Form>
          </Card>
        </Col>

        {/* Change Password Section */}
        <Col xs={24} md={12}>
          <Card
            title={
              <Space>
                <KeyOutlined />
                <span>Ubah Password</span>
              </Space>
            }
            className={styles.card}
          >
            <Form
              form={passwordForm}
              layout="vertical"
              onFinish={handleChangePassword}
            >
              <Form.Item
                label="Password Saat Ini"
                name="current_password"
                rules={[
                  {
                    required: true,
                    message: 'Password saat ini harus diisi'
                  }
                ]}
              >
                <Input.Password
                  placeholder="Masukkan password saat ini"
                />
              </Form.Item>

              <Form.Item
                label="Password Baru"
                name="new_password"
                rules={[
                  {
                    required: true,
                    message: 'Password baru harus diisi'
                  },
                  {
                    min: 6,
                    message: 'Password minimal 6 karakter'
                  },
                  {
                    max: 20,
                    message: 'Password maksimal 20 karakter'
                  }
                ]}
              >
                <Input.Password
                  placeholder="Masukkan password baru"
                />
              </Form.Item>

              <Form.Item
                label="Konfirmasi Password Baru"
                name="confirm_password"
                rules={[
                  {
                    required: true,
                    message: 'Konfirmasi password harus diisi'
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('new_password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Password tidak cocok'));
                    }
                  })
                ]}
              >
                <Input.Password
                  placeholder="Konfirmasi password baru"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  icon={<KeyOutlined />}
                  loading={loadingPassword}
                  danger
                >
                  Simpan Password
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>

      {/* Security Tips */}
      <Card style={{ marginTop: 24, background: '#fafafa' }} className={styles.tipsCard}>
        <h3>💡 Tips Keamanan</h3>
        <ul className={styles.tipsList}>
          <li>Selalu gunakan password yang kuat dan unik</li>
          <li>Jangan bagikan username dan password Anda kepada orang lain</li>
          <li>Ubah password secara berkala untuk keamanan lebih baik</li>
          <li>Logout dari perangkat yang tidak Anda gunakan</li>
          <li>Jika akun Anda dirasa tidak aman, hubungi admin segera</li>
        </ul>
      </Card>
    </div>
  );
};

export default SupplierSettings;
