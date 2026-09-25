import React, { useState } from 'react';
import { ScrollText, ShieldCheck, Terminal } from 'lucide-react';
import { AuditEntry, SystemLog } from '../types';

interface Props {
  auditLogs: AuditEntry[];
  systemLogs: SystemLog[];
}

export const LogsView: React.FC<Props> = ({ auditLogs, systemLogs }) => {
  const [activeTab, setActiveTab] = useState<'audit' | 'system'>('audit');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
      {/* Header and Tab Selector */}
      <div className="panel" style={{ marginBottom: 0, padding: '0.75rem 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="tabs-header" style={{ marginBottom: 0, borderBottom: 'none' }}>
            <button
              className={`tab-btn ${activeTab === 'audit' ? 'active' : ''}`}
              onClick={() => setActiveTab('audit')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ShieldCheck size={16} />
                <span>HSE Audit Trail ({auditLogs.length})</span>
              </div>
            </button>
            <button
              className={`tab-btn ${activeTab === 'system' ? 'active' : ''}`}
              onClick={() => setActiveTab('system')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Terminal size={16} />
                <span>Diagnostic System Logs ({systemLogs.length})</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Tab 1: Audit Trail */}
      {activeTab === 'audit' && (
        <div className="panel pane-scroll" style={{ flex: 1, marginBottom: 0 }}>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Category</th>
                  <th>Action</th>
                  <th>Actor / Reviewer</th>
                  <th>Summary Details</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log, i) => (
                  <tr key={i}>
                    <td style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                      {log.when || log.at}
                    </td>
                    <td>
                      <span className="badge badge-neutral" style={{ textTransform: 'uppercase', fontSize: '0.65rem' }}>
                        {log.category}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>{log.action}</td>
                    <td style={{ fontSize: '0.8rem' }}>{log.reviewer || log.actor || 'System'}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {log.summary || JSON.stringify(log.detail)}
                    </td>
                  </tr>
                ))}
                {auditLogs.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No audit entries recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: System Logs */}
      {activeTab === 'system' && (
        <div
          className="panel pane-scroll"
          style={{
            flex: 1,
            marginBottom: 0,
            background: '#070B14',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.8rem',
            lineHeight: 1.6,
          }}
        >
          {systemLogs.map((log, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.75rem', padding: '0.2rem 0', borderBottom: '1px solid #111827' }}>
              <span style={{ color: '#64748B' }}>{log.timestamp}</span>
              <span
                style={{
                  color:
                    log.level === 'ERROR'
                      ? '#EF4444'
                      : log.level === 'WARNING'
                      ? '#F59E0B'
                      : '#38BDF8',
                  fontWeight: 600,
                  width: 60,
                }}
              >
                [{log.level}]
              </span>
              <span style={{ color: '#94A3B8', width: 90 }}>{log.source}:</span>
              <span style={{ color: '#E2E8F0', flex: 1 }}>{log.message}</span>
            </div>
          ))}
          {systemLogs.length === 0 && (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
              No system logs available.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
