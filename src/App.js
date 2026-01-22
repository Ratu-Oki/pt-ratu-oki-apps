import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import theme from './config/theme';
import './App.css';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import AdminLayout from './pages/Admin/components/AdminLayout';
import Dashboard from './pages/Admin/Dashboard';
import Produk from './pages/Admin/Produk';
import Transaksi from './pages/Admin/Transaksi';
import Pembayaran from './pages/Admin/Pembayaran';
import Stok from './pages/Admin/Stok';
import Pengguna from './pages/Admin/Pengguna';
import Laporan from './pages/Admin/Laporan';
import Pengaturan from './pages/Admin/Pengaturan';
import Consumer from './pages/Consumer';
import StatusPesanan from './pages/Consumer/StatusPesanan';
import Riwayat from './pages/Consumer/Riwayat';
import Cart from './pages/Consumer/Cart';
import Checkout from './pages/Consumer/Checkout';
import Supplier from './pages/Supplier';

function App() {
  return (
    <ConfigProvider theme={theme}>
      <Router>
        <Routes>
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          
          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/produk" element={<Produk />} />
          <Route path="/admin/transaksi" element={<Transaksi />} />
          <Route path="/admin/pembayaran" element={<Pembayaran />} />
          <Route path="/admin/stok" element={<Stok />} />
          <Route path="/admin/pengguna" element={<Pengguna />} />
          <Route path="/admin/laporan" element={<Laporan />} />
          <Route path="/admin/pengaturan" element={<Pengaturan />} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          
          {/* Consumer Routes */}
          <Route path="/consumer" element={<Consumer />} />
          <Route path="/consumer/cart" element={<Cart />} />
          <Route path="/consumer/checkout" element={<Checkout />} />
          <Route path="/consumer/riwayat" element={<Riwayat />} />
          <Route path="/consumer/status-pesanan" element={<StatusPesanan />} />
          
          <Route path="/supplier" element={<Supplier />} />
          <Route path="/" element={<Navigate to="/signin" replace />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
}

export default App;
