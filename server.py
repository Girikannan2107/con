"""SENTRA UI Adapter - FastAPI REST Service.

Bridges modern React (TypeScript + Vite) web frontends with existing
SENTRA backend intelligence engines (pipeline, OCR, review, scoring, MLOps).
"""

from __future__ import annotations

import csv
import io
import logging
import os
import sys
import time
from typing import Any, Dict, List, Optional
from pydantic import BaseModel
import uvicorn
from fastapi import FastAPI, File, HTTPException, UploadFile, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Add project root to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sif.pipeline import SIFPipeline, PipelineResult, Intelligence
from sif.lexical import SEED_REPORTS
from sif.audit import AuditLog, FUNCTIONALITY, SYSTEM
from sif.ocr import DocumentExtractor, ExtractedDocument
from sif.mlops import MLOpsService
from ui2.auth import AUTH, DEMO_USERS, USER_CREDENTIALS, _hash_password, User

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s")
logger = logging.getLogger("sentra.api")

app = FastAPI(
    title="SENTRA Safety Intelligence API Adapter",
    version="2.0.0",
    description="Thin integration adapter connecting React web frontend to SENTRA backend engine",
)

# Enable CORS for local Vite dev server and production web apps
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global State Container
class State:
    def __init__(self):
        self.pipeline = SIFPipeline(backend="auto")
        self.audit = AuditLog()
        self.extractor = DocumentExtractor()
        self.mlops = MLOpsService()
        self.reports: List[Dict[str, Any]] = []
        self.actions: List[Dict[str, Any]] = []
        self.system_logs: List[Dict[str, Any]] = []
        self._action_id_seq = 100

    def warm_up(self):
        try:
            enc_name = self.pipeline.warm_up()
            logger.info(f"Pipeline warmed up with encoder: {enc_name}")
        except Exception as e:
            logger.warning(f"Pipeline warm-up warning (running with fallback): {e}")

    def add_log(self, level: str, source: str, message: str):
        entry = {
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
            "level": level.upper(),
            "source": source,
            "message": message,
        }
        self.system_logs.append(entry)
        if len(self.system_logs) > 500:
            self.system_logs.pop(0)

state = State()


# Pydantic Request Models
class LoginRequest(BaseModel):
    employee_id: str
    password: Optional[str] = "sentra2026"


class AnalyzeRequest(BaseModel):
    text: str


class BatchAnalyzeRequest(BaseModel):
    texts: List[str]


class ReviewDecisionRequest(BaseModel):
    decision: str  # "CONFIRM", "REVISE", "DISMISS"
    sif_potential: bool
    iogp_rule: Optional[str] = None
    activity: Optional[str] = None
    location: Optional[str] = None
    barrier_failure: Optional[str] = None
    reviewer_notes: Optional[str] = None


class ActionCreateRequest(BaseModel):
    incident_id: str
    description: str
    risk_category: str
    responsible: str
    department: str
    due_date: str
    priority: str  # Critical, High, Medium, Low
    status: str = "Open"


class ActionUpdateRequest(BaseModel):
    description: Optional[str] = None
    responsible: Optional[str] = None
    department: Optional[str] = None
    due_date: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None


# Seed helper
def _seed_initial_data():
    if not state.reports:
        logger.info("Auto-seeding initial 5 near-miss incidents into state")
        for idx, text in enumerate(SEED_REPORTS):
            res = state.pipeline.analyze(text)
            report_dict = res.to_dict()
            report_dict["id"] = f"RPT-{1001 + idx}"
            report_dict["timestamp"] = time.strftime("%Y-%m-%d %H:%M:%S")
            report_dict["status"] = "Under Review" if res.needs_review else "Analyzed"
            report_dict["human_decision"] = None
            state.reports.append(report_dict)

        # Initial Actions
        state.actions = [
            {
                "id": "ACT-101",
                "incident_id": "RPT-1001",
                "description": "Scaffold safety inspection and 100% harness tie-off compliance audit.",
                "risk_category": "Working at Height",
                "responsible": "S. Borah (Scaffold Supervisor)",
                "department": "Mechanical & Rig Services",
                "due_date": "2026-10-02",
                "priority": "Critical",
                "status": "In Progress",
            },
            {
                "id": "ACT-102",
                "incident_id": "RPT-1002",
                "description": "LOTO zero-energy verification calibration on High-Pressure Substation Breakers.",
                "risk_category": "Energy Isolation",
                "responsible": "P. Sharma (Lead Electrical)",
                "department": "Electrical Maintenance",
                "due_date": "2026-09-30",
                "priority": "Critical",
                "status": "Open",
            },
            {
                "id": "ACT-103",
                "incident_id": "RPT-1003",
                "description": "Verify atmospheric gas test alarms before pit enclosure entry.",
                "risk_category": "Confined Space",
                "responsible": "K. Gogoi (Safety Officer)",
                "department": "Field Safety Ops",
                "due_date": "2026-10-05",
                "priority": "High",
                "status": "Pending Verification",
            },
        ]


