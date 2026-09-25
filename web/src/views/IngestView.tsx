import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Play,
  ArrowRight,
  Languages,
  Layers,
  FileSpreadsheet,
  FileCode,
} from 'lucide-react';
import { IncidentReport } from '../types';

interface Props {
  onUploadFile: (file: File) => Promise<{ filename: string; ingested_count: number; reports: IncidentReport[] }>;
  onAnalyzeText: (text: string) => Promise<void>;
  onNavigateTab: (tab: any) => void;
}

interface IngestedDoc {
  id: string;
  filename: string;
  type: string;
  pages: number | string;
  language: string;
  ocrEngine: string;
  stage: 'Upload' | 'OCR' | 'Extract' | 'Translate' | 'Analyse' | 'Review' | 'Completed' | 'Failed';
  status: 'Completed' | 'Analysing' | 'Awaiting review' | 'Processing';
  extractedCount: number;
}

export const IngestView: React.FC<Props> = ({
  onUploadFile,
  onAnalyzeText,
  onNavigateTab,
}) => {
  const [pasteText, setPasteText] = useState('');
  const [analyzingText, setAnalyzingText] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Document history table
  const [docs, setDocs] = useState<IngestedDoc[]>([
    {
      id: 'DOC-901',
      filename: 'Field_NearMiss_Daily_Log_Assam.csv',
      type: 'CSV Batch',
      pages: '12 rows',
      language: 'English / Assamese',
      ocrEngine: 'Native Parser',
      stage: 'Completed',
      status: 'Completed',
      extractedCount: 5,
    },
    {
      id: 'DOC-902',
      filename: 'Rig14_Scaffold_WorkPermit_Scan.pdf',
      type: 'Scanned PDF',
      pages: '2 pages',
      language: 'English',
      ocrEngine: 'PaddleOCR Multilingual',
      stage: 'Review',
      status: 'Awaiting review',
      extractedCount: 2,
    },
    {
      id: 'DOC-903',
      filename: 'Substation_LOTO_Inspection_Log.png',
      type: 'Image OCR',
      pages: '1 photo',
      language: 'Hindi / English',
      ocrEngine: 'PaddleOCR Vision',
      stage: 'Completed',
      status: 'Completed',
      extractedCount: 1,
    },
  ]);

  const [uploadResult, setUploadResult] = useState<{
    filename: string;
    ingested_count: number;
    reports: IncidentReport[];
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePasteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pasteText.trim() || analyzingText) return;
    setAnalyzingText(true);
    setError(null);
    try {
      await onAnalyzeText(pasteText);
      const newDoc: IngestedDoc = {
        id: `DOC-${900 + docs.length + 1}`,
        filename: 'Direct_Narrative_Entry.txt',
        type: 'Text Entry',
        pages: '1 entry',
        language: 'English / Multilingual',
        ocrEngine: 'Neural NLP Parser',
        stage: 'Completed',
        status: 'Completed',
        extractedCount: 1,
      };
      setDocs((prev) => [newDoc, ...prev]);
      setPasteText('');
      onNavigateTab('incidents');
    } catch (err: any) {
      setError(err.message || 'Observation analysis failed');
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

    const tempDocId = `DOC-${900 + docs.length + 1}`;
    const pendingDoc: IngestedDoc = {
      id: tempDocId,
      filename: file.name,
      type: file.name.endsWith('.csv') ? 'CSV Batch' : file.name.endsWith('.pdf') ? 'Scanned PDF' : 'Image OCR',
      pages: 'Processing...',
      language: 'Auto-detecting',
      ocrEngine: 'PaddleOCR / Parser',
      stage: 'OCR',
      status: 'Processing',
      extractedCount: 0,
    };
    setDocs((prev) => [pendingDoc, ...prev]);

    try {
      const res = await onUploadFile(file);
      setUploadResult(res);
      setDocs((prev) =>
        prev.map((d) =>
          d.id === tempDocId
            ? {
                ...d,
                pages: `${res.ingested_count} records`,
                stage: 'Completed',
                status: 'Completed',
                extractedCount: res.ingested_count,
              }
            : d
        )
      );
    } catch (err: any) {
      setError(err.message || 'Upload and OCR processing failed');
      setDocs((prev) =>
        prev.map((d) =>
          d.id === tempDocId ? { ...d, stage: 'Failed', status: 'Processing' } : d
        )
      );
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="ingest-container">
      {/* 1. 6-Stage Workflow Stepper */}
      <div className="ingest-stages-card">
        <div className="stages-header">
          <span className="stages-title">SENTRA INGESTION & FORENSIC PIPELINE</span>
          <span className="stages-subtitle">12 Indian Languages + Scanned Permitting Docs</span>
        </div>

        <div className="stages-stepper-row">
          <div className="stage-step active">
            <div className="step-num">1</div>
            <div className="step-text">
              <strong>Upload</strong>
              <span>CSV / PDF / Img</span>
            </div>
          </div>
          <ArrowRight size={14} className="step-connector" />

          <div className="stage-step active">
            <div className="step-num">2</div>
            <div className="step-text">
              <strong>OCR</strong>
              <span>PaddleOCR Vision</span>
            </div>
          </div>
          <ArrowRight size={14} className="step-connector" />

          <div className="stage-step active">
            <div className="step-num">3</div>
            <div className="step-text">
              <strong>Extract</strong>
              <span>Observation Blocks</span>
            </div>
          </div>
          <ArrowRight size={14} className="step-connector" />

          <div className="stage-step active">
            <div className="step-num">4</div>
            <div className="step-text">
              <strong>Translate</strong>
              <span>Lexical Normalization</span>
            </div>
          </div>
          <ArrowRight size={14} className="step-connector" />

          <div className="stage-step active">
            <div className="step-num">5</div>
            <div className="step-text">
              <strong>Analyse</strong>
              <span>SIF Precursor AI</span>
            </div>
          </div>
          <ArrowRight size={14} className="step-connector" />

          <div className="stage-step">
            <div className="step-num">6</div>
            <div className="step-text">
              <strong>Review</strong>
              <span>Human HSE Sign-off</span>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="ingest-error-alert">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* 2. Ingest Action Grid: File Upload vs Direct Text */}
      <div className="ingest-action-grid">
        {/* Upload Zone */}
        <div className="ingest-card">
          <div className="card-header-clean">
            <UploadCloud size={16} className="text-accent" />
            <h2 className="card-heading-clean">Document Upload & Batch Ingestion</h2>
          </div>

          <div
            className={`dropzone-box ${uploading ? 'uploading' : ''}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.pdf,.png,.jpg,.jpeg,.txt,.log"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <div className="dropzone-icon-wrap">
              <UploadCloud size={24} />
            </div>
            <div className="dropzone-text-group">
              <strong className="dropzone-prompt">
                {uploading ? 'Processing OCR Extraction...' : 'Drag and drop files here, or browse'}
              </strong>
              <span className="dropzone-sub">
                Supported formats: CSV batch logs, scanned PDF permits, PNG/JPG photos, TXT/LOG
              </span>
            </div>
          </div>
        </div>

        {/* Manual Text Ingestion */}
        <div className="ingest-card">
          <div className="card-header-clean">
            <FileText size={16} className="text-accent" />
            <h2 className="card-heading-clean">Direct Observation Intake</h2>
          </div>

          <form onSubmit={handlePasteSubmit} className="direct-entry-form">
            <textarea
              placeholder="Paste observation narrative or multilingual shift log (e.g. Scaffolding clamp unhooked at Rig #3 wellhead)..."
              rows={6}
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              disabled={analyzingText}
            />
            <div className="direct-entry-footer">
              <span className="entry-hint">
                <Languages size={13} /> Auto-normalizes Assamese, Hindi, Bengali, Tamil & 8 others
              </span>
              <button
                type="submit"
                className="btn-primary-sentra"
                disabled={analyzingText || !pasteText.trim()}
              >
                <Play size={13} /> {analyzingText ? 'Analyzing...' : 'Run Pipeline'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 3. Document Processing Table */}
      <div className="ingest-table-card">
        <div className="table-card-header">
          <div className="table-title-group">
            <Layers size={16} />
            <h3>Document Processing & Ingestion Ledger</h3>
          </div>
          <span className="table-meta-count">{docs.length} Documents Processed</span>
        </div>

        <div className="table-wrapper">
          <table className="sentra-table">
            <thead>
              <tr>
                <th>REF ID</th>
                <th>FILE / SOURCE</th>
                <th>TYPE</th>
                <th>PAGES / RECORDS</th>
                <th>LANGUAGE</th>
                <th>OCR ENGINE</th>
                <th>STAGE</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((d) => (
                <tr key={d.id}>
                  <td className="font-mono font-bold text-accent">{d.id}</td>
                  <td>
                    <div className="file-cell">
                      {d.type.includes('CSV') ? (
                        <FileSpreadsheet size={15} className="text-green" />
                      ) : d.type.includes('PDF') ? (
                        <FileText size={15} className="text-red" />
                      ) : (
                        <FileCode size={15} className="text-blue" />
                      )}
                      <span className="filename-text">{d.filename}</span>
                    </div>
                  </td>
                  <td>{d.type}</td>
                  <td>{d.pages}</td>
                  <td>{d.language}</td>
                  <td>
                    <span className="engine-tag">{d.ocrEngine}</span>
                  </td>
                  <td>
                    <span className={`stage-badge stage-${d.stage.toLowerCase()}`}>
                      {d.stage}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`status-badge ${
                        d.status === 'Completed'
                          ? 'live'
                          : d.status === 'Awaiting review'
                          ? 'warning'
                          : 'processing'
                      }`}
                    >
                      ● {d.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
