"""Pages for the second build: dashboard, ingestion, engines, audit, and settings.

Views are passive - they render what the controller gives them and emit signals.
No pictographs anywhere: statuses are words, separators are typographic marks.
"""

from __future__ import annotations

from typing import Dict, List, Optional, Sequence, Tuple

from PyQt6.QtCore import Qt, pyqtSignal
from PyQt6.QtGui import QColor
from PyQt6.QtWidgets import (
    QCheckBox,
    QComboBox,
    QFrame,
    QGridLayout,
    QHBoxLayout,
    QHeaderView,
    QLabel,
    QLineEdit,
    QProgressBar,
    QPushButton,
    QTableWidget,
    QTableWidgetItem,
    QTextEdit,
    QVBoxLayout,
    QWidget,
)

from sif.narrative import plain_brief
from ui2.components import scrollable
from ui.charts import DonutChart, HBarChart
from ui.components import DataTable, FieldRow, KpiTile, Panel, Pill
from ui.theme import BAND_COLORS, C
from ui.views import (
    IMPORTANCE_COLUMNS,
    LOG_COLUMNS,
    MATRIX_COLUMNS,
    RUN_COLUMNS,
)

__all__ = ["DashboardView", "IngestView", "EnginesView", "SettingsView",
           "ReportView", "AuditView", "scrollable", "AUDIT_COLUMNS"]

DOCUMENT_ACTION_COLUMNS: Sequence[Tuple[str, str, int]] = (
    ("File", "name", 210),
    ("Actions", "_actions", 232),
    ("Backend", "backend", 112),
    ("Pages", "pages", 62),
    ("OCR confidence", "confidence", 112),
    ("Characters", "characters", 92),
    ("Blocks", "blocks", 70),
    ("Notes", "note", 260),
)

AUDIT_COLUMNS: Sequence[Tuple[str, str, int]] = (
    ("Time", "when", 158),
    ("Kind", "category", 116),
    ("What happened", "action", 210),
    ("Who", "actor", 110),
    ("Detail", "summary", 460),
)


class PipelineStageBar(QFrame):
    """Visual pipeline flow header card for HSE Analysts."""

    def __init__(self) -> None:
        super().__init__()
        self.setObjectName("Panel")
        self.setStyleSheet(f"""
            QFrame#Panel {{
                background-color: {C.PANEL};
                border: 1px solid {C.BORDER};
                border-radius: 8px;
                padding: 4px;
            }}
        """)
        layout = QHBoxLayout(self)
        layout.setContentsMargins(14, 8, 14, 8)
        layout.setSpacing(8)

        lbl = QLabel("ANALYSIS PIPELINE:")
        lbl.setStyleSheet(f"font-size: 11px; font-weight: 800; color: {C.TEXT_DIM};")
        layout.addWidget(lbl)

        stages = [
            ("1. Intake & Ingest", C.OK),
            ("2. OCR & Multilingual", C.OK),
            ("3. SIF Precursor AI", C.OK),
            ("4. Human Review Queue", C.WARN),
            ("5. MLOps Learning", C.INFO),
        ]

        for idx, (name, color) in enumerate(stages):
            pill = QLabel(f" {name} ")
            pill.setStyleSheet(f"""
                background-color: {C.PANEL_ALT};
                color: {color};
                border: 1px solid {color};
                border-radius: 4px;
                font-size: 11px;
                font-weight: 700;
                padding: 2px 6px;
            """)
            layout.addWidget(pill)
            if idx < len(stages) - 1:
                arr = QLabel("->")
                arr.setStyleSheet(f"color: {C.TEXT_FAINT}; font-size: 10px;")
                layout.addWidget(arr)

        layout.addStretch()


