// V54 Enterprise Experience types.
// Database intentionally remains unchanged; these contracts define the frontend boundary.
export type EnterpriseModule =
  | 'employee360'
  | 'scheduling'
  | 'approvals'
  | 'notifications'
  | 'documents'
  | 'security'
  | 'self_service'
  | 'reports';

export interface Employee360Summary {
  employeeId: string;
  attendanceRate?: number;
  pendingLeave?: number;
  pendingOvertime?: number;
  documentExpiries?: number;
  activeAssets?: number;
}

export interface ApprovalItem {
  id: string;
  type: 'leave' | 'overtime' | 'attendance_correction' | 'reimbursement' | 'hr_request';
  title: string;
  requester: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'revision';
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  severity: 'info' | 'success' | 'warning' | 'critical';
  read: boolean;
  createdAt: string;
}

export interface DocumentItem {
  id: string;
  employeeId: string;
  category: string;
  name: string;
  expiresAt?: string;
  status: 'valid' | 'expiring' | 'expired';
}

export interface SecurityEvent {
  id: string;
  type: 'login' | 'logout' | 'permission_change' | 'password_change' | 'suspicious_activity';
  actor: string;
  createdAt: string;
  severity: 'info' | 'warning' | 'critical';
}
