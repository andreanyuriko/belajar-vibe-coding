# Bug: Validasi Panjang Input API Terlalu Longgar (Database Error)

## Deskripsi Bug
Aplikasi saat ini rentan mengalami *database crash/error* ketika klien mengirimkan data *string* yang sangat panjang pada endpoint registrasi dan login. MySQL melemparkan pesan error *"Failed query: Data too long for column"* karena skema tabel `users` membatasi kolom `name`, `email`, dan `password` maksimal 255 karakter (`varchar 255`).

Sayangnya, di sisi API (ElysiaJS), kita belum membatasi panjang input tersebut sehingga data yang cacat lolos dari layer API dan langsung menabrak layer Database.

## Instruksi Perbaikan

Kita harus menahan input yang melebihi 255 karakter langsung di layer API menggunakan fitur validasi TypeBox yang sudah tertanam di ElysiaJS. Silakan ikuti instruksi di bawah ini dengan teliti.

### 1. Perbaiki Validasi Endpoint Registrasi
Buka file `src/routes/users-route.ts`. Cari bagian *handler* untuk `POST /api/users` yang mengurus registrasi.

Pada bagian akhir *handler* tersebut, terdapat blok validasi `body`. Tambahkan parameter opsi `{ maxLength: 255 }` pada setiap atribut tipe data string.

**Ubah dari ini:**
```typescript
body: t.Object({
  name: t.String(),
  email: t.String(),
  password: t.String(),
}),
```

**Menjadi ini:**
```typescript
body: t.Object({
  name: t.String({ maxLength: 255 }),
  email: t.String({ maxLength: 255 }),
  password: t.String({ maxLength: 255 }),
}),
```

### 2. Perbaiki Validasi Endpoint Login
Masih di file `src/routes/users-route.ts`, cari bagian *handler* untuk `POST /api/users/login`. 
Terapkan hal yang sama pada blok validasi untuk login.

**Ubah dari ini:**
```typescript
body: t.Object({
  email: t.String(),
  password: t.String(),
}),
```

**Menjadi ini:**
```typescript
body: t.Object({
  email: t.String({ maxLength: 255 }),
  password: t.String({ maxLength: 255 }),
}),
```

### 3. Pengetesan
Setelah kode disimpan:
1. Jalankan aplikasi menggunakan `bun run dev`.
2. Kirimkan JSON *request body* yang berisi karakter berlebih (misal 300 huruf "A" pada properti `name` atau `email`).
3. Pastikan API sekarang memberikan respons error validasi bawaan ElysiaJS (biasanya berstatus `422 Unprocessable Entity`), dan Anda tidak lagi melihat error *"Failed query"* mentah dari sistem database MySQL.