class DashboardView(QWidget):
    """Role-aware Analytics & Operational Dashboard for SENTRA."""

    MIN_CONTENT_HEIGHT = 760

    def __init__(self) -> None:
        super().__init__()
        content = QWidget()
        layout = QVBoxLayout(content)
        layout.setContentsMargins(18, 16, 18, 16)
        layout.setSpacing(14)

        # Pipeline Flow Stage Bar
        self.pipeline_bar = PipelineStageBar()
        layout.addWidget(self.pipeline_bar)

        # KPI Tiles
        self.tile_total = KpiTile("TOTAL REPORTS", "0", C.ACCENT, note="analysed so far")
        self.tile_sif = KpiTile("SIF-POTENTIAL", "0", C.DANGER, note="0.0% of corpus")
        self.tile_risk = KpiTile("MEAN RISK SCORE", "0.0", C.WARN, unit="/ 100",
                                 note="ranked exposure")
        self.tile_review = KpiTile("AWAITING REVIEW", "0", C.BLUE, note="expert validation")
        self.tile_engine = KpiTile("ENGINE AGREEMENT", "-", C.OK, note="model vs pipeline")

        self.kpis_layout = QHBoxLayout()
        self.kpis_layout.setSpacing(12)
        for tile in (self.tile_total, self.tile_sif, self.tile_risk, self.tile_review,
                     self.tile_engine):
            self.kpis_layout.addWidget(tile)

        # Charts Section
        self.rule_chart = HBarChart(highlight_color=C.DANGER, base_color=C.BLUE)
        self.energy_chart = DonutChart(centre_caption="energy sources")
        self.barrier_chart = HBarChart(highlight_color=C.WARN, base_color=C.OK)
        self.activity_chart = HBarChart(highlight_color=C.PURPLE, base_color=C.BLUE)

        rules = Panel("SIF exposure by IOGP Life-Saving Rule")
        rules.add(self.rule_chart, stretch=1)
        rules.add(self._legend((C.DANGER, "SIF-potential"), (C.BLUE, "not SIF-potential")))
        energies = Panel("High-energy source distribution")
        energies.add(self.energy_chart, stretch=1)
        barriers = Panel("Failed barrier controls")
        barriers.add(self.barrier_chart, stretch=1)
        activities = Panel("Activities most often flagged")
        activities.add(self.activity_chart, stretch=1)

        self.top = QHBoxLayout()
        self.top.setSpacing(12)
        self.top.addWidget(rules, stretch=1)
        self.top.addWidget(energies, stretch=1)
        
        self.bottom = QHBoxLayout()
        self.bottom.setSpacing(12)
        self.bottom.addWidget(barriers, stretch=1)
        self.bottom.addWidget(activities, stretch=1)

        # Safety Attention Required Table (For Safety Officer)
        self.officer_panel = Panel("Safety Attention Required (Immediate Action)")
        self.officer_table = QTableWidget()
        self.officer_table.setColumnCount(6)
        self.officer_table.setHorizontalHeaderLabels([
            "INCIDENT ID", "LOCATION", "ACTIVITY", "RISK SCORE", "FAILED BARRIER", "STATUS"
        ])
        self.officer_table.horizontalHeader().setStretchLastSection(True)
        self.officer_table.setStyleSheet(f"""
            QTableWidget {{
                background-color: {C.APP};
                color: {C.TEXT};
                border: 1px solid {C.BORDER_SOFT};
            }}
            QHeaderView::section {{
                background-color: {C.PANEL_ALT};
                color: {C.TEXT_DIM};
                font-weight: 700;
                font-size: 11px;
                padding: 4px;
            }}
        """)
        self.officer_panel.add(self.officer_table, stretch=1)
        self.officer_panel.hide()

        self.summary = QLabel("No reports analysed yet.")
        self.summary.setObjectName("Faint")

        layout.addLayout(self.kpis_layout)
        layout.addWidget(self.officer_panel, stretch=2)
        layout.addLayout(self.top, stretch=3)
        layout.addLayout(self.bottom, stretch=3)
        layout.addWidget(self.summary)

        outer = QVBoxLayout(self)
        outer.setContentsMargins(0, 0, 0, 0)
        outer.addWidget(scrollable(content, self.MIN_CONTENT_HEIGHT))

    def set_role(self, role: str) -> None:
        """Customize dashboard view based on active role."""
        if role == "Safety Officer":
            self.pipeline_bar.hide()
            self.tile_total.set_title("CRITICAL / HIGH RISK")
            self.tile_engine.set_title("OPEN CAPA ACTIONS")
            self.officer_panel.show()
        else:
            self.pipeline_bar.show()
            self.tile_total.set_title("TOTAL REPORTS")
            self.tile_engine.set_title("ENGINE AGREEMENT")
            self.officer_panel.hide()

    @staticmethod
    def _legend(*entries: Tuple[str, str]) -> QWidget:
        widget = QWidget()
        layout = QHBoxLayout(widget)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(14)
        layout.addStretch(1)
        for colour, text in entries:
            dot = QLabel("●")
            dot.setStyleSheet(f"color: {colour}; font-size: 11px;")
            label = QLabel(text)
            label.setObjectName("Faint")
            layout.addWidget(dot)
            layout.addWidget(label)
        layout.addStretch(1)
        return widget

    def update_kpis(self, kpis: Dict[str, object]) -> None:
        total = int(kpis.get("total", 0))
        self.tile_total.set_value(str(total), "analysed so far")
        self.tile_sif.set_value(str(kpis.get("sif_potential", 0)),
                                f"{float(kpis.get('sif_rate', 0.0)):.1f}% of corpus")
        self.tile_risk.set_value(f"{float(kpis.get('mean_risk', 0.0)):.1f}",
                                 f"{kpis.get('critical', 0)} in the critical band")
        reviewed = int(kpis.get("reviewed", 0) or 0)
        self.tile_review.set_value(
            str(kpis.get("needs_review", 0)),
            f"{reviewed} decided by an expert" if reviewed else "expert validation")
        agreement = kpis.get("model_agreement")
        self.tile_engine.set_value(
            "-" if agreement is None else f"{float(agreement):.0f}%",
            "no model trained" if agreement is None else "model vs pipeline")
        self.summary.setText(
            f"{total} report(s)  ·  encoder: {kpis.get('encoder', 'not loaded')}"
            f"  ·  language: {kpis.get('language', 'English')}")

    def update_charts(self, rules, energies, barriers, activities) -> None:
        self.rule_chart.set_data(rules)
        self.energy_chart.set_data(energies)
        self.barrier_chart.set_data(barriers)
        self.activity_chart.set_data(activities)