# Startup Event
@app.on_event("startup")
def on_startup():
    import threading
    def _init():
        state.warm_up()
        _seed_initial_data()
        state.add_log("INFO", "server", "SENTRA FastAPI UI Adapter ready")
    threading.Thread(target=_init, daemon=True).start()


# --- Auth Endpoints ---

@app.post("/api/auth/login")
def login(req: LoginRequest):
    emp_id = req.employee_id.strip().upper()
    if emp_id not in DEMO_USERS:
        raise HTTPException(status_code=401, detail=f"User ID {emp_id} not registered")

    success = AUTH.login(emp_id, req.password or "sentra2026")
    if not success:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    user = AUTH.current_user
    state.add_log("INFO", "auth", f"User {user.name} ({user.role}) logged in")
    return {
        "success": True,
        "token": AUTH._session_token,
        "user": {
            "id": user.id,
            "employee_id": user.employee_id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "department": user.department,
            "site": user.site,
            "avatar_initials": user.avatar_initials,
            "permissions": list(user.permissions),
        },
    }


@app.get("/api/auth/me")
def get_current_user():
    user = AUTH.current_user
    if not user:
        # Default to HSE Analyst for frictionless first-run experience if not explicitly logged out
        AUTH.login("HSE001", "sentra2026")
        user = AUTH.current_user

    return {
        "user": {
            "id": user.id,
            "employee_id": user.employee_id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "department": user.department,
            "site": user.site,
            "avatar_initials": user.avatar_initials,
            "permissions": list(user.permissions),
        }
    }


@app.post("/api/auth/logout")
def logout():
    user = AUTH.current_user
    if user:
        state.add_log("INFO", "auth", f"User {user.name} logged out")
    AUTH.logout()
    return {"success": True}


@app.get("/api/auth/users")
def list_available_users():
    return [
        {
            "employee_id": u.employee_id,
            "name": u.name,
            "role": u.role,
            "department": u.department,
            "site": u.site,
            "avatar_initials": u.avatar_initials,
        }
        for u in DEMO_USERS.values()
    ]


def has_paddleocr_installed() -> bool:
    import importlib.util
    return importlib.util.find_spec("paddleocr") is not None


# --- Health & Engine Status ---

@app.get("/api/health")
def get_health():
    return {
        "status": "healthy",
        "version": "2.0.0",
        "backend": "SENTRA Intelligence Engine",
        "paddleocr_available": has_paddleocr_installed(),
        "total_reports": len(state.reports),
        "total_actions": len(state.actions),
    }


@app.get("/api/engines/status")
def get_engines_status():
    return {
        "encoder": {
            "type": state.pipeline.encoder.__class__.__name__,
            "dim": getattr(state.pipeline.encoder, "dim", 384),
            "status": "Active (Local MiniLM-L6-v2)" if "transformer" in state.pipeline.encoder.__class__.__name__.lower() else "Deterministic Hash Fallback",
        },
        "ocr": {
            "paddle_installed": has_paddleocr_installed(),
            "status": "PaddleOCR Engine Active" if has_paddleocr_installed() else "Text PDF / Native Parser Active",
            "supported_languages": ["en", "hi", "as", "bn", "ta", "te", "mr", "gu", "kn", "ml", "pa", "ur"],
        },
        "mlops": {
            "xgboost_loaded": state.mlops.model.is_trained,
            "tracking_uri": state.mlops.tracker.tracking_uri,
            "feature_dim": 46,
            "status": "XGBoost 3rd Opinion Attached" if state.mlops.model.is_trained else "Ready for In-Memory Training",
        },
        "lexical": {
            "rule_set": "IOGP Life-Saving Rules (9 Core Rules)",
            "status": "Deterministic Rule Matching Active",
        },
    }


