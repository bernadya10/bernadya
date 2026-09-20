import type { EnterpriseModule } from './types';

const modules: Array<{id: EnterpriseModule; title: string; description: string}> = [
  { id: 'employee360', title: 'Employee 360', description: 'Satu timeline untuk data, attendance, leave, overtime, dokumen, aset, dan aktivitas karyawan.' },
  { id: 'scheduling', title: 'Shift & Scheduling', description: 'Roster, shift, jam kerja, holiday, dan aturan keterlambatan/lembur.' },
  { id: 'approvals', title: 'Approval Center', description: 'Satu inbox untuk leave, overtime, attendance correction, reimbursement, dan HR request.' },
  { id: 'notifications', title: 'Notification Center', description: 'Notifikasi operasional dan reminder yang terpusat.' },
  { id: 'documents', title: 'Document Management', description: 'Dokumen karyawan dengan kategori, expiry, dan akses terkontrol.' },
  { id: 'security', title: 'Security Center', description: 'Session, login history, security events, dan perubahan permission.' },
  { id: 'self_service', title: 'Employee Self-Service', description: 'Karyawan dapat mengelola kebutuhan HR yang diizinkan.' },
  { id: 'reports', title: 'Advanced Reports', description: 'Template laporan, filter, export, dan scheduled-report contract.' },
];

export default function EnterpriseExperience() {
  return (
    <section aria-label="Enterprise Experience" style={{display:'grid', gap:16}}>
      <header>
        <h2>Enterprise Experience</h2>
        <p>Modul profesional siap dihubungkan ke database contract pada tahap SQL berikutnya.</p>
      </header>
      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:12}}>
        {modules.map((item) => (
          <article key={item.id} style={{border:'1px solid currentColor', borderRadius:12, padding:16}}>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <small>Frontend-ready · SQL contract pending</small>
          </article>
        ))}
      </div>
    </section>
  );
}
