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
import { KpiTile } from '../components/KpiTile';
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
    total_reports: 0,
    sif_precursors: 0,
    sif_rate: 0,
    critical_risk: 0,
    high_risk: 0,
    pending_review: 0,
    open_actions: 0,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* KPI Tiles Grid */}
      <div className="kpi-grid">
        <KpiTile
          label="Total Field Reports"
          value={kpis.total_reports}
          sub="Ingested across all operational sites"
          variant="default"
          icon={<Database size={18} />}
        />
        <KpiTile
          label="SIF Precursors"
          value={kpis.sif_precursors}
          sub="Fatal & serious potential identified"
          variant="critical"
          icon={<AlertOctagon size={18} />}
        />
        <KpiTile
          label="Precursor Exposure Rate"
          value={`${kpis.sif_rate}%`}
          sub="SIF Density vs Total Reports"
          variant="high"
          icon={<Percent size={18} />}
        />
        <KpiTile
          label="Critical Risk Level"
          value={kpis.critical_risk}
          sub="Requires immediate stop-work triage"
          variant="critical"
          icon={<ShieldAlert size={18} />}
        />
        <KpiTile
          label="Pending Review Bench"
          value={kpis.pending_review}
          sub="Disagreements / Human verifications"
          variant="cyan"
          icon={<CheckCircle size={18} />}
        />
      </div>

      {/* Quick Analysis & Corpus Ingest Bar */}
      <div className="panel" style={{ background: 'linear-gradient(180deg, #111B2E 0%, #0F172A 100%)' }}>
        <div className="panel-header">
          <div className="panel-title">
            <Sparkles size={18} style={{ color: 'var(--accent-cyan)' }} />
            <span>Instant Safety Intelligence Triage</span>
          </div>
          <button className="btn btn-secondary" onClick={handleSeed} disabled={seeding}>
            <Database size={14} />
            <span>{seeding ? 'Seeding...' : 'Load 5 Seed Incidents'}</span>
          </button>
        </div>

        <form onSubmit={handleQuickSubmit} style={{ display: 'flex', gap: '0.75rem' }}>
          <input
            type="text"
            placeholder="Paste raw UA/UC text, near-miss observation, or permit log (e.g. 'Scaffold plank broke at 6m height, harness unclipped')..."
            value={quickText}
            onChange={(e) => setQuickText(e.target.value)}
          />
          <button type="submit" className="btn btn-primary" disabled={analyzing || !quickText.trim()}>
            <Play size={14} />
            <span>{analyzing ? 'Analyzing...' : 'Run Pipeline'}</span>
          </button>
        </form>
      </div>

      {/* Exposure Distributions & Recent Reports */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        {/* IOGP Life-Saving Rules Exposure */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">IOGP Life-Saving Rule Distribution</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
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
                      <span style={{ fontWeight: 500 }}>{rule}</span>
                      <span style={{ color: 'var(--text-muted)' }}>
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div
                      style={{
                        height: 6,
                        background: '#1E293B',
                        borderRadius: 3,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${pct}%`,
                          background: 'var(--accent-cyan)',
                          borderRadius: 3,
                        }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
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
                      <span style={{ fontWeight: 500 }}>{energy}</span>
                      <span style={{ color: 'var(--text-muted)' }}>
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div
                      style={{
                        height: 6,
                        background: '#1E293B',
                        borderRadius: 3,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${pct}%`,
                          background: '#F59E0B',
                          borderRadius: 3,
                        }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
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
            className="btn btn-secondary"
            onClick={() => onNavigateTab('incidents')}
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
          >
            <span>View All Reports</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Observation Summary</th>
                <th>SIF Precursor</th>
                <th>Risk Band</th>
                <th>IOGP Rule</th>
                <th>Energy Source</th>
                <th>Location</th>
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
                >
                  <td style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>{inc.id}</td>
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
                  <td style={{ color: 'var(--text-muted)' }}>{inc.location || 'Duliajan'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
