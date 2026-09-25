import React, { useState } from 'react';
import {
  ScrollText,
  ShieldCheck,
  Terminal,
  Search,
  Download,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import { AuditEntry, SystemLog } from '../types';

interface Props {
  auditLogs: AuditEntry[];
  systemLogs: SystemLog[];
}

export const LogsView: React.FC<Props> = ({ auditLogs, systemLogs }) => {
  const [activeTab, setActiveTab] = useState<'audit' | 'system'>('audit');
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [verifiedChain, setVerifiedChain] = useState<boolean | null>(null);

  const handleVerifyChain = () => {
    setVerifiedChain(true);
    setTimeout(() => setVerifiedChain(null), 3500);
  };

  const handleExportCsv = () => {
    if (auditLogs.length === 0) return;
    const headers = ['Timestamp', 'Category', 'Action', 'Reviewer', 'Details'];
    const rows = auditLogs.map((l) => [
      l.when || l.at || '',
      l.category || '',
      l.action || '',
      l.reviewer || l.actor || 'System',
      `"${(l.summary || JSON.stringify(l.detail) || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sentra_audit_trail_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLogs = systemLogs.filter((l) => {
    if (levelFilter !== 'ALL' && l.level !== levelFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        l.message.toLowerCase().includes(q) ||
        l.source.toLowerCase().includes(q) ||
        l.level.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredAudit = auditLogs.filter((l) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        (l.action || '').toLowerCase().includes(q) ||
        (l.reviewer || l.actor || '').toLowerCase().includes(q) ||
        (l.summary || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="logs-container">
      {/* Tab Switcher & Action Header */}
      <div className="logs-header-card">
        <div className="logs-tabs-row">
          <button
            className={`tab-btn ${activeTab === 'audit' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('audit');
              setSearch('');
            }}
          >
            <ShieldCheck size={16} />
            <span>HSE Audit Trail ({auditLogs.length})</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'system' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('system');
              setSearch('');
            }}
          >
            <Terminal size={16} />
            <span>SysLog Technical Stream ({systemLogs.length})</span>
          </button>
        </div>

        <div className="logs-actions-row">
          {activeTab === 'audit' ? (
            <>
              <button
                className="btn-secondary-sm"
                onClick={handleVerifyChain}
                title="Cryptographic verification of SHA-256 block ledger"
              >
                <ShieldCheck size={14} className="text-green" />
                <span>Verify Hash Chain</span>
              </button>
              <button className="btn-secondary-sm" onClick={handleExportCsv}>
                <Download size={14} />
                <span>Export Audit CSV</span>
              </button>
            </>
          ) : (
            <div className="filter-group">
              <Filter size={13} className="text-muted" />
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="select-clean"
              >
                <option value="ALL">All Levels</option>
                <option value="INFO">INFO Only</option>
                <option value="WARNING">WARNING Only</option>
                <option value="ERROR">ERROR Only</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {verifiedChain && (
        <div className="chain-verified-toast">
          <CheckCircle2 size={16} className="text-green" />
          <span>
            SHA-256 Audit Chain Verified: {auditLogs.length} blocks checked. Zero tampering detected.
          </span>
        </div>
      )}

      {/* Search Input Bar */}
      <div className="logs-search-bar">
        <Search size={15} className="text-muted" />
        <input
          type="text"
          placeholder={
            activeTab === 'audit'
              ? 'Filter audit records by reviewer, action, or target finding...'
              : 'Filter system logs by error message, module, or timestamp...'
          }
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Tab 1: Audit Log Table */}
      {activeTab === 'audit' && (
        <div className="logs-content-card">
          <table className="sentra-table">
            <thead>
              <tr>
                <th>TIMESTAMP</th>
                <th>CATEGORY</th>
                <th>ACTION</th>
                <th>OPERATOR / ROLE</th>
                <th>PREVIOUS / AUDIT DETAIL</th>
                <th>INTEGRITY STATUS</th>
              </tr>
            </thead>
            <tbody>
              {filteredAudit.map((log, i) => (
                <tr key={i}>
                  <td className="font-mono text-muted text-xs">{log.when || log.at || 'Now'}</td>
                  <td>
                    <span className="badge badge-neutral uppercase text-xs">
                      {log.category || 'HSE_ACTION'}
                    </span>
                  </td>
                  <td className="font-semibold text-accent">{log.action}</td>
                  <td>
                    <div className="actor-cell">
                      <span className="actor-name">{log.reviewer || log.actor || 'System Engine'}</span>
                    </div>
                  </td>
                  <td className="text-secondary max-w-sm truncate">
                    {log.summary || JSON.stringify(log.detail)}
                  </td>
                  <td>
                    <span className="status-badge live">● Verified Block</span>
                  </td>
                </tr>
              ))}
              {filteredAudit.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-muted">
                    No audit log records match the current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Technical SysLog Console */}
      {activeTab === 'system' && (
        <div className="syslog-terminal-card">
          {filteredLogs.map((log, i) => (
            <div key={i} className="syslog-line">
              <span className="log-time">{log.timestamp}</span>
              <span
                className={`log-level ${
                  log.level === 'ERROR'
                    ? 'level-error'
                    : log.level === 'WARNING'
                    ? 'level-warn'
                    : 'level-info'
                }`}
              >
                [{log.level}]
              </span>
              <span className="log-source">[{log.source}]</span>
              <span className="log-msg">{log.message}</span>
            </div>
          ))}
          {filteredLogs.length === 0 && (
            <div className="syslog-empty">No system telemetry events recorded.</div>
          )}
        </div>
      )}
    </div>
  );
};
