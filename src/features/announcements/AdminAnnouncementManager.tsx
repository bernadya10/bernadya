import { useState } from 'react';
import type { Announcement, AnnouncementCategory, AnnouncementPriority, AnnouncementAudience } from './types';
import { validateAnnouncementDraft } from './service';

export default function AdminAnnouncementManager({
  announcements,
  onCreate,
  onPublish,
  onArchive,
}: {
  announcements: Announcement[];
  onCreate?: (draft: {
    title: string; body: string; category: AnnouncementCategory;
    priority: AnnouncementPriority; audience: AnnouncementAudience; pinned: boolean;
  }) => Promise<void> | void;
  onPublish?: (id: string) => void;
  onArchive?: (id: string) => void;
}) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState<AnnouncementCategory>('general');
  const [priority, setPriority] = useState<AnnouncementPriority>('normal');
  const [pinned, setPinned] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [message, setMessage] = useState('');

  async function create() {
    const draft = { title, body, category, priority, audience: {type:'all'} as const, pinned };
    const e = validateAnnouncementDraft(draft);
    setErrors(e);
    if (e.length) return;
    await onCreate?.(draft);
    setMessage('Draft pengumuman berhasil dibuat.');
    setTitle(''); setBody('');
  }

  return (
    <section aria-label="Announcement Management">
      <header><h2>Kelola Pengumuman</h2><p>Buat dan terbitkan pengumuman untuk karyawan.</p></header>
      {message && <p role="status">{message}</p>}
      {errors.length > 0 && <div role="alert">{errors.map(x => <div key={x}>{x}</div>)}</div>}
      <label>Judul <input maxLength={200} value={title} onChange={e => setTitle(e.target.value)} /></label>
      <label>Kategori
        <select value={category} onChange={e => setCategory(e.target.value as AnnouncementCategory)}>
          <option value="general">Umum</option><option value="hr">HR</option>
          <option value="attendance">Kehadiran</option><option value="holiday">Libur</option>
          <option value="important">Penting</option><option value="urgent">Urgent</option>
        </select>
      </label>
      <label>Prioritas
        <select value={priority} onChange={e => setPriority(e.target.value as AnnouncementPriority)}>
          <option value="normal">Normal</option><option value="important">Penting</option><option value="urgent">Urgent</option>
        </select>
      </label>
      <label>Isi <textarea maxLength={20000} rows={10} value={body} onChange={e => setBody(e.target.value)} /></label>
      <label><input type="checkbox" checked={pinned} onChange={e => setPinned(e.target.checked)} /> Sematkan di atas</label>
      <button type="button" onClick={create}>Simpan Draft</button>

      <hr />
      <h3>Daftar Pengumuman</h3>
      {announcements.map(a => (
        <article key={a.id}>
          <strong>{a.title}</strong> · {a.status}
          {a.status === 'draft' && <button type="button" onClick={() => onPublish?.(a.id)}>Publish</button>}
          {a.status !== 'archived' && <button type="button" onClick={() => onArchive?.(a.id)}>Arsipkan</button>}
          {a.recipientCount !== undefined && <small> · Dibaca {a.readCount ?? 0}/{a.recipientCount}</small>}
        </article>
      ))}
    </section>
  );
}
