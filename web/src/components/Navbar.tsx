import React from 'react';
import { ShieldCheck, MapPin, RefreshCw } from 'lucide-react';
import { User } from '../types';

interface Props {
  title: string;
  subtitle: string;
  currentUser: User | null;
  onRefresh: () => void;
  loading?: boolean;
}

export const Navbar: React.FC<Props> = ({
  title,
  subtitle,
  currentUser,
  onRefresh,
  loading,
}) => {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <div>
          <div className="page-title">{title}</div>
          <div className="page-subtitle">{subtitle}</div>
        </div>
      </div>

      <div className="topbar-right">
        {currentUser && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              background: '#0B1220',
              padding: '0.35rem 0.75rem',
              borderRadius: '6px',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <MapPin size={14} style={{ color: 'var(--accent-cyan)' }} />
            <span>{currentUser.site}</span>
          </div>
        )}

        <button
          className="btn btn-secondary"
          onClick={onRefresh}
          disabled={loading}
          title="Refresh live metrics"
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          <span>Refresh</span>
        </button>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.75rem',
            color: '#10B981',
            background: 'rgba(16, 185, 129, 0.1)',
            padding: '0.35rem 0.6rem',
            borderRadius: '6px',
            border: '1px solid rgba(16, 185, 129, 0.3)',
          }}
        >
          <ShieldCheck size={14} />
          <span>Local Engine Online</span>
        </div>
      </div>
    </header>
  );
};
