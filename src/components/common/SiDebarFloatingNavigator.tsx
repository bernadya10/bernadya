import './SiDebarFloatingNavigator.css';

export default function SiDebarFloatingNavigator() {
  const scrollTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const scrollBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth',
    });
  };

  return (
    <div
      className="si-debar-floating-nav"
      aria-label="Navigasi SI Debar"
    >
      <button
        type="button"
        className="si-debar-floating-btn"
        onClick={scrollTop}
        title="Ke atas"
        aria-label="Ke atas"
      >
        ↑
      </button>

      <button
        type="button"
        className="si-debar-floating-btn"
        onClick={scrollBottom}
        title="Ke bawah"
        aria-label="Ke bawah"
      >
        ↓
      </button>
    </div>
  );
}
