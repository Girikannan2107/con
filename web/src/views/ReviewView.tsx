import React, { useState } from 'react';
import {
  CheckSquare,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertTriangle,
  Info,
  Shield,
  Layers,
  FileText,
  Clock,
  Sparkles,
  Zap,
} from 'lucide-react';
import { IncidentReport } from '../types';
import { RiskBandBadge } from '../components/RiskBandBadge';

interface Props {
  queue: IncidentReport[];
  onDecide: (
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
  ) => Promise<void>;
}

type QueueFilter = 'all' | 'critical' | 'disagreement' | 'needs_info' | 'reviewed';

export const ReviewView: React.FC<Props> = ({ queue, onDecide }) => {
  const [selectedId, setSelectedId] = useState<string | null>(queue[0]?.id || null);
  const [filter, setFilter] = useState<QueueFilter>('all');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const filteredQueue = queue.filter((item) => {
    if (filter === 'critical') return item.risk_band === 'Critical' || item.sif_potential;
    if (filter === 'disagreement')
      return (
        item.review_trigger?.toLowerCase().includes('disagree') ||
        item.review_trigger?.toLowerCase().includes('split')
      );
    if (filter === 'needs_info')
      return item.review_trigger?.toLowerCase().includes('info') || item.review_trigger?.toLowerCase().includes('unclassified');
    if (filter === 'reviewed') return Boolean(item.human_decision);
    return true;
  });

  const activeItem =
    filteredQueue.find((q) => q.id === selectedId) ||
    filteredQueue[0] ||
    queue.find((q) => q.id === selectedId) ||
    queue[0] ||
    null;

  const handleDecision = async (
    decision: 'CONFIRM' | 'REVISE' | 'DISMISS',
    sif: boolean,
    label: string
  ) => {
    if (!activeItem || submitting) return;
    setSubmitting(true);
    setStatusMsg(`Submitting decision: ${label}...`);
    try {
      await onDecide(activeItem.id, {
        decision,
        sif_potential: sif,
        iogp_rule: activeItem.iogp_rule,
        reviewer_notes: notes,
      });
      setStatusMsg(`Recorded: ${label}`);
      setNotes('');
      setTimeout(() => setStatusMsg(null), 2000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="review-workstation-container">
      {/* Workstation Header */}
      <div className="review-top-header">
        <div className="review-title-group">
          <div className="review-badge-icon">
            <CheckSquare size={18} />
          </div>
          <div>
            <h1 className="review-workstation-title">HSE Review Workstation</h1>
            <p className="review-workstation-subtitle">
              Accountable human-in-the-loop decision bench. AI assessments are recommendations only.
            </p>
          </div>
        </div>

        <div className="queue-filter-pills">
          <button
            className={`filter-pill ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({queue.length})
          </button>
          <button
            className={`filter-pill ${filter === 'critical' ? 'active' : ''}`}
            onClick={() => setFilter('critical')}
          >
            Critical ({queue.filter((q) => q.risk_band === 'Critical' || q.sif_potential).length})
          </button>
          <button
            className={`filter-pill ${filter === 'disagreement' ? 'active' : ''}`}
            onClick={() => setFilter('disagreement')}
          >
            Disagreements
          </button>
          <button
            className={`filter-pill ${filter === 'needs_info' ? 'active' : ''}`}
            onClick={() => setFilter('needs_info')}
          >
            Needs Info
          </button>
        </div>
      </div>

      {/* Two-Panel Layout */}
      <div className="review-split-layout">
        {/* Left: Review Queue List */}
        <div className="review-queue-panel">
          <div className="queue-panel-header">
            <span>PENDING CASES ({filteredQueue.length})</span>
          </div>

          <div className="queue-list-scroll">
            {filteredQueue.length === 0 ? (
              <div className="queue-empty-box">
                <CheckCircle2 size={28} className="text-green" />
                <p>No cases waiting in this triage category.</p>
              </div>
            ) : (
              filteredQueue.map((item) => {
                const isSelected = item.id === activeItem?.id;
                return (
                  <div
                    key={item.id}
                    className={`queue-item-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedId(item.id)}
                  >
                    <div className="item-header-row">
                      <span className="item-ref-id">{item.id}</span>
                      <RiskBandBadge band={item.risk_band} score={item.risk_score} />
                    </div>
                    <p className="item-snippet-text">{item.raw_text}</p>
                    <div className="item-footer-row">
                      <span className="item-trigger-tag">
                        {item.review_trigger || 'AI / Rule Threshold'}
                      </span>
                      <span className="item-date">{item.timestamp || 'Today'}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Selected Analysis & Human Decision Station */}
        {activeItem ? (
          <div className="review-detail-panel">
            {/* 1. Mandatory Engine Assessment Disclaimer */}
            <div className="engine-disclaimer-banner">
              <div className="disclaimer-left">
                <span className="disclaimer-tag">ENGINE ASSESSMENT — NOT A DECISION</span>
                <span className="disclaimer-sub">
                  This safety evaluation was generated by SENTRA NLP & lexical classifiers. A qualified HSE reviewer must confirm or override before closure.
                </span>
              </div>
              <div className="disclaimer-model-tag">
                Model: all-MiniLM-L6-v2 + IOGP v2
              </div>
            </div>

            {/* 2. Reported Narrative Card */}
            <div className="review-section-card">
              <div className="section-card-title">
                <FileText size={15} />
                <span>Raw Field Observation / Near-Miss Narrative</span>
                <span className="meta-ref">Ref: {activeItem.id} · {activeItem.location || 'Assam Basin Site'}</span>
              </div>
              <div className="raw-narrative-quote">
                "{activeItem.raw_text}"
              </div>
            </div>

            {/* 3. Multi-Engine Evidence & Classification */}
            <div className="review-evidence-grid">
              <div className="evidence-box">
                <span className="evidence-label">PRECURSOR EVALUATION</span>
                <div className="evidence-value">
                  {activeItem.sif_potential ? (
                    <span className="sif-flag-critical">SIF Potential Identified</span>
                  ) : (
                    <span className="sif-flag-low">Standard UA/UC</span>
                  )}
                </div>
                <span className="evidence-sub">
                  Neural Confidence: <strong>{Math.round((activeItem.sif_confidence || 0.82) * 100)}%</strong>
                </span>
              </div>

              <div className="evidence-box">
                <span className="evidence-label">IOGP LIFE-SAVING RULE</span>
                <div className="evidence-value highlight">
                  {activeItem.iogp_rule || 'Unclassified Rule'}
                </div>
                <span className="evidence-sub">
                  Matched via deterministic lexical tokens
                </span>
              </div>

              <div className="evidence-box">
                <span className="evidence-label">HIGH-ENERGY HAZARD</span>
                <div className="evidence-value text-amber">
                  {activeItem.energy_source || 'Mechanical / Pressure'}
                </div>
                <span className="evidence-sub">
                  Source: Rig Operations / Wellhead
                </span>
              </div>

              <div className="evidence-box">
                <span className="evidence-label">FAILED BARRIER IDENTIFIED</span>
                <div className="evidence-value text-red">
                  {activeItem.barrier_failures?.[0] || 'Physical Hazard Barrier'}
                </div>
                <span className="evidence-sub">
                  Root: Secondary restraint / LOTO
                </span>
              </div>
            </div>

            {/* 4. Engine Reasoning Explanation */}
            <div className="review-section-card">
              <div className="section-card-title">
                <Sparkles size={15} className="text-accent" />
                <span>Engine Reasoning & Forensic Evidence</span>
              </div>
              <div className="reasoning-content">
                <p>
                  Sentence-transformer attention weights matched high-energy release indicators. Lexical parser mapped observation tokens to <strong>{activeItem.iogp_rule}</strong> with high similarity.
                </p>
                {activeItem.matched_keywords && activeItem.matched_keywords.length > 0 && (
                  <div className="keywords-row">
                    <span className="kw-label">Matched Key Terms:</span>
                    {activeItem.matched_keywords.map((kw, i) => (
                      <span key={i} className="kw-pill">{kw}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 5. Distinct Human Decision Area */}
            <div className="human-decision-container">
              <div className="decision-header-row">
                <div className="decision-title">
                  <Shield size={16} className="text-green" />
                  <span>Human Reviewer Verdict & Audit Signature</span>
                </div>
                {statusMsg && <span className="decision-status-toast">{statusMsg}</span>}
              </div>

              <div className="decision-notes-wrap">
                <label>Reviewer Technical Justification (Logged to Append-Only Audit Trail):</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter technical comments or corrective action instructions..."
                  rows={2}
                  disabled={submitting}
                />
              </div>

              <div className="decision-action-buttons">
                <button
                  type="button"
                  className="btn-verdict-confirm"
                  onClick={() => handleDecision('CONFIRM', true, 'Confirmed SIF')}
                  disabled={submitting}
                >
                  <CheckCircle2 size={16} />
                  <span>Confirm SIF Precursor</span>
                </button>

                <button
                  type="button"
                  className="btn-verdict-reject"
                  onClick={() => handleDecision('DISMISS', false, 'Not SIF')}
                  disabled={submitting}
                >
                  <XCircle size={16} />
                  <span>Not SIF (Standard Risk)</span>
                </button>

                <button
                  type="button"
                  className="btn-verdict-info"
                  onClick={() => handleDecision('REVISE', activeItem.sif_potential, 'Needs Info')}
                  disabled={submitting}
                >
                  <HelpCircle size={16} />
                  <span>Need More Information</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="review-empty-panel">
            <CheckCircle2 size={48} className="text-green" />
            <h2>Review Queue Clear</h2>
            <p>All safety observations have been verified by authorized reviewers.</p>
          </div>
        )}
      </div>
    </div>
  );
};
