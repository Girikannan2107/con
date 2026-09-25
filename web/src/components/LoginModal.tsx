import React, { useState } from 'react';
import { User } from '../types';
import { UserCheck, X } from 'lucide-react';

interface Props {
  users: User[];
  currentUser: User | null;
  onSelectUser: (employee_id: string) => Promise<void>;
  onClose: () => void;
}

export const LoginModal: React.FC<Props> = ({
  users,
  currentUser,
  onSelectUser,
  onClose,
}) => {
  const [loading, setLoading] = useState<string | null>(null);

  const handleSwitch = async (empId: string) => {
    setLoading(empId);
    try {
      await onSelectUser(empId);
      onClose();
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="panel-header" style={{ marginBottom: '1.25rem' }}>
          <div className="panel-title">
            <UserCheck size={18} style={{ color: 'var(--accent-cyan)' }} />
            <span>Switch Operator Role / Account</span>
          </div>
          <button
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
            }}
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {users.map((u) => {
            const isCurrent = currentUser?.employee_id === u.employee_id;
            return (
              <div
                key={u.employee_id}
                onClick={() => !isCurrent && handleSwitch(u.employee_id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.85rem',
                  borderRadius: '8px',
                  background: isCurrent ? 'var(--accent-cyan-glow)' : 'var(--bg-card-subtle)',
                  border: `1px solid ${
                    isCurrent ? 'var(--accent-cyan)' : 'var(--border-subtle)'
                  }`,
                  cursor: isCurrent ? 'default' : 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div className="user-avatar">{u.avatar_initials}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{u.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-highlight)' }}>
                    {u.role} · {u.department}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {u.site} ({u.employee_id})
                  </div>
                </div>
                {isCurrent && (
                  <span
                    style={{
                      fontSize: '0.7rem',
                      color: 'var(--accent-cyan)',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                    }}
                  >
                    Active
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
