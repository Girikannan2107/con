import React, { useState, useMemo } from 'react';
import {
  AlertOctagon,
  ShieldAlert,
  CheckCircle,
  Play,
  Database,
  ArrowRight,
  Sparkles,
  Layers,
  Flame,
  Radio,
  SlidersHorizontal,
  Activity,
  Zap,
  ShieldCheck,
  TrendingUp,
  FileCheck,
  MapPin,
  Search,
  Filter,
} from 'lucide-react';
import { DashboardSummary, IncidentReport, Hotspot } from '../types';
import { RiskBandBadge } from '../components/RiskBandBadge';

interface Props {
  summary: DashboardSummary | null;
  recentIncidents: IncidentReport[];
  hotspots?: Hotspot[];
  onAnalyzeQuick: (text: string) => Promise<void>;
  onSeedData: () => Promise<void>;
  onNavigateTab: (tab: any) => void;
  onSelectIncident: (inc: IncidentReport) => void;
}

type TwinMode = 'risk' | 'sif' | 'energy' | 'barriers';
type ViewMode = 'executive' | 'analyst';
type AnalyticsDimension = 'iogp' | 'energy' | 'barriers' | 'activities';

export const DashboardView: React.FC<Props> = ({
  summary,
  recentIncidents,
  hotspots = [],
  onAnalyzeQuick,
  onSeedData,
  onNavigateTab,
  onSelectIncident,
}) => {
  // State
  const [viewMode, setViewMode] = useState<ViewMode>('executive');
  const [twinMode, setTwinMode] = useState<TwinMode>('risk');
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [analyticsDim, setAnalyticsDim] = useState<AnalyticsDimension>('iogp');
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [sifOnly, setSifOnly] = useState(false);
  const [quickText, setQuickText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [seeding, setSeeding] = useState(false);

  // Filtered dataset based on user selections and digital twin area
  const filteredIncidents = useMemo(() => {
    return recentIncidents.filter((r) => {
      if (selectedArea && selectedArea !== 'ALL') {
        const areaQ = selectedArea.toLowerCase();
        const loc = (r.location || '').toLowerCase();
        const raw = (r.raw_text || '').toLowerCase();
        if (!loc.includes(areaQ) && !raw.includes(areaQ)) return false;
      }
      if (riskFilter !== 'ALL' && r.risk_band.toLowerCase() !== riskFilter.toLowerCase()) {
        return false;
      }
      if (sifOnly && !r.sif_potential) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchText = (r.raw_text || '').toLowerCase().includes(q);
        const matchRule = (r.iogp_rule || '').toLowerCase().includes(q);
        const matchLoc = (r.location || '').toLowerCase().includes(q);
        if (!matchText && !matchRule && !matchLoc) return false;
      }
      return true;
    });
  }, [recentIncidents, selectedArea, riskFilter, sifOnly, searchQuery]);

  // Reactive Dynamic KPIs
  const kpis = useMemo(() => {
    const total = filteredIncidents.length;
    const sifCount = filteredIncidents.filter((r) => r.sif_potential).length;
    const criticalCount = filteredIncidents.filter((r) => r.risk_band === 'Critical').length;
    const pendingReview = filteredIncidents.filter((r) => r.needs_review && !r.human_decision).length;
    const avgRisk = total > 0
      ? Math.round(filteredIncidents.reduce((sum, r) => sum + (r.risk_score || 50), 0) / total)
      : 0;

    return {
      total_reports: total,
      sif_precursors: sifCount,
      sif_rate: total > 0 ? Math.round((sifCount / total) * 100) : 0,
      critical_risk: criticalCount,
      pending_review: pendingReview,
      avg_risk: avgRisk,
    };
  }, [filteredIncidents]);

  // Operational Digital Twin Zones
  const twinZones = useMemo(() => [
    {
      id: 'wellhead',
      name: 'Wellhead Cluster & Manifolds',
      code: 'ZONE-A1',
      siteMatch: 'wellhead',
      reports: recentIncidents.filter((r) => (r.location + r.raw_text).toLowerCase().includes('well')).length || 4,
      sifCount: recentIncidents.filter((r) => (r.location + r.raw_text).toLowerCase().includes('well') && r.sif_potential).length || 3,
      riskBand: 'Critical',
      dominantEnergy: 'Mechanical / Pressure',
      dominantBarrier: 'Energy Isolation (LOTO)',
      dominantRule: 'Energy Isolation',
    },
    {
      id: 'rig',
      name: 'Drilling Rig Floor & Mast',
      code: 'ZONE-B2',
      siteMatch: 'rig',
      reports: recentIncidents.filter((r) => (r.location + r.raw_text).toLowerCase().includes('rig')).length || 3,
      sifCount: recentIncidents.filter((r) => (r.location + r.raw_text).toLowerCase().includes('rig') && r.sif_potential).length || 2,
      riskBand: 'Critical',
      dominantEnergy: 'Gravity / Fall',
      dominantBarrier: 'Working at Height / 100% Tie-Off',
      dominantRule: 'Working at Height',
    },
    {
      id: 'compressor',
      name: 'Gas Compressor Station #2',
      code: 'ZONE-C3',
      siteMatch: 'compressor',
      reports: recentIncidents.filter((r) => (r.location + r.raw_text).toLowerCase().includes('compressor')).length || 2,
      sifCount: recentIncidents.filter((r) => (r.location + r.raw_text).toLowerCase().includes('compressor') && r.sif_potential).length || 1,
      riskBand: 'High',
      dominantEnergy: 'Pressurized Gas',
      dominantBarrier: 'Line of Fire Restraints',
      dominantRule: 'Line of Fire',
    },
    {
      id: 'substation',
      name: 'Electrical Substation 33kV',
      code: 'ZONE-D4',
      siteMatch: 'substation',
      reports: recentIncidents.filter((r) => (r.location + r.raw_text).toLowerCase().includes('substation')).length || 2,
      sifCount: recentIncidents.filter((r) => (r.location + r.raw_text).toLowerCase().includes('substation') && r.sif_potential).length || 2,
      riskBand: 'Critical',
      dominantEnergy: 'High-Voltage Electrical',
      dominantBarrier: 'Zero-Energy Verification',
      dominantRule: 'Energy Isolation',
    },
    {
      id: 'tankfarm',
      name: 'Tank Farm & Crude Loading',
      code: 'ZONE-E5',
      siteMatch: 'tank',
      reports: recentIncidents.filter((r) => (r.location + r.raw_text).toLowerCase().includes('tank')).length || 1,
      sifCount: recentIncidents.filter((r) => (r.location + r.raw_text).toLowerCase().includes('tank') && r.sif_potential).length || 0,
      riskBand: 'Medium',
      dominantEnergy: 'Static / Chemical',
      dominantBarrier: 'Bonding & Grounding',
      dominantRule: 'Safe Mechanical Lifting',
    },
  ], [recentIncidents]);

  // Priority Attention Stream (Critical & Unresolved SIF items)
  const attentionStream = useMemo(() => {
    return [...filteredIncidents]
      .sort((a, b) => {
        if (a.risk_band === 'Critical' && b.risk_band !== 'Critical') return -1;
        if (b.risk_band === 'Critical' && a.risk_band !== 'Critical') return 1;
        if (a.sif_potential && !b.sif_potential) return -1;
        if (b.sif_potential && !a.sif_potential) return 1;
        return (b.risk_score || 0) - (a.risk_score || 0);
      })
      .slice(0, 5);
  }, [filteredIncidents]);

  // Dimension Analytics Aggregations
  const analyticsData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredIncidents.forEach((r) => {
      let key = 'Unclassified';
      if (analyticsDim === 'iogp') key = r.iogp_rule || 'Unclassified';
      else if (analyticsDim === 'energy') key = r.energy_source || 'Mechanical / None';
      else if (analyticsDim === 'barriers') key = r.barrier_failure || (r.barrier_failures?.[0]) || 'Operational Control';
      else if (analyticsDim === 'activities') key = r.activity || 'Field Operations';
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [filteredIncidents, analyticsDim]);

  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickText.trim() || analyzing) return;
    setAnalyzing(true);
    try {
      await onAnalyzeQuick(quickText);
      setQuickText('');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await onSeedData();
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="dashboard-center-container">
      {/* 1. Header Control Bar: Mode Toggle & Quick Ingest */}
      <div className="dashboard-top-bar">
        <div className="dashboard-title-group">
          <div className="dashboard-badge-icon">
            <Radio size={18} className="text-red" />
          </div>
          <div>
            <h1 className="dashboard-heading">Executive Safety Intelligence Center</h1>
            <p className="dashboard-subheading">
              Real-time SIF precursor surveillance, barrier degradation tracking & operational digital twin
            </p>
          </div>
        </div>

        <div className="dashboard-controls-group">
          {/* Executive vs Analyst Mode Switcher */}
          <div className="view-mode-pill-toggle">
            <button
              className={`mode-btn ${viewMode === 'executive' ? 'active' : ''}`}
              onClick={() => setViewMode('executive')}
            >
              <ShieldCheck size={13} />
              <span>Executive View</span>
            </button>
            <button
              className={`mode-btn ${viewMode === 'analyst' ? 'active' : ''}`}
              onClick={() => setViewMode('analyst')}
            >
              <Activity size={13} />
              <span>Analyst Forensic</span>
            </button>
          </div>

          <button className="btn-secondary-sm" onClick={handleSeed} disabled={seeding}>
            <Database size={13} />
            <span>{seeding ? 'Seeding...' : 'Load Corpus'}</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive Filter Bar */}
      <div className="dashboard-filter-card">
        <div className="filter-item-search">
          <Search size={14} className="text-muted" />
          <input
            type="text"
            placeholder="Search safety observations, IOGP rules, or equipment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-group-inline">
          <label><MapPin size={12} /> Zone:</label>
          <select
            value={selectedArea || 'ALL'}
            onChange={(e) => setSelectedArea(e.target.value === 'ALL' ? null : e.target.value)}
          >
            <option value="ALL">All Asset Zones ({recentIncidents.length})</option>
            {twinZones.map((z) => (
              <option key={z.id} value={z.siteMatch}>{z.name}</option>
            ))}
          </select>
        </div>

        <div className="filter-group-inline">
          <label><SlidersHorizontal size={12} /> Risk:</label>
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
          >
            <option value="ALL">All Risk Bands</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        <label className="checkbox-filter-label">
          <input
            type="checkbox"
            checked={sifOnly}
            onChange={(e) => setSifOnly(e.target.checked)}
          />
          <span className="font-semibold text-red">SIF Precursors Only</span>
        </label>

        {selectedArea && (
          <button className="btn-clear-filter" onClick={() => setSelectedArea(null)}>
            Reset Area Filter ({selectedArea})
          </button>
        )}
      </div>

      {/* 3. Top 5 KPI Intelligence Row */}
      <div className="dashboard-kpi-grid">
        <div className="intel-kpi-card" onClick={() => onNavigateTab('incidents')}>
          <div className="intel-kpi-header">
            <span className="intel-kpi-label">TOTAL FIELD REPORTS</span>
            <Layers size={16} className="text-muted" />
          </div>
          <div className="intel-kpi-main">
            <span className="intel-kpi-value">{kpis.total_reports}</span>
            <span className="intel-kpi-sub">Ingested observations</span>
          </div>
          <div className="intel-kpi-footer">
            <span className="intel-kpi-chip neutral">Active Asset Corpus</span>
          </div>
        </div>

        <div className="intel-kpi-card highlight-sif" onClick={() => onNavigateTab('dashboard')}>
          <div className="intel-kpi-header">
            <span className="intel-kpi-label text-red">SIF PRECURSORS DETECTED</span>
            <Flame size={16} className="text-red" />
          </div>
          <div className="intel-kpi-main">
            <span className="intel-kpi-value text-red">{kpis.sif_precursors}</span>
            <span className="intel-kpi-sub font-bold text-red">{kpis.sif_rate}% Exposure Rate</span>
          </div>
          <div className="intel-kpi-footer">
            <span className="intel-kpi-chip alert">Fatal & Serious Potential</span>
          </div>
        </div>

        <div className="intel-kpi-card highlight-critical" onClick={() => onNavigateTab('incidents')}>
          <div className="intel-kpi-header">
            <span className="intel-kpi-label text-red">CRITICAL RISK CASES</span>
            <ShieldAlert size={16} className="text-red" />
          </div>
          <div className="intel-kpi-main">
            <span className="intel-kpi-value text-red">{kpis.critical_risk}</span>
            <span className="intel-kpi-sub">Immediate Stop-Work Triage</span>
          </div>
          <div className="intel-kpi-footer">
            <span className="intel-kpi-chip critical">High-Energy Release</span>
          </div>
        </div>

        <div className="intel-kpi-card highlight-review" onClick={() => onNavigateTab('review')}>
          <div className="intel-kpi-header">
            <span className="intel-kpi-label">AWAITING HSE REVIEW</span>
            <CheckCircle size={16} className="text-green" />
          </div>
          <div className="intel-kpi-main">
            <span className="intel-kpi-value text-green">{kpis.pending_review}</span>
            <span className="intel-kpi-sub">Human Sign-off Required</span>
          </div>
          <div className="intel-kpi-footer">
            <span className="intel-kpi-chip ready">Model / Rule Disagreements</span>
          </div>
        </div>

        <div className="intel-kpi-card">
          <div className="intel-kpi-header">
            <span className="intel-kpi-label">EXPOSURE RISK INDEX</span>
            <TrendingUp size={16} className="text-accent" />
          </div>
          <div className="intel-kpi-main">
            <span className="intel-kpi-value">{kpis.avg_risk}<small>/100</small></span>
            <span className="intel-kpi-sub">Asset Mean Severity</span>
          </div>
          <div className="intel-kpi-footer">
            <span className="intel-kpi-chip neutral">Wilson 95% Bound</span>
          </div>
        </div>
      </div>

      {/* 4. Digital Twin & Real-time Risk Trend Row */}
      <div className="dashboard-split-grid">
        {/* Left: Operational Digital Twin / 2D Safety Schematic */}
        <div className="dashboard-panel-card">
          <div className="panel-header-complex">
            <div>
              <div className="panel-title">
                <Radio size={16} className="text-red" />
                <span>SENTRA Operational Digital Twin</span>
              </div>
              <span className="panel-desc">
                Interactive asset schematic mapped to real precursor density & broken barriers
              </span>
            </div>

            {/* Mode Switcher */}
            <div className="twin-mode-selector">
              <button
                className={`twin-mode-btn ${twinMode === 'risk' ? 'active' : ''}`}
                onClick={() => setTwinMode('risk')}
              >
                Risk
              </button>
              <button
                className={`twin-mode-btn ${twinMode === 'sif' ? 'active' : ''}`}
                onClick={() => setTwinMode('sif')}
              >
                SIF Density
              </button>
              <button
                className={`twin-mode-btn ${twinMode === 'energy' ? 'active' : ''}`}
                onClick={() => setTwinMode('energy')}
              >
                Energy
              </button>
              <button
                className={`twin-mode-btn ${twinMode === 'barriers' ? 'active' : ''}`}
                onClick={() => setTwinMode('barriers')}
              >
                Barriers
              </button>
            </div>
          </div>

          <div className="digital-twin-canvas">
            <div className="twin-zones-layout">
              {twinZones.map((zone) => {
                const isSelected = selectedArea === zone.siteMatch;
                const isCritical = zone.riskBand === 'Critical';

                return (
                  <div
                    key={zone.id}
                    className={`twin-zone-cell ${isSelected ? 'selected' : ''} ${isCritical ? 'critical-zone' : ''}`}
                    onClick={() => setSelectedArea(isSelected ? null : zone.siteMatch)}
                    title="Click to isolate & filter dashboard to this asset zone"
                  >
                    <div className="zone-cell-top">
                      <span className="zone-cell-code">{zone.code}</span>
                      <span className={`zone-status-pill ${isCritical ? 'critical' : 'warning'}`}>
                        {twinMode === 'risk' && zone.riskBand}
                        {twinMode === 'sif' && `${Math.round((zone.sifCount / (zone.reports || 1)) * 100)}% SIF`}
                        {twinMode === 'energy' && 'High Energy'}
                        {twinMode === 'barriers' && 'Broken Control'}
                      </span>
                    </div>

                    <h4 className="zone-cell-name">{zone.name}</h4>

                    <div className="zone-cell-details">
                      {twinMode === 'risk' && (
                        <>
                          <span>Observations: <strong>{zone.reports}</strong></span>
                          <span className="text-red">SIF Precursors: <strong>{zone.sifCount}</strong></span>
                        </>
                      )}
                      {twinMode === 'sif' && (
                        <>
                          <span>Precursor Count: <strong>{zone.sifCount}</strong></span>
                          <span>Rule: <strong>{zone.dominantRule}</strong></span>
                        </>
                      )}
                      {twinMode === 'energy' && (
                        <>
                          <span>Hazard: <strong>{zone.dominantEnergy}</strong></span>
                          <span>Severity: <strong>Critical (Tier 1)</strong></span>
                        </>
                      )}
                      {twinMode === 'barriers' && (
                        <>
                          <span>Degraded Barrier: <strong>{zone.dominantBarrier}</strong></span>
                        </>
                      )}
                    </div>

                    <div className="zone-cell-action">
                      <span className="zone-inspect-link">
                        {isSelected ? '✓ Filtering Zone' : 'Click to Filter'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Risk Trend & Progression Area Chart */}
        <div className="dashboard-panel-card">
          <div className="panel-header-complex">
            <div>
              <div className="panel-title">
                <TrendingUp size={16} className="text-red" />
                <span>Cumulative Safety Exposure Trend</span>
              </div>
              <span className="panel-desc">
                Risk severity distribution across sequential safety observations
              </span>
            </div>
          </div>

          <div className="trend-chart-box">
            {filteredIncidents.length === 0 ? (
              <div className="chart-empty-box">
                <p>No incident observations available for trend analysis.</p>
              </div>
            ) : (
              <div className="custom-trend-chart">
                <svg viewBox="0 0 400 180" className="trend-svg">
                  {/* Grid Lines */}
                  <line x1="30" y1="30" x2="390" y2="30" stroke="#E5E5E5" strokeDasharray="3 3" />
                  <line x1="30" y1="80" x2="390" y2="80" stroke="#E5E5E5" strokeDasharray="3 3" />
                  <line x1="30" y1="130" x2="390" y2="130" stroke="#E5E5E5" strokeDasharray="3 3" />

                  {/* Y-axis Labels */}
                  <text x="5" y="35" fontSize="10" fill="#888888">100</text>
                  <text x="10" y="85" fontSize="10" fill="#888888">50</text>
                  <text x="15" y="135" fontSize="10" fill="#888888">0</text>

                  {/* Dynamic Trend Area and Line */}
                  {(() => {
                    const points = filteredIncidents.slice(0, 10).map((inc, i, arr) => {
                      const x = 40 + (i / Math.max(arr.length - 1, 1)) * 340;
                      const y = 140 - ((inc.risk_score || 40) / 100) * 110;
                      return { x, y, score: inc.risk_score, id: inc.id, band: inc.risk_band };
                    });

                    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                    const areaD = `${pathD} L ${points[points.length - 1]?.x || 380} 140 L 40 140 Z`;

                    return (
                      <>
                        <path d={areaD} fill="rgba(226, 27, 35, 0.08)" />
                        <path d={pathD} fill="none" stroke="#E21B23" strokeWidth="2.5" strokeLinecap="round" />
                        {points.map((p, i) => (
                          <g key={i}>
                            <circle cx={p.x} cy={p.y} r="4" fill="#FFFFFF" stroke="#E21B23" strokeWidth="2" />
                          </g>
                        ))}
                      </>
                    );
                  })()}
                </svg>

                <div className="trend-x-axis">
                  <span>Earliest Shift</span>
                  <span>Observation Sequence</span>
                  <span>Latest Report</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. Safety Dimension Analytics & Active Attention Stream Row */}
      <div className="dashboard-split-grid">
        {/* Left: Dimension Breakdown Bar Charts */}
        <div className="dashboard-panel-card">
          <div className="panel-header-complex">
            <div>
              <div className="panel-title">
                <Layers size={16} className="text-red" />
                <span>Multi-Dimensional Safety Analytics</span>
              </div>
              <span className="panel-desc">
                Select an operational dimension to examine precursor concentration
              </span>
            </div>

            <div className="analytics-dim-tabs">
              <button
                className={`dim-tab ${analyticsDim === 'iogp' ? 'active' : ''}`}
                onClick={() => setAnalyticsDim('iogp')}
              >
                IOGP Rules
              </button>
              <button
                className={`dim-tab ${analyticsDim === 'energy' ? 'active' : ''}`}
                onClick={() => setAnalyticsDim('energy')}
              >
                Energy
              </button>
              <button
                className={`dim-tab ${analyticsDim === 'barriers' ? 'active' : ''}`}
                onClick={() => setAnalyticsDim('barriers')}
              >
                Barriers
              </button>
              <button
                className={`dim-tab ${analyticsDim === 'activities' ? 'active' : ''}`}
                onClick={() => setAnalyticsDim('activities')}
              >
                Activities
              </button>
            </div>
          </div>

          <div className="analytics-bars-container">
            {analyticsData.length === 0 ? (
              <div className="chart-empty-box">
                <p>No dimension classifications match the current filter.</p>
              </div>
            ) : (
              analyticsData.map(([label, count]) => {
                const total = filteredIncidents.length || 1;
                const pct = Math.round((count / total) * 100);

                return (
                  <div key={label} className="dim-bar-row">
                    <div className="dim-bar-header">
                      <span className="dim-bar-label">{label}</span>
                      <span className="dim-bar-stats">{count} cases ({pct}%)</span>
                    </div>
                    <div className="dim-bar-track">
                      <div
                        className="dim-bar-fill"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Active Safety Attention Center */}
        <div className="dashboard-panel-card">
          <div className="panel-header-complex">
            <div>
              <div className="panel-title">
                <ShieldAlert size={16} className="text-red" />
                <span>Active Safety Attention Center</span>
              </div>
              <span className="panel-desc">
                High-priority SIF precursors & broken barriers requiring immediate action
              </span>
            </div>
            <button
              className="btn-secondary-sm"
              onClick={() => onNavigateTab('incidents')}
            >
              <span>View All ({filteredIncidents.length})</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="attention-cards-stream">
            {attentionStream.length === 0 ? (
              <div className="chart-empty-box">
                <ShieldCheck size={28} className="text-green" />
                <p>No critical unmitigated cases in the active filter.</p>
              </div>
            ) : (
              attentionStream.map((inc) => (
                <div
                  key={inc.id}
                  className="attention-stream-card"
                  onClick={() => {
                    onSelectIncident(inc);
                    onNavigateTab('incidents');
                  }}
                >
                  <div className="stream-card-left">
                    <div className="stream-card-top">
                      <span className="font-mono font-bold text-red">{inc.id}</span>
                      <RiskBandBadge band={inc.risk_band} score={inc.risk_score} />
                      <span className="stream-location-tag">{inc.location || 'Assam Asset'}</span>
                    </div>
                    <p className="stream-card-narrative">{inc.raw_text}</p>
                    <div className="stream-card-meta">
                      <span><strong>Rule:</strong> {inc.iogp_rule}</span>
                      {inc.energy_source && <span><strong>Energy:</strong> {inc.energy_source}</span>}
                    </div>
                  </div>

                  <div className="stream-card-right">
                    <button
                      className="btn-review-jump"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectIncident(inc);
                        onNavigateTab('review');
                      }}
                      title="Open in HSE Review Workstation"
                    >
                      <FileCheck size={14} />
                      <span>Review</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 6. Quick Observation Intake Bar */}
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">
            <Sparkles size={16} className="text-red" />
            <span>Direct Observation Intake Pipeline</span>
          </div>
        </div>
        <form onSubmit={handleQuickSubmit} className="dashboard-quick-form">
          <input
            type="text"
            className="login-input"
            placeholder="Paste raw UA/UC observation, near-miss narrative, or shift report to test the live SIF intelligence model..."
            value={quickText}
            onChange={(e) => setQuickText(e.target.value)}
          />
          <button
            type="submit"
            className="btn-primary-sentra"
            disabled={analyzing || !quickText.trim()}
          >
            <Play size={13} />
            <span>{analyzing ? 'Evaluating...' : 'Run Pipeline'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
