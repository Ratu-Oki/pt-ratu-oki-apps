import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Spin, message, Modal } from 'antd';
import SupplierLayout from './components/SupplierLayout';
import Dashboard from './components/Dashboard';
import AvailableProducts from './components/AvailableProducts';
import SupplyHistory from './components/SupplyHistory';
import BankManagement from './components/BankManagement';
import SupplierSettings from './components/SupplierSettings';
import Profile from './components/Profile';

/**
 * Supplier Main Page with Routing
 * Halaman utama untuk supplier dengan routing ke berbagai fitur
 */
const Supplier = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(
    typeof window !== 'undefined' ? window.innerWidth > 768 : true
  );

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <SupplierLayout>
            <Dashboard />
          </SupplierLayout>
        }
      />
      <Route
        path="/products"
        element={
          <SupplierLayout
            headerType="simple"
            title="Produk Tersedia"
            subTitle="Pilih dan supply produk yang tersedia"
          >
            <AvailableProducts />
          </SupplierLayout>
        }
      />
      <Route
        path="/history"
        element={
          <SupplierLayout
            headerType="simple"
            title="Riwayat Supply"
            subTitle="Pantau status pengajuan supply Anda"
          >
            <SupplyHistory />
          </SupplierLayout>
        }
      />
      <Route
        path="/bank"
        element={
          <SupplierLayout
            headerType="simple"
            title="Kelola Rekening Bank"
            subTitle="Tambahkan rekening untuk pembayaran"
          >
            <BankManagement />
          </SupplierLayout>
        }
      />
      <Route
        path="/settings"
        element={
          <SupplierLayout
            headerType="simple"
            title="Pengaturan Akun"
            subTitle="Kelola keamanan dan data akun Anda"
          >
            <SupplierSettings />
          </SupplierLayout>
        }
      />
      <Route
        path="/profile"
        element={
          <SupplierLayout
            headerType="simple"
            title="Profil Saya"
            subTitle="Lihat informasi profil akun Anda"
          >
            <Profile />
          </SupplierLayout>
        }
      />
    </Routes>
  );
};

export default Supplier;
