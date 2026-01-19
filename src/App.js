import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import theme from './config/theme';
import './App.css';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Admin from './pages/Admin';
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
          <Route path="/admin" element={<Admin />} />
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
