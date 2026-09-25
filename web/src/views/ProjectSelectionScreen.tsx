import React, { useState } from 'react';
import {
  Search,
  Shield,
  MapPin,
  ArrowRight,
  LogOut,
  User as UserIcon,
  ChevronDown,
  Building2,
  CheckCircle2,
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
  const [showUserMenu, setShowUserMenu] = useState(false);
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
      {/* Top Navigation Bar */}
      <header className="project-header">
        <div className="project-header-brand">
          <div className="brand-badge-small">S</div>
          <div>
            <div className="brand-title-small">SENTRA</div>
            <div className="brand-subtitle-small">SAFETY INTELLIGENCE PLATFORM</div>
          </div>
        </div>

        {/* User Profile Menu */}
        <div className="project-header-user">
          <div
            className="project-user-trigger"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className="user-avatar-small">{currentUser.avatar_initials}</div>
            <div className="user-text-small">
              <div className="user-name-small">{currentUser.name}</div>
              <div className="user-role-small">{currentUser.role}</div>
            </div>
            <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
          </div>

          {showUserMenu && (
            <div className="project-user-dropdown">
              <div className="dropdown-info">
                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{currentUser.name}</div>
                <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                  {currentUser.email}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-highlight)', marginTop: 2 }}>
                  Role: {currentUser.role}
                </div>
              </div>
              <div className="dropdown-divider" />
              <button
                className="dropdown-item logout"
                onClick={() => {
                  setShowUserMenu(false);
                  onLogout();
                }}
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Container */}
      <div className="project-content-container">
        <div className="project-heading-group">
          <h1 className="project-main-title">Select your project</h1>
          <p className="project-main-subtitle">
            Choose a SENTRA safety intelligence workspace to continue.
          </p>
        </div>

        {error && (
          <div className="project-error-banner">
            <Lock size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Search Bar */}
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

        {/* Workspaces Grid */}
        <div className="project-cards-grid">
          {filtered.map((ws) => {
            const isEntering = enteringId === ws.id;
            return (
              <div key={ws.id} className="workspace-card">
                <div className="workspace-card-top">
                  <div className="workspace-icon-box">{ws.icon_initial || 'S'}</div>
                  <div className="workspace-status-badge">
                    <span className="status-dot" />
                    <span>{ws.status}</span>
                  </div>
                </div>

                <div className="workspace-card-body">
                  <h3 className="workspace-title">{ws.name}</h3>
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
                      Role: <strong style={{ color: 'var(--text-primary)' }}>{currentUser.role}</strong>
                    </span>
                  </div>
                </div>

                <div className="workspace-card-action">
                  <button
                    className="enter-workspace-btn"
                    onClick={() => handleEnter(ws.id)}
                    disabled={isEntering}
                  >
                    <span>{isEntering ? 'ENTERING...' : 'ENTER PROJECT'}</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="project-empty-state">
            <Shield size={36} style={{ color: 'var(--text-muted)' }} />
            <div style={{ fontWeight: 600, marginTop: 8 }}>No projects found</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              No workspaces match your search or authorization filters.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
