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
              <ShieldAlert size={18} style={{ color: 'var(--accent-cyan)' }} />
              <span>Corrective and Preventive Safety Actions (CAPA)</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
              Accountable safety interventions and control barrier verifications assigned to field teams.
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={14} />
            <span>Create Safety Action</span>
          </button>
        </div>
      </div>

      {/* Action Items Table */}
      <div className="panel">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Action ID</th>
                <th>Linked Incident</th>
                <th>Intervention Description</th>
                <th>Category</th>
                <th>Responsible Lead</th>
                <th>Due Date</th>
                <th>Priority</th>
                <th>Status & Update</th>
              </tr>
            </thead>
            <tbody>
              {actions.map((act) => (
                <tr key={act.id}>
                  <td style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>{act.id}</td>
                  <td style={{ fontWeight: 600 }}>{act.incident_id}</td>
                  <td style={{ maxWidth: 320 }}>{act.description}</td>
                  <td>
                    <span className="badge badge-neutral">{act.risk_category}</span>
                  </td>
                  <td style={{ fontSize: '0.8rem' }}>
                    <div>{act.responsible}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{act.department}</div>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{act.due_date}</td>
                  <td>
                    <RiskBandBadge band={act.priority} />
                  </td>
                  <td>
                    <select
                      value={act.status}
                      onChange={(e) => onUpdateStatus(act.id, e.target.value as SafetyAction['status'])}
                      style={{
                        padding: '0.3rem 0.6rem',
                        fontSize: '0.75rem',
                        background:
                          act.status === 'Verified' || act.status === 'Closed'
                            ? 'rgba(16, 185, 129, 0.15)'
                            : act.status === 'In Progress'
                            ? 'rgba(6, 182, 212, 0.15)'
                            : '#0B1220',
                        borderColor:
                          act.status === 'Verified' || act.status === 'Closed'
                            ? '#10B981'
                            : act.status === 'In Progress'
                            ? 'var(--accent-cyan)'
                            : 'var(--border-medium)',
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
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="panel-header">
              <div className="panel-title">
                <Plus size={18} style={{ color: 'var(--accent-cyan)' }} />
                <span>Create Corrective Safety Action</span>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Incident ID:</label>
                <input value={incidentId} onChange={(e) => setIncidentId(e.target.value)} required />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Intervention Description:</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Inspect scaffold locking pins and conduct 100% harness compliance tool-box talk..."
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Category:</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="Working at Height">Working at Height</option>
                    <option value="Energy Isolation">Energy Isolation</option>
                    <option value="Confined Space">Confined Space</option>
                    <option value="Lifting Operations">Lifting Operations</option>
                    <option value="Hot Work">Hot Work</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Priority:</label>
                  <select value={priority} onChange={(e) => setPriority(e.target.value as RiskBand)}>
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Responsible Person:</label>
                  <input
                    placeholder="e.g. S. Borah (Supervisor)"
                    value={responsible}
                    onChange={(e) => setResponsible(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Department:</label>
                  <input
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Due Date:</label>
                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={creating}>
                  {creating ? 'Creating...' : 'Assign Action'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
