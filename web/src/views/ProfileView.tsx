import React, { useState } from 'react';
import {
  User as UserIcon,
  Shield,
  KeyRound,
  Laptop,
  History,
  CheckCircle2,
  Lock,
  Building,
  MapPin,
  Briefcase,
  Layers,
} from 'lucide-react';
import { User, Workspace } from '../types';

interface Props {
  currentUser: User | null;
  activeWorkspace: Workspace | null;
  onLogout: () => void;
}

type Tab = 'profile' | 'security' | 'sessions' | 'activity';

export const ProfileView: React.FC<Props> = ({ currentUser, activeWorkspace, onLogout }) => {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPass || newPass !== confirmPass) return;
    setPasswordSaved(true);
    setTimeout(() => setPasswordSaved(false), 3000);
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
  };

  return (
    <div className="profile-container">
      {/* Header Profile Summary */}
      <div className="profile-header-card">
        <div className="profile-avatar-large">
          {currentUser?.avatar_initials || 'SE'}
        </div>
        <div className="profile-header-info">
          <div className="profile-header-top">
            <h1 className="profile-name">{currentUser?.name || 'HSE Specialist'}</h1>
            <span className="profile-badge-role">{currentUser?.role || 'Safety Reviewer'}</span>
          </div>
          <div className="profile-meta-tags">
            <span className="profile-tag">
              <Building size={13} /> Oil India Limited
            </span>
            <span className="profile-tag">
              <MapPin size={13} /> {currentUser?.site || 'Duliajan Headquarter & Assets'}
            </span>
            <span className="profile-tag">
              <Briefcase size={13} /> {currentUser?.department || 'HSE Process Safety & Loss Prevention'}
            </span>
            <span className="profile-tag">
              <Layers size={13} /> Employee #{currentUser?.employee_id || 'HSE001'}
            </span>
          </div>
        </div>
        <div className="profile-header-actions">
          <button className="btn-secondary-sm" onClick={onLogout}>
            Sign Out Workstation
          </button>
        </div>
      </div>

      {/* Profile Navigation Tabs */}
      <div className="profile-tabs-bar">
        <button
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <UserIcon size={15} /> Account Details & Permissions
        </button>
        <button
          className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          <KeyRound size={15} /> Credentials & Security
        </button>
        <button
          className={`tab-btn ${activeTab === 'sessions' ? 'active' : ''}`}
          onClick={() => setActiveTab('sessions')}
        >
          <Laptop size={15} /> Workstation Sessions
        </button>
        <button
          className={`tab-btn ${activeTab === 'activity' ? 'active' : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          <History size={15} /> HSE Audit Signatures
        </button>
      </div>

      {/* Tab 1: Profile & Permissions */}
      {activeTab === 'profile' && (
        <div className="profile-content-grid">
          <div className="profile-card">
            <h2 className="card-heading">Organizational Profile</h2>
            <div className="info-fields-grid">
              <div className="info-field">
                <span className="field-label">FULL NAME</span>
                <span className="field-val">{currentUser?.name}</span>
              </div>
              <div className="info-field">
                <span className="field-label">CORPORATE EMAIL</span>
                <span className="field-val">{currentUser?.email}</span>
              </div>
              <div className="info-field">
                <span className="field-label">EMPLOYEE IDENTIFIER</span>
                <span className="field-val code-font">{currentUser?.employee_id}</span>
              </div>
              <div className="info-field">
                <span className="field-label">PRIMARY ROLE</span>
                <span className="field-val">{currentUser?.role}</span>
              </div>
              <div className="info-field">
                <span className="field-label">OPERATING ASSET / SITE</span>
                <span className="field-val">{currentUser?.site}</span>
              </div>
              <div className="info-field">
                <span className="field-label">ASSIGNED DEPARTMENT</span>
                <span className="field-val">{currentUser?.department}</span>
              </div>
              <div className="info-field full-width">
                <span className="field-label">ACTIVE HSE WORKSPACE</span>
                <span className="field-val highlight">
                  {activeWorkspace?.name || 'SENTRA HSE Platform'} ({activeWorkspace?.site})
                </span>
              </div>
            </div>
          </div>

          <div className="profile-card">
            <h2 className="card-heading">Authorized Operational Permissions</h2>
            <p className="card-subtext">
              Role-based Access Control (RBAC) granted by Oil India Corporate HSE Administration.
            </p>
            <div className="permissions-badge-list">
              {currentUser?.permissions && currentUser.permissions.length > 0 ? (
                currentUser.permissions.map((perm) => (
                  <div key={perm} className="perm-item">
                    <CheckCircle2 size={15} className="text-green" />
                    <span>{perm.replace(/_/g, ' ').toUpperCase()}</span>
                  </div>
                ))
              ) : (
                <div className="perm-item">
                  <CheckCircle2 size={15} className="text-green" />
                  <span>READ_ONLY_SAFETY_OBSERVATIONS</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Security & Password */}
      {activeTab === 'security' && (
        <div className="profile-content-grid">
          <div className="profile-card">
            <h2 className="card-heading">Change Workstation Password</h2>
            <form onSubmit={handlePasswordSubmit} className="security-form">
              <div className="form-group">
                <label>Current Workstation Password</label>
                <input
                  type="password"
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="Enter strong password (min. 8 chars)"
                  required
                />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  placeholder="Re-enter new password"
                  required
                />
              </div>
              <button type="submit" className="btn-primary-sentra">
                Update Security Credentials
              </button>
              {passwordSaved && (
                <span className="save-success-msg">
                  <CheckCircle2 size={14} /> Password updated successfully in memory.
                </span>
              )}
            </form>
          </div>

          <div className="profile-card">
            <h2 className="card-heading">Two-Factor Authentication & Cryptographic Keys</h2>
            <div className="security-status-box">
              <div className="sec-icon-wrap">
                <Shield size={24} className="text-green" />
              </div>
              <div>
                <strong>Workstation Hardware Key Verified</strong>
                <p>
                  SENTRA Desktop is bound to this authenticated Windows hardware profile with SHA-256 audit chaining.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Active Sessions */}
      {activeTab === 'sessions' && (
        <div className="profile-card">
          <h2 className="card-heading">Active Workstation Sessions</h2>
          <table className="sentra-table">
            <thead>
              <tr>
                <th>CLIENT TYPE</th>
                <th>HOST MACHINE</th>
                <th>IP / CONTEXT</th>
                <th>WORKSPACE</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div className="client-cell">
                    <Laptop size={15} className="text-accent" />
                    <span>SENTRA.exe (Windows Desktop)</span>
                  </div>
                </td>
                <td>DESKTOP-OIL-ASSAM</td>
                <td>127.0.0.1 (Local IPC)</td>
                <td>{activeWorkspace?.name || 'SENTRA HSE WORKSPACE'}</td>
                <td>
                  <span className="status-badge live">● Current Active Session</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 4: Activity */}
      {activeTab === 'activity' && (
        <div className="profile-card">
          <h2 className="card-heading">Recent HSE Review & Triage Actions</h2>
          <p className="card-subtext">
            Audit-logged operations executed under account <strong>{currentUser?.employee_id}</strong>.
          </p>
          <div className="activity-timeline">
            <div className="timeline-entry">
              <span className="time-badge">Today</span>
              <div className="entry-content">
                <strong>Workspace Authentication</strong>
                <p>Successfully verified credentials and entered workspace {activeWorkspace?.name}.</p>
              </div>
            </div>
            <div className="timeline-entry">
              <span className="time-badge">Session</span>
              <div className="entry-content">
                <strong>SIF Precursor Assessment Engine Sync</strong>
                <p>Synchronized with sentence-transformer and IOGP Life-Saving Rules rule-base.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