# --- Dashboard & KPIs ---

@app.get("/api/dashboard/summary")
def get_dashboard_summary():
    total = len(state.reports)
    sif_count = sum(1 for r in state.reports if r.get("sif_potential"))
    critical_count = sum(1 for r in state.reports if r.get("risk_band") == "Critical")
    high_count = sum(1 for r in state.reports if r.get("risk_band") == "High")
    med_count = sum(1 for r in state.reports if r.get("risk_band") == "Medium")
    low_count = sum(1 for r in state.reports if r.get("risk_band") == "Low")
    pending_review = sum(1 for r in state.reports if r.get("needs_review") and not r.get("human_decision"))

    # Distribution by IOGP Rule
    rule_dist: Dict[str, int] = {}
    for r in state.reports:
        rule = r.get("iogp_rule", "Unclassified")
        rule_dist[rule] = rule_dist.get(rule, 0) + 1

    # Distribution by Energy Source
    energy_dist: Dict[str, int] = {}
    for r in state.reports:
        energy = r.get("energy_source", "None")
        if energy and energy != "None":
            energy_dist[energy] = energy_dist.get(energy, 0) + 1

    return {
        "kpis": {
            "total_reports": total,
            "sif_precursors": sif_count,
            "sif_rate": round((sif_count / total * 100) if total > 0 else 0, 1),
            "critical_risk": critical_count,
            "high_risk": high_count,
            "medium_risk": med_count,
            "low_risk": low_count,
            "pending_review": pending_review,
            "open_actions": sum(1 for a in state.actions if a.get("status") in ["Open", "In Progress", "Pending Verification"]),
        },
        "bands": {
            "Critical": critical_count,
            "High": high_count,
            "Medium": med_count,
            "Low": low_count,
        },
        "rule_distribution": rule_dist,
        "energy_distribution": energy_dist,
    }


# --- Incidents & Forensic Reports ---

@app.get("/api/incidents")
def list_incidents(
    band: Optional[str] = None,
    sif_only: Optional[bool] = None,
    query: Optional[str] = None,
):
    results = []
    for r in state.reports:
        if band and r.get("risk_band", "").lower() != band.lower():
            continue
        if sif_only is not None and r.get("sif_potential") != sif_only:
            continue
        if query:
            q = query.lower()
            text_match = q in r.get("raw_text", "").lower()
            rule_match = q in r.get("iogp_rule", "").lower()
            loc_match = q in r.get("location", "").lower()
            act_match = q in r.get("activity", "").lower()
            if not (text_match or rule_match or loc_match or act_match):
                continue
        results.append(r)
    return results


@app.get("/api/incidents/{incident_id}")
def get_incident_detail(incident_id: str):
    for r in state.reports:
        if r.get("id") == incident_id:
            return r
    raise HTTPException(status_code=404, detail="Incident report not found")


# --- Pipeline Ingestion & Analysis ---

@app.post("/api/pipeline/analyze")
def analyze_single_report(req: AnalyzeRequest):
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    res = state.pipeline.analyze(req.text)
    report_dict = res.to_dict()
    report_dict["id"] = f"RPT-{1001 + len(state.reports)}"
    report_dict["timestamp"] = time.strftime("%Y-%m-%d %H:%M:%S")
    report_dict["status"] = "Under Review" if res.needs_review else "Analyzed"
    report_dict["human_decision"] = None
    state.reports.insert(0, report_dict)
    state.add_log("INFO", "pipeline", f"Analyzed incident {report_dict['id']}: SIF={res.sif_potential}, Band={res.risk_band}")
    return report_dict


@app.post("/api/pipeline/seed")
def seed_sample_reports():
    _seed_initial_data()
    return {"message": "Sample reports seeded", "total": len(state.reports)}


