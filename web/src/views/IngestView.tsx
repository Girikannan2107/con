import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  FileSpreadsheet,
  Image,
  CheckCircle2,
  AlertCircle,
  Play,
  Globe,
  Languages,
} from 'lucide-react';
import { IncidentReport } from '../types';

interface Props {
  onUploadFile: (file: File) => Promise<{ filename: string; ingested_count: number; reports: IncidentReport[] }>;
  onAnalyzeText: (text: string) => Promise<void>;
  onNavigateTab: (tab: any) => void;
}

export const IngestView: React.FC<Props> = ({
  onUploadFile,
  onAnalyzeText,
  onNavigateTab,
}) => {
  const [pasteText, setPasteText] = useState('');
  const [analyzingText, setAnalyzingText] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    filename: string;
    ingested_count: number;
    reports: IncidentReport[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePasteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pasteText.trim() || analyzingText) return;
    setAnalyzingText(true);
    setError(null);
    try {
      await onAnalyzeText(pasteText);
      setPasteText('');
      onNavigateTab('incidents');
    } catch (err: any) {
      setError(err.message || 'Analysis failed');
    } finally {
      setAnalyzingText(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    setUploadResult(null);
    try {
      const res = await onUploadFile(file);
      setUploadResult(res);
    } catch (err: any) {
      setError(err.message || 'Upload & OCR processing failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: 960 }}>
      {/* OCR & Ingest Header Notice */}
      <div
        className="panel"
        style={{
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(15, 23, 42, 0.9) 100%)',
          border: '1px solid rgba(6, 182, 212, 0.3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <Globe size={20} style={{ color: 'var(--accent-cyan)' }} />
          <div style={{ fontWeight: 700, fontSize: '1rem' }}>
            Multilingual Ingestion & OCR Intelligence Gateway
          </div>
        </div>
        <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
          Ingest safety reports from raw field exports (CSV), scanned permit documents (PDF), shift
          handover logs, and site photos. Supports 12 languages with native script parsing and
          lexical domain normalization.
        </p>
      </div>

      {error && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid #EF4444',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            color: '#FCA5A5',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Grid: File Upload vs Text Paste */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        {/* Document & File Upload Box */}
        <div className="panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="panel-header">
            <div className="panel-title">
              <UploadCloud size={18} style={{ color: 'var(--accent-cyan)' }} />
              <span>Upload Safety Documents</span>
            </div>
          </div>

          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: '2px dashed var(--border-medium)',
              borderRadius: '10px',
              padding: '2.5rem 1.5rem',
              textAlign: 'center',
              cursor: 'pointer',
              background: '#090E1A',
              transition: 'all 0.2s',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.75rem',
              flex: 1,
              justifyContent: 'center',
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.pdf,.png,.jpg,.jpeg,.txt,.log"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'var(--accent-cyan-glow)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-cyan)',
              }}
            >
              <UploadCloud size={24} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                {uploading ? 'Processing OCR & Ingestion...' : 'Click to upload files'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                CSV exports, Scanned PDFs, Site photos (PNG, JPG), Text logs
              </div>
            </div>
          </div>
        </div>

        {/* Manual Text Paste & Translation Box */}
        <div className="panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="panel-header">
            <div className="panel-title">
              <FileText size={18} style={{ color: 'var(--accent-cyan)' }} />
              <span>Direct Observation Entry</span>
            </div>
          </div>

          <form
            onSubmit={handlePasteSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}
          >
            <textarea
              placeholder="Paste raw UA/UC report, near-miss observation, or multilingual description..."
              rows={7}
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              style={{ flex: 1, resize: 'none' }}
            />

            <button
              type="submit"
              className="btn btn-primary"
              disabled={analyzingText || !pasteText.trim()}
              style={{ alignSelf: 'flex-end' }}
            >
              <Play size={14} />
              <span>{analyzingText ? 'Analyzing...' : 'Ingest & Triage'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Upload Success Report Table */}
      {uploadResult && (
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title" style={{ color: '#10B981' }}>
              <CheckCircle2 size={18} />
              <span>
                Successfully Ingested {uploadResult.ingested_count} Observations from{' '}
                {uploadResult.filename}
              </span>
            </div>
            <button
              className="btn btn-secondary"
              onClick={() => onNavigateTab('incidents')}
              style={{ fontSize: '0.75rem' }}
            >
              Open Incident Forensics
            </button>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Extracted Narrative</th>
                  <th>SIF Status</th>
                  <th>Risk Band</th>
                  <th>IOGP Rule</th>
                </tr>
              </thead>
              <tbody>
                {uploadResult.reports.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>{r.id}</td>
                    <td style={{ maxWidth: 360, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {r.raw_text}
                    </td>
                    <td>
                      {r.sif_potential ? (
                        <span className="badge badge-sif">SIF Precursor</span>
                      ) : (
                        <span className="badge badge-neutral">UA/UC</span>
                      )}
                    </td>
                    <td>{r.risk_band}</td>
                    <td>{r.iogp_rule}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