class IngestView(QWidget):
    """Everything that gets a report into the system, on one page."""

    analyse_requested = pyqtSignal(str)
    seed_requested = pyqtSignal()
    csv_requested = pyqtSignal()
    files_requested = pyqtSignal()
    analyse_documents_requested = pyqtSignal()
    clear_requested = pyqtSignal()
    document_preview_requested = pyqtSignal(int)
    document_analyse_requested = pyqtSignal(int)
    document_removed = pyqtSignal(int)
    language_changed = pyqtSignal(str)
    translate_toggled = pyqtSignal(bool)

    MIN_CONTENT_HEIGHT = 760

    def __init__(self, languages: Sequence[str], unsupported: Sequence[str]) -> None:
        super().__init__()
        content = QWidget()
        layout = QVBoxLayout(content)
        layout.setContentsMargins(18, 16, 18, 16)
        layout.setSpacing(12)

        top = QHBoxLayout()
        top.setSpacing(12)
        top.addWidget(self._build_text_panel(), stretch=3)
        top.addWidget(self._build_document_panel(languages, unsupported), stretch=4)

        layout.addLayout(top, stretch=1)
        layout.addWidget(self._build_extracted_panel(), stretch=2)

        outer = QVBoxLayout(self)
        outer.setContentsMargins(0, 0, 0, 0)
        outer.addWidget(scrollable(content, self.MIN_CONTENT_HEIGHT))

    def _build_text_panel(self) -> Panel:
        panel = Panel("Live shift paste / single report")
        caption = QLabel("Type or paste an incident or near-miss observation.")
        caption.setObjectName("Faint")

        self.input_box = QTextEdit()
        self.input_box.setPlaceholderText("Enter field narrative...")

        analyse = QPushButton("Analyse text")
        analyse.setObjectName("Primary")
        analyse.clicked.connect(lambda: self.analyse_requested.emit(self.input_box.toPlainText()))

        seed = QPushButton("Load 5 seed incidents")
        seed.clicked.connect(self.seed_requested.emit)

        actions = QHBoxLayout()
        actions.setSpacing(10)
        actions.addWidget(analyse)
        actions.addWidget(seed)
        actions.addStretch(1)

        panel.add(caption)
        panel.add(self.input_box, stretch=1)
        panel.body.addLayout(actions)
        return panel

    def set_preview(self, text: str) -> None:
        pass

    def _build_document_panel(self, languages: Sequence[str], unsupported: Sequence[str]) -> Panel:
        panel = Panel("Paperwork and files")
        caption = QLabel("Add documents (PDF, PNG, JPG, TIFF, TXT) or import a spreadsheet export.")
        caption.setObjectName("Faint")
        caption.setWordWrap(True)

        self.language_box = QComboBox()
        for language in languages:
            self.language_box.addItem(language, language)
        self.language_box.setCurrentIndex(0)
        self.language_box.currentTextChanged.connect(self.language_changed.emit)

        self.translate_checkbox = QCheckBox("Translate non-English reports via local LLM")
        self.translate_checkbox.setChecked(True)
        self.translate_checkbox.toggled.connect(self.translate_toggled.emit)

        add_files = QPushButton("Add documents (PDF, scans, images, logs)")
        add_files.setObjectName("Primary")
        add_files.clicked.connect(self.files_requested.emit)

        import_csv = QPushButton("Import CSV export")
        import_csv.clicked.connect(self.csv_requested.emit)

        lang_row = QHBoxLayout()
        lang_row.setSpacing(10)
        lang_label = QLabel("OCR language")
        lang_label.setObjectName("Muted")
        lang_row.addWidget(lang_label)
        lang_row.addWidget(self.language_box, stretch=1)

        actions = QHBoxLayout()
        actions.setSpacing(10)
        actions.addWidget(add_files)
        actions.addWidget(import_csv)
        actions.addStretch(1)

        self.ocr_status = QLabel("OCR model: checking")
        self.ocr_status.setObjectName("Faint")

        panel.add(caption)
        panel.body.addLayout(lang_row)
        panel.add(self.translate_checkbox)
        panel.body.addLayout(actions)
        panel.add(self.ocr_status)
        return panel

    def _build_extracted_panel(self) -> Panel:
        panel = Panel("Extracted documents waiting for analysis")
        caption = QLabel("Files are read as they are added. Blank lines separate report blocks.")
        caption.setObjectName("Faint")

        self.extracted_table = DataTable(DOCUMENT_ACTION_COLUMNS)

        self.btn_analyse_all = QPushButton("Analyse extracted blocks")
        self.btn_analyse_all.setObjectName("Primary")
        self.btn_analyse_all.clicked.connect(self.analyse_documents_requested.emit)

        self.btn_clear = QPushButton("Clear extraction list")
        self.btn_clear.clicked.connect(self.clear_requested.emit)

        actions = QHBoxLayout()
        actions.setSpacing(10)
        actions.addWidget(self.btn_analyse_all)
        actions.addWidget(self.btn_clear)
        actions.addStretch(1)

        panel.add(caption)
        panel.add(self.extracted_table, stretch=1)
        panel.body.addLayout(actions)
        return panel

    def set_ocr_status(self, text: str) -> None:
        self.ocr_status.setText(text)

    def set_documents(self, documents: Sequence[Dict[str, object]]) -> None:
        self.extracted_table.set_rows(documents)


