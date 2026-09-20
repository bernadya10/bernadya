export type AnnouncementCategory =
  | 'general' | 'hr' | 'attendance' | 'holiday' | 'important' | 'urgent';

export type AnnouncementPriority = 'normal' | 'important' | 'urgent';
export type AnnouncementStatus = 'draft' | 'published' | 'expired' | 'archived';
export type AnnouncementAudience =
  | { type: 'all' }
  | { type: 'department'; ids: string[] }
  | { type: 'branch'; ids: string[] }
  | { type: 'position'; ids: string[] };

export interface Announcement {
  id: string;
  title: string;
  body: string;
  category: AnnouncementCategory;
  priority: AnnouncementPriority;
  status: AnnouncementStatus;
  audience: AnnouncementAudience;
  pinned: boolean;
  publishedAt?: string;
  expiresAt?: string;
  attachmentCount: number;
  imageUrl?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt?: string;
  readCount?: number;
  recipientCount?: number;
  isRead?: boolean;
}

export interface AnnouncementDraft {
  title: string;
  body: string;
  category: AnnouncementCategory;
  priority: AnnouncementPriority;
  audience: AnnouncementAudience;
  pinned: boolean;
  publishAt?: string;
  expiresAt?: string;
  image?: File;
  attachments?: File[];
}
