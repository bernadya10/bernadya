import type { Announcement, AnnouncementDraft } from './types';

/**
 * Database-neutral boundary. SQL/RLS/storage will be implemented separately.
 */
export interface AnnouncementDataSource {
  createAnnouncement(draft: AnnouncementDraft): Promise<Announcement>;
  updateAnnouncement(id: string, draft: Partial<AnnouncementDraft>): Promise<Announcement>;
  publishAnnouncement(id: string): Promise<Announcement>;
  archiveAnnouncement(id: string): Promise<Announcement>;
  listPublishedForEmployee(): Promise<Announcement[]>;
  listForAdmin(): Promise<Announcement[]>;
  markAsRead(id: string): Promise<void>;
  getReadStats(id: string): Promise<{ readCount: number; recipientCount: number }>;
}

export function validateAnnouncementDraft(draft: AnnouncementDraft): string[] {
  const errors: string[] = [];
  if (!draft.title.trim()) errors.push('Judul pengumuman wajib diisi.');
  if (draft.title.trim().length > 200) errors.push('Judul maksimal 200 karakter.');
  if (!draft.body.trim()) errors.push('Isi pengumuman wajib diisi.');
  if (draft.body.trim().length > 20000) errors.push('Isi pengumuman maksimal 20.000 karakter.');
  if (!draft.category) errors.push('Kategori wajib dipilih.');
  if (!draft.priority) errors.push('Prioritas wajib dipilih.');
  if (draft.expiresAt && draft.publishAt && draft.expiresAt < draft.publishAt) {
    errors.push('Tanggal berakhir tidak boleh sebelum tanggal publish.');
  }
  return errors;
}
