import {
  DashboardSummary,
  EngineStatus,
  IncidentReport,
  Hotspot,
  SafetyAction,
  AuditEntry,
  SystemLog,
  User,
} from './types';

const BASE_URL = '/api';

export async function fetchHealth() {
  const res = await fetch(`${BASE_URL}/health`);
  if (!res.ok) throw new Error('Failed to fetch health');
  return res.json();
}

export async function fetchCurrentUser(): Promise<{ user: User }> {
  const res = await fetch(`${BASE_URL}/auth/me`);
  if (!res.ok) throw new Error('Failed to fetch current user');
  return res.json();
}

export async function fetchAvailableUsers(): Promise<User[]> {
  const res = await fetch(`${BASE_URL}/auth/users`);
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
}

export async function loginUser(employee_id: string, password?: string): Promise<{ success: boolean; user: User }> {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ employee_id, password: password || 'sentra2026' }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Login failed' }));
    throw new Error(err.detail || 'Login failed');
  }
  return res.json();
}

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const res = await fetch(`${BASE_URL}/dashboard/summary`);
  if (!res.ok) throw new Error('Failed to fetch dashboard summary');
  return res.json();
}

export async function fetchIncidents(params?: {
  band?: string;
  sif_only?: boolean;
  query?: string;
}): Promise<IncidentReport[]> {
  const searchParams = new URLSearchParams();
  if (params?.band) searchParams.append('band', params.band);
  if (params?.sif_only !== undefined) searchParams.append('sif_only', String(params.sif_only));
  if (params?.query) searchParams.append('query', params.query);

  const res = await fetch(`${BASE_URL}/incidents?${searchParams.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch incidents');
  return res.json();
}

export async function fetchIncidentDetail(id: string): Promise<IncidentReport> {
  const res = await fetch(`${BASE_URL}/incidents/${id}`);
  if (!res.ok) throw new Error('Failed to fetch incident details');
  return res.json();
}

export async function analyzeReport(text: string): Promise<IncidentReport> {
  const res = await fetch(`${BASE_URL}/pipeline/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error('Failed to analyze report');
  return res.json();
}

export async function seedSampleReports(): Promise<{ message: string; total: number }> {
  const res = await fetch(`${BASE_URL}/pipeline/seed`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to seed reports');
  return res.json();
}

export async function uploadDocument(file: File): Promise<{
  filename: string;
  ingested_count: number;
  reports: IncidentReport[];
}> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${BASE_URL}/ingest/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to upload document');
  return res.json();
}

export async function fetchReviewQueue(): Promise<IncidentReport[]> {
  const res = await fetch(`${BASE_URL}/review/queue`);
  if (!res.ok) throw new Error('Failed to fetch review queue');
  return res.json();
}

export async function submitReviewDecision(
  id: string,
  decision: {
    decision: 'CONFIRM' | 'REVISE' | 'DISMISS';
    sif_potential: boolean;
    iogp_rule?: string;
    activity?: string;
    location?: string;
    barrier_failure?: string;
    reviewer_notes?: string;
  }
): Promise<{ success: boolean; incident: IncidentReport }> {
  const res = await fetch(`${BASE_URL}/review/${id}/decide`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(decision),
  });
  if (!res.ok) throw new Error('Failed to submit review decision');
  return res.json();
}

export async function fetchHotspots(): Promise<Hotspot[]> {
  const res = await fetch(`${BASE_URL}/patterns/hotspots`);
  if (!res.ok) throw new Error('Failed to fetch hotspots');
  return res.json();
}

export async function fetchActions(): Promise<SafetyAction[]> {
  const res = await fetch(`${BASE_URL}/actions`);
  if (!res.ok) throw new Error('Failed to fetch safety actions');
  return res.json();
}

export async function createAction(action: Omit<SafetyAction, 'id' | 'created_at'>): Promise<SafetyAction> {
  const res = await fetch(`${BASE_URL}/actions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(action),
  });
  if (!res.ok) throw new Error('Failed to create action');
  return res.json();
}

export async function updateAction(id: string, updates: Partial<SafetyAction>): Promise<SafetyAction> {
  const res = await fetch(`${BASE_URL}/actions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update action');
  return res.json();
}

export async function fetchEnginesStatus(): Promise<EngineStatus> {
  const res = await fetch(`${BASE_URL}/engines/status`);
  if (!res.ok) throw new Error('Failed to fetch engine status');
  return res.json();
}

export async function triggerModelTraining(): Promise<{
  success: boolean;
  metrics: Record<string, number>;
  feature_importances: Array<[string, number]>;
  num_samples: number;
}> {
  const res = await fetch(`${BASE_URL}/mlops/train`, { method: 'POST' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Training failed' }));
    throw new Error(err.detail || 'Training failed');
  }
  return res.json();
}

export async function fetchAuditLogs(): Promise<AuditEntry[]> {
  const res = await fetch(`${BASE_URL}/audit/logs`);
  if (!res.ok) throw new Error('Failed to fetch audit logs');
  return res.json();
}

export async function fetchSystemLogs(): Promise<SystemLog[]> {
  const res = await fetch(`${BASE_URL}/system/logs`);
  if (!res.ok) throw new Error('Failed to fetch system logs');
  return res.json();
}
