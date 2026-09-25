import React, { useState } from 'react';
import {
  Search,
  AlertTriangle,
  Layers,
  FileCheck,
  Zap,
  Info,
  ChevronRight,
  Shield,
  Activity,
  MapPin,
  Clock,
  Sparkles,
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
              color: 'var(--text-muted)',
            }}
          />
          <input
            type="text"
            placeholder="Search observation text, IOGP rule, location, or activity..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '2rem' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Risk Band:</label>
          <select
            value={bandFilter}
            onChange={(e) => setBandFilter(e.target.value)}
            style={{ width: 'auto', padding: '0.45rem 0.75rem' }}
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
            color: sifOnly ? 'var(--text-highlight)' : 'var(--text-secondary)',
          }}
        >
          <input
            type="checkbox"
            checked={sifOnly}
            onChange={(e) => setSifOnly(e.target.checked)}
            style={{ width: 'auto' }}
          />
          <span>SIF Precursors Only</span>
        </label>
      </div>

      {/* Split Workspace */}
      <div className="split-pane">
        {/* Left: Incident Table List */}
        <div className="table-container pane-scroll">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Safety Report / Observation</th>
                <th>SIF</th>
                <th>Band</th>
                <th>Rule</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inc) => {
                const isSelected = current?.id === inc.id;
                return (
                  <tr
                    key={inc.id}
                    className={isSelected ? 'selected' : ''}
                    onClick={() => onSelectIncident(inc)}
                  >
                    <td style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>{inc.id}</td>
                    <td style={{ maxWidth: 280, fontSize: '0.8rem' }}>
                      <div
                        style={{
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {inc.raw_text}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {inc.location || 'Duliajan'} · {inc.activity || 'Field Operations'}
                      </div>
                    </td>
                    <td>
                      {inc.sif_potential ? (
                        <span className="badge badge-sif">SIF</span>
                      ) : (
                        <span className="badge badge-neutral">UA/UC</span>
                      )}
                    </td>
                    <td>
                      <RiskBandBadge band={inc.risk_band} score={inc.risk_score} />
                    </td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {inc.iogp_rule}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Right: Forensic Inspector Pane */}
        {current ? (
          <div className="panel pane-scroll" style={{ marginBottom: 0 }}>
            <div className="panel-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                    {current.id}
                  </span>
                  <RiskBandBadge band={current.risk_band} score={current.risk_score} />
                </div>
                <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                  Recorded: {current.timestamp || 'Recent Shift'}
                </div>
              </div>

              {current.needs_review && (
                <button
                  className="btn btn-primary"
                  onClick={() => onNavigateReview(current)}
                  style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                >
                  <FileCheck size={14} />
                  <span>Review Case</span>
                </button>
              )}
            </div>

            {/* Forensic Inspection Tabs */}
            <div className="tabs-header">
              <button
                className={`tab-btn ${activeTab === 'brief' ? 'active' : ''}`}
                onClick={() => setActiveTab('brief')}
              >
                Brief & Verdict
              </button>
              <button
                className={`tab-btn ${activeTab === 'entities' ? 'active' : ''}`}
                onClick={() => setActiveTab('entities')}
              >
                Extracted Entities
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
                <div style={{ background: '#090E1A', padding: '0.85rem', borderRadius: '8px' }}>
                  <div className="kpi-label" style={{ marginBottom: '0.35rem' }}>
                    Reporter Surface Text
                  </div>
                  <div style={{ fontSize: '0.85rem', fontStyle: 'italic', color: 'var(--text-primary)' }}>
                    "{current.raw_text}"
                  </div>
                </div>

                <div style={{ background: '#090E1A', padding: '0.85rem', borderRadius: '8px' }}>
                  <div className="kpi-label" style={{ marginBottom: '0.35rem' }}>
                    Deterministic Rationale & Explanation
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-highlight)' }}>
                    {current.explanation || 'Analyzed via hybrid lexical-semantic pipeline.'}
                  </div>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.5rem',
                    fontSize: '0.8rem',
                  }}
                >
                  <div style={{ background: '#0B1220', padding: '0.6rem', borderRadius: '6px' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>P(SIF) Probability</div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: '#EF4444' }}>
                      {(current.p_sif * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div style={{ background: '#0B1220', padding: '0.6rem', borderRadius: '6px' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Rule Confidence</div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--accent-cyan)' }}>
                      {(current.rule_confidence * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>

                {current.human_decision && (
                  <div
                    style={{
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      padding: '0.75rem',
                      borderRadius: '8px',
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 700,
                        color: '#10B981',
                        fontSize: '0.8rem',
                        marginBottom: '0.25rem',
                      }}
                    >
                      ✓ Human Review Decision: {current.human_decision.decision}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Verified by: {current.human_decision.reviewer_name} ({current.human_decision.reviewer_id})
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
                <div style={{ background: '#090E1A', padding: '0.75rem', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                    <Shield size={14} />
                    <span>IOGP LIFE-SAVING RULE</span>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-highlight)', marginTop: 2 }}>
                    {current.iogp_rule}
                  </div>
                </div>

                <div style={{ background: '#090E1A', padding: '0.75rem', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                    <Zap size={14} />
                    <span>ENERGY SOURCE HAZARD</span>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#F59E0B', marginTop: 2 }}>
                    {current.energy_source || 'None detected'}
                  </div>
                </div>

                <div style={{ background: '#090E1A', padding: '0.75rem', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                    <AlertTriangle size={14} />
                    <span>CRITICAL BARRIER FAILURE</span>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#EF4444', marginTop: 2 }}>
                    {current.barrier_failure || 'No barrier failure found'}
                  </div>
                </div>

                <div style={{ background: '#090E1A', padding: '0.75rem', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                    <Activity size={14} />
                    <span>OPERATIONAL ACTIVITY</span>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', marginTop: 2 }}>
                    {current.activity || 'General Field Tasks'}
                  </div>
                </div>

                <div style={{ background: '#090E1A', padding: '0.75rem', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                    <MapPin size={14} />
                    <span>SITE / RIG LOCATION</span>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', marginTop: 2 }}>
                    {current.location || 'Oil India Limited Facility'}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Cues & Nearest Prototypes */}
            {activeTab === 'cues' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ background: '#090E1A', padding: '0.75rem', borderRadius: '6px' }}>
                  <div className="kpi-label" style={{ marginBottom: '0.35rem' }}>
                    Lexical Cue Matches
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {current.evidence?.energy_cues && current.evidence.energy_cues.length > 0 ? (
                      current.evidence.energy_cues.map((cue, i) => (
                        <span key={i} className="badge badge-neutral" style={{ color: '#F59E0B' }}>
                          ⚡ {cue}
                        </span>
                      ))
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        No direct lexical energy keywords
                      </span>
                    )}
                    {current.evidence?.barrier_cues?.map((cue, i) => (
                      <span key={i} className="badge badge-neutral" style={{ color: '#EF4444' }}>
                        🛡 {cue}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ background: '#090E1A', padding: '0.75rem', borderRadius: '6px' }}>
                  <div className="kpi-label" style={{ marginBottom: '0.35rem' }}>
                    Semantic Prototype Cosine Similarities
                  </div>
                  {current.evidence?.rule_prototypes && current.evidence.rule_prototypes.length > 0 ? (
                    current.evidence.rule_prototypes.slice(0, 3).map((proto, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '0.75rem',
                          padding: '0.25rem 0',
                          borderBottom: '1px solid #1E293B',
                        }}
                      >
                        <span>{proto.label}</span>
                        <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>
                          {(proto.score * 100).toFixed(1)}%
                        </span>
                      </div>
                    ))
                  ) : (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Embedded using MiniLM vector prototype spaces
                    </div>
                  )}
                </div>

                <div style={{ background: '#090E1A', padding: '0.75rem', borderRadius: '6px' }}>
                  <div className="kpi-label" style={{ marginBottom: '0.35rem' }}>
                    Learned Third Opinion (XGBoost)
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    ML Probability:{' '}
                    <strong style={{ color: 'var(--text-primary)' }}>
                      {current.ml_probability !== null && current.ml_probability !== undefined
                        ? `${(current.ml_probability * 100).toFixed(1)}%`
                        : 'Active / Weak Prior'}
                    </strong>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: Provenance & Decision Path */}
            {activeTab === 'provenance' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <div style={{ background: '#090E1A', padding: '0.75rem', borderRadius: '6px' }}>
                  <div className="kpi-label" style={{ marginBottom: '0.4rem' }}>
                    Multi-Stage Pipeline Trace
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ color: 'var(--accent-cyan)' }}>1. NLP Clean:</span>
                      <span>Acronym expansion (LOTO/PTW/GGS)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ color: 'var(--accent-cyan)' }}>2. Vector Embed:</span>
                      <span>{current.encoder || 'all-MiniLM-L6-v2'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ color: 'var(--accent-cyan)' }}>3. Rule Head:</span>
                      <span>{current.iogp_rule}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ color: 'var(--accent-cyan)' }}>4. Risk Scorer:</span>
                      <span>{current.risk_score} pts ({current.risk_band})</span>
                    </div>
                  </div>
                </div>

                <div style={{ background: '#090E1A', padding: '0.75rem', borderRadius: '6px' }}>
                  <div className="kpi-label" style={{ marginBottom: '0.35rem' }}>
                    Audit Reference Hash
                  </div>
                  <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    REF-{current.id}-2026-OIL-ASSAM
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div
            className="panel"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
            }}
          >
            Select an incident to view forensic details.
          </div>
        )}
      </div>
    </div>
  );
};
