import type { Suggestion } from './types';

export default function SuperAdminSuggestionInbox({
  suggestions,
  onStatusChange,
  onReply,
}: {
  suggestions: Suggestion[];
  onStatusChange?: (id: string, status: Suggestion['status']) => void;
  onReply?: (id: string, reply: string) => void;
}) {
  return (
    <section aria-label="Super Admin Suggestion Inbox">
      <header>
        <h2>Suggestion Inbox</h2>
        <p>Semua saran karyawan yang dikirim untuk ditinjau Super Admin.</p>
      </header>
      {suggestions.length === 0 ? <p>Belum ada saran.</p> : (
        <div>
          {suggestions.map((s) => (
            <article key={s.id}>
              <h3>{s.title}</h3>
              <p>{s.content}</p>
              <small>
                {s.anonymous ? 'Anonim' : (s.submittedBy || 'Karyawan')}
                {' · '}{s.category} · {s.priority} · {s.status}
              </small>
              <div>
                <label>Status
                  <select value={s.status}
                    onChange={(e) => onStatusChange?.(s.id, e.target.value as Suggestion['status'])}>
                    <option value="new">Baru</option>
                    <option value="reviewing">Ditinjau</option>
                    <option value="in_progress">Diproses</option>
                    <option value="resolved">Selesai</option>
                    <option value="archived">Arsip</option>
                  </select>
                </label>
                <button type="button" onClick={() => {
                  const reply = window.prompt('Balasan untuk karyawan:');
                  if (reply?.trim()) onReply?.(s.id, reply.trim());
                }}>Balas</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
