# Panduan Penggunaan Project (Ratu Oki Apps)

Panduan ini ditulis dalam Bahasa Indonesia sederhana. Berisi langkah-langkah setup, cara menjalankan, dan panduan singkat fitur untuk tiga peran: Pengguna (consumer), Admin, dan Supplier.

**Persyaratan awal**
- Node.js (versi 14 atau lebih baru direkomendasikan)
- npm (biasanya sudah terpasang bersama Node.js)

**1. Setup dan Menjalankan Proyek (Development)**
1. Buka terminal di folder proyek: [README.md](README.md)
2. Install dependensi:

```bash
npm install
```

3. Menjalankan development server:

```bash
npm start
```

4. Akses aplikasi di browser: http://localhost:3000

Catatan: jika port 3000 sudah digunakan, CRA akan menawarkan port lain.

**2. Build untuk produksi**

```bash
npm run build
```

Folder `build/` akan terbuat dan siap di-deploy.

**3. Struktur penting di folder `src/`**
- `src/pages/Consumer/` : halaman untuk pengguna (shopping, cart, checkout, riwayat, status pesanan)
- `src/pages/Admin/` : halaman dashboard admin (pengguna, produk, transaksi, laporan, pengaturan)
- `src/pages/Supplier/` : halaman untuk supplier (manajemen rekening bank dll.)
- `src/services/api.js` : konfigurasi panggilan API
- `src/context/AuthContext.js` : manajemen autentikasi dan role

**4. Fitur utama (Ringkasan singkat)**
- Fitur Pengguna (Consumer):
	- Melihat daftar produk
	- Menambah produk ke keranjang
	- Checkout dan memilih metode pembayaran
	- Melihat riwayat pesanan dan status pesanan

- Fitur Admin:
	- Dashboard metrik penjualan dan aktivitas terbaru
	- Kelola produk (tambah/ubah/hapus)
	- Kelola pengguna
	- Kelola transaksi dan verifikasi pembayaran
	- Laporan penjualan

- Fitur Supplier:
	- Kelola data rekening bank untuk menerima pembayaran
	- Melacak pesanan yang terkait supplier (jika ada fitur pemisahan supplier)

**5. Panduan singkat per peran (langkah yang paling sering dilakukan)**

- Pengguna (Consumer):
	1. Buka halaman utama di `http://localhost:3000`.
	2. Gunakan menu atau pencarian untuk menemukan produk.
	3. Klik produk lalu pilih "Tambah ke Keranjang".
	4. Buka halaman `Cart` lalu klik "Checkout".
	5. Isi data pengiriman dan pilih metode pembayaran lalu konfirmasi.
	6. Pantau status pesanan di halaman `Riwayat` atau `Status Pesanan`.

- Admin:
	1. Login ke area admin (biasanya ada rute `/admin` atau tombol di UI).
	2. Buka `Dashboard` untuk melihat ringkasan metrik.
	3. Gunakan menu `Produk` untuk menambah/ubah/hapus produk.
	4. Buka `Transaksi` untuk melihat pesanan masuk dan verifikasi pembayaran.
	5. Gunakan `Laporan` untuk mengekspor data penjualan.

- Supplier:
	1. Login sebagai supplier.
	2. Buka halaman `BankAccountManager` untuk menambahkan atau memperbarui rekening.
	3. Cek pesanan terkait supplier (jika tersedia) dan konfirmasi pemenuhan.

**6. Konfigurasi API dan autentikasi**
- Endpoint API utama dikelola di `src/services/api.js`.
- Untuk menjalankan fitur yang membutuhkan login, pastikan backend (API) tersedia dan Anda memiliki URL serta token yang benar.

Jika ada variabel environment yang diperlukan, tambahkan file `.env` mengikuti dokumentasi backend (mis. `REACT_APP_API_URL=https://api.example.com`).

**7. Troubleshooting singkat**
- Jika `npm start` error:
	- Jalankan `npm install` ulang.
	- Hapus `node_modules/` dan `package-lock.json`, lalu `npm install`.
- Jika kesalahan API (CORS/auth): periksa `REACT_APP_API_URL` dan kebijakan backend.

**8. Cara kontribusi singkat**
1. Buat branch baru untuk perubahan: `git checkout -b feat/nama-fitur`
2. Lakukan perubahan, lalu jalankan `npm start` untuk tes lokal.
3. Commit dan push, lalu buat pull request.

**9. Kesimpulan**

Ratu Oki Apps adalah aplikasi frontend e-commerce dan supply chain yang membantu menghubungkan consumer, admin, dan supplier dalam satu alur kerja. Consumer dapat melihat produk, melakukan checkout, dan memantau pesanan; admin dapat mengelola produk, pengguna, transaksi, serta laporan; sedangkan supplier dapat mengelola informasi pendukung seperti rekening dan data produk yang disupply.

Dengan dukungan React, integrasi API, autentikasi berbasis role, serta halaman yang dipisahkan sesuai kebutuhan setiap pengguna, aplikasi ini dapat menjadi dasar sistem penjualan dan pengelolaan stok yang lebih terstruktur. README ini diharapkan membantu proses instalasi, pengembangan, dan pemahaman fitur utama agar proyek lebih mudah dijalankan maupun dikembangkan kembali.

--
Jika mau, saya bisa:
- Menambahkan contoh `.env.example` dengan variabel yang dibutuhkan
- Menambahkan petunjuk login admin dan akun testing (jika tersedia)
- Menyusun panduan screenshot untuk tiap halaman

Beritahu langkah mana yang ingin kamu lengkapkan terlebih dulu.
