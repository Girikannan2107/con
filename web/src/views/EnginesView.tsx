import React, { useState } from 'react';
import { Cpu, BarChart2, Play, CheckCircle2, RefreshCw } from 'lucide-react';
import { EngineStatus } from '../types';

interface Props {
  status: EngineStatus | null;
  onTrainModel: () => Promise<{
    success: boolean;
    metrics: Record<string, number>;
    feature_importances: Array<[string, number]>;
    num_samples: number;
  }>;
}

export const EnginesView: React.FC<Props> = ({ status, onTrainModel }) => {
  const [training, setTraining] = useState(false);
  const [trainResult, setTrainResult] = useState<{
    metrics: Record<string, number>;
    feature_importances: Array<[string, number]>;
    num_samples: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTrain = async () => {
    setTraining(true);
    setError(null);
    try {
      const res = await onTrainModel();
      setTrainResult(res);
    } catch (err: any) {
      setError(err.message || 'Model training failed');
    } finally {
      setTraining(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Engines Header */}
      <div className="panel" style={{ marginBottom: 0 }}>
        <div className="panel-header" style={{ marginBottom: 0 }}>
          <div>
            <div className="panel-title">
              <Cpu size={18} className="text-red" />
              <span>Safety Intelligence Engines & MLOps Architecture</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--oil-text-secondary)', marginTop: 2 }}>
              Runtime status of sentence transformer encoders, PaddleOCR, deterministic rules, and XGBoost supervised retraining.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="login-error-alert">
          {error}
        </div>
      )}

      {/* Engine Status Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {/* Semantic Encoder */}
        <div className="panel" style={{ marginBottom: 0 }}>
          <div className="panel-header">
            <div className="panel-title">Semantic Sentence Transformer</div>
            <span className="badge badge-low">Online · CPU</span>
          </div>
          <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div>Engine Type: <strong>{status?.encoder.type || 'all-MiniLM-L6-v2'}</strong></div>
            <div>Vector Dimension: <strong>{status?.encoder.dim || 384}d Dense Embeddings</strong></div>
            <div style={{ color: 'var(--oil-text-secondary)', fontSize: '0.75rem' }}>
              Maps report semantics to IOGP Life-Saving Rule prototype vectors in real-time.
            </div>
          </div>
        </div>

        {/* OCR Engine */}
        <div className="panel" style={{ marginBottom: 0 }}>
          <div className="panel-header">
            <div className="panel-title">Document & Image OCR Engine</div>
            <span className="badge badge-low">
              {status?.ocr.paddle_installed ? 'PaddleOCR Active' : 'Native Parser Active'}
            </span>
          </div>
          <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div>Status: <strong>{status?.ocr.status || 'Active'}</strong></div>
            <div>Languages: <strong>{status?.ocr.supported_languages?.slice(0, 6).join(', ')} + 6 others</strong></div>
            <div style={{ color: 'var(--oil-text-secondary)', fontSize: '0.75rem' }}>
              Multilingual Optical Character Recognition across English and Indian regional scripts.
            </div>
          </div>
        </div>
      </div>

      {/* Supervised XGBoost MLOps Panel */}
      <div className="panel">
        <div className="panel-header">
          <div>
            <div className="panel-title">
              <BarChart2 size={18} className="text-red" />
              <span>Learned Supervised Model (XGBoost 3rd Opinion)</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--oil-text-secondary)', marginTop: 2 }}>
              Feature dimension: 46 engineered safety features · Tracking: {status?.mlops.tracking_uri || 'sqlite:///mlflow.db'}
            </div>
          </div>

          <button className="btn-primary-sentra" onClick={handleTrain} disabled={training}>
            <Play size={14} />
            <span>{training ? 'Training Model...' : 'Train Model on Ingested Corpus'}</span>
          </button>
        </div>

        {trainResult ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--status-low)', fontWeight: 700, fontSize: '0.9rem' }}>
              <CheckCircle2 size={18} />
              <span>Model training complete on {trainResult.num_samples} sample observations!</span>
            </div>

            {/* Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
              {Object.entries(trainResult.metrics).map(([k, v]) => (
                <div key={k} style={{ background: 'var(--oil-off-white)', border: '1px solid var(--oil-border)', padding: '0.65rem', borderRadius: 4 }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--oil-text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>{k}</div>
                  <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--oil-red)' }}>
                    {typeof v === 'number' ? v.toFixed(3) : v}
                  </div>
                </div>
              ))}
            </div>

            {/* Top Feature Importances */}
            {trainResult.feature_importances && trainResult.feature_importances.length > 0 && (
              <div>
                <div className="kpi-label" style={{ marginBottom: '0.5rem' }}>
                  Top Interpretable Feature Importances
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {trainResult.feature_importances.map(([feat, score], i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', background: 'var(--oil-off-white)', border: '1px solid var(--oil-light-gray)', padding: '0.4rem 0.6rem', borderRadius: 4 }}>
                      <span>{feat}</span>
                      <strong style={{ color: 'var(--oil-red)' }}>{(score * 100).toFixed(1)}%</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ fontSize: '0.8rem', color: 'var(--oil-text-secondary)', lineHeight: 1.4 }}>
            The XGBoost model trains over 46 domain features (energy severity, barrier criticality, rule one-hot,
            text stats) using stratified cross-validation. Click "Train Model on Ingested Corpus" to fit and log to MLflow.
          </div>
        )}
      </div>
    </div>
  );
};
