import React, { useState } from 'react';
import { Cpu, RefreshCw, BarChart2, ShieldCheck, Play, Award, CheckCircle2 } from 'lucide-react';
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
      setError(err.message || 'Training failed');
    } finally {
      setTraining(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: 960 }}>
      {/* Engines Banner */}
      <div className="panel" style={{ marginBottom: 0 }}>
        <div className="panel-header" style={{ marginBottom: 0 }}>
          <div>
            <div className="panel-title">
              <Cpu size={18} style={{ color: 'var(--accent-cyan)' }} />
              <span>Safety Intelligence Engines & MLOps Infrastructure</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
              Runtime status of sentence transformer encoders, PaddleOCR, deterministic safety rules,
              and XGBoost learning layers.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #EF4444', padding: '0.75rem', borderRadius: '8px', color: '#FCA5A5', fontSize: '0.85rem' }}>
          {error}
        </div>
      )}

      {/* Engine Status Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {/* Semantic Encoder */}
        <div className="panel" style={{ marginBottom: 0 }}>
          <div className="panel-header">
            <div className="panel-title">Semantic Sentence Transformer</div>
            <span className="badge badge-low">Online</span>
          </div>
          <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div>Engine Type: <strong>{status?.encoder.type || 'TransformerEncoder'}</strong></div>
            <div>Vector Embedding Dimension: <strong>{status?.encoder.dim || 384}d</strong></div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
              Maps report semantics to IOGP Life-Saving Rule prototype vectors.
            </div>
          </div>
        </div>

        {/* OCR Engine */}
        <div className="panel" style={{ marginBottom: 0 }}>
          <div className="panel-header">
            <div className="panel-title">Document & Image OCR Engine</div>
            <span className="badge badge-low">
              {status?.ocr.paddle_installed ? 'PaddleOCR Active' : 'Native Parser'}
            </span>
          </div>
          <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div>Engine Status: <strong>{status?.ocr.status || 'Active'}</strong></div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
              Languages: {status?.ocr.supported_languages?.slice(0, 8).join(', ')}...
            </div>
          </div>
        </div>
      </div>

      {/* Supervised XGBoost MLOps Panel */}
      <div className="panel">
        <div className="panel-header">
          <div>
            <div className="panel-title">
              <BarChart2 size={18} style={{ color: 'var(--accent-cyan)' }} />
              <span>Learned Supervised Model (XGBoost 3rd Opinion)</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
              Feature dimension: 46 named features · MLflow: {status?.mlops.tracking_uri || 'sqlite:///mlflow.db'}
            </div>
          </div>

          <button className="btn btn-primary" onClick={handleTrain} disabled={training}>
            <Play size={14} />
            <span>{training ? 'Training Model...' : 'Train Model on Corpus'}</span>
          </button>
        </div>

        {trainResult ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10B981', fontWeight: 700, fontSize: '0.9rem' }}>
              <CheckCircle2 size={18} />
              <span>Successfully trained model on {trainResult.num_samples} samples!</span>
            </div>

            {/* Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
              {Object.entries(trainResult.metrics).map(([k, v]) => (
                <div key={k} style={{ background: '#090E1A', padding: '0.65rem', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{k}</div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--accent-cyan)' }}>
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
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', background: '#0B1220', padding: '0.4rem 0.6rem', borderRadius: '4px' }}>
                      <span>{feat}</span>
                      <strong style={{ color: 'var(--accent-cyan)' }}>{(score * 100).toFixed(1)}%</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            The XGBoost model trains over 46 domain features (energy severity, barrier criticality, rule one-hot,
            text stats) using stratified cross-validation. Click "Train Model on Corpus" to fit and log to MLflow.
          </div>
        )}
      </div>
    </div>
  );
};
