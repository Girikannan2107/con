import React, { useState } from 'react';
import {
  Sliders,
  Building,
  Users,
  Cpu,
  ShieldCheck,
  HardDrive,
  Bell,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { Workspace, User } from '../types';

interface Props {
  activeWorkspace: Workspace | null;
  currentUser: User | null;
}

type SettingCategory =
  | 'general'
  | 'organization'
  | 'users'
  | 'models'
  | 'security'
  | 'storage'
  | 'notifications';

export const SettingsView: React.FC<Props> = ({ activeWorkspace, currentUser }) => {
  const [selectedCat, setSelectedCat] = useState<SettingCategory>('general');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Settings State
  const [sifThreshold, setSifThreshold] = useState('0.65');
  const [autoFlagCritical, setAutoFlagCritical] = useState(true);
  const [auditChainVerification, setAuditChainVerification] = useState(true);
  const [ocrEngine, setOcrEngine] = useState('paddle');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [retentionDays, setRetentionDays] = useState('365');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="settings-container">
      {/* Settings Navigation Sidebar */}
      <div className="settings-nav-card">
        <div className="settings-nav-header">
          <Sliders size={16} />
          <span>System Settings</span>
        </div>
        <nav className="settings-nav-list">
          <button
            className={`settings-nav-item ${selectedCat === 'general' ? 'active' : ''}`}
            onClick={() => setSelectedCat('general')}
          >
            <Sliders size={15} /> General & Workspace
          </button>
          <button
            className={`settings-nav-item ${selectedCat === 'organization' ? 'active' : ''}`}
            onClick={() => setSelectedCat('organization')}
          >
            <Building size={15} /> Organization & Site
          </button>
          <button
            className={`settings-nav-item ${selectedCat === 'users' ? 'active' : ''}`}
            onClick={() => setSelectedCat('users')}
          >
            <Users size={15} /> Users & Roles (RBAC)
          </button>
          <button
            className={`settings-nav-item ${selectedCat === 'models' ? 'active' : ''}`}
            onClick={() => setSelectedCat('models')}
          >
            <Cpu size={15} /> AI Models & SIF Logic
          </button>
          <button
            className={`settings-nav-item ${selectedCat === 'security' ? 'active' : ''}`}
            onClick={() => setSelectedCat('security')}
          >
            <ShieldCheck size={15} /> Security & Audit
          </button>
          <button
            className={`settings-nav-item ${selectedCat === 'storage' ? 'active' : ''}`}
            onClick={() => setSelectedCat('storage')}
          >
            <HardDrive size={15} /> Storage & Logs
          </button>
          <button
            className={`settings-nav-item ${selectedCat === 'notifications' ? 'active' : ''}`}
            onClick={() => setSelectedCat('notifications')}
          >
            <Bell size={15} /> Alerts & Notifications
          </button>
        </nav>
      </div>

      {/* Settings Content Area */}
      <div className="settings-main-card">
        <form onSubmit={handleSave}>
          {selectedCat === 'general' && (
            <div className="settings-section">
              <h2 className="section-title">General Platform Settings</h2>
              <p className="section-desc">Configure active workspace operational parameters.</p>

              <div className="settings-form-grid">
                <div className="setting-field">
                  <label>Active Workspace</label>
                  <input type="text" value={activeWorkspace?.name || 'SENTRA HSE Platform'} readOnly />
                </div>
                <div className="setting-field">
                  <label>Primary Operational Domain</label>
                  <input type="text" value="Upstream Oil & Gas / Rig HSE Operations" readOnly />
                </div>
                <div className="setting-field full-width">
                  <label>Default SIF Sensitivity Threshold (0.0 - 1.0)</label>
                  <input
                    type="number"
                    step="0.05"
                    min="0.1"
                    max="0.95"
                    value={sifThreshold}
                    onChange={(e) => setSifThreshold(e.target.value)}
                  />
                  <span className="field-hint">
                    Observations exceeding this semantic/lexical similarity score will be automatically flagged as SIF Precursors.
                  </span>
                </div>
              </div>
            </div>
          )}

          {selectedCat === 'organization' && (
            <div className="settings-section">
              <h2 className="section-title">Organization & Asset Configuration</h2>
              <p className="section-desc">Manage Oil India Limited regional enterprise configuration.</p>

              <div className="settings-form-grid">
                <div className="setting-field">
                  <label>Enterprise Entity</label>
                  <input type="text" value="Oil India Limited (OIL)" readOnly />
                </div>
                <div className="setting-field">
                  <label>Operating Asset / Field</label>
                  <input type="text" value={activeWorkspace?.site || 'Assam Basin Exploration & Production'} readOnly />
                </div>
                <div className="setting-field full-width">
                  <label>Compliance Standard</label>
                  <input type="text" value="IOGP Report 459 (Life-Saving Rules 2026 Revision)" readOnly />
                </div>
              </div>
            </div>
          )}

          {selectedCat === 'users' && (
            <div className="settings-section">
              <h2 className="section-title">User Roles & Access Control</h2>
              <p className="section-desc">Manage HSE authorization tiers and sign-off privileges.</p>

              <div className="roles-overview-table">
                <table className="sentra-table">
                  <thead>
                    <tr>
                      <th>ROLE NAME</th>
                      <th>PERMISSIONS</th>
                      <th>SIGN-OFF AUTHORITY</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>HSE Lead / Admin</strong></td>
                      <td>Full Pipeline, Ingest, Review Sign-off, MLOps Retraining, Audit Verification</td>
                      <td><span className="status-badge live">Full Executive</span></td>
                    </tr>
                    <tr>
                      <td><strong>Safety Officer</strong></td>
                      <td>Incident Forensics, Direct Ingest, Action Management, Draft Review</td>
                      <td><span className="status-badge warning">Operational Triage</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {selectedCat === 'models' && (
            <div className="settings-section">
              <h2 className="section-title">AI Engine & SIF Classification Rules</h2>
              <p className="section-desc">Configure local sentence transformers and rule engines.</p>

              <div className="settings-form-grid">
                <div className="setting-field">
                  <label>Semantic Transformer Model</label>
                  <select defaultValue="all-MiniLM-L6-v2">
                    <option value="all-MiniLM-L6-v2">sentence-transformers/all-MiniLM-L6-v2 (Local 384-dim)</option>
                    <option value="bge-small">BAAI/bge-small-en-v1.5</option>
                  </select>
                </div>
                <div className="setting-field">
                  <label>OCR Engine Provider</label>
                  <select value={ocrEngine} onChange={(e) => setOcrEngine(e.target.value)}>
                    <option value="paddle">PaddleOCR Multilingual (12 Indian Languages + English)</option>
                    <option value="pdfplumber">Native PDF Plumber Parser</option>
                  </select>
                </div>
                <div className="setting-field full-width">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={autoFlagCritical}
                      onChange={(e) => setAutoFlagCritical(e.target.checked)}
                    />
                    <span>Automatically trigger Human Review when Neural Model and Rule Engine disagree</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {selectedCat === 'security' && (
            <div className="settings-section">
              <h2 className="section-title">Audit Chain & Cryptographic Integrity</h2>
              <p className="section-desc">Configure tamper-evident append-only ledger settings.</p>

              <div className="settings-form-grid">
                <div className="setting-field full-width">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={auditChainVerification}
                      onChange={(e) => setAuditChainVerification(e.target.checked)}
                    />
                    <span>Enforce SHA-256 Hash Chain verification on every review sign-off</span>
                  </label>
                </div>
                <div className="setting-field">
                  <label>Audit Hash Algorithm</label>
                  <input type="text" value="SHA-256 (Append-Only In-Memory & Disk Chaining)" readOnly />
                </div>
              </div>
            </div>
          )}

          {selectedCat === 'storage' && (
            <div className="settings-section">
              <h2 className="section-title">Data Retention & Local Storage</h2>
              <p className="section-desc">Manage historical observation caching and logs.</p>

              <div className="settings-form-grid">
                <div className="setting-field">
                  <label>Observation Retention (Days)</label>
                  <input
                    type="number"
                    value={retentionDays}
                    onChange={(e) => setRetentionDays(e.target.value)}
                  />
                </div>
                <div className="setting-field">
                  <label>Database Target</label>
                  <input type="text" value="Local SQLite / In-Memory State Adapter" readOnly />
                </div>
              </div>
            </div>
          )}

          {selectedCat === 'notifications' && (
            <div className="settings-section">
              <h2 className="section-title">HSE Alert Dispatch</h2>
              <p className="section-desc">Configure automated escalation for critical process safety findings.</p>

              <div className="settings-form-grid">
                <div className="setting-field full-width">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={emailAlerts}
                      onChange={(e) => setEmailAlerts(e.target.checked)}
                    />
                    <span>Broadcast immediate alert when SIF Precursor is verified by Lead Reviewer</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          <div className="settings-actions-footer">
            <button type="submit" className="btn-primary-sentra">
              <Save size={15} /> Save Settings Configuration
            </button>
            {saveSuccess && (
              <span className="save-success-msg">
                <CheckCircle2 size={15} /> Configuration updated successfully.
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
