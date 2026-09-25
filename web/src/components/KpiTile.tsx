import React from 'react';

interface Props {
  label: string;
  value: string | number;
  sub?: string;
  variant?: 'default' | 'critical' | 'high' | 'cyan';
  icon?: React.ReactNode;
}

export const KpiTile: React.FC<Props> = ({ label, value, sub, variant = 'default', icon }) => {
  return (
    <div className={`kpi-card ${variant}`}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="kpi-label">{label}</div>
        {icon && <div style={{ color: 'var(--text-muted)' }}>{icon}</div>}
      </div>
      <div className="kpi-value">{value}</div>
      {sub && <div className="kpi-sub">{sub}</div>}
    </div>
  );
};
