/**
 * Admin Audit Logging System
 * Tracks all admin actions for security and compliance
 */

export interface AuditLogEntry {
  id: string;
  adminId: string;
  adminEmail: string;
  action:
    | 'role_change'
    | 'user_delete'
    | 'user_create'
    | 'order_update'
    | 'subscription_change'
    | 'subscription_cancel'
    | 'login'
    | 'logout';
  targetUserId?: string;
  targetUserEmail?: string;
  targetOrderId?: string;
  oldValue?: string;
  newValue?: string;
  description: string;
  timestamp: string;
  ipAddress?: string;
  status: 'success' | 'failed';
}

const AUDIT_LOG_KEY = 'adminAuditLog';

/**
 * Log an admin action
 */
export const logAdminAction = (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): AuditLogEntry => {
  try {
    const logEntry: AuditLogEntry = {
      ...entry,
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    };

    const logs = getAuditLog();
    logs.push(logEntry);

    // Keep only last 10,000 entries to avoid localStorage overflow
    if (logs.length > 10000) {
      logs.shift();
    }

    localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(logs));
    console.log(`Audit logged: ${entry.action} by ${entry.adminEmail}`);

    return logEntry;
  } catch (error) {
    console.error('Error logging audit entry:', error);
    throw error;
  }
};

/**
 * Get all audit log entries
 */
export const getAuditLog = (): AuditLogEntry[] => {
  try {
    const logsJson = localStorage.getItem(AUDIT_LOG_KEY);
    return logsJson ? JSON.parse(logsJson) : [];
  } catch (error) {
    console.error('Error retrieving audit log:', error);
    return [];
  }
};

/**
 * Get audit logs for a specific admin
 */
export const getAuditLogByAdmin = (adminId: string): AuditLogEntry[] => {
  const logs = getAuditLog();
  return logs.filter((log) => log.adminId === adminId);
};

/**
 * Get audit logs for a specific action type
 */
export const getAuditLogByAction = (action: AuditLogEntry['action']): AuditLogEntry[] => {
  const logs = getAuditLog();
  return logs.filter((log) => log.action === action);
};

/**
 * Get audit logs for a specific target user
 */
export const getAuditLogByTargetUser = (userId: string): AuditLogEntry[] => {
  const logs = getAuditLog();
  return logs.filter((log) => log.targetUserId === userId);
};

/**
 * Get audit logs within a date range
 */
export const getAuditLogByDateRange = (startDate: Date, endDate: Date): AuditLogEntry[] => {
  const logs = getAuditLog();
  const start = startDate.getTime();
  const end = endDate.getTime();

  return logs.filter((log) => {
    const logTime = new Date(log.timestamp).getTime();
    return logTime >= start && logTime <= end;
  });
};

/**
 * Get audit logs sorted by date (newest first)
 */
export const getAuditLogSorted = (ascending = false): AuditLogEntry[] => {
  const logs = getAuditLog();
  return [...logs].sort((a, b) => {
    const timeA = new Date(a.timestamp).getTime();
    const timeB = new Date(b.timestamp).getTime();
    return ascending ? timeA - timeB : timeB - timeA;
  });
};

/**
 * Search audit logs
 */
export const searchAuditLog = (query: string): AuditLogEntry[] => {
  const logs = getAuditLog();
  const lowerQuery = query.toLowerCase();

  return logs.filter(
    (log) =>
      log.adminEmail.toLowerCase().includes(lowerQuery) ||
      log.targetUserEmail?.toLowerCase().includes(lowerQuery) ||
      log.description.toLowerCase().includes(lowerQuery) ||
      log.action.includes(lowerQuery)
  );
};

/**
 * Clear old audit logs (older than specified days)
 */
export const clearOldAuditLogs = (daysToKeep: number = 90): number => {
  try {
    const logs = getAuditLog();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const filteredLogs = logs.filter((log) => {
      const logDate = new Date(log.timestamp);
      return logDate > cutoffDate;
    });

    const deletedCount = logs.length - filteredLogs.length;
    localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(filteredLogs));

    console.log(`Deleted ${deletedCount} old audit logs`);
    return deletedCount;
  } catch (error) {
    console.error('Error clearing old audit logs:', error);
    return 0;
  }
};

/**
 * Get audit log statistics
 */
export const getAuditLogStats = () => {
  const logs = getAuditLog();
  const actionCounts = logs.reduce(
    (acc, log) => {
      acc[log.action] = (acc[log.action] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const adminCounts = logs.reduce(
    (acc, log) => {
      acc[log.adminEmail] = (acc[log.adminEmail] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return {
    totalEntries: logs.length,
    actionCounts,
    adminCounts,
    oldestEntry: logs[0]?.timestamp || null,
    newestEntry: logs[logs.length - 1]?.timestamp || null,
  };
};

/**
 * Export audit log as JSON
 */
export const exportAuditLog = (): string => {
  const logs = getAuditLog();
  return JSON.stringify(logs, null, 2);
};
