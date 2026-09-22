import moonLogo from '../../assets/moon-logo.svg';
import '../../styles/components/home.css';

interface HomeProps {
  onMasuk: () => void;
  onRegister: () => void;
}

export default function Home({ onMasuk, onRegister }: HomeProps) {
  return (
    <main className="public-home">
      <header className="public-header">
        <div className="public-brand">
          <img src={moonLogo} alt="Project by Tirta" />
          <div><strong>Project by Tirta</strong><span>Karyawan Platform</span></div>
        </div>
        <nav>
          <a href="#features">Fitur</a>
          <a href="#solutions">Solusi</a>
          <a href="#features">Karyawan</a>
          <button type="button" className="public-login-link" onClick={onMasuk}>Masuk</button>
          <button type="button" className="public-cta" onClick={onMasuk}>Mulai</button>
        </nav>
      </header>

      <section className="public-hero">
        <div className="public-hero-copy">
          <span className="public-eyebrow">KARYAWAN · ABSENSI · PAYROLL · TALENTA</span>
          <h1>Manajemen HR Modern<br /><em>untuk Bisnis Modern.</em></h1>
          <p>Satu platform untuk mengelola karyawan, payroll, absensi, cuti, dan talenta dalam pengalaman HRIS yang modern, aman, dan terintegrasi.</p>
          <div className="public-actions">
            <button type="button" className="public-primary" onClick={onMasuk}>Mulai Sekarang <span>→</span></button>
            <button type="button" className="public-secondary" onClick={onRegister}>Daftar Karyawan</button>
          </div>
          <div className="public-trust"><span>●</span> Akses aman <i /> Platform berbasis peran <i /> Data workforce terpusat</div>
        </div>

        <div className="moon-hero-visual" aria-hidden="true">
          <div className="moon-orbit orbit-one" />
          <div className="moon-orbit orbit-two" />
          <div className="moon-glow" />
          <img src={moonLogo} alt="" />
          <div className="moon-caption"><b>PROJECT BY TIRTA</b><span>Karyawan Platform</span></div>
        </div>
      </section>

      <section id="features" className="public-features">
        {[
          ['♙', 'Karyawan', 'Master data & employee 360°'],
          ['◷', 'Absensi', 'Absensi dan pemantauan cerdas'],
          ['Rp', 'Payroll', 'Payroll, slip gaji & kepatuhan'],
          ['◇', 'Talenta', 'Kinerja, KPI & rekrutmen'],
          ['▥', 'Pelaporan', 'Analitik tenaga kerja & laporan'],
        ].map(([icon, title, desc]) => (
          <article key={title}><span>{icon}</span><div><b>{title}</b><small>{desc}</small></div></article>
        ))}
      </section>
    </main>
  );
}
