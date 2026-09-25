import React, { useState } from 'react';
import {
  Search,
  AlertTriangle,
  FileCheck,
  Zap,
  Shield,
  Activity,
  Layers,
} from 'lucide-react';
import { IncidentReport } from '../types';
import { RiskBandBadge } from '../components/RiskBandBadge';

interface Props {
  incidents: IncidentReport[];
  selectedIncident: IncidentReport | null;
  onSelectIncident: (inc: IncidentReport) => void;
  onNavigateReview: (inc: IncidentReport) => void;
}

export const IncidentsView: React.FC<Props> = ({
  incidents,
  selectedIncident,
  onSelectIncident,
  onNavigateReview,
}) => {
  const [search, setSearch] = useState('');
  const [bandFilter, setBandFilter] = useState('ALL');
  const [sifOnly, setSifOnly] = useState(false);
  const [activeTab, setActiveTab] = useState<'brief' | 'entities' | 'cues' | 'provenance'>('brief');

  const filtered = incidents.filter((inc) => {
    if (bandFilter !== 'ALL' && inc.risk_band.toLowerCase() !== bandFilter.toLowerCase()) {
      return false;
    }
    if (sifOnly && !inc.sif_potential) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchText = inc.raw_text.toLowerCase().includes(q);
      const matchRule = inc.iogp_rule.toLowerCase().includes(q);
      const matchLoc = inc.location.toLowerCase().includes(q);
      const matchAct = inc.activity.toLowerCase().includes(q);
      if (!matchText && !matchRule && !matchLoc && !matchAct) return false;
    }
    return true;
  });

  const current = selectedIncident || filtered[0] || null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
      {/* Filter and Search Bar */}
      <div
        className="panel"
        style={{
          padding: '0.75rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
          marginBottom: 0,
        }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--oil-text-muted)',
            }}
          />
          <input
            type="text"
            className="login-input"
            placeholder="Search observation text, IOGP rule, location, or activity..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '2rem' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--oil-text-secondary)' }}>Risk Band:</label>
          <select
            value={bandFilter}
            onChange={(e) => setBandFilter(e.target.value)}
            style={{ padding: '0.45rem 0.75rem', border: '1px solid var(--oil-border)', borderRadius: 4, background: '#FFFFFF' }}
          >
            <option value="ALL">All Bands</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.8rem',
            cursor: 'pointer',
            fontWeight: 600,
            color: sifOnly ? 'var(--oil-red)' : 'var(--oil-text-secondary)',
          }}
        >
          <input
            type="checkbox"
            checked={sifOnly}
            onChange={(e) => setSifOnly(e.target.checked)}
          />
          <span>SIF Precursors Only</span>
        </label>
      </div>

      {/* Split Workspace */}
      <div className="review-split-layout" style={{ gridTemplateColumns: '420px 1fr' }}>
        {/* Left: Incident Table List */}
        <div className="review-queue-panel">
          <div className="queue-panel-header">
            <span>FILTERED OBSERVATIONS ({filtered.length})</span>
          </div>

          <div className="queue-list-scroll">
            {filtered.map((inc) => {
              const isSelected = current?.id === inc.id;
              return (
                <div
                  key={inc.id}
                  className={`queue-item-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => onSelectIncident(inc)}
                >
                  <div className="item-header-row">
                    <span className="item-ref-id">{inc.id}</span>
                    <RiskBandBadge band={inc.risk_band} score={inc.risk_score} />
                  </div>
                  <p className="item-snippet-text">{inc.raw_text}</p>
                  <div className="item-footer-row">
                    <span style={{ fontWeight: 600, color: 'var(--oil-text-secondary)' }}>
                      {inc.iogp_rule}
                    </span>
                    <span className="item-date">{inc.location || 'Assam Basin'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Forensic Inspector Pane */}
        {current ? (
          <div className="review-detail-panel">
            <div className="panel-header" style={{ marginBottom: 0 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--oil-red)' }}>
                    {current.id}
                  </span>
                  <RiskBandBadge band={current.risk_band} score={current.risk_score} />
                </div>
                <div style={{ fontSize: '0.725rem', color: 'var(--oil-text-muted)', marginTop: 2 }}>
                  Recorded: {current.timestamp || 'Shift Log'}
                </div>
              </div>

              {current.needs_review && (
                <button
                  className="btn-primary-sentra"
                  onClick={() => onNavigateReview(current)}
                >
                  <FileCheck size={14} />
                  <span>Open Triage Review</span>
                </button>
              )}
            </div>

            {/* Forensic Inspection Tabs */}
            <div className="profile-tabs-bar">
              <button
                className={`tab-btn ${activeTab === 'brief' ? 'active' : ''}`}
                onClick={() => setActiveTab('brief')}
              >
                Brief & Rationale
              </button>
              <button
                className={`tab-btn ${activeTab === 'entities' ? 'active' : ''}`}
                onClick={() => setActiveTab('entities')}
              >
                Safety Entities
              </button>
              <button
                className={`tab-btn ${activeTab === 'cues' ? 'active' : ''}`}
                onClick={() => setActiveTab('cues')}
              >
                Cues & ML
              </button>
              <button
                className={`tab-btn ${activeTab === 'provenance' ? 'active' : ''}`}
                onClick={() => setActiveTab('provenance')}
              >
                Decision Path
              </button>
            </div>

            {/* Tab 1: Brief & Verdict */}
            {activeTab === 'brief' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div className="review-section-card">
                  <div className="kpi-label" style={{ marginBottom: '0.35rem' }}>
                    Reporter Surface Text
                  </div>
                  <div className="raw-narrative-quote">
                    "{current.raw_text}"
                  </div>
                </div>

                <div className="review-section-card">
                  <div className="kpi-label" style={{ marginBottom: '0.35rem' }}>
                    Deterministic Rationale & Explanation
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--oil-text-black)', fontWeight: 500 }}>
                    {current.explanation || 'Analyzed via hybrid lexical-semantic sentence-transformer pipeline.'}
                  </div>
                </div>

                <div className="review-evidence-grid">
                  <div className="evidence-box">
                    <span className="evidence-label">P(SIF) PROBABILITY</span>
                    <div className="evidence-value" style={{ color: 'var(--status-critical)', fontSize: '1.1rem' }}>
                      {(current.p_sif * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="evidence-box">
                    <span className="evidence-label">RULE CONFIDENCE</span>
                    <div className="evidence-value" style={{ color: 'var(--oil-red)', fontSize: '1.1rem' }}>
                      {(current.rule_confidence * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="evidence-box">
                    <span className="evidence-label">HIGH-ENERGY STATE</span>
                    <div className="evidence-value">
                      {current.high_energy ? 'Confirmed' : 'None'}
                    </div>
                  </div>
                  <div className="evidence-box">
                    <span className="evidence-label">BARRIER INTEGRITY</span>
                    <div className="evidence-value" style={{ color: current.barrier_failed ? 'var(--status-critical)' : 'inherit' }}>
                      {current.barrier_failed ? 'Compromised' : 'Intact'}
                    </div>
                  </div>
                </div>

                {current.human_decision && (
                  <div
                    style={{
                      background: 'var(--status-low-bg)',
                      border: '1px solid var(--status-low)',
                      padding: '0.75rem',
                      borderRadius: 4,
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 700,
                        color: 'var(--status-low-text)',
                        fontSize: '0.8rem',
                        marginBottom: '0.25rem',
                      }}
                    >
                      ✓ Human Review Verdict: {current.human_decision.decision}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--oil-text-secondary)' }}>
                      Signed off by: {current.human_decision.reviewer_name} ({current.human_decision.reviewer_id})
                    </div>
                    {current.human_decision.notes && (
                      <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                        Notes: {current.human_decision.notes}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Extracted Safety Entities */}
            {activeTab === 'entities' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <div className="review-section-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--oil-text-secondary)', fontSize: '0.7rem' }}>
                    <Shield size={14} />
                    <span>IOGP LIFE-SAVING RULE</span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--oil-red)', marginTop: 2 }}>
                    {current.iogp_rule}
                  </div>
                </div>

                <div className="review-section-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--oil-text-secondary)', fontSize: '0.7rem' }}>
                    <Zap size={14} />
                    <span>ENERGY SOURCE HAZARD</span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--status-high)', marginTop: 2 }}>
                    {current.energy_source || 'None detected'}
                  </div>
                </div>

                <div className="review-section-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--oil-text-secondary)', fontSize: '0.7rem' }}>
                    <AlertTriangle size={14} />
                    <span>CRITICAL BARRIER FAILURE</span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--status-critical)', marginTop: 2 }}>
                    {current.barrier_failure || 'No barrier failure detected'}
                  </div>
                </div>

                <div className="review-section-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--oil-text-secondary)', fontSize: '0.7rem' }}>
                    <Activity size={14} />
                    <span>OPERATIONAL ACTIVITY</span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--oil-text-black)', marginTop: 2 }}>
                    {current.activity || 'Field Operations'}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Cues & ML */}
            {activeTab === 'cues' && (
              <div className="review-section-card">
                <span className="evidence-label">ML & NEURAL CLASSIFIER INFERENCE</span>
                <p style={{ fontSize: '0.8rem', color: 'var(--oil-text-secondary)', marginTop: 4 }}>
                  MiniLM embedding mapped against IOGP Rule prototypes with score{' '}
                  <strong>{(current.rule_confidence * 100).toFixed(1)}%</strong>.
                </p>
                {current.matched_keywords && current.matched_keywords.length > 0 && (
                  <div className="keywords-row">
                    <span className="kw-label">Extracted Tokens:</span>
                    {current.matched_keywords.map((kw, idx) => (
                      <span key={idx} className="kw-pill">{kw}</span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 4: Provenance & Decision Path */}
            {activeTab === 'provenance' && (
              <div className="review-section-card">
                <span className="evidence-label">EXPLAINABLE PIPELINE PROVENANCE</span>
                <div style={{ fontSize: '0.8rem', marginTop: 6, lineHeight: 1.5 }}>
                  <div>Encoder: <strong>{current.encoder}</strong></div>
                  <div>Latency: <strong>{current.elapsed_ms}ms</strong></div>
                  <div>Audit Reference: <strong className="font-mono text-red">{current.reference || 'SHA256-OK'}</strong></div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="review-empty-panel">
            <Layers size={36} className="text-muted" />
            <p>Select an observation from the list to inspect forensics.</p>
          </div>
        )}
      </div>
    </div>
  );
};
