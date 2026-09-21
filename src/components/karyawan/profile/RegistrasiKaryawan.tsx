import React, { useState } from 'react';
import moonLogo from '../../../assets/moon-logo.svg';
import { supabase } from '../../../lib/supabase/client';
import '../../../styles/employee/registration.css';

interface RegistrasiKaryawanProps {
  onBack?: () => void;
}

export default function RegistrasiKaryawan({ onBack }: RegistrasiKaryawanProps) {
  const [form, setForm] = useState({
    nama: '',
    id_karyawan: '',
    email: '',
    no_telp: '',
    alamat_rumah: '',
    tanggal_lahir: '',
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        setError('Ukuran foto maksimal 2MB.');
        return;
      }
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.nama.trim()) {
      setError('Nama lengkap wajib diisi.');
      return;
    }

    if (form.id_karyawan.trim() && !/^[A-Za-z0-9][A-Za-z0-9._-]{2,31}$/.test(form.id_karyawan.trim())) {
      setError('ID Karyawan hanya boleh berisi huruf, angka, titik, garis bawah, atau tanda hubung (3–32 karakter).');
      return;
    }

    if (!form.email.trim()) {
      setError('Email wajib diisi.');
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

      // 1. Upload foto ke Supabase Storage jika ada file dipilih
      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop();
        const fileName = `reg-${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('employee-photos')
          .upload(filePath, photoFile, { upsert: true });

        if (uploadError) { throw uploadError; } else {
          const { data: urlData } = supabase.storage
            .from('employee-photos')
            .getPublicUrl(filePath);
          uploadedPhotoUrl = urlData.publicUrl;
        }
      }

      // 2. Daftarkan akun auth beserta metadata tambahan (Bank & Foto)
      const { error: signUpError } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
        options: {
          data: {
            nama: form.nama.trim(),
            id_karyawan: form.id_karyawan.trim().toUpperCase() || null,
            no_telp: form.no_telp.trim(),
            alamat_rumah: form.alamat_rumah.trim(),
            tanggal_lahir: form.tanggal_lahir || null,
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
      setError(err?.message || 'Pendaftaran gagal. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="registration-page">
        <div className="registration-success">
          <div className="registration-logo"><img src={moonLogo} alt="Project by Tirta" /></div>
          <h1>Pendaftaran Berhasil</h1>
          <p>Data Anda berhasil dikirim dan masuk ke proses verifikasi HR/Admin.</p>
          <div className="registration-success-box">
            <strong>Menunggu Verifikasi</strong>
            <span>Akun Anda akan dapat digunakan setelah HR/Admin mengaktifkannya.</span>
          </div>
          <button type="button" className="registration-button" onClick={onBack}>
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
            <img src="/sakura-moon.jpg" alt="Project by Tirta" />
          </div>
          <div>
            <strong>Project by Tirta</strong>
            <span>Human Resources & Workforce Platform</span>
          </div>
        </div>

        <div className="registration-card">
          <div className="registration-heading">
            <span className="registration-eyebrow">EMPLOYEE REGISTRATION</span>
            <h1>Daftar sebagai Karyawan</h1>
            <p>Lengkapi data diri, informasi rekening bank, dan foto profil Anda.</p>
          </div>

          {error && <div className="registration-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* Foto Profil */}
            <div className="registration-section">
              <h3>Foto Profil / ID Card</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                <div style={{
                  width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#eef2f7',
                  display: 'grid', placeItems: 'center', overflow: 'hidden', border: '1px solid #d8dee8'
                }}>
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '20px', color: '#667085' }}>📷</span>
                  )}
                </div>
                <div>
                  <input type="file" accept="image/*" onChange={handlePhotoChange} id="photo-upload" style={{ display: 'none' }} />
                  <label htmlFor="photo-upload" className="registration-button" style={{ padding: '6px 12px', fontSize: '12px', cursor: 'pointer', display: 'inline-block' }}>
                    Pilih Foto
                  </label>
                  <small style={{ display: 'block', color: '#667085', marginTop: '4px' }}>Format JPG/PNG, maks 2MB</small>
                </div>
              </div>
            </div>

            {/* Data Pribadi */}
            <div className="registration-section">
              <h3>Data Pribadi</h3>

              <div className="registration-field">
                <label>Nama Lengkap *</label>
                <input name="nama" value={form.nama} onChange={handleChange} placeholder="Masukkan nama lengkap" required />
              </div>
              <div className="registration-field">
                <label>ID Karyawan <span className="field-optional">(opsional)</span></label>
                <input name="id_karyawan" value={form.id_karyawan} onChange={handleChange} placeholder="Contoh: EMP-0001" maxLength={32} autoCapitalize="characters" />
                <small className="field-help">Boleh dikosongkan. HR/Admin dapat membuat atau mengubah ID setelah verifikasi.</small>
              </div>

              <div className="registration-row">
                <div className="registration-field">
                  <label>Email *</label>
                  <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="nama@email.com" required />
                </div>
                <div className="registration-field">
                  <label>No. Telepon</label>
                  <input name="no_telp" value={form.no_telp} onChange={handleChange} placeholder="08xxxxxxxxxx" />
                </div>
              </div>

              <div className="registration-field">
                <label>Tanggal Lahir</label>
                <input type="date" name="tanggal_lahir" value={form.tanggal_lahir} onChange={handleChange} />
              </div>

              <div className="registration-field">
                <label>Alamat Rumah</label>
                <textarea name="alamat_rumah" value={form.alamat_rumah} onChange={handleChange} placeholder="Masukkan alamat lengkap" rows={3} />
              </div>
            </div>

            {/* Informasi Bank & Rekening */}
            <div className="registration-section">
              <h3>Informasi Rekening Gaji</h3>

              <div className="registration-row">
                <div className="registration-field">
                  <label>Nama Bank</label>
                  <select name="bank_name" value={form.bank_name} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d8dee8' }}>
                    <option value="">-- Pilih Bank --</option>
                    <option value="BCA">BCA</option>
                    <option value="Mandiri">Mandiri</option>
                    <option value="BNI">BNI</option>
                    <option value="BRI">BRI</option>
                    <option value="CIMB Niaga">CIMB Niaga</option>
                    <option value="Permata">Permata</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div className="registration-field">
                  <label>Nomor Rekening</label>
                  <input name="bank_account" value={form.bank_account} onChange={handleChange} placeholder="Masukkan nomor rekening" />
                </div>
              </div>
            </div>

            {/* Keamanan Akun */}
            <div className="registration-section">
              <h3>Keamanan Akun</h3>

              <div className="registration-row">
                <div className="registration-field">
                  <label>Password *</label>
                  <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Minimal 6 karakter" required />
                </div>
                <div className="registration-field">
                  <label>Konfirmasi Password *</label>
                  <input type="password" name="konfirmasi" value={form.konfirmasi} onChange={handleChange} placeholder="Ulangi password" required />
                </div>
              </div>
            </div>

            <button type="submit" className="registration-button" disabled={loading}>
              {loading ? 'Memproses...' : 'Daftar Sekarang'}
            </button>

            <button type="button" className="registration-back" onClick={onBack}>
              Sudah memiliki akun? Kembali ke Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
