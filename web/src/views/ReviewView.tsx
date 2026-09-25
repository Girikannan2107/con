import React, { useState } from 'react';
import {
  CheckSquare,
  CheckCircle2,
  XCircle,
  Edit3,
  AlertTriangle,
  FileText,
  User,
  Shield,
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

export const ReviewView: React.FC<Props> = ({ queue, onDecide }) => {
  const [selectedId, setSelectedId] = useState<string | null>(queue[0]?.id || null);
  const [notes, setNotes] = useState('');
  const [editingRule, setEditingRule] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const activeItem = queue.find((q) => q.id === selectedId) || queue[0] || null;

  const handleDecision = async (decision: 'CONFIRM' | 'REVISE' | 'DISMISS') => {
    if (!activeItem || submitting) return;
    setSubmitting(true);
    try {
      await onDecide(activeItem.id, {
        decision,
        sif_potential: decision === 'CONFIRM' ? true : decision === 'DISMISS' ? false : activeItem.sif_potential,
        iogp_rule: editingRule.trim() || activeItem.iogp_rule,
        reviewer_notes: notes,
      });
      setNotes('');
      setEditingRule('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
      {/* Review Bench Header Banner */}
      <div
        className="panel"
        style={{
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(15, 23, 42, 0.9) 100%)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          marginBottom: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
          <CheckSquare size={20} style={{ color: '#EF4444' }} />
          <div style={{ fontWeight: 700, fontSize: '1rem' }}>
            Accountable Human Review Bench ({queue.length} Cases in Queue)
          </div>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          No SIF finding closes autonomously. Verify model vs rule disagreements, dismissive reporter language,
          or critical hazards. Your decisions feed the ground-truth training loop.
        </p>
      </div>

      {/* Split Review Workspace */}
      <div className="split-pane">
        {/* Queue List */}
        <div className="table-container pane-scroll">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Observation Text</th>
                <th>Trigger Reason</th>
                <th>Band</th>
              </tr>
            </thead>
            <tbody>
              {queue.map((item) => {
                const isSelected = item.id === (activeItem?.id || selectedId);
                return (
                  <tr
                    key={item.id}
                    className={isSelected ? 'selected' : ''}
                    onClick={() => {
                      setSelectedId(item.id);
                      setEditingRule(item.iogp_rule);
                    }}
                  >
                    <td style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>{item.id}</td>
                    <td style={{ maxWidth: 260, fontSize: '0.8rem' }}>
                      <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.raw_text}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {item.location || 'Duliajan'} · {item.iogp_rule}
                      </div>
                    </td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          background: 'rgba(239, 68, 68, 0.15)',
                          color: '#FCA5A5',
                          fontSize: '0.7rem',
                        }}
                      >
                        {item.review_trigger || 'Critical Risk'}
                      </span>
                    </td>
                    <td>
                      <RiskBandBadge band={item.risk_band} score={item.risk_score} />
                    </td>
                  </tr>
                );
              })}
              {queue.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    Review queue is clear! All flagged cases have been verified.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Triage Decision Console */}
        {activeItem ? (
          <div className="panel pane-scroll" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="panel-header" style={{ marginBottom: 0 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                    {activeItem.id}
                  </span>
                  <RiskBandBadge band={activeItem.risk_band} score={activeItem.risk_score} />
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Trigger: {activeItem.review_trigger || 'Rule & Safety Threshold'}
                </div>
              </div>
            </div>

            {/* Observation quote */}
            <div style={{ background: '#090E1A', padding: '0.85rem', borderRadius: '8px' }}>
              <div className="kpi-label" style={{ marginBottom: '0.35rem' }}>
                Reported Safety Finding
              </div>
              <div style={{ fontSize: '0.875rem', fontStyle: 'italic' }}>
                "{activeItem.raw_text}"
              </div>
            </div>

            {/* AI vs Rules comparison */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div style={{ background: '#0B1220', padding: '0.75rem', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>IOGP RULE</div>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-highlight)' }}>
                  {activeItem.iogp_rule}
                </div>
              </div>
              <div style={{ background: '#0B1220', padding: '0.75rem', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ENERGY HAZARD</div>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#F59E0B' }}>
                  {activeItem.energy_source || 'None'}
                </div>
              </div>
            </div>

            {/* Reviewer Notes & Revision */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Reviewer Technical Notes / Justification:
              </label>
              <textarea
                placeholder="Add accountable comments for the HSE audit trail..."
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* Triage Decision Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: 'auto' }}>
              <button
                className="btn btn-primary"
                onClick={() => handleDecision('CONFIRM')}
                disabled={submitting}
                style={{ justifyContent: 'center', padding: '0.75rem' }}
              >
                <CheckCircle2 size={16} />
                <span>Confirm as SIF Precursor</span>
              </button>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => handleDecision('REVISE')}
                  disabled={submitting}
                  style={{ justifyContent: 'center' }}
                >
                  <Edit3 size={14} />
                  <span>Revise Finding</span>
                </button>

                <button
                  className="btn btn-danger"
                  onClick={() => handleDecision('DISMISS')}
                  disabled={submitting}
                  style={{ justifyContent: 'center' }}
                >
                  <XCircle size={14} />
                  <span>Dismiss Finding</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            No item selected.
          </div>
        )}
      </div>
    </div>
  );
};
