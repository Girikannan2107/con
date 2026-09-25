import React, { useState } from 'react';
import {
  Search,
  Shield,
  MapPin,
  ArrowRight,
  LogOut,
  Building2,
  Lock,
} from 'lucide-react';
import { User, Workspace } from '../types';

interface Props {
  workspaces: Workspace[];
  currentUser: User;
  onSelectWorkspace: (workspaceId: string) => Promise<void>;
  onLogout: () => Promise<void>;
}

export const ProjectSelectionScreen: React.FC<Props> = ({
  workspaces,
  currentUser,
  onSelectWorkspace,
  onLogout,
}) => {
  const [search, setSearch] = useState('');
  const [enteringId, setEnteringId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filtered = workspaces.filter((ws) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      ws.name.toLowerCase().includes(q) ||
      ws.site.toLowerCase().includes(q) ||
      ws.description.toLowerCase().includes(q) ||
      ws.code.toLowerCase().includes(q)
    );
  });

  const handleEnter = async (wsId: string) => {
    setEnteringId(wsId);
    setError(null);
    try {
      await onSelectWorkspace(wsId);
    } catch (err: any) {
      setError(err.message || 'Unable to enter workspace');
    } finally {
      setEnteringId(null);
    }
  };

  return (
    <div className="project-selection-screen">
      {/* Top Bar */}
      <header className="project-header">
        <div className="project-header-brand">
          <div className="brand-badge-small">S</div>
          <div>
            <div className="brand-title-small">SENTRA</div>
            <div className="brand-subtitle-small">SAFETY · INTELLIGENCE · COMPLIANCE</div>
          </div>
        </div>

        <div className="project-header-user">
          <div className="user-text-small">
            <span className="user-name-small">{currentUser.name}</span>
            <span className="user-role-badge">{currentUser.role}</span>
          </div>
          <button className="btn-logout-small" onClick={onLogout} title="Sign Out">
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Selection Area */}
      <div className="project-content-container">
        <div className="project-heading-group">
          <h1 className="project-main-title">Select workspace</h1>
          <p className="project-main-subtitle">
            Choose the SENTRA workspace you want to enter.
          </p>
        </div>

        {error && (
          <div className="project-error-banner">
            <Lock size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Search */}
        <div className="project-search-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="project-search-input"
            placeholder="Search workspaces by name, site, or asset code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Workspace Cards */}
        <div className="project-cards-grid">
          {filtered.map((ws) => {
            const isEntering = enteringId === ws.id;
            return (
              <div key={ws.id} className="workspace-card">
                <div className="workspace-card-top">
                  <div className="workspace-icon-box">{ws.icon_initial || 'S'}</div>
                  <div className="workspace-status-badge">
                    <span className="status-dot ready" />
                    <span>{ws.status}</span>
                  </div>
                </div>

                <div className="workspace-card-body">
                  <h3 className="workspace-title">{ws.name}</h3>
                  <p className="workspace-tagline">Safety Intelligence · HSE</p>
                  <p className="workspace-description">{ws.description}</p>
                </div>

                <div className="workspace-card-meta">
                  <div className="meta-row">
                    <Building2 size={13} className="meta-icon" />
                    <span>{ws.organization}</span>
                  </div>
                  <div className="meta-row">
                    <MapPin size={13} className="meta-icon" />
                    <span className="truncate">{ws.site}</span>
                  </div>
                  <div className="meta-row">
                    <Shield size={13} className="meta-icon" />
                    <span>
                      User role: <strong>{currentUser.role}</strong>
                    </span>
                  </div>
                </div>

                <div className="workspace-card-action">
                  <button
                    className="enter-workspace-btn"
                    onClick={() => handleEnter(ws.id)}
                    disabled={isEntering}
                  >
                    <span>{isEntering ? 'ENTERING...' : 'ENTER WORKSPACE'}</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="project-empty-state">
            <Shield size={36} className="text-muted" />
            <div className="empty-title">No workspaces found</div>
            <div className="empty-desc">
              No workspaces match your search query or authorization level.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
