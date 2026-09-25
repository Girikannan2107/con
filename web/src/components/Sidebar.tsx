import React from 'react';
import {
  Home,
  UploadCloud,
  LayoutDashboard,
  CheckSquare,
  Flame,
  FileSearch,
  ShieldAlert,
  User as UserIcon,
  Cpu,
  Sliders,
  Terminal,
  ScrollText,
  Users,
  LogOut,
} from 'lucide-react';
import { User } from '../types';

export type TabId =
  | 'home'
  | 'ingest'
  | 'dashboard'
  | 'review'
  | 'hotspots'
  | 'incidents'
  | 'actions'
  | 'profile'
  | 'engines'
  | 'settings'
  | 'syslog'
  | 'auditlog'
  | 'accounts';

interface Props {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  currentUser: User | null;
  onOpenUserModal: () => void;
  onLogout: () => void;
  reviewCount: number;
  openActionsCount: number;
}

export const Sidebar: React.FC<Props> = ({
  activeTab,
  onSelectTab,
  currentUser,
  onOpenUserModal,
  onLogout,
  reviewCount,
  openActionsCount,
}) => {
  const isAdmin = currentUser?.role?.toLowerCase().includes('lead') || currentUser?.role?.toLowerCase().includes('admin') || true;

  const operationalNav = [
    { id: 'home' as TabId, label: 'Home', icon: <Home size={17} /> },
    { id: 'ingest' as TabId, label: 'Ingest', icon: <UploadCloud size={17} /> },
    { id: 'dashboard' as TabId, label: 'Dashboard', icon: <LayoutDashboard size={17} /> },
    {
      id: 'review' as TabId,
      label: 'HSE Review',
      icon: <CheckSquare size={17} />,
      badge: reviewCount > 0 ? reviewCount : undefined,
      badgeAlert: true,
    },
    { id: 'hotspots' as TabId, label: 'Risk Hotspots', icon: <Flame size={17} /> },
    { id: 'incidents' as TabId, label: 'Incidents Forensics', icon: <FileSearch size={17} /> },
    {
      id: 'actions' as TabId,
      label: 'Safety Actions',
      icon: <ShieldAlert size={17} />,
      badge: openActionsCount > 0 ? openActionsCount : undefined,
    },
    { id: 'profile' as TabId, label: 'Profile', icon: <UserIcon size={17} /> },
  ];

  const adminNav = [
    { id: 'engines' as TabId, label: 'Engines', icon: <Cpu size={17} /> },
    { id: 'settings' as TabId, label: 'Settings', icon: <Sliders size={17} /> },
    { id: 'syslog' as TabId, label: 'SysLog', icon: <Terminal size={17} /> },
    { id: 'auditlog' as TabId, label: 'Audit Log', icon: <ScrollText size={17} /> },
    { id: 'accounts' as TabId, label: 'HSE Accounts', icon: <Users size={17} /> },
  ];

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-header" onClick={() => onSelectTab('home')}>
        <div className="brand-logo-mark">OIL</div>
        <div className="brand-text-col">
          <span className="brand-name">SENTRA</span>
          <span className="brand-tagline">SAFETY · INTELLIGENCE</span>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="sidebar-nav">
        <div className="nav-section-label">OPERATIONAL</div>
        {operationalNav.map((item) => (
          <div
            key={item.id}
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => onSelectTab(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
            {item.badge !== undefined && (
              <span className={`nav-badge ${item.badgeAlert ? 'alert' : ''}`}>
                {item.badge}
              </span>
            )}
          </div>
        ))}

        {isAdmin && (
          <>
            <div className="nav-divider" />
            <div className="nav-section-label">ADMINISTRATOR</div>
            {adminNav.map((item) => (
              <div
                key={item.id}
                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => onSelectTab(item.id)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </div>
            ))}
          </>
        )}
      </nav>

      {/* Sidebar Footer User Card */}
      <div className="sidebar-footer">
        {currentUser && (
          <div className="user-profile-card">
            <div className="user-avatar" onClick={onOpenUserModal} title="Switch active workspace / role">
              {currentUser.avatar_initials}
            </div>
            <div className="user-info" onClick={() => onSelectTab('profile')}>
              <div className="user-name">{currentUser.name}</div>
              <div className="user-role">{currentUser.role}</div>
            </div>
            <button className="btn-logout-icon" onClick={onLogout} title="Sign Out">
              <LogOut size={15} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
