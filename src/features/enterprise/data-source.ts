// V54 frontend service boundary.
// These functions deliberately do not assume new SQL tables/RPCs yet.
import type { ApprovalItem, DocumentItem, Employee360Summary, NotificationItem, SecurityEvent } from './types';

export interface EnterpriseDataSource {
  getEmployee360?(employeeId: string): Promise<Employee360Summary>;
  getApprovals?(): Promise<ApprovalItem[]>;
  getNotifications?(): Promise<NotificationItem[]>;
  getDocuments?(employeeId?: string): Promise<DocumentItem[]>;
  getSecurityEvents?(): Promise<SecurityEvent[]>;
}

export function createEnterpriseDataSource(
  source: EnterpriseDataSource = {}
): EnterpriseDataSource {
  return source;
}
