import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import theme from './config/theme';
import './App.css';

// Auth
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute';

// Pages
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Admin/Dashboard';
import Produk from './pages/Admin/Produk';
import Transaksi from './pages/Admin/Transaksi';
import Pembayaran from './pages/Admin/Pembayaran';
import Stok from './pages/Admin/Stok';
import Pengguna from './pages/Admin/Pengguna';
import Laporan from './pages/Admin/Laporan';
import Pengaturan from './pages/Admin/Pengaturan';
import PembayaranSupplier from './pages/Admin/PembayaranSupplier';
import Consumer from './pages/Consumer';
import StatusPesanan from './pages/Consumer/StatusPesanan';
import Riwayat from './pages/Consumer/Riwayat';
import Cart from './pages/Consumer/Cart';
import Checkout from './pages/Consumer/Checkout';
import Supplier from './pages/Supplier';

function App() {
  return (
    <AuthProvider>
      <ConfigProvider theme={theme}>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/signin" element={<PublicRoute><SignIn /></PublicRoute>} />
            <Route path="/signup" element={<PublicRoute><SignUp /></PublicRoute>} />

            {/* Admin Routes - Protected */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/produk" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Produk />
              </ProtectedRoute>
            } />
            <Route path="/admin/transaksi" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Transaksi />
              </ProtectedRoute>
            } />
            <Route path="/admin/pembayaran" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Pembayaran />
              </ProtectedRoute>
            } />
            <Route path="/admin/stok" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Stok />
              </ProtectedRoute>
            } />
            <Route path="/admin/pengguna" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Pengguna />
              </ProtectedRoute>
            } />
            <Route path="/admin/laporan" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Laporan />
              </ProtectedRoute>
            } />
            <Route path="/admin/pengaturan" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Pengaturan />
              </ProtectedRoute>
            } />
            <Route path="/admin/pembayaran-supplier" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <PembayaranSupplier />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

            {/* Consumer Routes - Protected */}
            <Route path="/consumer" element={
              <ProtectedRoute allowedRoles={['consumer']}>
                <Consumer />
              </ProtectedRoute>
            } />
            <Route path="/consumer/cart" element={
              <ProtectedRoute allowedRoles={['consumer']}>
                <Cart />
              </ProtectedRoute>
            } />
            <Route path="/consumer/checkout" element={
              <ProtectedRoute allowedRoles={['consumer']}>
                <Checkout />
              </ProtectedRoute>
            } />
            <Route path="/consumer/riwayat" element={
              <ProtectedRoute allowedRoles={['consumer']}>
                <Riwayat />
              </ProtectedRoute>
            } />
            <Route path="/consumer/status-pesanan" element={
              <ProtectedRoute allowedRoles={['consumer']}>
                <StatusPesanan />
              </ProtectedRoute>
            } />

            {/* Supplier Routes - Protected */}
            <Route path="/supplier/*" element={
              <ProtectedRoute allowedRoles={['supplier']}>
                <Supplier />
              </ProtectedRoute>
            } />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/signin" replace />} />
          </Routes>
        </Router>
      </ConfigProvider>
    </AuthProvider>
  );
}

export default App;
