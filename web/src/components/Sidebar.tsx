import React from 'react';
import {
  LayoutDashboard,
  FileSearch,
  UploadCloud,
  CheckSquare,
  Flame,
  ShieldAlert,
  Cpu,
  ScrollText,
  Radio,
} from 'lucide-react';
import { User } from '../types';

export type TabId =
  | 'dashboard'
  | 'incidents'
  | 'ingest'
  | 'review'
  | 'hotspots'
  | 'actions'
  | 'engines'
  | 'logs';

interface Props {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  currentUser: User | null;
  onOpenUserModal: () => void;
  reviewCount: number;
  openActionsCount: number;
}

export const Sidebar: React.FC<Props> = ({
  activeTab,
  onSelectTab,
  currentUser,
  onOpenUserModal,
  reviewCount,
  openActionsCount,
}) => {
  const navItems = [
    { id: 'dashboard' as TabId, label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'incidents' as TabId, label: 'Incident Forensics', icon: <FileSearch size={18} /> },
    { id: 'ingest' as TabId, label: 'Ingest & OCR', icon: <UploadCloud size={18} /> },
    {
      id: 'review' as TabId,
      label: 'Review Bench',
      icon: <CheckSquare size={18} />,
      badge: reviewCount > 0 ? reviewCount : undefined,
      badgeAlert: true,
    },
    { id: 'hotspots' as TabId, label: 'Risk Hotspots', icon: <Flame size={18} /> },
    {
      id: 'actions' as TabId,
      label: 'Safety Actions',
      icon: <ShieldAlert size={18} />,
      badge: openActionsCount > 0 ? openActionsCount : undefined,
    },
    { id: 'engines' as TabId, label: 'Engines & MLOps', icon: <Cpu size={18} /> },
    { id: 'logs' as TabId, label: 'Logs & Audit', icon: <ScrollText size={18} /> },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="brand-badge">OIL</div>
        <div>
          <div className="brand-title">SENTRA</div>
          <div className="brand-sub">SIF Intelligence</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <div
            key={item.id}
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => onSelectTab(item.id)}
          >
            {item.icon}
            <span>{item.label}</span>
            {item.badge !== undefined && (
              <span className={`nav-badge ${item.badgeAlert ? 'alert' : ''}`}>
                {item.badge}
              </span>
            )}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        {currentUser && (
          <div className="user-card" onClick={onOpenUserModal} title="Switch active profile / role">
            <div className="user-avatar">{currentUser.avatar_initials}</div>
            <div className="user-info">
              <div className="user-name">{currentUser.name}</div>
              <div className="user-role">{currentUser.role}</div>
            </div>
            <Radio size={14} style={{ color: 'var(--accent-cyan)' }} />
          </div>
        )}
      </div>
    </aside>
  );
};
