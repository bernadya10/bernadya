import React, { useState } from 'react';
import type { SuggestionCategory, SuggestionDraft, SuggestionPriority } from './types';
import { validateSuggestionDraft } from './suggestion-service';

const categories: Array<[SuggestionCategory, string]> = [
  ['workplace', 'Tempat Kerja'],
  ['attendance', 'Kehadiran'],
  ['leave', 'Cuti / Izin'],
  ['management', 'Manajemen'],
  ['facilities', 'Fasilitas'],
  ['technology', 'Teknologi'],
  ['culture', 'Budaya Kerja'],
  ['other', 'Lainnya'],
];

export default function SuggestionBox({
  onSubmit,
}: {
  onSubmit?: (draft: SuggestionDraft) => Promise<void> | void;
}) {
  const [draft, setDraft] = useState<SuggestionDraft>({
    title: '', content: '', category: 'other', priority: 'normal', anonymous: false,
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [sent, setSent] = useState(false);
  const update = (patch: Partial<SuggestionDraft>) => setDraft((v) => ({ ...v, ...patch }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors = validateSuggestionDraft(draft);
    setErrors(nextErrors);
    if (nextErrors.length) return;
    await onSubmit?.(draft);
    setSent(true);
  }

  if (sent) {
    return (
      <section aria-live="polite">
        <h2>Saran berhasil dikirim</h2>
        <p>Saran Anda telah diteruskan ke Super Admin untuk ditinjau.</p>
        <button type="button" onClick={() => {
          setSent(false);
          setDraft({title:'', content:'', category:'other', priority:'normal', anonymous:false});
        }}>Kirim saran lain</button>
      </section>
    );
  }

  return (
    <form onSubmit={submit} aria-label="Kotak Saran">
      <h2>Kotak Saran</h2>
      <p>Sampaikan ide, masukan, atau kendala kepada Super Admin.</p>
      {errors.length > 0 && <div role="alert">{errors.map((x) => <div key={x}>{x}</div>)}</div>}

      <label>Judul
        <input maxLength={150} value={draft.title} onChange={(e) => update({title:e.target.value})} />
      </label>

      <label>Kategori
        <select value={draft.category} onChange={(e) => update({category:e.target.value as SuggestionCategory})}>
          {categories.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </label>

      <label>Prioritas
        <select value={draft.priority} onChange={(e) => update({priority:e.target.value as SuggestionPriority})}>
          <option value="low">Rendah</option>
          <option value="normal">Normal</option>
          <option value="high">Tinggi</option>
        </select>
      </label>

      <label>Isi Saran
        <textarea maxLength={5000} rows={8} value={draft.content}
          onChange={(e) => update({content:e.target.value})} />
      </label>

      <label>
        <input type="checkbox" checked={draft.anonymous}
          onChange={(e) => update({anonymous:e.target.checked})} />
        Kirim secara anonim
      </label>

      <label>Lampiran (opsional)
        <input type="file" multiple onChange={(e) => update({attachments:Array.from(e.target.files ?? [])})} />
      </label>

      <button type="submit">Kirim ke Super Admin</button>
    </form>
  );
}
