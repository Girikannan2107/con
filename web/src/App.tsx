import React, { useState, useEffect } from 'react';
import {
  fetchCurrentUser,
  fetchAvailableUsers,
  loginUser,
  logoutUser,
  fetchWorkspaces,
  selectWorkspace,
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
  Workspace,
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
import { LoginScreen } from './views/LoginScreen';
import { ProjectSelectionScreen } from './views/ProjectSelectionScreen';
import { DashboardView } from './views/DashboardView';
import { IncidentsView } from './views/IncidentsView';
import { IngestView } from './views/IngestView';
import { ReviewView } from './views/ReviewView';
import { HotspotsView } from './views/HotspotsView';
import { ActionsView } from './views/ActionsView';
import { EnginesView } from './views/EnginesView';
import { LogsView } from './views/LogsView';

type AppState = 'login' | 'project_selection' | 'workspace';

export function App() {
  const [appState, setAppState] = useState<AppState>('login');
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
  const [availableWorkspaces, setAvailableWorkspaces] = useState<Workspace[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);

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

  // Initial session check on application start
  useEffect(() => {
    const initSession = async () => {
      try {
        const users = await fetchAvailableUsers().catch(() => []);
        setAvailableUsers(users);

        const meRes = await fetchCurrentUser().catch(() => null);
        if (meRes?.user) {
          setCurrentUser(meRes.user);
          const wsList = await fetchWorkspaces().catch(() => []);
          setAvailableWorkspaces(wsList);

          if (meRes.active_workspace) {
            setActiveWorkspace(meRes.active_workspace);
            setAppState('workspace');
            await loadWorkspaceData();
          } else {
            setAppState('project_selection');
          }
        } else {
          setAppState('login');
        }
      } catch {
        setAppState('login');
      }
    };
    initSession();
  }, []);

  // Load all operational safety intelligence data for active workspace
  const loadWorkspaceData = async () => {
    setLoading(true);
    try {
      const [
        summaryRes,
        incidentsRes,
        queueRes,
        hotspotsRes,
        actionsRes,
        enginesRes,
        auditRes,
        sysLogsRes,
      ] = await Promise.all([
        fetchDashboardSummary().catch(() => null),
        fetchIncidents().catch(() => []),
        fetchReviewQueue().catch(() => []),
        fetchHotspots().catch(() => []),
        fetchActions().catch(() => []),
        fetchEnginesStatus().catch(() => null),
        fetchAuditLogs().catch(() => []),
        fetchSystemLogs().catch(() => []),
      ]);

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

  // --- Auth Handlers ---
  const handleLogin = async (employeeId: string, password?: string) => {
    const res = await loginUser(employeeId, password);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      const wsList = await fetchWorkspaces().catch(() => []);
      setAvailableWorkspaces(wsList);
      setAppState('project_selection');
    }
  };

  const handleSelectWorkspace = async (workspaceId: string) => {
    const res = await selectWorkspace(workspaceId);
    if (res.success && res.workspace) {
      setActiveWorkspace(res.workspace);
      setAppState('workspace');
      await loadWorkspaceData();
    }
  };

  const handleSwitchProject = () => {
    setAppState('project_selection');
  };

  const handleLogout = async () => {
    await logoutUser().catch(() => null);
    setCurrentUser(null);
    setActiveWorkspace(null);
    setAppState('login');
  };

  // --- Workspace Actions ---
  const handleAnalyzeQuick = async (text: string) => {
    const report = await analyzeReport(text);
    setSelectedIncident(report);
    await loadWorkspaceData();
  };

  const handleSeedData = async () => {
    await seedSampleReports();
    await loadWorkspaceData();
  };

  const handleUploadFile = async (file: File) => {
    const res = await uploadDocument(file);
    await loadWorkspaceData();
    return res;
  };

  const handleReviewDecide = async (id: string, decision: any) => {
    await submitReviewDecision(id, decision);
    await loadWorkspaceData();
  };

  const handleCreateAction = async (action: Omit<SafetyAction, 'id' | 'created_at'>) => {
    await createAction(action);
    await loadWorkspaceData();
  };

  const handleUpdateActionStatus = async (id: string, status: SafetyAction['status']) => {
    await updateAction(id, { status });
    await loadWorkspaceData();
  };

  const handleTrainModel = async () => {
    const res = await triggerModelTraining();
    await loadWorkspaceData();
    return res;
  };

  // --- Render based on Flow State ---

  if (appState === 'login') {
    return <LoginScreen onLogin={handleLogin} availableUsers={availableUsers} />;
  }

  if (appState === 'project_selection' && currentUser) {
    return (
      <ProjectSelectionScreen
        workspaces={availableWorkspaces}
        currentUser={currentUser}
        onSelectWorkspace={handleSelectWorkspace}
        onLogout={handleLogout}
      />
    );
  }

  const getPageInfo = () => {
    switch (activeTab) {
      case 'dashboard':
        return {
          title: 'HSE Executive Dashboard',
          subtitle: `${activeWorkspace?.name || 'SENTRA'} · SIF Intelligence Overview`,
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
        onOpenUserModal={() => setAppState('project_selection')}
        reviewCount={reviewQueue.length}
        openActionsCount={actions.filter((a) => a.status !== 'Closed' && a.status !== 'Verified').length}
      />

      <div className="main-wrapper">
        <Navbar
          title={pageInfo.title}
          subtitle={pageInfo.subtitle}
          currentUser={currentUser}
          activeWorkspace={activeWorkspace}
          onRefresh={loadWorkspaceData}
          onSwitchProject={handleSwitchProject}
          onLogout={handleLogout}
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
    </div>
  );
}

export default App;
