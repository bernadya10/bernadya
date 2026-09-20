export type Karyawan = {
  id: string;
  id_karyawan?: string;
  nama: string;
  jabatan?: string;
  departemen?: string;
  email?: string;
  no_telp?: string;
  alamat_rumah?: string;
  nik_ktp?: string;
  gaji_pokok?: number;
  tanggal_lahir?: string;
  tanggal_masuk?: string;
  status_aktif?: boolean;
  status_karyawan?: string;
  role?: string;
  auth_user_id?: string | null;
  email_terverifikasi?: boolean;
};
