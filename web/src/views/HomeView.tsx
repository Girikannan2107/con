import React, { useState } from 'react';
import {
  AlertTriangle,
  Flame,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Send,
  Zap,
  Layers,
  Activity,
  UserCheck,
} from 'lucide-react';
import { DashboardSummary, IncidentReport, Workspace, User } from '../types';
import { RiskBandBadge } from '../components/RiskBandBadge';
import { TabId } from '../components/Sidebar';

interface Props {
  summary: DashboardSummary | null;
  recentIncidents: IncidentReport[];
  activeWorkspace: Workspace | null;
  currentUser: User | null;
  onAnalyzeQuick: (text: string) => Promise<void>;
  onNavigateTab: (tab: TabId) => void;
  onSelectIncident: (inc: IncidentReport) => void;
}

export const HomeView: React.FC<Props> = ({
  summary,
  recentIncidents,
  activeWorkspace,
  currentUser,
  onAnalyzeQuick,
  onNavigateTab,
  onSelectIncident,
}) => {
  const [quickText, setQuickText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  const kpis = summary?.kpis;
  const criticalReports = recentIncidents.filter(
    (r) => r.risk_band === 'Critical' || r.sif_potential
  );
  const pendingReviewReports = recentIncidents.filter(
    (r) => r.needs_review && !r.human_decision
  );

  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickText.trim()) return;
    setAnalyzing(true);
    try {
      await onAnalyzeQuick(quickText);
      setQuickText('');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="home-container">
      {/* 1. Operational Workspace Banner */}
      <section className="home-banner-card">
        <div className="banner-left">
          <div className="banner-badge">
            <span className="live-dot pulse"></span>
            <span>OIL INDIA LIMITED · HSE OPERATIONAL CONSOLE</span>
          </div>
          <h1 className="banner-title">
            {activeWorkspace?.name || 'SENTRA Process Safety Intelligence'}
          </h1>
          <p className="banner-desc">
            {activeWorkspace?.description ||
              'Real-time precursor detection, high-energy isolation auditing, and IOGP life-saving compliance.'}
          </p>
          <div className="banner-meta-row">
            <span className="meta-tag">
              <strong>Asset / Site:</strong> {activeWorkspace?.site || 'Assam Basin Asset'}
            </span>
            <span className="meta-tag">
              <strong>Shift Lead:</strong> {currentUser?.name || 'Authorized HSE Lead'} ({currentUser?.role || 'HSE Specialist'})
            </span>
            <span className="meta-tag">
              <strong>SIF Precursor Sensitivity:</strong> Wilson 95% Confidence
            </span>
          </div>
        </div>

        <div className="banner-right">
          <div className="banner-action-card">
            <div className="action-card-header">
              <Zap size={16} className="text-accent" />
              <span>Direct Observation Intake</span>
            </div>
            <p className="action-card-sub">
              Submit raw field narrative for instant sentence-transformer SIF analysis:
            </p>
            <form onSubmit={handleQuickSubmit} className="quick-intake-form">
              <textarea
                value={quickText}
                onChange={(e) => setQuickText(e.target.value)}
                placeholder="Paste unsafe act / condition or near-miss log (e.g. Scaffolding clamp slipped during casing pull at Well #14)..."
                rows={2}
                disabled={analyzing}
              />
              <div className="form-action-row">
                <button
                  type="button"
                  className="btn-link"
                  onClick={() => onNavigateTab('ingest')}
                >
                  <Layers size={13} /> Batch CSV / PDF Ingest
                </button>
                <button
                  type="submit"
                  className="btn-primary-sentra"
                  disabled={analyzing || !quickText.trim()}
                >
                  <Send size={13} /> {analyzing ? 'Evaluating...' : 'Run Pipeline'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* 2. Top Metric Tiles (Home KPI Row) */}
      <section className="home-metrics-grid">
        <div className="home-kpi-card" onClick={() => onNavigateTab('incidents')}>
          <div className="kpi-icon-wrap bg-blue-subtle">
            <Layers size={20} className="text-blue" />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">REPORTS RECEIVED</span>
            <div className="kpi-value-row">
              <span className="kpi-num">{kpis?.total_reports ?? recentIncidents.length}</span>
              <span className="kpi-trend">All observations</span>
            </div>
          </div>
        </div>

        <div className="home-kpi-card highlight-sif" onClick={() => onNavigateTab('dashboard')}>
          <div className="kpi-icon-wrap bg-amber-subtle">
            <Flame size={20} className="text-amber" />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">SIF POTENTIAL DETECTED</span>
            <div className="kpi-value-row">
              <span className="kpi-num text-amber">{kpis?.sif_precursors ?? 0}</span>
              <span className="kpi-trend badge-rate">{kpis?.sif_rate ?? 0}% rate</span>
            </div>
          </div>
        </div>

        <div className="home-kpi-card highlight-critical" onClick={() => onNavigateTab('incidents')}>
          <div className="kpi-icon-wrap bg-red-subtle">
            <AlertTriangle size={20} className="text-red" />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">CRITICAL RISK CASES</span>
            <div className="kpi-value-row">
              <span className="kpi-num text-red">{kpis?.critical_risk ?? 0}</span>
              <span className="kpi-trend">High energy / broken barriers</span>
            </div>
          </div>
        </div>

        <div className="home-kpi-card highlight-review" onClick={() => onNavigateTab('review')}>
          <div className="kpi-icon-wrap bg-green-subtle">
            <Clock size={20} className="text-green" />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">AWAITING HUMAN REVIEW</span>
            <div className="kpi-value-row">
              <span className="kpi-num text-green">{kpis?.pending_review ?? pendingReviewReports.length}</span>
              <span className="kpi-trend">Needs HSE Sign-off</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Operational Grid: Attention Items & Live Activity */}
      <div className="home-operational-split">
        {/* Left: Urgent Attention Items */}
        <section className="home-panel-card">
          <div className="panel-header">
            <div className="panel-title-wrap">
              <AlertTriangle size={17} className="text-red" />
              <h2>Immediate Attention & High-Risk Precursors</h2>
            </div>
            <button
              className="btn-secondary-sm"
              onClick={() => onNavigateTab('incidents')}
            >
              View All ({recentIncidents.length})
            </button>
          </div>

          <div className="attention-list">
            {criticalReports.length === 0 ? (
              <div className="empty-state-card">
                <CheckCircle2 size={32} className="text-green" />
                <p className="empty-title">No critical unmitigated cases</p>
                <p className="empty-desc">
                  All processed observations currently meet acceptable process safety thresholds.
                </p>
              </div>
            ) : (
              criticalReports.slice(0, 5).map((inc) => (
                <div
                  key={inc.id}
                  className="attention-item-row"
                  onClick={() => {
                    onSelectIncident(inc);
                    onNavigateTab('incidents');
                  }}
                >
                  <div className="item-meta-col">
                    <span className="item-id">{inc.id}</span>
                    <RiskBandBadge band={inc.risk_band} />
                  </div>
                  <div className="item-content-col">
                    <div className="item-top">
                      <span className="item-rule">{inc.iogp_rule || 'Unclassified Rule'}</span>
                      <span className="item-location">{inc.location || 'Facility Area'}</span>
                    </div>
                    <p className="item-text">{inc.raw_text}</p>
                    {inc.barrier_failures && inc.barrier_failures.length > 0 && (
                      <div className="barrier-pill-row">
                        <span className="barrier-label">Failed Barrier:</span>
                        <span className="barrier-pill">{inc.barrier_failures[0]}</span>
                      </div>
                    )}
                  </div>
                  <div className="item-action-col">
                    <button className="btn-icon-jump" title="Inspect Forensics">
                      <ArrowRight size={15} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Right: Operational Activity & Review Triage Queue */}
        <div className="home-side-col">
          {/* Triage Queue Quick Jump */}
          <section className="home-panel-card">
            <div className="panel-header">
              <div className="panel-title-wrap">
                <UserCheck size={17} className="text-accent-green" />
                <h2>HSE Review Triage</h2>
              </div>
              <button
                className="btn-secondary-sm"
                onClick={() => onNavigateTab('review')}
              >
                Open Review ({pendingReviewReports.length})
              </button>
            </div>

            <div className="triage-quick-list">
              {pendingReviewReports.length === 0 ? (
                <div className="triage-cleared-box">
                  <ShieldCheck size={24} className="text-green" />
                  <div>
                    <strong>Triage Bench Cleared</strong>
                    <p>No model/rule disagreements awaiting human confirmation.</p>
                  </div>
                </div>
              ) : (
                pendingReviewReports.slice(0, 3).map((r) => (
                  <div
                    key={r.id}
                    className="triage-card"
                    onClick={() => {
                      onSelectIncident(r);
                      onNavigateTab('review');
                    }}
                  >
                    <div className="triage-card-header">
                      <span className="triage-id">{r.id}</span>
                      <span className="triage-badge-pending">Pending Sign-off</span>
                    </div>
                    <p className="triage-snippet">{r.raw_text.slice(0, 95)}...</p>
                    <div className="triage-card-footer">
                      <span>{r.iogp_rule}</span>
                      <span className="text-amber">SIF Potential</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Quick System & Safety Engines Overview */}
          <section className="home-panel-card">
            <div className="panel-header">
              <div className="panel-title-wrap">
                <Activity size={17} className="text-blue" />
                <h2>Active Safety Controls</h2>
              </div>
            </div>
            <div className="controls-status-list">
              <div className="control-status-item">
                <span className="status-indicator-dot ready"></span>
                <div className="control-info">
                  <strong>IOGP 9 Life-Saving Rules</strong>
                  <span>Deterministic lexical rule verification active</span>
                </div>
                <span className="control-badge">Locked</span>
              </div>
              <div className="control-status-item">
                <span className="status-indicator-dot ready"></span>
                <div className="control-info">
                  <strong>Semantic Precursor Neural Model</strong>
                  <span>Local sentence transformer (all-MiniLM-L6-v2)</span>
                </div>
                <span className="control-badge">Ready</span>
              </div>
              <div className="control-status-item">
                <span className="status-indicator-dot ready"></span>
                <div className="control-info">
                  <strong>Append-Only Audit Trail</strong>
                  <span>SHA-256 tamper-evident integrity</span>
                </div>
                <span className="control-badge">Verified</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