class EnginesView(QWidget):
    """Technical engine configuration and MLOps status."""

    encoder_changed = pyqtSignal(str)
    train_requested = pyqtSignal()
    ocr_check_requested = pyqtSignal()
    ollama_check_requested = pyqtSignal()
    ollama_config_changed = pyqtSignal(str, str)
    ollama_toggled = pyqtSignal(bool)
    download_requested = pyqtSignal()
    MIN_CONTENT_HEIGHT = 700

    def __init__(self) -> None:
        super().__init__()
        content = QWidget()
        layout = QVBoxLayout(content)
        layout.setContentsMargins(18, 16, 18, 16)
        layout.setSpacing(14)

        panel = Panel("Intelligence Engine Telemetry & Backends")
        caption = QLabel("Configuration of offline rule-engines, PaddleOCR, and local Ollama inference.")
        caption.setObjectName("Faint")

        self.txt_engines = QTextEdit()
        self.txt_engines.setReadOnly(True)
        self.txt_engines.setHtml(f"""
            <p><b>Rule Engine:</b> 11 IOGP Life-Saving Rules + Barrier Taxonomy (Active)</p>
            <p><b>Offline Encoder:</b> 512-dimensional Lexical Hashing (Active)</p>
            <p><b>PaddleOCR Engine:</b> Multi-lingual text layer extraction (Ready)</p>
            <p><b>Local LLM:</b> Ollama Llama-3.2 (Translation & 4th opinion verification)</p>
            <p><b>Risk Model:</b> XGBoost Precursor Classifier (Active)</p>
        """)

        panel.add(caption)
        panel.add(self.txt_engines, stretch=1)
        layout.addWidget(panel)

        outer = QVBoxLayout(self)
        outer.setContentsMargins(0, 0, 0, 0)
        outer.addWidget(scrollable(content, self.MIN_CONTENT_HEIGHT))

    def set_encoder_status(self, text: str) -> None:
        pass

    def set_ocr_status(self, text: str) -> None:
        pass

    def set_llm_status(self, text: str, models: Sequence[str] = ()) -> None:
        pass

    def set_model_status(self, model: str, tracking: str) -> None:
        pass

    def set_runs(self, runs: Sequence[Dict[str, object]]) -> None:
        pass

    def set_importances(self, importances: Sequence[Tuple[str, float]]) -> None:
        pass


