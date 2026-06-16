# Kios Mini App (Kios SkynCkz)

Aplikasi POS sederhana untuk kios kecil: manajemen produk, stok, dan pencatatan penjualan dengan scan barcode menggunakan kamera HP. Prioritas: Web terlebih dahulu.

Teknologi rekomendasi:
- Backend: Node.js + Express
- Database: Firebase Firestore (mudah untuk realtime dan setup cepat)
- Frontend Web: React
- Barcode scanning (web): html5-qrcode (menggunakan kamera perangkat)

Langkah cepat untuk memulai:
1. Buat project Firebase dan aktifkan Firestore.
2. Buat Service Account di Firebase Console -> Project Settings -> Service accounts -> Generate new private key. Simpan file JSON.
3. Buat repository ini di GitHub (sudah dibuat oleh Anda).
4. Clone repo, lalu ikuti instruksi per-folder (backend, web).

Struktur awal:
```
kios-mini-app/
├── backend/
│   ├── package.json
│   ├── index.js
│   └── .env.example
├── web/
│   ├── package.json
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       └── App.jsx
├── .gitignore
└── README.md
```

Catatan keamanan:
- Jangan commit file service account JSON ke repo.
- Gunakan environment variables untuk konfigurasi.

Jika Anda ingin, saya bisa:
- Push perubahan ini ke repo Anda (saya sudah menyiapkan file awal).
- Membantu mengatur Firebase dan menguji endpoint.
- Menambahkan fitur reporting/CSV export.

Selanjutnya: jalankan instruksi di folder `backend` dan `web` untuk menjalankan server dan antarmuka web.
