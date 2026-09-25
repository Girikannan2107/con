import React, { useState } from 'react';
import { Flame, MapPin, Activity, ShieldAlert, AlertTriangle } from 'lucide-react';
import { Hotspot } from '../types';

interface Props {
  hotspots: Hotspot[];
}

export const HotspotsView: React.FC<Props> = ({ hotspots }) => {
  const [filterDim, setFilterDim] = useState('ALL');

  const filtered = hotspots.filter((h) => {
    if (filterDim !== 'ALL' && h.dimension.toLowerCase() !== filterDim.toLowerCase()) {
      return false;
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Banner */}
      <div
        className="panel"
        style={{
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(15, 23, 42, 0.9) 100%)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
          <Flame size={20} style={{ color: '#F59E0B' }} />
          <div style={{ fontWeight: 700, fontSize: '1rem' }}>
            Systemic Risk Hotspots & Repeat Vulnerabilities
          </div>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Ranked by <strong>SIF-precursor density</strong> (the proportion of reports carrying fatal
          potential) discounted by a Wilson lower bound so small sample groups do not overshadow
          persistent site hazards.
        </p>
      </div>

      {/* Hotspot Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1rem' }}>
        {filtered.map((spot, idx) => (
          <div
            key={idx}
            className="panel"
            style={{
              marginBottom: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              borderLeft: '4px solid #F59E0B',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span
                  className="badge badge-neutral"
                  style={{ fontSize: '0.65rem', textTransform: 'uppercase', marginBottom: 4 }}
                >
                  {spot.dimension || 'Site Cluster'}
                </span>
                <div style={{ fontWeight: 700, fontSize: '1rem', marginTop: 2 }}>{spot.name}</div>
              </div>
              <div
                style={{
                  background: 'rgba(245, 158, 11, 0.2)',
                  color: '#FCD34D',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '6px',
                }}
              >
                {(spot.sif_rate * 100).toFixed(0)}% SIF
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem' }}>
              <div style={{ background: '#090E1A', padding: '0.5rem', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Total Reports</div>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>{spot.count}</div>
              </div>
              <div style={{ background: '#090E1A', padding: '0.5rem', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>SIF Precursors</div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: '#EF4444' }}>{spot.sif_count}</div>
              </div>
            </div>

            {spot.rules && spot.rules.length > 0 && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 2 }}>Associated Rules:</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                  {spot.rules.map((r, i) => (
                    <span key={i} className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
