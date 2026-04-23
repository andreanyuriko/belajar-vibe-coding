# Belajar Vibe Coding - Backend API

Aplikasi ini adalah backend API sederhana untuk sistem autentikasi pengguna menggunakan Bun, ElysiaJS, dan Drizzle ORM.

## 🚀 Teknologi yang Digunakan

- **Runtime**: [Bun](https://bun.sh/)
- **Framework**: [ElysiaJS](https://elysiajs.com/)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Database**: MySQL (via `mysql2`)
- **Lainnya**:
  - `bcrypt`: Untuk hashing password.
  - `drizzle-kit`: Untuk migrasi dan push schema database.

## 📁 Arsitektur Proyek

Proyek ini menggunakan struktur folder yang terorganisir untuk memisahkan tanggung jawab:

- `src/`
  - `db/`: Berisi konfigurasi koneksi database dan definisi schema (`schema.ts`).
  - `routes/`: Mendefinisikan endpoint API menggunakan Elysia. Contoh: `users-route.ts`.
  - `services/`: Berisi logika bisnis (business logic) dan interaksi langsung dengan database.
  - `index.ts`: Entry point aplikasi.
- `drizzle/`: File migrasi yang dihasilkan oleh Drizzle (jika ada).
- `test/`: Berisi file pengujian (integration tests).
- `package.json`: Definisi dependensi dan script.
- `.env`: Konfigurasi variabel lingkungan (environment variables).

## 🗄️ Struktur Database

Terdapat dua tabel utama dalam database:

1. **`users`**
   - `id`: Primary key (serial).
   - `name`: Nama lengkap pengguna.
   - `email`: Alamat email (unik).
   - `password`: Password yang sudah di-hash.
   - `created_at`: Waktu pendaftaran.

2. **`sessions`**
   - `id`: Primary key (serial).
   - `token`: Token sesi untuk autentikasi.
   - `user_id`: Foreign key ke tabel `users`.
   - `created_at`: Waktu sesi dibuat.

## 🛣️ API Endpoints

Aplikasi ini menyediakan endpoint berikut:

### Publik
- **POST `/api/users`**
  - Mendaftarkan pengguna baru.
  - Body: `{ name, email, password }`
- **POST `/api/users/login`**
  - Login pengguna dan mendapatkan token.
  - Body: `{ email, password }`
  - Return: `{ data: "token_string" }`

### Terproteksi (Butuh Header `Authorization: Bearer <token>`)
- **GET `/api/users/current`**
  - Mengambil informasi profil pengguna yang sedang login.
- **GET `/api/users/logout`**
  - Menghapus sesi aktif pengguna.

### Umum
- **GET `/`**: Cek status aplikasi.
- **GET `/health`**: Health check.

## 🛠️ Setup Proyek

1. **Instalasi Dependensi**
   ```bash
   bun install
   ```

2. **Konfigurasi Environment**
   Salin file `.env.example` menjadi `.env` dan sesuaikan URL database Anda:
   ```env
   DATABASE_URL=mysql://user:password@localhost:3306/db_name
   ```

3. **Sinkronisasi Database**
   Jalankan perintah berikut untuk membuat tabel di database MySQL Anda:
   ```bash
   bun run db:push
   ```

## 🏃 Cara Menjalankan

Untuk menjalankan aplikasi dalam mode development:
```bash
bun run dev
```
Aplikasi akan berjalan di `http://localhost:3000`.

## 🧪 Cara Testing

Aplikasi ini menggunakan engine test bawaan Bun. Untuk menjalankan pengujian:
```bash
bun test
```
Pastikan database testing Anda sudah siap atau gunakan environment yang sesuai karena test akan membersihkan data sebelum dijalankan.
