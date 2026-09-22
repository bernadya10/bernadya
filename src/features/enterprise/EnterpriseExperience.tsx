import type { EnterpriseModule } from './types';

const modules: Array<{id: EnterpriseModule; title: string; description: string}> = [
  { id: 'employee360', title: 'Employee 360', description: 'Satu timeline untuk data, absensi, cuti, lembur, dokumen, aset, dan aktivitas karyawan.' },
  { id: 'scheduling', title: 'Shift & Scheduling', description: 'Roster, shift, jam kerja, holiday, dan aturan keterlambatan/lembur.' },
  { id: 'approvals', title: 'Pusat Persetujuan', description: 'Satu inbox untuk cuti, lembur, koreksi absensi, penggantian biaya, dan permintaan HR.' },
  { id: 'notifications', title: 'Pusat Notifikasi', description: 'Notifikasi operasional dan reminder yang terpusat.' },
  { id: 'documents', title: 'Document Management', description: 'Dokumen karyawan dengan kategori, expiry, dan akses terkontrol.' },
  { id: 'security', title: 'Pusat Keamanan', description: 'Sesi, riwayat login, event keamanan, dan perubahan hak akses.' },
  { id: 'self_service', title: 'Layanan Mandiri Karyawan', description: 'Karyawan dapat mengelola kebutuhan HR yang diizinkan.' },
  { id: 'reports', title: 'Laporan Lanjutan', description: 'Template laporan, filter, ekspor, dan kontrak laporan terjadwal.' },
];

export default function EnterpriseExperience() {
  return (
    <section aria-label="Pengalaman Enterprise" style={{display:'grid', gap:16}}>
      <header>
        <h2>Pengalaman Enterprise</h2>
        <p>Modul profesional siap dihubungkan ke database contract pada tahap SQL berikutnya.</p>
      </header>
      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:12}}>
        {modules.map((item) => (
          <article key={item.id} style={{border:'1px solid currentColor', borderRadius:12, padding:16}}>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <small>Frontend siap · kontrak SQL menunggu</small>
          </article>
        ))}
      </div>
    </section>
  );
}
