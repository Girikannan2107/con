import React, { useState, useEffect } from 'react';
import {
  fetchCurrentUser,
  fetchAvailableUsers,
  loginUser,
  fetchDashboardSummary,
  fetchIncidents,
  analyzeReport,
  seedSampleReports,
  uploadDocument,
  fetchReviewQueue,
  submitReviewDecision,
  fetchHotspots,
  fetchActions,
  createAction,
  updateAction,
  fetchEnginesStatus,
  triggerModelTraining,
  fetchAuditLogs,
  fetchSystemLogs,
} from './api';
import {
  User,
  DashboardSummary,
  IncidentReport,
  Hotspot,
  SafetyAction,
  EngineStatus,
  AuditEntry,
  SystemLog,
} from './types';
import { Sidebar, TabId } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { LoginModal } from './components/LoginModal';
import { DashboardView } from './views/DashboardView';
import { IncidentsView } from './views/IncidentsView';
import { IngestView } from './views/IngestView';
import { ReviewView } from './views/ReviewView';
import { HotspotsView } from './views/HotspotsView';
import { ActionsView } from './views/ActionsView';
import { EnginesView } from './views/EnginesView';
import { LogsView } from './views/LogsView';

export function App() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [showUserModal, setShowUserModal] = useState(false);

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<IncidentReport | null>(null);
  const [reviewQueue, setReviewQueue] = useState<IncidentReport[]>([]);
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [actions, setActions] = useState<SafetyAction[]>([]);
  const [enginesStatus, setEnginesStatus] = useState<EngineStatus | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);

  const [loading, setLoading] = useState(false);

  // Load all initial data from backend API
  const refreshAllData = async () => {
    setLoading(true);
    try {
      const [
        meRes,
        usersRes,
        summaryRes,
        incidentsRes,
        queueRes,
        hotspotsRes,
        actionsRes,
        enginesRes,
        auditRes,
        sysLogsRes,
      ] = await Promise.all([
        fetchCurrentUser().catch(() => null),
        fetchAvailableUsers().catch(() => []),
        fetchDashboardSummary().catch(() => null),
        fetchIncidents().catch(() => []),
        fetchReviewQueue().catch(() => []),
        fetchHotspots().catch(() => []),
        fetchActions().catch(() => []),
        fetchEnginesStatus().catch(() => null),
        fetchAuditLogs().catch(() => []),
        fetchSystemLogs().catch(() => []),
      ]);

      if (meRes?.user) setCurrentUser(meRes.user);
      if (usersRes) setAvailableUsers(usersRes);
      if (summaryRes) setSummary(summaryRes);
      if (incidentsRes) {
        setIncidents(incidentsRes);
        if (!selectedIncident && incidentsRes.length > 0) {
          setSelectedIncident(incidentsRes[0]);
        }
      }
      if (queueRes) setReviewQueue(queueRes);
      if (hotspotsRes) setHotspots(hotspotsRes);
      if (actionsRes) setActions(actionsRes);
      if (enginesRes) setEnginesStatus(enginesRes);
      if (auditRes) setAuditLogs(auditRes);
      if (sysLogsRes) setSystemLogs(sysLogsRes);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  // Handlers
  const handleSelectUser = async (empId: string) => {
    const res = await loginUser(empId);
    if (res.success) {
      setCurrentUser(res.user);
      await refreshAllData();
    }
  };

  const handleAnalyzeQuick = async (text: string) => {
    const report = await analyzeReport(text);
    setSelectedIncident(report);
    await refreshAllData();
  };

  const handleSeedData = async () => {
    await seedSampleReports();
    await refreshAllData();
  };

  const handleUploadFile = async (file: File) => {
    const res = await uploadDocument(file);
    await refreshAllData();
    return res;
  };

  const handleReviewDecide = async (id: string, decision: any) => {
    await submitReviewDecision(id, decision);
    await refreshAllData();
  };

  const handleCreateAction = async (action: Omit<SafetyAction, 'id' | 'created_at'>) => {
    await createAction(action);
    await refreshAllData();
  };

  const handleUpdateActionStatus = async (id: string, status: SafetyAction['status']) => {
    await updateAction(id, { status });
    await refreshAllData();
  };

  const handleTrainModel = async () => {
    const res = await triggerModelTraining();
    await refreshAllData();
    return res;
  };

  const getPageInfo = () => {
    switch (activeTab) {
      case 'dashboard':
        return {
          title: 'HSE Executive Dashboard',
          subtitle: 'Oil India Limited · Real-time Serious Injury & Fatality (SIF) Intelligence',
        };
      case 'incidents':
        return {
          title: 'Incident Forensics & Inspection',
          subtitle: 'Structured safety observation analysis with multi-tab forensic evidence',
        };
      case 'ingest':
        return {
          title: 'Multilingual Ingest & OCR Studio',
          subtitle: 'Batch CSV ingestion, PDF extraction, and 12-language optical character recognition',
        };
      case 'review':
        return {
          title: 'Human Review Bench',
          subtitle: 'Accountable triage station for AI/rule disagreements and critical safety cases',
        };
      case 'hotspots':
        return {
          title: 'Systemic Risk Hotspots',
          subtitle: 'Wilson-score precursor density ranking across sites, activities, and broken barriers',
        };
      case 'actions':
        return {
          title: 'Corrective Safety Actions (CAPA)',
          subtitle: 'Track, assign, verify, and close critical safety interventions linked to findings',
        };
      case 'engines':
        return {
          title: 'Intelligence Engines & MLOps',
          subtitle: 'Semantic sentence transformers, PaddleOCR models, and XGBoost supervised retraining',
        };
      case 'logs':
        return {
          title: 'System Diagnostics & HSE Audit Trail',
          subtitle: 'Append-only accountability record and real-time backend engine logs',
        };
      default:
        return { title: 'SENTRA', subtitle: 'SIF Intelligence Console' };
    }
  };

  const pageInfo = getPageInfo();

  return (
    <div className="app-container">
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        currentUser={currentUser}
        onOpenUserModal={() => setShowUserModal(true)}
        reviewCount={reviewQueue.length}
        openActionsCount={actions.filter((a) => a.status !== 'Closed' && a.status !== 'Verified').length}
      />

      <div className="main-wrapper">
        <Navbar
          title={pageInfo.title}
          subtitle={pageInfo.subtitle}
          currentUser={currentUser}
          onRefresh={refreshAllData}
          loading={loading}
        />

        <main className="content-body">
          {activeTab === 'dashboard' && (
            <DashboardView
              summary={summary}
              recentIncidents={incidents}
              onAnalyzeQuick={handleAnalyzeQuick}
              onSeedData={handleSeedData}
              onNavigateTab={setActiveTab}
              onSelectIncident={(inc) => {
                setSelectedIncident(inc);
                setActiveTab('incidents');
              }}
            />
          )}

          {activeTab === 'incidents' && (
            <IncidentsView
              incidents={incidents}
              selectedIncident={selectedIncident}
              onSelectIncident={setSelectedIncident}
              onNavigateReview={(inc) => {
                setSelectedIncident(inc);
                setActiveTab('review');
              }}
            />
          )}

          {activeTab === 'ingest' && (
            <IngestView
              onUploadFile={handleUploadFile}
              onAnalyzeText={handleAnalyzeQuick}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'review' && (
            <ReviewView queue={reviewQueue} onDecide={handleReviewDecide} />
          )}

          {activeTab === 'hotspots' && <HotspotsView hotspots={hotspots} />}

          {activeTab === 'actions' && (
            <ActionsView
              actions={actions}
              onCreateAction={handleCreateAction}
              onUpdateStatus={handleUpdateActionStatus}
            />
          )}

          {activeTab === 'engines' && (
            <EnginesView status={enginesStatus} onTrainModel={handleTrainModel} />
          )}

          {activeTab === 'logs' && (
            <LogsView auditLogs={auditLogs} systemLogs={systemLogs} />
          )}
        </main>
      </div>

      {showUserModal && (
        <LoginModal
          users={availableUsers}
          currentUser={currentUser}
          onSelectUser={handleSelectUser}
          onClose={() => setShowUserModal(false)}
        />
      )}
    </div>
  );
}

export default App;
