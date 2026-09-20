# ID Card Karyawan

Modul ID Card sudah ditambahkan ke Dashboard Admin pada menu **PEOPLE → ID Card**.

## Fitur
- Mengambil data karyawan langsung dari tabel `karyawan`.
- Cari dan pilih karyawan.
- Preview kartu sisi depan/belakang.
- Download PNG.
- Download SVG resolusi tinggi.
- Print langsung dari browser.
- Batch print beberapa karyawan sekaligus.
- Tombol **Print / PDF** menggunakan dialog print browser; pilih **Save as PDF** untuk menghasilkan PDF.
- Jika database memiliki salah satu kolom `foto_url`, `foto`, atau `photo_url`, foto akan digunakan otomatis. Jika belum ada, kartu menampilkan inisial nama.
- Data sensitif seperti NIK, alamat, rekening, dan nomor telepon tidak dicetak ke kartu.

## Catatan
Template memakai ukuran kartu 856×540 px (rasio sekitar 1.585), cocok untuk preview digital dan print. ID karyawan menggunakan `id_karyawan`, dengan fallback ke UUID `id`.
