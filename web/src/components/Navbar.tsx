import React, { useState } from 'react';
import { MapPin, RefreshCw, ChevronDown, LayoutGrid, LogOut } from 'lucide-react';
import { User, Workspace } from '../types';

interface Props {
  title: string;
  subtitle: string;
  currentUser: User | null;
  activeWorkspace: Workspace | null;
  onRefresh: () => void;
  onSwitchProject: () => void;
  onLogout: () => void;
  loading?: boolean;
}

export const Navbar: React.FC<Props> = ({
  title,
  subtitle,
  currentUser,
  activeWorkspace,
  onRefresh,
  onSwitchProject,
  onLogout,
  loading,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="topbar">
      <div className="topbar-left">
        {activeWorkspace && (
          <div className="workspace-breadcrumb">
            <span className="brand-tag">SENTRA</span>
            <span className="divider">/</span>
            <span className="workspace-name">{activeWorkspace.name}</span>
          </div>
        )}
        <div>
          <div className="page-title">{title}</div>
          <div className="page-subtitle">{subtitle}</div>
        </div>
      </div>

      <div className="topbar-right">
        {activeWorkspace && (
          <div className="workspace-site-badge">
            <MapPin size={13} style={{ color: 'var(--oil-red)' }} />
            <span className="site-text">{activeWorkspace.site}</span>
          </div>
        )}

        <button
          className="btn-secondary-sm"
          onClick={onRefresh}
          disabled={loading}
          title="Refresh live metrics"
        >
          <RefreshCw size={13} className={loading ? 'spin' : ''} />
          <span>Refresh</span>
        </button>

        {/* User Profile & Workspace Switcher Menu */}
        {currentUser && (
          <div style={{ position: 'relative' }}>
            <div
              className="topbar-user-pill"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="user-avatar-tiny">{currentUser.avatar_initials}</div>
              <div className="user-pill-text">
                <div className="user-pill-name">{currentUser.name}</div>
                <div className="user-pill-role">{currentUser.role}</div>
              </div>
              <ChevronDown size={13} style={{ color: 'var(--oil-text-secondary)' }} />
            </div>

            {showUserMenu && (
              <div className="topbar-user-dropdown">
                <div className="dropdown-user-header">
                  <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{currentUser.name}</div>
                  <div style={{ fontSize: '0.725rem', color: 'var(--oil-text-secondary)' }}>
                    {currentUser.department}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--oil-red)', marginTop: 2, fontWeight: 600 }}>
                    {currentUser.site}
                  </div>
                </div>
                <button
                  className="dropdown-item"
                  onClick={() => {
                    setShowUserMenu(false);
                    onSwitchProject();
                  }}
                >
                  <LayoutGrid size={14} />
                  <span>Switch Workspace</span>
                </button>
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
        )}
      </div>
    </header>
  );
};