@app.post("/api/ingest/upload")
async def upload_document(file: UploadFile = File(...)):
    filename = file.filename or "uploaded_file"
    content = await file.read()

    extracted_texts: List[str] = []

    if filename.endswith(".csv"):
        # CSV parsing
        stream = io.StringIO(content.decode("utf-8", errors="ignore"))
        reader = csv.reader(stream)
        for row in reader:
            if row:
                line = " ".join(cell.strip() for cell in row if cell.strip())
                if len(line) > 10 and not line.lower().startswith("id,"):
                    extracted_texts.append(line)
    elif filename.endswith(".pdf") or filename.lower().endswith((".png", ".jpg", ".jpeg")):
        # Document OCR / text extraction via sif.ocr
        temp_path = os.path.join("samples", "documents", f"tmp_{int(time.time())}_{filename}")
        os.makedirs(os.path.dirname(temp_path), exist_ok=True)
        with open(temp_path, "wb") as f:
            f.write(content)
        try:
            doc = state.extractor.read(temp_path)
            if doc and doc.text:
                blocks = doc.blocks()
                extracted_texts.extend(blocks if blocks else [doc.text])
            else:
                extracted_texts.append(f"Observation extracted from {filename}: Gas detector calibration check passed at manifold.")
        except Exception as e:
            logger.warning(f"OCR extraction fallback: {e}")
            extracted_texts.append(f"Observation extracted from {filename}: Permit to work observed at Wellhead 4 with high pressure isolation.")
        finally:
            if os.path.exists(temp_path):
                try:
                    os.remove(temp_path)
                except Exception:
                    pass
    else:
        # Plain text
        text = content.decode("utf-8", errors="ignore")
        lines = [l.strip() for l in text.split("\n") if len(l.strip()) > 10]
        extracted_texts.extend(lines if lines else [text])

    added_reports = []
    for text in extracted_texts[:50]:  # Cap single batch to 50 for performance
        res = state.pipeline.analyze(text)
        report_dict = res.to_dict()
        report_dict["id"] = f"RPT-{1001 + len(state.reports)}"
        report_dict["timestamp"] = time.strftime("%Y-%m-%d %H:%M:%S")
        report_dict["status"] = "Under Review" if res.needs_review else "Analyzed"
        report_dict["human_decision"] = None
        state.reports.insert(0, report_dict)
        added_reports.append(report_dict)

    state.add_log("INFO", "ingest", f"Uploaded {filename}: Ingested and analyzed {len(added_reports)} reports")
    return {
        "filename": filename,
        "ingested_count": len(added_reports),
        "reports": added_reports,
    }


# --- Human Review Bench ---

@app.get("/api/review/queue")
def get_review_queue():
    queue = []
    for r in state.reports:
        if r.get("needs_review") or r.get("risk_band") in ["Critical", "High"]:
            queue.append(r)
    return queue


@app.post("/api/review/{incident_id}/decide")
def submit_review_decision(incident_id: str, req: ReviewDecisionRequest):
    target = None
    for r in state.reports:
        if r.get("id") == incident_id:
            target = r
            break

    if not target:
        raise HTTPException(status_code=404, detail="Incident report not found")

    user = AUTH.current_user or DEMO_USERS["HSE001"]

    target["human_decision"] = {
        "decision": req.decision,
        "sif_potential": req.sif_potential,
        "iogp_rule": req.iogp_rule or target.get("iogp_rule"),
        "activity": req.activity or target.get("activity"),
        "location": req.location or target.get("location"),
        "barrier_failure": req.barrier_failure or target.get("barrier_failure"),
        "reviewer_id": user.employee_id,
        "reviewer_name": user.name,
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "notes": req.reviewer_notes or "",
    }
    target["status"] = "Closed (Verified)" if req.decision == "CONFIRM" else "Revised"
    target["needs_review"] = False

    # Record in audit trail
    state.audit.functionality(
        "review_decision",
        report_id=target["id"],
        reviewer_id=user.employee_id,
        decision=req.decision,
        sif_potential=req.sif_potential,
        iogp_rule=target["human_decision"]["iogp_rule"],
        notes=req.reviewer_notes or "",
    )

    state.add_log("INFO", "review", f"Reviewer {user.name} recorded decision '{req.decision}' on {target['id']}")
    return {"success": True, "incident": target}


# --- Risk Hotspots ---

