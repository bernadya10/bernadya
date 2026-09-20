import type { Announcement } from './types';

export default function EmployeeAnnouncementCenter({
  announcements,
  onRead,
}: {
  announcements: Announcement[];
  onRead?: (id: string) => void;
}) {
  const unread = announcements.filter(a => !a.isRead).length;

  return (
    <section aria-label="Announcement Center">
      <header>
        <h2>📢 Pengumuman</h2>
        <p>{unread > 0 ? `${unread} pengumuman belum dibaca` : 'Semua pengumuman sudah dibaca'}</p>
      </header>
      {announcements.length === 0 ? <p>Belum ada pengumuman.</p> : (
        <div style={{display:'grid', gap:12}}>
          {announcements.map((a) => (
            <article key={a.id} aria-label={a.title}>
              <div>
                {a.pinned && <strong>📌 Tersemat </strong>}
                <strong>{a.title}</strong>
              </div>
              <small>{a.category} · {a.priority} · {a.publishedAt || ''}</small>
              <p>{a.body}</p>
              <button type="button" disabled={!!a.isRead} onClick={() => onRead?.(a.id)}>
                {a.isRead ? '✓ Sudah dibaca' : 'Tandai sudah dibaca'}
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