class AuditView(QWidget):
    """Dedicated full-screen Audit Trail view."""

    audit_refreshed = pyqtSignal()
    audit_exported = pyqtSignal()
    audit_filtered = pyqtSignal(str)
    MIN_CONTENT_HEIGHT = 700

    def __init__(self) -> None:
        super().__init__()
        content = QWidget()
        layout = QVBoxLayout(content)
        layout.setContentsMargins(18, 14, 18, 14)
        layout.setSpacing(14)

        header = QHBoxLayout()
        title_box = QVBoxLayout()
        title = QLabel("SYSTEM & OPERATIONS AUDIT TRAIL")
        title.setStyleSheet(f"font-size: 18px; font-weight: 800; color: {C.TEXT}; letter-spacing: 0.5px;")
        sub = QLabel("Append-only immutable record of all user logins, SIF review decisions, and system actions")
        sub.setStyleSheet(f"font-size: 11.5px; color: {C.TEXT_DIM};")
        title_box.addWidget(title)
        title_box.addWidget(sub)
        header.addLayout(title_box)
        header.addStretch()

        self.btn_export = QPushButton("Export Trail (CSV)")
        self.btn_export.clicked.connect(self.audit_exported.emit)
        header.addWidget(self.btn_export)

        self.btn_refresh = QPushButton("Refresh")
        self.btn_refresh.clicked.connect(self.audit_refreshed.emit)
        header.addWidget(self.btn_refresh)

        layout.addLayout(header)

        self.audit_table = DataTable(AUDIT_COLUMNS)
        layout.addWidget(self.audit_table, stretch=1)

        outer = QVBoxLayout(self)
        outer.setContentsMargins(0, 0, 0, 0)
        outer.addWidget(scrollable(content, self.MIN_CONTENT_HEIGHT))

    def set_audit_rows(self, rows, note: str = "") -> None:
        dict_rows = [r.to_dict() if hasattr(r, "to_dict") else r for r in rows]
        self.audit_table.set_rows(dict_rows)