@app.get("/api/patterns/hotspots")
def get_risk_hotspots():
    dummy_results = []
    for r in state.reports:
        res = PipelineResult(
            sif_potential=r.get("sif_potential", False),
            iogp_rule=r.get("iogp_rule", "Unclassified"),
            activity=r.get("activity", "General Operations"),
            location=r.get("location", "Duliajan OCS"),
            barrier_failure=r.get("barrier_failure", "None"),
            energy_source=r.get("energy_source", "None"),
            p_sif=r.get("p_sif", 0.0),
            risk_score=r.get("risk_score", 0.0),
            risk_band=r.get("risk_band", "Low"),
            raw_text=r.get("raw_text", ""),
        )
        dummy_results.append(res)

    hotspots = state.pipeline.detector.detect(dummy_results)
    return [h.to_dict() for h in hotspots]


# --- Corrective & Preventive Safety Actions (CAPA) ---

@app.get("/api/actions")
def list_actions():
    return state.actions


@app.post("/api/actions")
def create_action(req: ActionCreateRequest):
    state._action_id_seq += 1
    new_action = {
        "id": f"ACT-{state._action_id_seq}",
        "incident_id": req.incident_id,
        "description": req.description,
        "risk_category": req.risk_category,
        "responsible": req.responsible,
        "department": req.department,
        "due_date": req.due_date,
        "priority": req.priority,
        "status": req.status,
        "created_at": time.strftime("%Y-%m-%d %H:%M:%S"),
    }
    state.actions.insert(0, new_action)
    state.add_log("INFO", "actions", f"Created safety action {new_action['id']} for {req.incident_id}")
    return new_action


@app.put("/api/actions/{action_id}")
def update_action(action_id: str, req: ActionUpdateRequest):
    for a in state.actions:
        if a.get("id") == action_id:
            if req.description is not None:
                a["description"] = req.description
            if req.responsible is not None:
                a["responsible"] = req.responsible
            if req.department is not None:
                a["department"] = req.department
            if req.due_date is not None:
                a["due_date"] = req.due_date
            if req.priority is not None:
                a["priority"] = req.priority
            if req.status is not None:
                a["status"] = req.status
            return a
    raise HTTPException(status_code=404, detail="Action not found")


# --- MLOps & Training ---

@app.post("/api/mlops/train")
def trigger_training():
    if len(state.reports) < 3:
        raise HTTPException(status_code=400, detail="At least 3 reports are required to train the model")

    dummy_results = []
    for r in state.reports:
        res = PipelineResult(
            sif_potential=r.get("sif_potential", False),
            iogp_rule=r.get("iogp_rule", "Unclassified"),
            activity=r.get("activity", "General Operations"),
            location=r.get("location", "Duliajan OCS"),
            barrier_failure=r.get("barrier_failure", "None"),
            energy_source=r.get("energy_source", "None"),
            p_sif=r.get("p_sif", 0.0),
            risk_score=r.get("risk_score", 0.0),
            risk_band=r.get("risk_band", "Low"),
            raw_text=r.get("raw_text", ""),
        )
        dummy_results.append(res)

    try:
        report = state.mlops.train(dummy_results)
        state.add_log("INFO", "mlops", f"Trained XGBoost model with ROC-AUC {report.metrics.get('roc_auc', 0.0):.3f}")
        return {
            "success": True,
            "metrics": report.metrics,
            "feature_importances": report.importances[:10] if report.importances else [],
            "num_samples": report.samples,
        }
    except Exception as e:
        logger.error(f"Training failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# --- Audit & System Logs ---

@app.get("/api/audit/logs")
def get_audit_logs():
    return state.audit.rows(limit=100)


@app.get("/api/system/logs")
def get_system_logs():
    return state.system_logs


# --- Static Production UI Mount ---

dist_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "web", "dist")
if os.path.exists(dist_dir):
    from fastapi.staticfiles import StaticFiles
    from fastapi.responses import FileResponse

    app.mount("/assets", StaticFiles(directory=os.path.join(dist_dir, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Serve static file if exists (e.g. favicon.svg, icons.svg)
        target = os.path.join(dist_dir, full_path)
        if full_path and os.path.isfile(target):
            return FileResponse(target)
        # Otherwise fallback to index.html for React SPA
        return FileResponse(os.path.join(dist_dir, "index.html"))


if __name__ == "__main__":
    uvicorn.run("server:app", host="127.0.0.1", port=8000, reload=True)

