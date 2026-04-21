# Warkop Warga - Sistem Pemesanan Digital

## 🎯 Tentang Sistem

Sistem pemesanan digital untuk Warkop Warga yang memungkinkan pelanggan untuk:
- Scan QR code di meja untuk langsung memesan
- Browse menu dan menambahkan pesanan ke keranjang
- Checkout dengan berbagai metode pembayaran
- Generate dan print struk digital

## 📱 Cara Menggunakan Sistem

### Untuk Pelanggan:

1. **Scan QR Code atau Input Nomor Meja**
   - Scan QR code yang ada di meja Anda
   - Atau buka halaman utama dan masukkan nomor meja secara manual
   - URL: `http://localhost:5173/` atau `http://localhost:5173/?table=5` (untuk meja 5)

2. **Browse dan Pilih Menu**
   - Lihat semua menu minuman dan makanan
   - Filter berdasarkan kategori (Minuman/Makanan)
   - Klik tombol "Tambah" untuk menambahkan item ke keranjang
   - Lihat badge "Populer" untuk menu favorit

3. **Review Pesanan di Keranjang**
   - Klik tombol "Keranjang" di header
   - Atur jumlah item dengan tombol +/-
   - Hapus item yang tidak diinginkan
   - Lihat total harga pesanan

4. **Checkout & Pembayaran**
   - Klik "Lanjut ke Pembayaran"
   - Review ringkasan pesanan
   - Pilih metode pembayaran:
     * Tunai (bayar di kasir)
     * QRIS
     * Transfer Bank
   - Klik "Konfirmasi Pesanan"

5. **Dapatkan Struk Digital**
   - Struk otomatis muncul setelah konfirmasi
   - Opsi untuk:
     * Print struk (untuk bukti pembayaran fisik)
     * Download struk sebagai file txt
   - Tunjukkan struk kepada kasir untuk pembayaran

### Untuk Admin/Pemilik:

1. **Generate QR Code untuk Meja**
   - Buka halaman admin: `http://localhost:5173/admin/qr`
   - Atur jumlah meja yang dibutuhkan
   - Setiap QR code berisi link dengan nomor meja spesifik
   - Download QR code individual atau semua sekaligus

2. **Print & Pasang QR Code**
   - Download QR code dalam format PNG
   - Print dengan ukuran yang sesuai (rekomendasi: A5 atau A6)
   - Pasang di setiap meja dengan jelas
   - Pastikan QR code mudah di-scan oleh pelanggan

## 🎨 Fitur Utama

### ✅ Yang Sudah Diimplementasi:
- ✅ Sistem pemilihan meja (manual & QR scan)
- ✅ Menu digital dengan kategori
- ✅ Shopping cart dengan management item
- ✅ Checkout dengan pilihan metode pembayaran
- ✅ Generate struk digital (print & download)
- ✅ QR Code generator untuk admin
- ✅ Responsive design untuk mobile & desktop
- ✅ Color scheme hijau-kuning-putih soft

### 🔮 Rekomendasi Pengembangan dengan Supabase:

Untuk implementasi production yang lebih robust, disarankan menggunakan Supabase untuk:

1. **Database Order Management**
   - Simpan semua pesanan di database
   - Real-time tracking status pesanan
   - History transaksi pelanggan

2. **Table Management**
   - Status meja (available/occupied)
   - Tracking pesanan per meja
   - Queue management

3. **Real-time Updates**
   - Notifikasi ke dapur saat ada pesanan baru
   - Update status pesanan untuk pelanggan
   - Live dashboard untuk monitoring

4. **Payment Integration**
   - Integrasi dengan payment gateway (Midtrans, Xendit, dll)
   - Verifikasi pembayaran otomatis
   - Payment receipt yang lebih lengkap

5. **Analytics & Reporting**
   - Laporan penjualan harian/bulanan
   - Menu terlaris
   - Revenue tracking

**Note:** Figma Make tidak ditujukan untuk mengumpulkan data pribadi sensitif atau informasi pembayaran yang memerlukan keamanan tinggi. Untuk production, gunakan backend yang proper dengan enkripsi dan security measures yang sesuai.

## 🚀 Routes

- `/` - Table Selection (pilih nomor meja)
- `/menu` - Menu & Shopping Cart
- `/checkout` - Checkout & Payment Selection
- `/receipt/:orderId` - Digital Receipt
- `/admin/qr` - QR Code Generator (Admin)
- `/welcome` - Landing Page Info

## 💡 Tips Implementasi

1. **QR Code Placement**
   - Pasang di tempat yang mudah terlihat di meja
   - Gunakan sticker waterproof
   - Berikan instruksi singkat cara scan

2. **Training Staff**
   - Latih kasir untuk verifikasi struk digital
   - Pastikan staff memahami alur pemesanan
   - Siapkan backup manual jika sistem down

3. **Customer Onboarding**
   - Buat poster instruksi di entrance
   - Staff membantu customer pertama kali
   - Sediakan nomor kontak untuk bantuan

## 🎯 Flow Diagram

```
Customer Datang
    ↓
Scan QR / Input Nomor Meja
    ↓
Browse Menu
    ↓
Tambah ke Keranjang
    ↓
Review Pesanan
    ↓
Pilih Metode Pembayaran
    ↓
Konfirmasi Pesanan
    ↓
Dapatkan Struk Digital
    ↓
Tunjukkan ke Kasir
    ↓
Bayar & Selesai
```

## 🎨 Design System

- **Primary Color**: #6B9B7A (Hijau Soft)
- **Secondary Color**: #F8E6A8 (Kuning Soft)
- **Background**: #FEFDF8 (Putih Cream)
- **Text**: #2C3E2E (Hijau Gelap)

## 📝 Catatan Penting

- Sistem saat ini menggunakan localStorage untuk menyimpan pesanan (development only)
- Untuk production, implementasi backend database diperlukan
- Pastikan koneksi internet stabil untuk loading gambar
- Test QR code sebelum dipasang di semua meja