class SettingsView(QWidget):
    """System preferences and diagnostics."""

    tracking_changed = pyqtSignal(str, str)
    log_level_changed = pyqtSignal(str)
    logs_refreshed = pyqtSignal()
    logs_cleared = pyqtSignal()
    audit_refreshed = pyqtSignal()
    audit_exported = pyqtSignal()
    audit_filtered = pyqtSignal(str)

    MIN_CONTENT_HEIGHT = 700

    def __init__(self) -> None:
        super().__init__()
        content = QWidget()
        layout = QVBoxLayout(content)
        layout.setContentsMargins(18, 16, 18, 16)
        layout.setSpacing(14)

        tracking = Panel("MLflow Tracking Configuration")
        self.tracking_uri = QLineEdit("sqlite:///mlflow.db")
        self.experiment_name = QLineEdit("sentra-hse-ops")
        apply_btn = QPushButton("Apply")
        apply_btn.clicked.connect(lambda: self.tracking_changed.emit(self.tracking_uri.text(), self.experiment_name.text()))

        row = QHBoxLayout()
        row.addWidget(QLabel("Tracking URI:"))
        row.addWidget(self.tracking_uri, stretch=2)
        row.addWidget(QLabel("Experiment:"))
        row.addWidget(self.experiment_name, stretch=1)
        row.addWidget(apply_btn)
        tracking.body.addLayout(row)
        layout.addWidget(tracking)

        logging_panel = Panel("System Diagnostics & Logging")
        self.level_box = QComboBox()
        self.level_box.addItems(["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"])
        self.level_box.setCurrentText("INFO")
        self.level_box.currentTextChanged.connect(self.log_level_changed.emit)

        ref_btn = QPushButton("Refresh")
        ref_btn.clicked.connect(self.logs_refreshed.emit)
        clr_btn = QPushButton("Clear Buffer")
        clr_btn.clicked.connect(self.logs_cleared.emit)

        ctl = QHBoxLayout()
        ctl.addWidget(QLabel("Minimum Level:"))
        ctl.addWidget(self.level_box)
        ctl.addWidget(ref_btn)
        ctl.addWidget(clr_btn)
        ctl.addStretch(1)

        self.log_table = DataTable(LOG_COLUMNS)
        logging_panel.body.addLayout(ctl)
        logging_panel.add(self.log_table, stretch=1)
        layout.addWidget(logging_panel, stretch=1)

        outer = QVBoxLayout(self)
        outer.setContentsMargins(0, 0, 0, 0)
        outer.addWidget(scrollable(content, self.MIN_CONTENT_HEIGHT))

    def set_log_rows(self, rows) -> None:
        self.log_table.set_rows(rows)
        self.log_table.scrollToBottom()

    def set_log_path(self, path: str) -> None:
        pass

    def set_audit_rows(self, rows, note: str = "") -> None:
        dict_rows = [r.to_dict() if hasattr(r, "to_dict") else r for r in rows]
        pass


class ReportView(QWidget):
    """Reports matrix and evidence inspector."""

    report_selected = pyqtSignal(int)
    row_selected = pyqtSignal(int)
    MIN_CONTENT_HEIGHT = 760

    def __init__(self) -> None:
        super().__init__()
        content = QWidget()
        layout = QVBoxLayout(content)
        layout.setContentsMargins(18, 14, 18, 14)
        layout.setSpacing(12)

        self.table = DataTable(MATRIX_COLUMNS, on_select=self._on_table_select)
        layout.addWidget(self.table, stretch=1)

        outer = QVBoxLayout(self)
        outer.setContentsMargins(0, 0, 0, 0)
        outer.addWidget(scrollable(content, self.MIN_CONTENT_HEIGHT))

    def _on_table_select(self, row: int) -> None:
        self.report_selected.emit(row)
        self.row_selected.emit(row)

    def set_reports(self, reports: Sequence[Dict[str, object]]) -> None:
        self.table.set_rows(reports)

    def show_detail(self, row_data: Optional[Dict[str, object]]) -> None:
        pass
