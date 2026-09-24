# Lumbung Edukatif

Website pembelajaran dengan frontend HTML, API serverless Vercel, dan MongoDB Atlas sebagai database media.

## 1. Siapkan MongoDB Atlas

1. Buat akun dan cluster gratis di [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Buat **Database User** dan simpan username/password-nya.
3. Pada **Network Access**, tambahkan akses untuk Vercel. Untuk percobaan awal dapat memakai `0.0.0.0/0`, tetapi sebaiknya dibatasi sesuai kebutuhan produksi.
4. Salin connection string MongoDB Atlas. Ganti username, password, dan nama cluster sesuai akun Anda.

## 2. Upload project ke GitHub

Jalankan dari folder proyek:

```powershell
git init
git add .
git commit -m "Siapkan MongoDB dan Vercel"
git branch -M main
git remote add origin https://github.com/USERNAME/NAMA-REPOSITORY.git
git push -u origin main
```

File `.env` tidak akan ikut karena sudah masuk `.gitignore` dan `.vercelignore`.

## 3. Deploy ke Vercel

1. Masuk ke [Vercel](https://vercel.com/) dengan akun GitHub.
2. Pilih **Add New → Project**, lalu import repository.
3. Pada **Environment Variables**, tambahkan:

   ```text
   MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/?retryWrites=true&w=majority
   MONGODB_DB=lumbung_edukatif
   BLOB_READ_WRITE_TOKEN=vercel_blob_rw_ganti_token_blob
   AUTH_SECRET=buat-rahasia-acak-minimal-32-karakter
   EDITOR_USERNAME=editor
   EDITOR_PASSWORD=buat-password-editor-yang-kuat
   ```

   Aktifkan keenam variabel untuk **Production**, **Preview**, dan **Development**.

4. Gunakan pengaturan berikut:
   - Framework Preset: **Other**
   - Root Directory: `./`
   - Build Command: kosong
   - Output Directory: kosong
5. Klik **Deploy**.

Setelah deployment selesai, buka URL Vercel dan login memakai `EDITOR_USERNAME` serta `EDITOR_PASSWORD`. Jika collection MongoDB masih kosong, data contoh awal akan dikirim ke MongoDB ketika login editor pertama kali.

## 4. Deploy langsung dengan Vercel CLI

```powershell
npm.cmd install -g vercel
vercel.cmd login
vercel.cmd --prod
```

Tetap masukkan environment variables di dashboard Vercel atau melalui pengaturan project CLI.

## 5. Menjalankan lokal

Salin `.env.example` menjadi `.env` dan isi nilainya, lalu pasang dependency:

```powershell
Copy-Item .env.example .env
npm.cmd install
npx.cmd vercel dev
```

Buka `http://localhost:3000`. Untuk PowerShell Windows yang memblokir `npm.ps1`, gunakan bentuk `.cmd` seperti contoh di atas.

## Catatan keamanan dan arsitektur

- `api/media.js` menyediakan GET publik dan operasi tulis yang hanya dapat dilakukan setelah login editor.
- `api/download.js` mengambil file dari URL media dan mengirimkannya dengan `Content-Disposition: attachment`, sehingga tombol unduh mengunduh file alih-alih membuka preview PDF.
- `api/upload.js` membuat token untuk direct client upload; file dikirim langsung dari browser ke Vercel Blob sehingga tidak melewati batas request Function 4,5 MB.
- Session editor memakai cookie `HttpOnly` yang ditandatangani `AUTH_SECRET`; jangan gunakan nilai contoh untuk production.
- File media fisik disimpan di Vercel Blob, sedangkan MongoDB menyimpan metadata dan URL file.
- Jangan pernah commit `.env` atau membagikan `MONGODB_URI`, `AUTH_SECRET`, dan `EDITOR_PASSWORD`.
