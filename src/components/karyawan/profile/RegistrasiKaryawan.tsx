import React, { useState } from 'react';
import moonLogo from '../../../assets/moon-logo.svg';
import { supabase } from '../../../lib/supabase/client';
import '../../../styles/employee/registration.css';

interface RegistrasiKaryawanProps {
  onBack?: () => void;
}

export default function RegistrasiKaryawan({ onBack }: RegistrasiKaryawanProps) {
  const [form, setForm] = useState({
    nik_ktp: '',
    id_karyawan: '',
    nama: '',
    tempat_lahir: '',
    tanggal_lahir: '',
    jenis_kelamin: '',
    alamat_rumah: '',
    no_telp: '',
    email: '',
    status_pernikahan: '',
    nama_ibu_kandung: '',
    departemen: '',
    jabatan: '',
    status_karyawan: '',
    tanggal_masuk: '',
    gaji_pokok: '',
    bank_name: '',
    bank_account: '',
    password: '',
    konfirmasi: '',
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];

    if (!file.type.startsWith('image/')) {
      setError('File foto harus berupa gambar.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('Ukuran foto maksimal 2MB.');
      return;
    }

    setError('');
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const nik = form.nik_ktp.trim();
    const idKaryawan = form.id_karyawan.trim();
    const nama = form.nama.trim();
    const email = form.email.trim();

    if (!nik) {
      setError('NIK KTP wajib diisi.');
      return;
    }

    if (!/^[0-9]{16}$/.test(nik)) {
      setError('NIK KTP harus terdiri dari 16 digit angka.');
      return;
    }

    if (
      idKaryawan &&
      !/^[A-Za-z0-9][A-Za-z0-9._-]{2,31}$/.test(idKaryawan)
    ) {
      setError(
        'ID Karyawan hanya boleh berisi huruf, angka, titik, garis bawah, atau tanda hubung (3–32 karakter).'
      );
      return;
    }

    if (!nama) {
      setError('Nama lengkap wajib diisi.');
      return;
    }

    if (!form.tempat_lahir.trim()) {
      setError('Tempat lahir wajib diisi.');
      return;
    }

    if (!form.tanggal_lahir) {
      setError('Tanggal lahir wajib diisi.');
      return;
    }

    if (!form.jenis_kelamin) {
      setError('Jenis kelamin wajib dipilih.');
      return;
    }

    if (!form.alamat_rumah.trim()) {
      setError('Alamat rumah wajib diisi.');
      return;
    }

    if (!form.no_telp.trim()) {
      setError('Nomor telepon wajib diisi.');
      return;
    }

    if (!/^[0-9+\-\s()]{8,20}$/.test(form.no_telp.trim())) {
      setError('Format nomor telepon tidak valid.');
      return;
    }

    if (!email) {
      setError('Email wajib diisi.');
      return;
    }

    if (!form.status_pernikahan) {
      setError('Status pernikahan wajib dipilih.');
      return;
    }

    if (!form.nama_ibu_kandung.trim()) {
      setError('Nama ibu kandung wajib diisi.');
      return;
    }

    if (!form.departemen.trim()) {
      setError('Departemen wajib diisi.');
      return;
    }

    if (!form.jabatan.trim()) {
      setError('Jabatan wajib diisi.');
      return;
    }

    if (!form.status_karyawan) {
      setError('Status karyawan wajib dipilih.');
      return;
    }

    if (!form.tanggal_masuk) {
      setError('Tanggal masuk wajib diisi.');
      return;
    }

    if (!form.gaji_pokok.trim()) {
      setError('Gaji pokok wajib diisi.');
      return;
    }

    const gaji = Number(form.gaji_pokok.replace(/[^0-9]/g, ''));

    if (!Number.isFinite(gaji) || gaji < 0) {
      setError('Gaji pokok tidak valid.');
      return;
    }

    if (form.password.length < 6) {
      setError('Password minimal 6 karakter.');
      return;
    }

    if (form.password !== form.konfirmasi) {
      setError('Konfirmasi password tidak sama.');
      return;
    }

    setLoading(true);

    try {
      let uploadedPhotoUrl = '';

      if (photoFile) {
        const fileExt =
          photoFile.name.split('.').pop()?.toLowerCase() || 'jpg';

        const fileName = `reg-${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('profile-photos')
          .upload(filePath, photoFile, {
            upsert: true,
            contentType: photoFile.type,
          });

        if (uploadError) {
          throw uploadError;
        }

        const { data: urlData } = supabase.storage
          .from('profile-photos')
          .getPublicUrl(filePath);

        uploadedPhotoUrl = urlData.publicUrl;
      }

      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password: form.password,
        options: {
          data: {
            nik_ktp: nik,
            id_karyawan: idKaryawan
              ? idKaryawan.toUpperCase()
              : null,
            nama,
            tempat_lahir: form.tempat_lahir.trim(),
            tanggal_lahir: form.tanggal_lahir || null,
            jenis_kelamin: form.jenis_kelamin,
            alamat_rumah: form.alamat_rumah.trim(),
            no_telp: form.no_telp.trim(),
            status_pernikahan: form.status_pernikahan,
            nama_ibu_kandung: form.nama_ibu_kandung.trim(),
            departemen: form.departemen.trim(),
            jabatan: form.jabatan.trim(),
            status_karyawan: form.status_karyawan,
            tanggal_masuk: form.tanggal_masuk || null,
            gaji_pokok: String(gaji),
            bank_name: form.bank_name.trim(),
            bank_account: form.bank_account.trim(),
            foto_url: uploadedPhotoUrl,
          },
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      setSuccess(true);
    } catch (err: any) {
      setError(
        err?.message ||
          'Pendaftaran gagal. Silakan coba lagi.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="registration-page">
        <div className="registration-success">
          <div className="registration-logo">
            <img src={moonLogo} alt="Project by Tirta" />
          </div>

          <h1>Pendaftaran Berhasil</h1>

          <p>
            Data Anda berhasil dikirim dan masuk ke proses
            verifikasi HR/Admin.
          </p>

          <div className="registration-success-box">
            <strong>Menunggu Verifikasi</strong>
            <span>
              Akun Anda akan dapat digunakan setelah HR/Admin
              mengaktifkannya.
            </span>
          </div>

          <button
            type="button"
            className="registration-button"
            onClick={onBack}
          >
            Kembali ke Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="registration-page">
      <div className="registration-shell">

        <div className="registration-brand">
          <div className="registration-logo">
            <img
              src="/sakura-moon.jpg"
              alt="Project by Tirta"
            />
          </div>

          <div>
            <strong>Project by Tirta</strong>
            <span>Human Resources & Workforce Platform</span>
          </div>
        </div>

        <div className="registration-card">

          <div className="registration-heading">
            <span className="registration-eyebrow">
              EMPLOYEE REGISTRATION
            </span>

            <h1>Daftar sebagai Karyawan</h1>

            <p>
              Lengkapi data diri, informasi pekerjaan,
              rekening bank, dan foto profil Anda.
            </p>
          </div>

          {error && (
            <div className="registration-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* FOTO */}
            <div className="registration-section">
              <h3>Foto Profil / ID Card</h3>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                  marginBottom: '15px',
                }}
              >
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: '#eef2f7',
                    display: 'grid',
                    placeItems: 'center',
                    overflow: 'hidden',
                    border: '1px solid #d8dee8',
                    flexShrink: 0,
                  }}
                >
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Preview"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <span
                      style={{
                        fontSize: '20px',
                        color: '#667085',
                      }}
                    >
                      📷
                    </span>
                  )}
                </div>

                <div>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handlePhotoChange}
                    id="photo-upload"
                    style={{ display: 'none' }}
                  />

                  <label
                    htmlFor="photo-upload"
                    className="registration-button"
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'inline-block',
                    }}
                  >
                    Pilih Foto
                  </label>

                  <small
                    style={{
                      display: 'block',
                      color: '#667085',
                      marginTop: '4px',
                    }}
                  >
                    JPG/PNG/WebP, maksimal 2MB
                  </small>
                </div>
              </div>
            </div>

            {/* DATA PRIBADI */}
            <div className="registration-section">
              <h3>Data Pribadi</h3>

              <div className="registration-field">
                <label>NIK KTP *</label>
                <input
                  name="nik_ktp"
                  value={form.nik_ktp}
                  onChange={handleChange}
                  placeholder="16 digit NIK"
                  inputMode="numeric"
                  maxLength={16}
                  required
                />
              </div>

              <div className="registration-field">
                <label>
                  ID Karyawan{' '}
                  <span className="field-optional">
                    (opsional)
                  </span>
                </label>

                <input
                  name="id_karyawan"
                  value={form.id_karyawan}
                  onChange={handleChange}
                  placeholder="Contoh: EMP-0001"
                  maxLength={32}
                  autoCapitalize="characters"
                />

                <small className="field-help">
                  Boleh dikosongkan. Sistem akan membuat ID
                  registrasi sementara.
                </small>
              </div>

              <div className="registration-field">
                <label>Nama Lengkap *</label>
                <input
                  name="nama"
                  value={form.nama}
                  onChange={handleChange}
                  placeholder="Masukkan nama lengkap"
                  required
                />
              </div>

              <div className="registration-row">
                <div className="registration-field">
                  <label>Tempat Lahir *</label>
                  <input
                    name="tempat_lahir"
                    value={form.tempat_lahir}
                    onChange={handleChange}
                    placeholder="Contoh: Jakarta"
                    required
                  />
                </div>

                <div className="registration-field">
                  <label>Tanggal Lahir *</label>
                  <input
                    type="date"
                    name="tanggal_lahir"
                    value={form.tanggal_lahir}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="registration-row">
                <div className="registration-field">
                  <label>Jenis Kelamin *</label>

                  <select
                    name="jenis_kelamin"
                    value={form.jenis_kelamin}
                    onChange={handleChange}
                    required
                  >
                    <option value="">
                      -- Pilih Jenis Kelamin --
                    </option>
                    <option value="Laki-laki">
                      Laki-laki
                    </option>
                    <option value="Perempuan">
                      Perempuan
                    </option>
                  </select>
                </div>

                <div className="registration-field">
                  <label>Status Pernikahan *</label>

                  <select
                    name="status_pernikahan"
                    value={form.status_pernikahan}
                    onChange={handleChange}
                    required
                  >
                    <option value="">
                      -- Pilih Status --
                    </option>
                    <option value="Belum Menikah">
                      Belum Menikah
                    </option>
                    <option value="Menikah">
                      Menikah
                    </option>
                    <option value="Cerai">
                      Cerai
                    </option>
                  </select>
                </div>
              </div>

              <div className="registration-field">
                <label>Nama Ibu Kandung *</label>
                <input
                  name="nama_ibu_kandung"
                  value={form.nama_ibu_kandung}
                  onChange={handleChange}
                  placeholder="Masukkan nama lengkap ibu kandung"
                  required
                />
              </div>

              <div className="registration-field">
                <label>Alamat Rumah *</label>

                <textarea
                  name="alamat_rumah"
                  value={form.alamat_rumah}
                  onChange={handleChange}
                  placeholder="Masukkan alamat lengkap"
                  rows={3}
                  required
                />
              </div>

              <div className="registration-row">
                <div className="registration-field">
                  <label>No. Telepon *</label>

                  <input
                    name="no_telp"
                    value={form.no_telp}
                    onChange={handleChange}
                    placeholder="08xxxxxxxxxx"
                    inputMode="tel"
                    required
                  />
                </div>

                <div className="registration-field">
                  <label>Email *</label>

                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="nama@email.com"
                    required
                  />
                </div>
              </div>
            </div>

            {/* DATA PEKERJAAN */}
            <div className="registration-section">
              <h3>Data Pekerjaan</h3>

              <div className="registration-row">
                <div className="registration-field">
                  <label>Departemen *</label>

                  <input
                    name="departemen"
                    value={form.departemen}
                    onChange={handleChange}
                    placeholder="Contoh: Human Resources"
                    required
                  />
                </div>

                <div className="registration-field">
                  <label>Jabatan *</label>

                  <input
                    name="jabatan"
                    value={form.jabatan}
                    onChange={handleChange}
                    placeholder="Contoh: Staff HR"
                    required
                  />
                </div>
              </div>

              <div className="registration-row">
                <div className="registration-field">
                  <label>Status Karyawan *</label>

                  <select
                    name="status_karyawan"
                    value={form.status_karyawan}
                    onChange={handleChange}
                    required
                  >
                    <option value="">
                      -- Pilih Status --
                    </option>
                    <option value="Tetap">
                      Tetap
                    </option>
                    <option value="Kontrak">
                      Kontrak
                    </option>
                    <option value="Harian">
                      Harian
                    </option>
                    <option value="Probation">
                      Probation
                    </option>
                  </select>
                </div>

                <div className="registration-field">
                  <label>Tanggal Masuk *</label>

                  <input
                    type="date"
                    name="tanggal_masuk"
                    value={form.tanggal_masuk}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="registration-field">
                <label>Gaji Pokok *</label>

                <input
                  name="gaji_pokok"
                  value={form.gaji_pokok}
                  onChange={handleChange}
                  placeholder="Contoh: 5000000"
                  inputMode="numeric"
                  required
                />

                <small className="field-help">
                  Masukkan angka tanpa titik atau simbol Rp.
                </small>
              </div>
            </div>

            {/* BANK */}
            <div className="registration-section">
              <h3>Informasi Rekening Gaji</h3>

              <div className="registration-row">
                <div className="registration-field">
                  <label>Nama Bank</label>

                  <select
                    name="bank_name"
                    value={form.bank_name}
                    onChange={handleChange}
                  >
                    <option value="">
                      -- Pilih Bank --
                    </option>
                    <option value="BCA">BCA</option>
                    <option value="Mandiri">Mandiri</option>
                    <option value="BNI">BNI</option>
                    <option value="BRI">BRI</option>
                    <option value="CIMB Niaga">
                      CIMB Niaga
                    </option>
                    <option value="Permata">
                      Permata
                    </option>
                    <option value="Lainnya">
                      Lainnya
                    </option>
                  </select>
                </div>

                <div className="registration-field">
                  <label>Nomor Rekening</label>

                  <input
                    name="bank_account"
                    value={form.bank_account}
                    onChange={handleChange}
                    placeholder="Masukkan nomor rekening"
                    inputMode="numeric"
                  />
                </div>
              </div>
            </div>

            {/* KEAMANAN */}
            <div className="registration-section">
              <h3>Keamanan Akun</h3>

              <div className="registration-row">
                <div className="registration-field">
                  <label>Password *</label>

                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Minimal 6 karakter"
                    minLength={6}
                    required
                  />
                </div>

                <div className="registration-field">
                  <label>Konfirmasi Password *</label>

                  <input
                    type="password"
                    name="konfirmasi"
                    value={form.konfirmasi}
                    onChange={handleChange}
                    placeholder="Ulangi password"
                    minLength={6}
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="registration-button"
              disabled={loading}
            >
              {loading
                ? 'Memproses...'
                : 'Daftar Sekarang'}
            </button>

            <button
              type="button"
              className="registration-back"
              onClick={onBack}
            >
              Sudah memiliki akun? Kembali ke Login
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}
