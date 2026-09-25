import React from 'react';
import { RiskBand } from '../types';

interface Props {
  band: RiskBand | string;
  score?: number;
}

export const RiskBandBadge: React.FC<Props> = ({ band, score }) => {
  const normalized = (band || 'Low').toLowerCase();

  let className = 'badge badge-low';
  if (normalized === 'critical') className = 'badge badge-critical';
  else if (normalized === 'high') className = 'badge badge-high';
  else if (normalized === 'medium') className = 'badge badge-medium';

  return (
    <span className={className}>
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          backgroundColor: 'currentColor',
          display: 'inline-block',
        }}
      />
      {band} {score !== undefined ? `(${Math.round(score)})` : ''}
    </span>
  );
};
