# CRUD Produk — Next.js + MySQL (Aiven) di Vercel

Aplikasi CRUD sederhana (Create, Read, Update, Delete) untuk data "produk", dibangun dengan Next.js App Router dan database MySQL, siap deploy ke Vercel dengan database di Aiven.

## Struktur Project

```
app/
  api/products/route.js         -> GET (list), POST (create)
  api/products/[id]/route.js    -> GET (detail), PUT (update), DELETE
  page.js                       -> Halaman utama (tabel + form)
  layout.js
  globals.css
lib/
  db.js                         -> Koneksi pool MySQL (support SSL Aiven)
schema.sql                      -> Skema tabel `products`
.env.local.example              -> Contoh environment variables
```

## 1. Buat Database di Aiven

1. Login ke https://aiven.io lalu buat service baru → pilih MySQL → plan Free.
2. Pilih region terdekat, tunggu status menjadi "Running".
3. Buka tab Overview, catat: `Host`, `Port`, `User` (biasanya `avnadmin`), `Password`, `Database name` (default `defaultdb`).
4. Download CA Certificate (`ca.pem`) dari halaman yang sama.
5. Buat tabelnya. Bisa lewat Aiven Console (query editor) atau CLI MySQL:

```
mysql --host=<HOST> --port=<PORT> --user=<USER> --password=<PASSWORD> \
  --database=<DBNAME> --ssl-mode=REQUIRED < schema.sql
```

## 2. Setup Project Secara Lokal

```
npm install
cp .env.local.example .env.local
```

Isi `.env.local` dengan kredensial Aiven kamu:

```
DB_HOST=your-service.aivencloud.com
DB_PORT=xxxxx
DB_USER=avnadmin
DB_PASSWORD=xxxxx
DB_NAME=defaultdb
DB_CA_CERT=<base64 dari ca.pem>
```

Generate nilai `DB_CA_CERT` dari file `ca.pem` yang tadi didownload:

```
base64 -i ca.pem | tr -d '\n'
```

> Di Linux, pakai `base64 -w 0 ca.pem`. Di Windows PowerShell:
> `[Convert]::ToBase64String([IO.File]::ReadAllBytes("ca.pem"))`

Copy hasilnya (satu baris panjang) ke `.env.local`.

Jalankan secara lokal:

```
npm run dev
```

Buka http://localhost:3000 — kamu akan melihat form tambah produk dan tabel daftar produk.

## 3. Push ke GitHub

```
git init
git add .
git commit -m "Initial commit: CRUD produk Next.js + MySQL"
git branch -M main
git remote add origin https://github.com/username/nama-repo.git
git push -u origin main
```

Pastikan `.env.local` tidak ikut ter-commit (sudah otomatis diabaikan lewat `.gitignore`).

## 4. Deploy ke Vercel

1. Login ke https://vercel.com dengan akun GitHub.
2. Klik Add New → Project, pilih repo yang baru saja di-push.
3. Di bagian Environment Variables, tambahkan variabel yang sama persis seperti di `.env.local`:
   * `DB_HOST`
   * `DB_PORT`
   * `DB_USER`
   * `DB_PASSWORD`
   * `DB_NAME`
   * `DB_CA_CERT`
4. Klik Deploy.
5. Setelah selesai, buka URL yang diberikan Vercel (`https://nama-project.vercel.app`) — aplikasi CRUD sudah bisa dipakai.

## Fitur

* Create: tambah produk baru lewat form (nama, deskripsi, harga)
* Read: daftar semua produk otomatis dimuat saat halaman dibuka
* Update: klik "Edit" pada baris produk untuk mengubah data
* Delete: klik "Hapus" untuk menghapus produk (dengan konfirmasi)

## Catatan

* Koneksi database memakai `mysql2` dengan connection pool kecil (`connectionLimit: 5`) agar aman untuk serverless di Vercel.
* Semua query memakai parameter (`?`) sehingga aman dari SQL injection.
* Free plan Aiven bisa otomatis dimatikan jika lama tidak aktif; nyalakan kembali dari console bila koneksi gagal.
