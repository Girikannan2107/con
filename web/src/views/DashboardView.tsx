import React, { useState } from 'react';
import {
  AlertOctagon,
  ShieldAlert,
  Percent,
  CheckCircle,
  Play,
  Database,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { DashboardSummary, IncidentReport } from '../types';
import { RiskBandBadge } from '../components/RiskBandBadge';

interface Props {
  summary: DashboardSummary | null;
  recentIncidents: IncidentReport[];
  onAnalyzeQuick: (text: string) => Promise<void>;
  onSeedData: () => Promise<void>;
  onNavigateTab: (tab: any) => void;
  onSelectIncident: (inc: IncidentReport) => void;
}

export const DashboardView: React.FC<Props> = ({
  summary,
  recentIncidents,
  onAnalyzeQuick,
  onSeedData,
  onNavigateTab,
  onSelectIncident,
}) => {
  const [quickText, setQuickText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickText.trim() || analyzing) return;
    setAnalyzing(true);
    try {
      await onAnalyzeQuick(quickText);
      setQuickText('');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await onSeedData();
    } finally {
      setSeeding(false);
    }
  };

  const kpis = summary?.kpis || {
    total_reports: recentIncidents.length,
    sif_precursors: recentIncidents.filter((r) => r.sif_potential).length,
    sif_rate: 60,
    critical_risk: recentIncidents.filter((r) => r.risk_band === 'Critical').length,
    high_risk: recentIncidents.filter((r) => r.risk_band === 'High').length,
    pending_review: recentIncidents.filter((r) => r.needs_review && !r.human_decision).length,
    open_actions: 3,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* KPI Tiles Row */}
      <div className="home-metrics-grid">
        <div className="home-kpi-card" onClick={() => onNavigateTab('incidents')}>
          <div className="kpi-icon-wrap bg-blue-subtle">
            <Database size={20} />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">TOTAL FIELD REPORTS</span>
            <div className="kpi-value-row">
              <span className="kpi-num">{kpis.total_reports}</span>
              <span className="kpi-trend">All Observations</span>
            </div>
          </div>
        </div>

        <div className="home-kpi-card" onClick={() => onNavigateTab('dashboard')}>
          <div className="kpi-icon-wrap bg-red-subtle">
            <AlertOctagon size={20} className="text-red" />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">SIF PRECURSORS DETECTED</span>
            <div className="kpi-value-row">
              <span className="kpi-num text-red">{kpis.sif_precursors}</span>
              <span className="kpi-trend badge-rate">{kpis.sif_rate}% rate</span>
            </div>
          </div>
        </div>

        <div className="home-kpi-card" onClick={() => onNavigateTab('incidents')}>
          <div className="kpi-icon-wrap bg-red-subtle">
            <ShieldAlert size={20} className="text-red" />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">CRITICAL PROCESS RISK</span>
            <div className="kpi-value-row">
              <span className="kpi-num text-red">{kpis.critical_risk}</span>
              <span className="kpi-trend">Immediate triage</span>
            </div>
          </div>
        </div>

        <div className="home-kpi-card" onClick={() => onNavigateTab('review')}>
          <div className="kpi-icon-wrap bg-green-subtle">
            <CheckCircle size={20} className="text-green" />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">AWAITING REVIEW</span>
            <div className="kpi-value-row">
              <span className="kpi-num text-green">{kpis.pending_review}</span>
              <span className="kpi-trend">Needs HSE Sign-off</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Intake Bar */}
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">
            <Sparkles size={18} className="text-red" />
            <span>Instant Safety Intelligence Intake</span>
          </div>
          <button className="btn-secondary-sm" onClick={handleSeed} disabled={seeding}>
            <Database size={13} />
            <span>{seeding ? 'Seeding...' : 'Load 5 Seed Incidents'}</span>
          </button>
        </div>

        <form onSubmit={handleQuickSubmit} style={{ display: 'flex', gap: '0.75rem' }}>
          <input
            type="text"
            className="login-input"
            placeholder="Paste raw UA/UC text, near-miss observation, or permit log (e.g. 'Scaffold plank broke at 6m height, harness unclipped')..."
            value={quickText}
            onChange={(e) => setQuickText(e.target.value)}
          />
          <button type="submit" className="btn-primary-sentra" disabled={analyzing || !quickText.trim()}>
            <Play size={13} />
            <span>{analyzing ? 'Analyzing...' : 'Run Pipeline'}</span>
          </button>
        </form>
      </div>

      {/* Distribution Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        {/* IOGP Life-Saving Rules Exposure */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">IOGP Life-Saving Rule Distribution</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {summary?.rule_distribution && Object.keys(summary.rule_distribution).length > 0 ? (
              Object.entries(summary.rule_distribution).map(([rule, count]) => {
                const total = summary.kpis.total_reports || 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={rule}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.8rem',
                        marginBottom: '0.25rem',
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>{rule}</span>
                      <span style={{ color: 'var(--oil-text-secondary)' }}>
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div
                      style={{
                        height: 6,
                        background: 'var(--oil-light-gray)',
                        borderRadius: 3,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${pct}%`,
                          background: 'var(--oil-red)',
                          borderRadius: 3,
                          transition: 'width 0.4s ease',
                        }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ fontSize: '0.825rem', color: 'var(--oil-text-muted)' }}>
                No classified rules yet.
              </div>
            )}
          </div>
        </div>

        {/* High-Energy Hazards Distribution */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">Identified High-Energy Hazard Families</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {summary?.energy_distribution && Object.keys(summary.energy_distribution).length > 0 ? (
              Object.entries(summary.energy_distribution).map(([energy, count]) => {
                const total = summary.kpis.total_reports || 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={energy}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.8rem',
                        marginBottom: '0.25rem',
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>{energy}</span>
                      <span style={{ color: 'var(--oil-text-secondary)' }}>
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div
                      style={{
                        height: 6,
                        background: 'var(--oil-light-gray)',
                        borderRadius: 3,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${pct}%`,
                          background: 'var(--status-high)',
                          borderRadius: 3,
                          transition: 'width 0.4s ease',
                        }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ fontSize: '0.825rem', color: 'var(--oil-text-muted)' }}>
                No energy sources detected yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Latest Analyzed Incidents Table */}
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">Latest Analyzed Safety Observations</div>
          <button
            className="btn-secondary-sm"
            onClick={() => onNavigateTab('incidents')}
          >
            <span>View All Reports</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <div className="table-container">
          <table className="sentra-table">
            <thead>
              <tr>
                <th>REF ID</th>
                <th>OBSERVATION SUMMARY</th>
                <th>SIF PRECURSOR</th>
                <th>RISK BAND</th>
                <th>IOGP RULE</th>
                <th>ENERGY SOURCE</th>
                <th>LOCATION</th>
              </tr>
            </thead>
            <tbody>
              {recentIncidents.slice(0, 6).map((inc) => (
                <tr
                  key={inc.id}
                  onClick={() => {
                    onSelectIncident(inc);
                    onNavigateTab('incidents');
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <td className="font-mono font-bold text-red">{inc.id}</td>
                  <td
                    style={{
                      maxWidth: 320,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {inc.raw_text}
                  </td>
                  <td>
                    {inc.sif_potential ? (
                      <span className="badge badge-sif">SIF Precursor</span>
                    ) : (
                      <span className="badge badge-neutral">Standard UA/UC</span>
                    )}
                  </td>
                  <td>
                    <RiskBandBadge band={inc.risk_band} score={inc.risk_score} />
                  </td>
                  <td>{inc.iogp_rule}</td>
                  <td>{inc.energy_source || 'None'}</td>
                  <td style={{ color: 'var(--oil-text-secondary)' }}>{inc.location || 'Assam Basin'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
