import React, { useState } from 'react';
import { ShieldAlert, Plus, CheckCircle, Clock, AlertTriangle, X } from 'lucide-react';
import { SafetyAction, RiskBand } from '../types';
import { RiskBandBadge } from '../components/RiskBandBadge';

interface Props {
  actions: SafetyAction[];
  onCreateAction: (action: Omit<SafetyAction, 'id' | 'created_at'>) => Promise<void>;
  onUpdateStatus: (id: string, status: SafetyAction['status']) => Promise<void>;
}

export const ActionsView: React.FC<Props> = ({
  actions,
  onCreateAction,
  onUpdateStatus,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [incidentId, setIncidentId] = useState('RPT-1001');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState('Working at Height');
  const [responsible, setResponsible] = useState('');
  const [department, setDepartment] = useState('Mechanical Services');
  const [dueDate, setDueDate] = useState('2026-10-15');
  const [priority, setPriority] = useState<RiskBand>('High');
  const [creating, setCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc.trim() || !responsible.trim() || creating) return;
    setCreating(true);
    try {
      await onCreateAction({
        incident_id: incidentId,
        description: desc,
        risk_category: category,
        responsible,
        department,
        due_date: dueDate,
        priority,
        status: 'Open',
      });
      setShowModal(false);
      setDesc('');
      setResponsible('');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header Panel */}
      <div className="panel" style={{ marginBottom: 0 }}>
        <div className="panel-header" style={{ marginBottom: 0 }}>
          <div>
            <div className="panel-title">
              <ShieldAlert size={18} className="text-red" />
              <span>Corrective and Preventive Safety Actions (CAPA)</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--oil-text-secondary)', marginTop: 2 }}>
              Accountable safety interventions and control barrier verifications assigned to field teams.
            </p>
          </div>
          <button className="btn-primary-sentra" onClick={() => setShowModal(true)}>
            <Plus size={14} />
            <span>Create Safety Action</span>
          </button>
        </div>
      </div>

      {/* Action Items Table */}
      <div className="panel">
        <div className="table-container">
          <table className="sentra-table">
            <thead>
              <tr>
                <th>ACTION ID</th>
                <th>LINKED INCIDENT</th>
                <th>INTERVENTION DESCRIPTION</th>
                <th>CATEGORY</th>
                <th>RESPONSIBLE LEAD</th>
                <th>DUE DATE</th>
                <th>PRIORITY</th>
                <th>STATUS & VERIFICATION</th>
              </tr>
            </thead>
            <tbody>
              {actions.map((act) => (
                <tr key={act.id}>
                  <td className="font-mono font-bold text-red">{act.id}</td>
                  <td className="font-semibold">{act.incident_id}</td>
                  <td style={{ maxWidth: 320 }}>{act.description}</td>
                  <td>
                    <span className="badge badge-neutral">{act.risk_category}</span>
                  </td>
                  <td style={{ fontSize: '0.8rem' }}>
                    <div style={{ fontWeight: 600 }}>{act.responsible}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--oil-text-secondary)' }}>{act.department}</div>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--oil-text-secondary)' }}>{act.due_date}</td>
                  <td>
                    <RiskBandBadge band={act.priority} />
                  </td>
                  <td>
                    <select
                      value={act.status}
                      onChange={(e) => onUpdateStatus(act.id, e.target.value as SafetyAction['status'])}
                      style={{
                        padding: '0.35rem 0.6rem',
                        fontSize: '0.75rem',
                        border: '1px solid var(--oil-border)',
                        borderRadius: 4,
                        background: '#FFFFFF',
                        fontWeight: 600,
                        color:
                          act.status === 'Closed' || act.status === 'Verified'
                            ? 'var(--status-low)'
                            : act.status === 'In Progress'
                            ? 'var(--status-high)'
                            : 'var(--oil-text-black)',
                      }}
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Pending Verification">Pending Verification</option>
                      <option value="Verified">Verified</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </td>
                </tr>
              ))}
              {actions.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--oil-text-muted)' }}>
                    No corrective actions currently registered.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Dialog for New Action */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(5, 5, 5, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            backdropFilter: 'blur(2px)',
          }}
        >
          <div
            className="panel"
            style={{
              width: '100%',
              maxWidth: 500,
              background: '#FFFFFF',
              boxShadow: 'var(--shadow-dropdown)',
            }}
          >
            <div className="panel-header" style={{ borderBottom: '1px solid var(--oil-light-gray)', paddingBottom: '0.75rem' }}>
              <div className="panel-title">
                <ShieldAlert size={18} className="text-red" />
                <span>New Corrective Safety Action</span>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--oil-text-secondary)' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label className="login-label">Linked Incident</label>
                  <input
                    type="text"
                    className="login-input"
                    value={incidentId}
                    onChange={(e) => setIncidentId(e.target.value)}
                    required
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label className="login-label">Priority</label>
                  <select
                    className="login-input"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as RiskBand)}
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label className="login-label">Action Description</label>
                <textarea
                  className="login-input"
                  rows={3}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Describe corrective safety intervention or barrier verification requirement..."
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label className="login-label">Responsible Person</label>
                  <input
                    type="text"
                    className="login-input"
                    value={responsible}
                    onChange={(e) => setResponsible(e.target.value)}
                    placeholder="e.g. S. Borah (Supervisor)"
                    required
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label className="login-label">Target Due Date</label>
                  <input
                    type="date"
                    className="login-input"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="btn-secondary-sm"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary-sentra"
                  disabled={creating}
                >
                  {creating ? 'Saving...' : 'Register Action'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
