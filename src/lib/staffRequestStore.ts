export interface StaffRequest {
  id: string;
  pcName: string;
  type: 'TOPUP_CASH' | 'HARDWARE_ISSUE' | 'CLEAN_DESK' | 'EXTRA_SERVICE' | 'OTHER';
  title: string;
  details: string;
  target?: 'SERVER' | 'KITCHEN';
  status: 'PENDING' | 'RESOLVED';
  createdAt: string;
}

export const STAFF_REQUEST_STORAGE_KEY = 'CYBER_STAFF_REQUESTS';
export const STAFF_REQUEST_EVENT = 'cyber_staff_request_sync';

export const INITIAL_STAFF_REQUESTS: StaffRequest[] = [];

export function getStoredStaffRequests(): StaffRequest[] {
  if (typeof window === 'undefined') return INITIAL_STAFF_REQUESTS;
  try {
    const raw = localStorage.getItem(STAFF_REQUEST_STORAGE_KEY);
    if (!raw) {
      return INITIAL_STAFF_REQUESTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_STAFF_REQUESTS;
  } catch {
    return INITIAL_STAFF_REQUESTS;
  }
}

export function broadcastStaffRequests(reqs: StaffRequest[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STAFF_REQUEST_STORAGE_KEY, JSON.stringify(reqs));
    window.dispatchEvent(new CustomEvent(STAFF_REQUEST_EVENT, { detail: reqs }));
  } catch (err) {
    console.error('Failed to broadcast staff requests:', err);
  }
}

export function createStaffRequest(
  data: Omit<StaffRequest, 'id' | 'status' | 'createdAt'>
): StaffRequest {
  const current = getStoredStaffRequests();
  const newReq: StaffRequest = {
    ...data,
    target: data.target || 'SERVER',
    id: `req-${Date.now()}`,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
  };

  const updated = [newReq, ...current];
  broadcastStaffRequests(updated);
  return newReq;
}

export function resolveStaffRequest(id: string): StaffRequest[] {
  const current = getStoredStaffRequests();
  const updated = current.map((r) => (r.id === id ? { ...r, status: 'RESOLVED' as const } : r));
  broadcastStaffRequests(updated);
  return updated;
}

export function clearAllStaffRequests(): void {
  broadcastStaffRequests([]);
}