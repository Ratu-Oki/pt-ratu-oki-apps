import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Spin, message, Avatar, Tag, Divider } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, EnvironmentOutlined, EditOutlined } from '@ant-design/icons';
import { useAuth } from '../../../context/AuthContext';
import { authService } from '../../../services/api';
import styles from './Profile.module.css';

/**
 * Supplier Profile Component
 * Menampilkan informasi profil supplier dari database
 */
const Profile = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const response = await authService.getProfile();
      setProfileData(response.data);
    } catch (error) {
      message.error('Gagal memuat data profil');
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spin size="large" tip="Memuat data profil..." />
      </div>
    );
  }

  const displayData = profileData || user;

  // Helper function to get initials from name
  const getInitials = (nama) => {
    if (!nama) return 'S';
    const parts = nama.split(' ');
    return parts.map(p => p.charAt(0).toUpperCase()).join('').slice(0, 2);
  };

  return (
    <div className={styles.profileContainer}>
      {/* Header Card with User Avatar */}
      <Card className={styles.headerCard} bordered={false}>
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} sm={24} md={4} className={styles.avatarCol}>
            <Avatar
              size={120}
              className={styles.avatar}
              icon={<UserOutlined />}
            >
              {getInitials(displayData?.nama)}
            </Avatar>
          </Col>
          <Col xs={24} sm={24} md={20}>
            <div className={styles.headerInfo}>
              <h1 className={styles.userName}>{displayData?.nama || 'Supplier'}</h1>
              <Tag color="green" className={styles.roleTag}>
                {displayData?.role?.toUpperCase() || 'SUPPLIER'}
              </Tag>
              <p className={styles.joinDate}>
                Akun dibuat pada {new Date().toLocaleDateString('id-ID')}
              </p>
            </div>
          </Col>
        </Row>
      </Card>

      <Divider />

      {/* Profile Information Cards */}
      <Row gutter={[24, 24]}>
        {/* Email Card */}
        <Col xs={24} sm={24} md={12}>
          <Card 
            className={styles.infoCard}
            title={
              <div className={styles.cardTitle}>
                <MailOutlined className={styles.icon} />
                <span>Email</span>
              </div>
            }
            bordered={false}
          >
            <p className={styles.infoValue}>{displayData?.email || '-'}</p>
            <p className={styles.infoLabel}>Alamat email terdaftar</p>
          </Card>
        </Col>

        {/* Phone Card */}
        <Col xs={24} sm={24} md={12}>
          <Card 
            className={styles.infoCard}
            title={
              <div className={styles.cardTitle}>
                <PhoneOutlined className={styles.icon} />
                <span>Nomor Telepon</span>
              </div>
            }
            bordered={false}
          >
            <p className={styles.infoValue}>{displayData?.telepon || '-'}</p>
            <p className={styles.infoLabel}>Nomor telepon yang terdaftar</p>
          </Card>
        </Col>

        {/* Address Card */}
        <Col xs={24}>
          <Card 
            className={styles.infoCard}
            title={
              <div className={styles.cardTitle}>
                <EnvironmentOutlined className={styles.icon} />
                <span>Alamat</span>
              </div>
            }
            bordered={false}
          >
            <p className={styles.infoValue}>{displayData?.alamat || '-'}</p>
            <p className={styles.infoLabel}>Alamat yang terdaftar di sistem</p>
          </Card>
        </Col>

        {/* Account Status Card */}
        <Col xs={24} sm={24} md={12}>
          <Card 
            className={styles.infoCard}
            title={
              <div className={styles.cardTitle}>
                <UserOutlined className={styles.icon} />
                <span>Status Akun</span>
              </div>
            }
            bordered={false}
          >
            <p className={styles.infoValue}>
              <Tag color="green">Aktif</Tag>
            </p>
            <p className={styles.infoLabel}>Akun Anda aktif dan dapat digunakan</p>
          </Card>
        </Col>

        {/* Account ID Card */}
        <Col xs={24} sm={24} md={12}>
          <Card 
            className={styles.infoCard}
            title={
              <div className={styles.cardTitle}>
                <UserOutlined className={styles.icon} />
                <span>ID Akun</span>
              </div>
            }
            bordered={false}
          >
            <p className={styles.infoValue}>{displayData?.id || '-'}</p>
            <p className={styles.infoLabel}>Identitas unik akun Anda</p>
          </Card>
        </Col>
      </Row>

      {/* Info Section */}
      <Card className={styles.infoSection} bordered={false}>
        <h3 className={styles.infoTitle}>Informasi Penting</h3>
        <ul className={styles.infoList}>
          <li>Pastikan data yang ditampilkan sudah benar dan sesuai dengan identitas Anda</li>
          <li>Untuk mengubah informasi profil, silakan kunjungi halaman Pengaturan Akun</li>
          <li>Jika menemukan data yang tidak sesuai, hubungi tim support kami</li>
          <li>Informasi pribadi Anda dilindungi dan tidak akan dibagikan kepada pihak ketiga</li>
        </ul>
      </Card>
    </div>
  );
};

export default Profile;
