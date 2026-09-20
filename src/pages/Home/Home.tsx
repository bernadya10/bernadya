import moonLogo from '../../assets/moon-logo.svg';
import '../../styles/components/home.css';

interface HomeProps {
  onLogin: () => void;
  onRegister: () => void;
}

export default function Home({ onLogin, onRegister }: HomeProps) {
  return (
    <main className="public-home">
      <header className="public-header">
        <div className="public-brand">
          <img src={moonLogo} alt="Project by Tirta" />
          <div><strong>Project by Tirta</strong><span>People Platform</span></div>
        </div>
        <nav>
          <a href="#features">Features</a>
          <a href="#solutions">Solutions</a>
          <a href="#features">People</a>
          <button type="button" className="public-login-link" onClick={onLogin}>Login</button>
          <button type="button" className="public-cta" onClick={onLogin}>Get Started</button>
        </nav>
      </header>

      <section className="public-hero">
        <div className="public-hero-copy">
          <span className="public-eyebrow">PEOPLE · ATTENDANCE · PAYROLL · TALENT</span>
          <h1>Modern HR Management<br /><em>for Modern Business.</em></h1>
          <p>Satu platform untuk mengelola people, payroll, attendance, leave, dan talent dalam pengalaman HRIS yang modern, aman, dan terintegrasi.</p>
          <div className="public-actions">
            <button type="button" className="public-primary" onClick={onLogin}>Mulai Sekarang <span>→</span></button>
            <button type="button" className="public-secondary" onClick={onRegister}>Daftar Karyawan</button>
          </div>
          <div className="public-trust"><span>●</span> Secure access <i /> Role-based platform <i /> Centralized workforce data</div>
        </div>

        <div className="moon-hero-visual" aria-hidden="true">
          <div className="moon-orbit orbit-one" />
          <div className="moon-orbit orbit-two" />
          <div className="moon-glow" />
          <img src={moonLogo} alt="" />
          <div className="moon-caption"><b>PROJECT BY TIRTA</b><span>People Platform</span></div>
        </div>
      </section>

      <section id="features" className="public-features">
        {[
          ['♙', 'People', 'Master data & employee 360°'],
          ['◷', 'Attendance', 'Smart attendance & monitoring'],
          ['Rp', 'Payroll', 'Payroll, payslip & compliance'],
          ['◇', 'Talent', 'Performance, KPI & recruitment'],
          ['▥', 'Reporting', 'Workforce analytics & reports'],
        ].map(([icon, title, desc]) => (
          <article key={title}><span>{icon}</span><div><b>{title}</b><small>{desc}</small></div></article>
        ))}
      </section>
    </main>
  );
}
