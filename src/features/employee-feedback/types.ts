export type SuggestionCategory =
  | 'workplace'
  | 'attendance'
  | 'leave'
  | 'management'
  | 'facilities'
  | 'technology'
  | 'culture'
  | 'other';

export type SuggestionPriority = 'low' | 'normal' | 'high';
export type SuggestionStatus = 'new' | 'reviewing' | 'in_progress' | 'resolved' | 'archived';

export interface Suggestion {
  id: string;
  title: string;
  content: string;
  category: SuggestionCategory;
  priority: SuggestionPriority;
  anonymous: boolean;
  status: SuggestionStatus;
  submittedAt: string;
  submittedBy?: string;
  attachmentCount: number;
  adminReply?: string;
  updatedAt?: string;
}

export interface SuggestionDraft {
  title: string;
  content: string;
  category: SuggestionCategory;
  priority: SuggestionPriority;
  anonymous: boolean;
  attachments?: File[];
}
