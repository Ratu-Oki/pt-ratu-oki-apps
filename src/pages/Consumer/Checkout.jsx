import React, { useState, useEffect } from 'react';
import { Layout, Row, Col, Card, Form, Input, Select, Button, Divider, List, Space, message, Spin, Modal, Alert } from 'antd';
import { ArrowLeftOutlined, QrcodeOutlined, CheckCircleOutlined, ClockCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import OrderTrackingCompact from './components/OrderTrackingCompact';
import styles from './Checkout.module.css';
import { transactionService, productService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

/**
 * Checkout Page
 * Halaman pembayaran dengan form pengiriman dan metode pembayaran QRIS
 */
const Checkout = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Payment modal state
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);

  // Out-of-stock handling state
  const [stockErrorModalVisible, setStockErrorModalVisible] = useState(false);
  const [stockErrorItems, setStockErrorItems] = useState([]);
  const [refetchingProducts, setRefetchingProducts] = useState(false);

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      const cart = JSON.parse(savedCart);
      if (cart.length === 0) {
        message.warning('Keranjang kosong. Silakan pilih produk terlebih dahulu.');
        navigate('/consumer');
        return;
      }
      setCartItems(cart);
    } else {
      message.warning('Keranjang kosong. Silakan pilih produk terlebih dahulu.');
      navigate('/consumer');
    }
  }, [navigate]);

  // Pre-fill form with user data
  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        nama_penerima: user.nama,
        no_telepon: user.telepon || '',
        alamat_lengkap: user.alamat || '',
      });
    }
  }, [user, form]);

  // Auto-check payment status
  useEffect(() => {
    let interval;
    if (paymentModalVisible && paymentData && !paymentComplete) {
      interval = setInterval(async () => {
        try {
          setCheckingPayment(true);
          const response = await transactionService.getPaymentStatus(paymentData.transactionId);

          if (response.success && response.data.payment.status === 'settlement') {
            setPaymentComplete(true);
            clearInterval(interval);
            message.success('Pembayaran berhasil!');

            // Clear cart and redirect after short delay
            setTimeout(() => {
              localStorage.removeItem('cart');
              navigate('/consumer/status-pesanan');
            }, 2000);
          }
        } catch (error) {
          console.log('Error checking payment status:', error);
        } finally {
          setCheckingPayment(false);
        }
      }, 5000); // Check every 5 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [paymentModalVisible, paymentData, paymentComplete, navigate]);

  const provinces = [
  { label: 'Aceh', value: 'aceh' },
  { label: 'Sumatera Utara', value: 'sumatera-utara' },
  { label: 'Sumatera Barat', value: 'sumatera-barat' },
  { label: 'Riau', value: 'riau' },
  { label: 'Kepulauan Riau', value: 'kepulauan-riau' },
  { label: 'Jambi', value: 'jambi' },
  { label: 'Sumatera Selatan', value: 'sumatera-selatan' },
  { label: 'Bangka Belitung', value: 'bangka-belitung' },
  { label: 'Bengkulu', value: 'bengkulu' },
  { label: 'Lampung', value: 'lampung' },
  { label: 'DKI Jakarta', value: 'dki-jakarta' },
  { label: 'Jawa Barat', value: 'jawa-barat' },
  { label: 'Jawa Tengah', value: 'jawa-tengah' },
  { label: 'DI Yogyakarta', value: 'di-yogyakarta' },
  { label: 'Jawa Timur', value: 'jawa-timur' },
  { label: 'Banten', value: 'banten' },
  { label: 'Bali', value: 'bali' },
  { label: 'Nusa Tenggara Barat', value: 'ntb' },
  { label: 'Nusa Tenggara Timur', value: 'ntt' },
  { label: 'Kalimantan Barat', value: 'kalimantan-barat' },
  { label: 'Kalimantan Tengah', value: 'kalimantan-tengah' },
  { label: 'Kalimantan Selatan', value: 'kalimantan-selatan' },
  { label: 'Kalimantan Timur', value: 'kalimantan-timur' },
  { label: 'Kalimantan Utara', value: 'kalimantan-utara' },
  { label: 'Sulawesi Utara', value: 'sulawesi-utara' },
  { label: 'Sulawesi Tengah', value: 'sulawesi-tengah' },
  { label: 'Sulawesi Selatan', value: 'sulawesi-selatan' },
  { label: 'Sulawesi Tenggara', value: 'sulawesi-tenggara' },
  { label: 'Gorontalo', value: 'gorontalo' },
  { label: 'Sulawesi Barat', value: 'sulawesi-barat' },
  { label: 'Maluku', value: 'maluku' },
  { label: 'Maluku Utara', value: 'maluku-utara' },
  { label: 'Papua', value: 'papua' },
  { label: 'Papua Barat', value: 'papua-barat' },
  { label: 'Papua Selatan', value: 'papua-selatan' },
  { label: 'Papua Tengah', value: 'papua-tengah' },
  { label: 'Papua Pegunungan', value: 'papua-pegunungan' },
  { label: 'Papua Barat Daya', value: 'papua-barat-daya' },
];

  const districts = [
  // ACEH
  { label: 'Kabupaten Aceh Barat', value: 'aceh-barat' },
  { label: 'Kabupaten Aceh Barat Daya', value: 'aceh-barat-daya' },
  { label: 'Kabupaten Aceh Besar', value: 'aceh-besar' },
  { label: 'Kabupaten Aceh Jaya', value: 'aceh-jaya' },
  { label: 'Kabupaten Aceh Selatan', value: 'aceh-selatan' },
  { label: 'Kabupaten Aceh Singkil', value: 'aceh-singkil' },
  { label: 'Kabupaten Aceh Tamiang', value: 'aceh-tamiang' },
  { label: 'Kabupaten Aceh Tengah', value: 'aceh-tengah' },
  { label: 'Kabupaten Aceh Tenggara', value: 'aceh-tenggara' },
  { label: 'Kabupaten Aceh Timur', value: 'aceh-timur' },
  { label: 'Kabupaten Aceh Utara', value: 'aceh-utara' },
  { label: 'Kabupaten Bener Meriah', value: 'bener-meriah' },
  { label: 'Kabupaten Bireuen', value: 'bireuen' },
  { label: 'Kabupaten Gayo Lues', value: 'gayo-lues' },
  { label: 'Kabupaten Nagan Raya', value: 'nagan-raya' },
  { label: 'Kabupaten Pidie', value: 'pidie' },
  { label: 'Kabupaten Pidie Jaya', value: 'pidie-jaya' },
  { label: 'Kabupaten Simeulue', value: 'simeulue' },
  { label: 'Kota Banda Aceh', value: 'banda-aceh' },
  { label: 'Kota Langsa', value: 'langsa' },
  { label: 'Kota Lhokseumawe', value: 'lhokseumawe' },
  { label: 'Kota Sabang', value: 'sabang' },
  { label: 'Kota Subulussalam', value: 'subulussalam' },

  // SUMATERA UTARA
  { label: 'Kabupaten Asahan', value: 'asahan' },
  { label: 'Kabupaten Batu Bara', value: 'batu-bara' },
  { label: 'Kabupaten Dairi', value: 'dairi' },
  { label: 'Kabupaten Deli Serdang', value: 'deli-serdang' },
  { label: 'Kabupaten Humbang Hasundutan', value: 'humbang-hasundutan' },
  { label: 'Kabupaten Karo', value: 'karo' },
  { label: 'Kabupaten Labuhanbatu', value: 'labuhanbatu' },
  { label: 'Kabupaten Labuhanbatu Selatan', value: 'labuhanbatu-selatan' },
  { label: 'Kabupaten Labuhanbatu Utara', value: 'labuhanbatu-utara' },
  { label: 'Kabupaten Langkat', value: 'langkat' },
  { label: 'Kabupaten Mandailing Natal', value: 'mandailing-natal' },
  { label: 'Kabupaten Nias', value: 'nias' },
  { label: 'Kabupaten Nias Barat', value: 'nias-barat' },
  { label: 'Kabupaten Nias Selatan', value: 'nias-selatan' },
  { label: 'Kabupaten Nias Utara', value: 'nias-utara' },
  { label: 'Kabupaten Padang Lawas', value: 'padang-lawas' },
  { label: 'Kabupaten Padang Lawas Utara', value: 'padang-lawas-utara' },
  { label: 'Kabupaten Pakpak Bharat', value: 'pakpak-bharat' },
  { label: 'Kabupaten Samosir', value: 'samosir' },
  { label: 'Kabupaten Serdang Bedagai', value: 'serdang-bedagai' },
  { label: 'Kabupaten Simalungun', value: 'simalungun' },
  { label: 'Kabupaten Tapanuli Selatan', value: 'tapanuli-selatan' },
  { label: 'Kabupaten Tapanuli Tengah', value: 'tapanuli-tengah' },
  { label: 'Kabupaten Tapanuli Utara', value: 'tapanuli-utara' },
  { label: 'Kabupaten Toba', value: 'toba' },
  { label: 'Kota Binjai', value: 'binjai' },
  { label: 'Kota Gunungsitoli', value: 'gunungsitoli' },
  { label: 'Kota Medan', value: 'medan' },
  { label: 'Kota Padangsidimpuan', value: 'padangsidimpuan' },
  { label: 'Kota Pematangsiantar', value: 'pematangsiantar' },
  { label: 'Kota Sibolga', value: 'sibolga' },
  { label: 'Kota Tanjungbalai', value: 'tanjungbalai' },
  { label: 'Kota Tebing Tinggi', value: 'tebing-tinggi' },

  // SUMATERA BARAT
  { label: 'Kabupaten Agam', value: 'agam' },
  { label: 'Kabupaten Dharmasraya', value: 'dharmasraya' },
  { label: 'Kabupaten Kepulauan Mentawai', value: 'mentawai' },
  { label: 'Kabupaten Lima Puluh Kota', value: 'lima-puluh-kota' },
  { label: 'Kabupaten Padang Pariaman', value: 'padang-pariaman' },
  { label: 'Kabupaten Pasaman', value: 'pasaman' },
  { label: 'Kabupaten Pasaman Barat', value: 'pasaman-barat' },
  { label: 'Kabupaten Pesisir Selatan', value: 'pesisir-selatan' },
  { label: 'Kabupaten Sijunjung', value: 'sijunjung' },
  { label: 'Kabupaten Solok', value: 'solok' },
  { label: 'Kabupaten Solok Selatan', value: 'solok-selatan' },
  { label: 'Kabupaten Tanah Datar', value: 'tanah-datar' },
  { label: 'Kota Bukittinggi', value: 'bukittinggi' },
  { label: 'Kota Padang', value: 'padang' },
  { label: 'Kota Padang Panjang', value: 'padang-panjang' },
  { label: 'Kota Pariaman', value: 'pariaman' },
  { label: 'Kota Payakumbuh', value: 'payakumbuh' },
  { label: 'Kota Sawahlunto', value: 'sawahlunto' },
  { label: 'Kota Solok', value: 'kota-solok' },
  { label: 'Kabupaten Bengkalis', value: 'bengkalis' },
  { label: 'Kabupaten Indragiri Hilir', value: 'indragiri-hilir' },
  { label: 'Kabupaten Indragiri Hulu', value: 'indragiri-hulu' },
  { label: 'Kabupaten Kampar', value: 'kampar' },
  { label: 'Kabupaten Kepulauan Meranti', value: 'kepulauan-meranti' },
  { label: 'Kabupaten Kuantan Singingi', value: 'kuantan-singingi' },
  { label: 'Kabupaten Pelalawan', value: 'pelalawan' },
  { label: 'Kabupaten Rokan Hilir', value: 'rokan-hilir' },
  { label: 'Kabupaten Rokan Hulu', value: 'rokan-hulu' },
  { label: 'Kabupaten Siak', value: 'siak' },
  { label: 'Kota Dumai', value: 'dumai' },
  { label: 'Kota Pekanbaru', value: 'pekanbaru' },

  // KEPULAUAN RIAU
  { label: 'Kabupaten Bintan', value: 'bintan' },
  { label: 'Kabupaten Karimun', value: 'karimun' },
  { label: 'Kabupaten Kepulauan Anambas', value: 'anambas' },
  { label: 'Kabupaten Lingga', value: 'lingga' },
  { label: 'Kabupaten Natuna', value: 'natuna' },
  { label: 'Kota Batam', value: 'batam' },
  { label: 'Kota Tanjungpinang', value: 'tanjungpinang' },

  // JAMBI
  { label: 'Kabupaten Batanghari', value: 'batanghari' },
  { label: 'Kabupaten Bungo', value: 'bungo' },
  { label: 'Kabupaten Kerinci', value: 'kerinci' },
  { label: 'Kabupaten Merangin', value: 'merangin' },
  { label: 'Kabupaten Muaro Jambi', value: 'muaro-jambi' },
  { label: 'Kabupaten Sarolangun', value: 'sarolangun' },
  { label: 'Kabupaten Tanjung Jabung Barat', value: 'tanjung-jabung-barat' },
  { label: 'Kabupaten Tanjung Jabung Timur', value: 'tanjung-jabung-timur' },
  { label: 'Kabupaten Tebo', value: 'tebo' },
  { label: 'Kota Jambi', value: 'kota-jambi' },
  { label: 'Kota Sungai Penuh', value: 'sungai-penuh' },

  // SUMATERA SELATAN
  { label: 'Kabupaten Banyuasin', value: 'banyuasin' },
  { label: 'Kabupaten Empat Lawang', value: 'empat-lawang' },
  { label: 'Kabupaten Lahat', value: 'lahat' },
  { label: 'Kabupaten Muara Enim', value: 'muara-enim' },
  { label: 'Kabupaten Musi Banyuasin', value: 'musi-banyuasin' },
  { label: 'Kabupaten Musi Rawas', value: 'musi-rawas' },
  { label: 'Kabupaten Musi Rawas Utara', value: 'musi-rawas-utara' },
  { label: 'Kabupaten Ogan Ilir', value: 'ogan-ilir' },
  { label: 'Kabupaten Ogan Komering Ilir', value: 'oki' },
  { label: 'Kabupaten Ogan Komering Ulu', value: 'oku' },
  { label: 'Kabupaten Ogan Komering Ulu Selatan', value: 'oku-selatan' },
  { label: 'Kabupaten Ogan Komering Ulu Timur', value: 'oku-timur' },
  { label: 'Kabupaten Penukal Abab Lematang Ilir', value: 'pali' },
  { label: 'Kota Lubuklinggau', value: 'lubuklinggau' },
  { label: 'Kota Pagar Alam', value: 'pagar-alam' },
  { label: 'Kota Palembang', value: 'palembang' },
  { label: 'Kota Prabumulih', value: 'prabumulih' },

  // BENGKULU
  { label: 'Kabupaten Bengkulu Selatan', value: 'bengkulu-selatan' },
  { label: 'Kabupaten Bengkulu Tengah', value: 'bengkulu-tengah' },
  { label: 'Kabupaten Bengkulu Utara', value: 'bengkulu-utara' },
  { label: 'Kabupaten Kaur', value: 'kaur' },
  { label: 'Kabupaten Kepahiang', value: 'kepahiang' },
  { label: 'Kabupaten Lebong', value: 'lebong' },
  { label: 'Kabupaten Mukomuko', value: 'mukomuko' },
  { label: 'Kabupaten Rejang Lebong', value: 'rejang-lebong' },
  { label: 'Kabupaten Seluma', value: 'seluma' },
  { label: 'Kota Bengkulu', value: 'kota-bengkulu' },

  // LAMPUNG
  { label: 'Kabupaten Lampung Barat', value: 'lampung-barat' },
  { label: 'Kabupaten Lampung Selatan', value: 'lampung-selatan' },
  { label: 'Kabupaten Lampung Tengah', value: 'lampung-tengah' },
  { label: 'Kabupaten Lampung Timur', value: 'lampung-timur' },
  { label: 'Kabupaten Lampung Utara', value: 'lampung-utara' },
  { label: 'Kabupaten Mesuji', value: 'mesuji' },
  { label: 'Kabupaten Pesawaran', value: 'pesawaran' },
  { label: 'Kabupaten Pesisir Barat', value: 'pesisir-barat' },
  { label: 'Kabupaten Pringsewu', value: 'pringsewu' },
  { label: 'Kabupaten Tanggamus', value: 'tanggamus' },
  { label: 'Kabupaten Tulang Bawang', value: 'tulang-bawang' },
  { label: 'Kabupaten Tulang Bawang Barat', value: 'tulang-bawang-barat' },
  { label: 'Kabupaten Way Kanan', value: 'way-kanan' },
  { label: 'Kota Bandar Lampung', value: 'bandar-lampung' },
  { label: 'Kota Metro', value: 'metro' },
  // SULAWESI UTARA
  { label: 'Kabupaten Bolaang Mongondow', value: 'bolaang-mongondow' },
  { label: 'Kabupaten Bolaang Mongondow Selatan', value: 'bolaang-mongondow-selatan' },
  { label: 'Kabupaten Bolaang Mongondow Timur', value: 'bolaang-mongondow-timur' },
  { label: 'Kabupaten Bolaang Mongondow Utara', value: 'bolaang-mongondow-utara' },
  { label: 'Kabupaten Kepulauan Sangihe', value: 'kepulauan-sangihe' },
  { label: 'Kabupaten Kepulauan Siau Tagulandang Biaro', value: 'sitaro' },
  { label: 'Kabupaten Kepulauan Talaud', value: 'kepulauan-talaud' },
  { label: 'Kabupaten Minahasa', value: 'minahasa' },
  { label: 'Kabupaten Minahasa Selatan', value: 'minahasa-selatan' },
  { label: 'Kabupaten Minahasa Tenggara', value: 'minahasa-tenggara' },
  { label: 'Kabupaten Minahasa Utara', value: 'minahasa-utara' },
  { label: 'Kota Bitung', value: 'bitung' },
  { label: 'Kota Kotamobagu', value: 'kotamobagu' },
  { label: 'Kota Manado', value: 'manado' },
  { label: 'Kota Tomohon', value: 'tomohon' },

  // GORONTALO
  { label: 'Kabupaten Boalemo', value: 'boalemo' },
  { label: 'Kabupaten Bone Bolango', value: 'bone-bolango' },
  { label: 'Kabupaten Gorontalo', value: 'gorontalo' },
  { label: 'Kabupaten Gorontalo Utara', value: 'gorontalo-utara' },
  { label: 'Kabupaten Pohuwato', value: 'pohuwato' },
  { label: 'Kota Gorontalo', value: 'kota-gorontalo' },

  // SULAWESI TENGAH
  { label: 'Kabupaten Banggai', value: 'banggai' },
  { label: 'Kabupaten Banggai Kepulauan', value: 'banggai-kepulauan' },
  { label: 'Kabupaten Banggai Laut', value: 'banggai-laut' },
  { label: 'Kabupaten Buol', value: 'buol' },
  { label: 'Kabupaten Donggala', value: 'donggala' },
  { label: 'Kabupaten Morowali', value: 'morowali' },
  { label: 'Kabupaten Morowali Utara', value: 'morowali-utara' },
  { label: 'Kabupaten Parigi Moutong', value: 'parigi-moutong' },
  { label: 'Kabupaten Poso', value: 'poso' },
  { label: 'Kabupaten Sigi', value: 'sigi' },
  { label: 'Kabupaten Tojo Una-Una', value: 'tojo-una-una' },
  { label: 'Kabupaten Toli-Toli', value: 'toli-toli' },
  { label: 'Kota Palu', value: 'palu' },

  // SULAWESI BARAT
  { label: 'Kabupaten Majene', value: 'majene' },
  { label: 'Kabupaten Mamasa', value: 'mamasa' },
  { label: 'Kabupaten Mamuju', value: 'mamuju' },
  { label: 'Kabupaten Mamuju Tengah', value: 'mamuju-tengah' },
  { label: 'Kabupaten Pasangkayu', value: 'pasangkayu' },
  { label: 'Kabupaten Polewali Mandar', value: 'polewali-mandar' },

  // SULAWESI SELATAN
  { label: 'Kabupaten Bantaeng', value: 'bantaeng' },
  { label: 'Kabupaten Barru', value: 'barru' },
  { label: 'Kabupaten Bone', value: 'bone' },
  { label: 'Kabupaten Bulukumba', value: 'bulukumba' },
  { label: 'Kabupaten Enrekang', value: 'enrekang' },
  { label: 'Kabupaten Gowa', value: 'gowa' },
  { label: 'Kabupaten Jeneponto', value: 'jeneponto' },
  { label: 'Kabupaten Kepulauan Selayar', value: 'kepulauan-selayar' },
  { label: 'Kabupaten Luwu', value: 'luwu' },
  { label: 'Kabupaten Luwu Timur', value: 'luwu-timur' },
  { label: 'Kabupaten Luwu Utara', value: 'luwu-utara' },
  { label: 'Kabupaten Maros', value: 'maros' },
  { label: 'Kabupaten Pangkajene dan Kepulauan', value: 'pangkep' },
  { label: 'Kabupaten Pinrang', value: 'pinrang' },
  { label: 'Kabupaten Sidenreng Rappang', value: 'sidrap' },
  { label: 'Kabupaten Sinjai', value: 'sinjai' },
  { label: 'Kabupaten Soppeng', value: 'soppeng' },
  { label: 'Kabupaten Takalar', value: 'takalar' },
  { label: 'Kabupaten Tana Toraja', value: 'tana-toraja' },
  { label: 'Kabupaten Toraja Utara', value: 'toraja-utara' },
  { label: 'Kabupaten Wajo', value: 'wajo' },
  { label: 'Kota Makassar', value: 'makassar' },
  { label: 'Kota Palopo', value: 'palopo' },
  { label: 'Kota Parepare', value: 'parepare' },

  // SULAWESI TENGGARA
  { label: 'Kabupaten Bombana', value: 'bombana' },
  { label: 'Kabupaten Buton', value: 'buton' },
  { label: 'Kabupaten Buton Selatan', value: 'buton-selatan' },
  { label: 'Kabupaten Buton Tengah', value: 'buton-tengah' },
  { label: 'Kabupaten Buton Utara', value: 'buton-utara' },
  { label: 'Kabupaten Kolaka', value: 'kolaka' },
  { label: 'Kabupaten Kolaka Timur', value: 'kolaka-timur' },
  { label: 'Kabupaten Kolaka Utara', value: 'kolaka-utara' },
  { label: 'Kabupaten Konawe', value: 'konawe' },
  { label: 'Kabupaten Konawe Kepulauan', value: 'konawe-kepulauan' },
  { label: 'Kabupaten Konawe Selatan', value: 'konawe-selatan' },
  { label: 'Kabupaten Konawe Utara', value: 'konawe-utara' },
  { label: 'Kabupaten Muna', value: 'muna' },
  { label: 'Kabupaten Muna Barat', value: 'muna-barat' },
  { label: 'Kabupaten Wakatobi', value: 'wakatobi' },
  { label: 'Kota Baubau', value: 'baubau' },
  { label: 'Kota Kendari', value: 'kendari' },
];

  // Payment method fixed to QRIS
  const paymentMethod = 'qris';

  /**
   * Format currency
   */
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  /**
   * Refetch products and update cart with fresh stock data
   * Returns { removed: [], updated: [] } for items affected by stock changes
   */
  const refetchAndUpdateCart = async () => {
    try {
      setRefetchingProducts(true);

      // Fetch fresh product data from backend
      const response = await productService.getAll({ limit: 100 });
      const freshProducts = Array.isArray(response.data) 
        ? response.data 
        : (response.data?.products || []);

      // Create product map for quick lookup
      const productMap = new Map(freshProducts.map(p => [p.id, p]));

      // Check cart items against fresh data
      const removed = [];
      const updated = [];
      let newCart = [...cartItems];

      for (const item of cartItems) {
        const freshProduct = productMap.get(item.id);

        if (!freshProduct || freshProduct.stok === 0) {
          // Product removed from inventory or out of stock
          removed.push(item);
          newCart = newCart.filter(cartItem => cartItem.id !== item.id);
        } else if (freshProduct.stok < (item.qty || 1)) {
          // Stock reduced - adjust quantity to match available stock
          updated.push({
            ...item,
            oldQty: item.qty || 1,
            newQty: freshProduct.stok,
          });
          newCart = newCart.map(cartItem =>
            cartItem.id === item.id
              ? { ...cartItem, qty: freshProduct.stok }
              : cartItem
          );
        }
      }

      // Save updated cart to localStorage
      setCartItems(newCart);

      return { removed, updated };
    } catch (error) {
      console.error('Error refetching products:', error);
      message.error('Gagal memperbarui data stok. Silakan coba lagi.');
      return { removed: [], updated: [] };
    } finally {
      setRefetchingProducts(false);
    }
  };

  /**
   * Calculate totals
   */
  const subtotal = cartItems.reduce((sum, item) => sum + (item.harga_jual || item.price || 0) * (item.qty || 1), 0);
  const total = subtotal;

  /**
   * Handle form submit with QRIS payment
   */
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (cartItems.length === 0) {
        message.error('Keranjang kosong');
        return;
      }

      setSubmitting(true);

      // Build transaction data
      const transactionData = {
        items: cartItems.map(item => ({
          product_id: item.id,
          jumlah: item.qty || 1,
          grade: item.grade || 'A'
        })),
        shipping_address: `${values.nama_penerima}, ${values.no_telepon}, ${values.alamat_lengkap}, ${values.kecamatan}, ${values.provinsi}, ${values.kode_pos}`,
        notes: values.notes || '',
        payment_type: paymentMethod
      };

      const response = await transactionService.createWithPayment(transactionData);

      if (response.success) {
        // Show payment modal with QR code
        setPaymentData({
          transactionId: response.data.transaction.id,
          invoiceNumber: response.data.transaction.invoice_number,
          qrCodeUrl: response.data.payment.qr_code_url,
          qrString: response.data.payment.qr_string,
          total: response.data.payment.total,
          expiredAt: response.data.payment.expired_at
        });
        setPaymentModalVisible(true);
      } else {
        // Handle specific out-of-stock errors
        const errorMessage = response.message || 'Gagal membuat pesanan';
        
        // Check if error is stock-related (common patterns from backend)
        const isStockError = 
          errorMessage.toLowerCase().includes('stock') ||
          errorMessage.toLowerCase().includes('stok') ||
          errorMessage.toLowerCase().includes('unavailable') ||
          response.error?.code === 'STOCK_INSUFFICIENT';

        if (isStockError) {
          // Refetch products and update cart with fresh data
          const { removed, updated } = await refetchAndUpdateCart();
          
          // Store error details for modal display
          setStockErrorItems({ removed, updated });
          setStockErrorModalVisible(true);
        } else {
          message.error(errorMessage);
        }
      }
    } catch (error) {
      console.error('Checkout error:', error);
      
      // Handle out-of-stock error responses
      if (error?.success === false) {
        const isStockError = 
          error.message?.toLowerCase().includes('stock') ||
          error.message?.toLowerCase().includes('stok') ||
          error.message?.toLowerCase().includes('unavailable') ||
          error.code === 'STOCK_INSUFFICIENT';

        if (isStockError) {
          // Refetch products and update cart
          const { removed, updated } = await refetchAndUpdateCart();
          setStockErrorItems({ removed, updated });
          setStockErrorModalVisible(true);
          return;
        }
      }
      
      if (error.errorFields) {
        message.error('Silakan lengkapi semua data');
      } else {
        message.error(error.message || 'Gagal membuat pesanan. Silakan coba lagi.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Handle close payment modal
   */
  const handleClosePaymentModal = () => {
    if (!paymentComplete) {
      Modal.confirm({
        title: 'Batalkan Pembayaran?',
        content: 'Pesanan Anda akan disimpan dan bisa dibayar nanti dari halaman Status Pesanan.',
        okText: 'Tutup',
        cancelText: 'Lanjut Bayar',
        onOk: () => {
          setPaymentModalVisible(false);
          localStorage.removeItem('cart');
          navigate('/consumer/status-pesanan');
        }
      });
    } else {
      setPaymentModalVisible(false);
      localStorage.removeItem('cart');
      navigate('/consumer/status-pesanan');
    }
  };

  /**
   * Handle close out-of-stock error modal
   */
  const handleCloseStockErrorModal = (action = 'back') => {
    setStockErrorModalVisible(false);
    
    if (action === 'back') {
      // Go back to cart to review updated items
      navigate('/consumer/cart');
    } else if (action === 'retry' && cartItems.length > 0) {
      // User wants to retry checkout with updated cart
      setStockErrorModalVisible(false);
    }
  };

  /**
   * Handle back to cart
   */
  const handleBackToCart = () => {
    navigate('/consumer/cart');
  };

  if (loading) {
    return (
      <Layout className={styles.layout}>
        <Header cartCount={cartItems.length} userName={user?.nama || 'Guest'} />
        <Layout.Content className={styles.content}>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
            <Spin size="large" />
          </div>
        </Layout.Content>
        <Footer />
      </Layout>
    );
  }

  return (
    <Layout className={styles.layout}>
      {/* Header */}
      <Header cartCount={cartItems.reduce((sum, item) => sum + (item.qty || 1), 0)} userName={user?.nama || 'Guest'} />

      {/* Main Content */}
      <Layout.Content className={styles.content}>
        <div className={styles.contentWrapper}>
          {/* Page Header */}
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>PEMBAYARAN</h1>
          </div>

          <Row gutter={[24, 24]}>
            {/* Form Section */}
            <Col xs={24} lg={14}>
              {/* Shipping Address */}
              <Card className={styles.formCard} bordered={false}>
                <h2 className={styles.cardTitle}>Alamat Pengiriman</h2>

                <Form
                  form={form}
                  layout="vertical"
                  className={styles.form}
                  autoComplete="off"
                >
                  <Form.Item
                    label="Nama Penerima"
                    name="nama_penerima"
                    rules={[{ required: true, message: 'Nama penerima harus diisi' }]}
                  >
                    <Input placeholder="Nama lengkap penerima" />
                  </Form.Item>

                  <Form.Item
                    label="Nomor Telepon"
                    name="no_telepon"
                    rules={[{ required: true, message: 'Nomor telepon harus diisi' }]}
                  >
                    <Input placeholder="08123456789" />
                  </Form.Item>

                  <Form.Item
                    label="Alamat Lengkap"
                    name="alamat_lengkap"
                    rules={[{ required: true, message: 'Alamat lengkap harus diisi' }]}
                  >
                    <Input.TextArea placeholder="Jl. Merdeka No. 123, Kelurahan..." rows={3} />
                  </Form.Item>

                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="Provinsi"
                        name="provinsi"
                        rules={[{ required: true, message: 'Provinsi harus dipilih' }]}
                      >
                        <Select placeholder="Pilih Provinsi" options={provinces} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="Kecamatan/Kota"
                        name="kecamatan"
                        rules={[{ required: true, message: 'Kecamatan harus dipilih' }]}
                      >
                        <Select placeholder="Pilih Kecamatan" options={districts} />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    label="Kode Pos"
                    name="kode_pos"
                    rules={[{ required: true, message: 'Kode pos harus diisi' }]}
                  >
                    <Input placeholder="40135" />
                  </Form.Item>

                  <Form.Item
                    label="Catatan (opsional)"
                    name="notes"
                  >
                    <Input.TextArea placeholder="Catatan untuk penjual..." rows={2} />
                  </Form.Item>
                </Form>
              </Card>

              {/* Payment Method - QRIS Only */}
              <Card className={styles.formCard} bordered={false}>
                <h2 className={styles.cardTitle}>Metode Pembayaran</h2>

                <div className={styles.paymentOption} style={{ borderColor: '#1b5e3f', background: '#f0f9f4' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <QrcodeOutlined style={{ fontSize: 32, color: '#1b5e3f' }} />
                    <div>
                      <div className={styles.methodLabel}>QRIS</div>
                      <div className={styles.methodInfo}>Scan QR untuk bayar dengan berbagai e-wallet</div>
                    </div>
                  </div>
                </div>

                <div className={styles.paymentNote}>
                  <QrcodeOutlined style={{ fontSize: 20, marginRight: 12, color: '#2D7A52' }} />
                  <span>Pembayaran menggunakan QRIS dapat dilakukan melalui berbagai aplikasi e-wallet seperti GoPay, OVO, DANA, LinkAja, dan lainnya.</span>
                </div>
              </Card>
            </Col>

            {/* Summary Section */}
            <Col xs={24} lg={10}>
              <Card className={styles.summaryCard} bordered={false}>
                <h2 className={styles.cardTitle}>Ringkasan Pesanan</h2>

                {/* Items List */}
                <div className={styles.itemsList}>
                  <List
                    dataSource={cartItems}
                    renderItem={(item) => (
                      <div className={styles.summaryItem}>
                        <div className={styles.itemInfo}>
                          <div className={styles.itemName}>{item.nama_produk || item.name}</div>
                          <div className={styles.itemDetails}>
                            Grade {item.grade || 'A'} • Qty: {item.qty || 1}
                          </div>
                        </div>
                        <div className={styles.itemTotal}>
                          {formatCurrency((item.harga_jual || item.price || 0) * (item.qty || 1))}
                        </div>
                      </div>
                    )}
                  />
                </div>

                <Divider style={{ margin: '16px 0' }} />

                {/* Summary Details */}
                <div className={styles.summaryDetails}>
                  <div className={styles.summaryRow}>
                    <span>Total ({cartItems.reduce((sum, item) => sum + (item.qty || 1), 0)} item)</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                </div>

                <Divider style={{ margin: '12px 0' }} />

                {/* Total */}
                <div className={styles.totalRow}>
                  <span className={styles.totalLabel}>Total</span>
                  <span className={styles.totalAmount}>{formatCurrency(total)}</span>
                </div>

                {/* Action Buttons */}
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  <Button
                    type="primary"
                    block
                    size="large"
                    onClick={handleSubmit}
                    loading={submitting}
                    className={styles.submitBtn}
                    icon={<QrcodeOutlined />}
                  >
                    Bayar dengan {paymentMethod.toUpperCase()}
                  </Button>
                  <Button
                    type="default"
                    block
                    size="large"
                    icon={<ArrowLeftOutlined />}
                    onClick={handleBackToCart}
                    className={styles.backBtn}
                    disabled={submitting}
                  >
                    Kembali ke Keranjang
                  </Button>
                </Space>
              </Card>
            </Col>
          </Row>
        </div>
      </Layout.Content>

      {/* Footer */}
      <Footer />

      {/* Payment Modal with QR Code */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <QrcodeOutlined style={{ fontSize: 24, color: '#2D7A52' }} />
            <span>Scan QR untuk Membayar</span>
          </div>
        }
        open={paymentModalVisible}
        onCancel={handleClosePaymentModal}
        footer={null}
        centered
        width={450}
        maskClosable={false}
      >
        {paymentData && (
          <div className={styles.paymentModalContent}>
            {paymentComplete ? (
              <div className={styles.paymentSuccess}>
                <CheckCircleOutlined style={{ fontSize: 64, color: '#52c41a' }} />
                <h3>Pembayaran Berhasil!</h3>
                <p>Terima kasih. Pesanan Anda sedang diproses.</p>
                
                {/* Order Tracking Preview */}
                <Divider style={{ margin: '20px 0' }} />
                <div style={{ marginTop: 16 }}>
                  <p style={{ fontSize: 12, color: '#000000', marginBottom: 12, textAlign: 'center' }}>
                    Status Pesanan Anda:
                  </p>
                  <OrderTrackingCompact status="processing" showLabel={true} />
                </div>
              </div>
            ) : (
              <>
                <div className={styles.qrSection}>
                  <div className={styles.invoiceInfo}>
                    <span>Invoice: {paymentData.invoiceNumber}</span>
                  </div>

                  {paymentData.qrCodeUrl ? (
                    <img
                      src={paymentData.qrCodeUrl}
                      alt="QR Code Pembayaran"
                      className={styles.qrImage}
                    />
                  ) : (
                    <div className={styles.qrPlaceholder}>
                      <Spin size="large" />
                      <p>Memuat QR Code...</p>
                    </div>
                  )}

                  <div className={styles.paymentAmount}>
                    <span>Total Pembayaran</span>
                    <strong>{formatCurrency(paymentData.total)}</strong>
                  </div>
                </div>

                <div className={styles.paymentInstructions}>
                  <h4>Cara Pembayaran:</h4>
                  <ol>
                    <li>Buka aplikasi e-wallet Anda (GoPay, OVO, DANA, dll)</li>
                    <li>Pilih menu <strong>Scan QR</strong></li>
                    <li>Scan QR code di atas</li>
                    <li>Konfirmasi pembayaran</li>
                  </ol>
                </div>

                <div className={styles.paymentStatus}>
                  {checkingPayment ? (
                    <Spin size="small" />
                  ) : (
                    <ClockCircleOutlined style={{ color: '#faad14' }} />
                  )}
                  <span>Menunggu pembayaran...</span>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>

      {/* Out-of-Stock Error Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <WarningOutlined style={{ fontSize: 24, color: '#ff4d4f' }} />
            <span>Stok Produk Berubah</span>
          </div>
        }
        open={stockErrorModalVisible}
        onCancel={() => handleCloseStockErrorModal('back')}
        centered
        width={500}
        maskClosable={false}
        footer={[
          <Button
            key="back"
            type="primary"
            onClick={() => handleCloseStockErrorModal('back')}
          >
            Kembali ke Keranjang
          </Button>,
          cartItems.length > 0 && (
            <Button
              key="retry"
              onClick={() => handleCloseStockErrorModal('retry')}
            >
              Lanjut Checkout
            </Button>
          ),
        ]}
      >
        <div style={{ padding: '20px 0' }}>
          {/* Main Error Message */}
          <Alert
            message="Mohon maaf, stok barang baru saja habis!"
            type="error"
            icon={<WarningOutlined />}
            showIcon
            style={{ marginBottom: 24 }}
          />

          {/* Removed Items */}
          {stockErrorItems.removed && stockErrorItems.removed.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ color: '#ff4d4f', marginBottom: 12 }}>
                Produk Dihapus (Stok Habis):
              </h4>
              <List
                dataSource={stockErrorItems.removed}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      title={item.nama_produk || item.name}
                      description={`Qty: ${item.qty || 1} | ${formatCurrency(item.harga_jual || item.price)}`}
                    />
                  </List.Item>
                )}
              />
            </div>
          )}

          {/* Updated Items (Quantity Reduced) */}
          {stockErrorItems.updated && stockErrorItems.updated.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ color: '#faad14', marginBottom: 12 }}>
                Produk Diperbarui (Jumlah Dikurangi):
              </h4>
              <List
                dataSource={stockErrorItems.updated}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      title={item.nama_produk || item.name}
                      description={
                        <span>
                          Qty: <strong>{item.oldQty}</strong> → <strong>{item.newQty}</strong> | 
                          {formatCurrency(item.harga_jual || item.price)}
                        </span>
                      }
                    />
                  </List.Item>
                )}
              />
            </div>
          )}

          {/* Info Message */}
          {cartItems.length > 0 && (
            <Alert
              message="Keranjang Anda telah diperbarui dengan stok terbaru. Silakan tinjau kembali sebelum melanjutkan."
              type="info"
              style={{ marginBottom: 16 }}
            />
          )}

          {cartItems.length === 0 && (
            <Alert
              message="Semua produk dalam keranjang Anda tidak tersedia lagi. Silakan kembali ke katalog untuk memilih produk lain."
              type="warning"
            />
          )}
        </div>
      </Modal>
    </Layout>
  );
};

export default Checkout;
