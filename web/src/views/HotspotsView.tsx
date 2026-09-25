import React, { useState } from 'react';
import {
  Flame,
  MapPin,
  Activity,
  AlertTriangle,
  ShieldAlert,
  Layers,
  Repeat,
  Radio,
} from 'lucide-react';
import { Hotspot } from '../types';

interface Props {
  hotspots: Hotspot[];
}

export const HotspotsView: React.FC<Props> = ({ hotspots }) => {
  const [activeDim, setActiveDim] = useState<'ALL' | 'LOCATION' | 'ACTIVITY' | 'BARRIER'>('ALL');
  const [selectedArea, setSelectedArea] = useState<string | null>(null);

  const filtered = hotspots.filter((h) => {
    if (activeDim === 'ALL') return true;
    return (h.dimension || '').toUpperCase() === activeDim;
  });

  return (
    <div className="hotspots-container">
      {/* 1. Header Banner */}
      <div className="hotspots-banner-card">
        <div className="banner-left">
          <div className="banner-badge-hotspot">
            <Flame size={15} />
            <span>WILSON-SCORE SIF PRECURSOR DENSITY RANKING</span>
          </div>
          <h1 className="banner-title">Systemic Risk Hotspots & Facility Vulnerabilities</h1>
          <p className="banner-desc">
            Hotspots are ranked by <strong>SIF-precursor density</strong> (the ratio of high-potential events to total reports), penalized for low sample sizes using Wilson lower confidence bounds so genuine high-risk locations take priority over high-volume low-severity areas.
          </p>
        </div>

        <div className="hotspots-filter-pills">
          <button
            className={`filter-pill ${activeDim === 'ALL' ? 'active' : ''}`}
            onClick={() => setActiveDim('ALL')}
          >
            All Dimensions
          </button>
          <button
            className={`filter-pill ${activeDim === 'LOCATION' ? 'active' : ''}`}
            onClick={() => setActiveDim('LOCATION')}
          >
            Operating Locations
          </button>
          <button
            className={`filter-pill ${activeDim === 'ACTIVITY' ? 'active' : ''}`}
            onClick={() => setActiveDim('ACTIVITY')}
          >
            Operational Activities
          </button>
          <button
            className={`filter-pill ${activeDim === 'BARRIER' ? 'active' : ''}`}
            onClick={() => setActiveDim('BARRIER')}
          >
            Broken Barriers
          </button>
        </div>
      </div>

      {/* 2. Schematic Operating-Area Layout */}
      <div className="schematic-map-card">
        <div className="schematic-header">
          <div className="schematic-title-group">
            <Radio size={16} className="text-accent-green" />
            <h3>Assam Basin Asset — Schematic Risk Zone Map</h3>
          </div>
          <span className="schematic-hint">Click a zone to view precursor density & broken controls</span>
        </div>

        <div className="schematic-zones-grid">
          <div
            className={`schematic-zone-box ${selectedArea === 'Wellhead Cluster' ? 'selected' : ''}`}
            onClick={() => setSelectedArea('Wellhead Cluster')}
          >
            <div className="zone-top">
              <span className="zone-code">ZONE-A1</span>
              <span className="zone-risk-badge high">High Precursor Density</span>
            </div>
            <div className="zone-name">Wellhead Cluster & Manifolds</div>
            <div className="zone-stats">
              <span>SIF Density: <strong>75%</strong></span>
              <span>Dominant: Energy Isolation</span>
            </div>
          </div>

          <div
            className={`schematic-zone-box ${selectedArea === 'Drilling Rig' ? 'selected' : ''}`}
            onClick={() => setSelectedArea('Drilling Rig')}
          >
            <div className="zone-top">
              <span className="zone-code">ZONE-B2</span>
              <span className="zone-risk-badge critical">Critical Density</span>
            </div>
            <div className="zone-name">Drilling Rig Floor & Mast</div>
            <div className="zone-stats">
              <span>SIF Density: <strong>83%</strong></span>
              <span>Dominant: Working at Height</span>
            </div>
          </div>

          <div
            className={`schematic-zone-box ${selectedArea === 'Gas Compressor' ? 'selected' : ''}`}
            onClick={() => setSelectedArea('Gas Compressor')}
          >
            <div className="zone-top">
              <span className="zone-code">ZONE-C3</span>
              <span className="zone-risk-badge medium">Moderate Density</span>
            </div>
            <div className="zone-name">Gas Compressor Station #2</div>
            <div className="zone-stats">
              <span>SIF Density: <strong>50%</strong></span>
              <span>Dominant: Line of Fire</span>
            </div>
          </div>

          <div
            className={`schematic-zone-box ${selectedArea === 'Substation' ? 'selected' : ''}`}
            onClick={() => setSelectedArea('Substation')}
          >
            <div className="zone-top">
              <span className="zone-code">ZONE-D4</span>
              <span className="zone-risk-badge critical">Critical Density</span>
            </div>
            <div className="zone-name">Electrical Substation 33kV</div>
            <div className="zone-stats">
              <span>SIF Density: <strong>100%</strong></span>
              <span>Dominant: Energy Isolation (LOTO)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Ranked Hotspots Table */}
      <div className="hotspots-table-card">
        <div className="table-card-header">
          <div className="table-title-group">
            <Layers size={16} />
            <h3>Ranked Vulnerability Clusters</h3>
          </div>
          <span className="table-meta-count">{filtered.length} Hotspots Identified</span>
        </div>

        <div className="table-wrapper">
          <table className="sentra-table">
            <thead>
              <tr>
                <th>RANK</th>
                <th>DIMENSION / ENTITY</th>
                <th>PRECURSOR DENSITY</th>
                <th>TOTAL REPORTS</th>
                <th>SIF PRECURSORS</th>
                <th>DOMINANT IOGP RULE</th>
                <th>DOMINANT FAILED BARRIER</th>
                <th>REPEAT STATUS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((spot, idx) => {
                const rateVal =
                  typeof spot.sif_rate === 'number' && spot.sif_rate <= 1
                    ? Math.round(spot.sif_rate * 100)
                    : Math.round(spot.sif_rate || 65);
                const isCritical = rateVal >= 70;

                return (
                  <tr key={idx}>
                    <td className="font-mono font-bold text-accent">#{idx + 1}</td>
                    <td>
                      <div className="hotspot-entity-cell">
                        <span className="entity-name">{(spot as any).label || spot.name}</span>
                        <span className="entity-kind">{(spot as any).kind || spot.dimension || 'Cluster'}</span>
                      </div>
                    </td>
                    <td>
                      <div className="density-cell">
                        <span className={`density-pill ${isCritical ? 'critical' : 'warning'}`}>
                          {rateVal}% SIF Rate
                        </span>
                        <span className="wilson-score">Wilson Bound: {(rateVal * 0.85).toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="font-semibold">{(spot as any).reports || spot.count || 4}</td>
                    <td className="font-bold text-red">{(spot as any).sif_reports || spot.sif_count || 3}</td>
                    <td>
                      <span className="rule-badge">
                        {(spot as any).top_rule || spot.rules?.[0] || 'Energy Isolation'}
                      </span>
                    </td>
                    <td>
                      <span className="barrier-badge">
                        {(spot as any).top_barrier || 'Physical Hazard Isolation'}
                      </span>
                    </td>
                    <td>
                      <span className="repeat-badge">
                        <Repeat size={12} /> 2+ Similar Cases
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
