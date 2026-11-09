# SKM Kemenag Kota Palembang

Aplikasi Survei Kepuasan Masyarakat (SKM) dan Persepsi Anti Korupsi untuk Kementerian Agama Kota Palembang. Menggantikan formulir Google Form sebelumnya dengan aplikasi web berbasis Laravel + Inertia.js (React).

## Stack

- Backend: Laravel 13 / PHP 8.5, MySQL 8
- Frontend: Inertia.js v3 → React 19 + TypeScript (Vite), Tailwind CSS v4, shadcn/ui
- Auth: Laravel Fortify (admin only, tanpa registrasi publik)
- Autorisasi: spatie/laravel-permission (super_admin, admin_unit, viewer)
- Export: maatwebsite/excel, barryvdh/laravel-dompdf
- QR Code: bacon/bacon-qr-code
- Testing: Pest (backend), Vitest + React Testing Library (frontend)

## Setup Lokal

```bash
composer install
cp .env.example .env
php artisan key:generate
# atur DB_* di .env
php artisan migrate --seed
npm install
npm run build
php artisan serve
```

Atau gunakan script setup:

```bash
composer run setup
```

Akun demo (password: `password`):

- superadmin@kemenag.palembang.go.id (super_admin)
- adminunit@kemenag.palembang.go.id (admin_unit)
- viewer@kemenag.palembang.go.id (viewer)

## Perhitungan IKM

- Nilai responden = rata-rata seluruh jawaban (skor 1–4).
- NRR per pertanyaan = rata-rata skor seluruh responden.
- IKM Total = rata-rata NRR × 25 (skala 25–100).
- IKM Pelayanan = rata-rata NRR kelompok A × 25.
- Indeks Anti Korupsi = rata-rata NRR kelompok B × 25.
- Mutu pelayanan: A (88,31–100), B (76,61–88,30), C (65,00–76,60), D (25,00–64,99).

Lihat `App\Services\IkmCalculator` (unit test: `tests/Unit/Services/IkmCalculatorTest.php`).

## Anti-Spam

- Throttle 5 pengiriman/jam per IP pada route POST `/survei`.
- Honeypot field `website` (harus kosong).
- Cloudflare Turnstile opsional (set `TURNSTILE_SITE_KEY` dan `TURNSTILE_SECRET_KEY`).
- Deteksi duplikat: nama + unit + kebutuhan sama dalam 10 menit terakhir → ditolak dengan pesan ramah.

## Brading (Estimasi Warna)

Warna berikut adalah estimasi dan dapat disesuaikan di `resources/css/app.css` (variabel CSS) tanpa mengubah kode komponen:

- `--kemenag-primary`: #1B7F3B (hijau Kemenag)
- `--kemenag-primary-dark`: #0F5A28
- `--kemenag-primary-light`: #E6F4EA
- `--kemenag-accent`: #F2B705 (emas)
- `--kemenag-surface`: #FFFFFF
- `--kemenag-text`: #1F2937
- `--kemenag-muted`: #6B7280
- Grade A: hijau primer, B: hijau muda/teal, C: amber, D: #C62828

Font: Inter (self-hosted via @fontsource). Body minimum 16px di mobile.

## Asumsi

1. Laravel yang terpasang adalah versi 13 (starter kit), meskipun spesifikasi awal menyebut Laravel 12. API yang digunakan mengikuti versi terpasang.
2. React 19 dan Tailwind v4 mengikuti starter kit yang tersedia (spesifikasi awal menyebut React 18).
3. QR Code menggunakan `bacon/bacon-qr-code` (bukan `simplesoftwareio/simple-qrcode`) karena konflik dependensi dengan Fortify (`bacon/bacon-qr-code`).
4. Grade mutu pelayanan dihitung dari IKM Pelayanan (bukan IKM Total).
5. Mode anonim: bila aktif, nama responden boleh kosong.
6. Caching IKM per filter dan invalidasi tag belum diimplementasikan (perhitungan langsung dari DB).
7. Impor data lama dijalankan sinkron pada request (tanpa queue/progress bar) karena volume data tiap periode kecil; parser otomatis memetakan kolom Google Form lama, memisahkan gabungan "Pilihan Pelayanan"/"Kebutuhan" dengan pencocokan awalan nama unit layanan, menerima timestamp `dd/mm/yyyy H:mm:ss`, memetakan teks Likert (Sangat Puas=4 … Tidak Puas=1), melewati baris error/duplikat (nama + unit + kebutuhan sama dalam 10 menit), dan membuat baris pekerjaan baru bila belum ada (is_active=false). Role `viewer` hanya dapat melihat halaman impor, tidak dapat memproses.
8. Ekspor Excel laporan terdiri dari 3 sheet (Rekap Responden, NRR per Pertanyaan, IKM) dan PDF menggunakan DomPDF dengan grafik SVG di sisi server.
9. `formatNumber()` tersedia di PHP (`App\Support\NumberFormatter`) dan di React (`resources/js/lib/formatNumber.ts`) dengan aturan yang sama (desimal koma, pemisah ribuan titik, 2 desimal).

## Deploy

### Nginx + PHP-FPM

- Build aset: `npm run build`.
- Jalankan migrasi: `php artisan migrate --force`.
- Arahkan document root ke `public/`.
- Konfigurasi PHP-FPM pool sesuai kebutuhan.
- Pastikan queue worker (database driver) berjalan: `php artisan queue:work`.

### Docker Compose

Lihat `docker-compose.yml` (jika tersedia). Build image, jalankan migrasi, lalu akses aplikasi.

### CI (GitHub Actions)

Workflow di `.github/workflows/ci.yml` menjalankan: Pint, ESLint, tsc --noEmit, Pest, Vitest, Vite build.

## Backup Database

```bash
mysqldump -u user -p skmkemenag > backup_$(date +%F).sql
```

## Lisensi

MIT (starter kit Laravel).
