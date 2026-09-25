export type RiskBand = 'Critical' | 'High' | 'Medium' | 'Low';

export interface User {
  id: string;
  employee_id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  site: string;
  avatar_initials: string;
  permissions: string[];
}

export interface HumanDecision {
  decision: 'CONFIRM' | 'REVISE' | 'DISMISS';
  sif_potential: boolean;
  iogp_rule: string;
  activity: string;
  location: string;
  barrier_failure: string;
  reviewer_id: string;
  reviewer_name: string;
  timestamp: string;
  notes: string;
}

export interface IncidentEvidence {
  energy_cues?: string[];
  barrier_cues?: string[];
  rule_cues?: string[];
  energy_prototypes?: Array<{ label: string; score: number }>;
  barrier_prototypes?: Array<{ label: string; score: number }>;
  rule_prototypes?: Array<{ label: string; score: number }>;
  decision_path?: string[];
  provenance?: Record<string, string>;
}

export interface IncidentReport {
  id: string;
  timestamp: string;
  raw_text: string;
  sif_potential: boolean;
  iogp_rule: string;
  activity: string;
  location: string;
  barrier_failure: string;
  energy_source: string;
  p_sif: number;
  risk_score: number;
  risk_band: RiskBand;
  severity_hint: string;
  confidence: number;
  rule_confidence: number;
  high_energy: boolean;
  barrier_failed: boolean;
  lexical_flag: boolean;
  semantic_flag: boolean;
  semantic_active: boolean;
  minimizing_language: boolean;
  ml_probability?: number | null;
  ml_flag?: boolean;
  ml_active?: boolean;
  source_language?: string;
  translated_text?: string;
  needs_review: boolean;
  review_trigger: string;
  review_reason: string;
  explanation: string;
  reference: string;
  encoder: string;
  elapsed_ms: number;
  evidence?: IncidentEvidence;
  status: string;
  human_decision?: HumanDecision | null;
}

export interface DashboardSummary {
  kpis: {
    total_reports: number;
    sif_precursors: number;
    sif_rate: number;
    critical_risk: number;
    high_risk: number;
    medium_risk: number;
    low_risk: number;
    pending_review: number;
    open_actions: number;
  };
  bands: {
    Critical: number;
    High: number;
    Medium: number;
    Low: number;
  };
  rule_distribution: Record<string, number>;
  energy_distribution: Record<string, number>;
}

export interface Hotspot {
  dimension: string;
  name: string;
  count: number;
  sif_count: number;
  sif_rate: number;
  score: number;
  critical_count: number;
  rules: string[];
  sample_ids?: string[];
}

export interface SafetyAction {
  id: string;
  incident_id: string;
  description: string;
  risk_category: string;
  responsible: string;
  department: string;
  due_date: string;
  priority: RiskBand;
  status: 'Open' | 'In Progress' | 'Pending Verification' | 'Verified' | 'Closed';
  created_at?: string;
}

export interface EngineStatus {
  encoder: {
    type: string;
    dim: number;
    status: string;
  };
  ocr: {
    paddle_installed: boolean;
    status: string;
    supported_languages: string[];
  };
  mlops: {
    xgboost_loaded: boolean;
    tracking_uri: string;
    feature_dim: number;
    status: string;
  };
  lexical: {
    rule_set: string;
    status: string;
  };
}

export interface AuditEntry {
  at: string;
  when?: string;
  category: string;
  action: string;
  actor: string;
  reviewer: string;
  version: string;
  summary: string;
  detail: Record<string, any>;
}

export interface SystemLog {
  timestamp: string;
  level: string;
  source: string;
  message: string;
}
