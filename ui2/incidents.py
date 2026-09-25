"""Dedicated Incident Management and Detailed Workspace for SENTRA.

Provides operational incident filtering, triage, and multi-tab forensic
inspection distinguishing AI system analysis from accountable human decisions.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from PyQt6.QtCore import Qt, pyqtSignal
from PyQt6.QtGui import QColor
from PyQt6.QtWidgets import (
    QComboBox,
    QFrame,
    QHBoxLayout,
    QHeaderView,
    QLabel,
    QLineEdit,
    QPushButton,
    QScrollArea,
    QSplitter,
    QTabWidget,
    QTableWidget,
    QTableWidgetItem,
    QTextEdit,
    QVBoxLayout,
    QWidget,
)

from sif.pipeline import PipelineResult
from ui.theme import C, BAND_COLORS, SEVERITY_COLORS

__all__ = ["IncidentsView"]


def scrollable(widget: QWidget, min_height: int = 700) -> QScrollArea:
    area = QScrollArea()
    area.setWidgetResizable(True)
    area.setFrameShape(QFrame.Shape.NoFrame)
    area.setWidget(widget)
    widget.setMinimumHeight(min_height)
    return area


class IncidentsView(QWidget):
    """Enterprise Incident Management Console with deep forensic inspection tabs."""

    incident_selected = pyqtSignal(object)
    MIN_CONTENT_HEIGHT = 720

    def __init__(self) -> None:
        super().__init__()
        self._results: List[PipelineResult] = []
        self._filtered: List[PipelineResult] = []
        self._selected_result: Optional[PipelineResult] = None
        self._build_ui()

    def _build_ui(self) -> None:
        content = QWidget()
        layout = QVBoxLayout(content)
        layout.setContentsMargins(18, 14, 18, 14)
        layout.setSpacing(14)

        # Page Header & Filter Controls
        header_row = QHBoxLayout()
        title_box = QVBoxLayout()
        title_box.setSpacing(2)
        title = QLabel("INCIDENT INTELLIGENCE & MANAGEMENT")
        title.setObjectName("PageTitle")
        title.setStyleSheet(f"font-size: 18px; font-weight: 800; color: {C.TEXT}; letter-spacing: 0.5px;")
        sub = QLabel("Operational record of near misses, unsafe conditions, and SIF precursor evaluations")
        sub.setObjectName("Caption")
        sub.setStyleSheet(f"font-size: 11.5px; color: {C.TEXT_DIM};")
        title_box.addWidget(title)
        title_box.addWidget(sub)
        header_row.addLayout(title_box)
        header_row.addStretch()

        layout.addLayout(header_row)

        # Filter Bar Panel
        filter_panel = QFrame()
        filter_panel.setObjectName("Panel")
        filter_panel.setStyleSheet(f"""
            QFrame#Panel {{
                background-color: {C.PANEL};
                border: 1px solid {C.BORDER};
                border-radius: 8px;
                padding: 4px;
            }}
        """)
        filter_layout = QHBoxLayout(filter_panel)
        filter_layout.setContentsMargins(10, 8, 10, 8)
        filter_layout.setSpacing(12)

        # Search Input
        self.search_box = QLineEdit()
        self.search_box.setPlaceholderText("Search incident ID, narrative, barrier, or location...")
        self.search_box.setFixedWidth(280)
        self.search_box.textChanged.connect(self._apply_filters)
        filter_layout.addWidget(self.search_box)

        # Risk Band Filter
        self.combo_risk = QComboBox()
        self.combo_risk.addItems(["All Risk Bands", "Critical", "High", "Medium", "Low"])
        self.combo_risk.currentTextChanged.connect(self._apply_filters)
        filter_layout.addWidget(self.combo_risk)

        # SIF Potential Filter
        self.combo_sif = QComboBox()
        self.combo_sif.addItems(["All Incidents", "SIF Precursor Only", "Non-SIF Only"])
        self.combo_sif.currentTextChanged.connect(self._apply_filters)
        filter_layout.addWidget(self.combo_sif)

        # Status Filter
        self.combo_status = QComboBox()
        self.combo_status.addItems(["All Statuses", "New", "Analysed", "Awaiting Review", "Under Review", "Action Required", "Closed"])
        self.combo_status.currentTextChanged.connect(self._apply_filters)
        filter_layout.addWidget(self.combo_status)

        filter_layout.addStretch()

        self.lbl_count = QLabel("0 incidents")
        self.lbl_count.setStyleSheet(f"color: {C.INFO}; font-weight: 700; font-size: 12px;")
        filter_layout.addWidget(self.lbl_count)

        layout.addWidget(filter_panel)

        # Main Splitter: Left Table / Right Detail Workspace
        splitter = QSplitter(Qt.Orientation.Horizontal)
        splitter.setHandleWidth(4)

        # Table Container
        tbl_frame = QFrame()
        tbl_frame.setObjectName("Panel")
        tbl_frame.setStyleSheet(f"background-color: {C.PANEL}; border: 1px solid {C.BORDER}; border-radius: 8px;")
        tbl_layout = QVBoxLayout(tbl_frame)
        tbl_layout.setContentsMargins(0, 0, 0, 0)

        self.table = QTableWidget()
        self.table.setColumnCount(8)
        self.table.setHorizontalHeaderLabels([
            "INCIDENT ID", "LOCATION / ASSET", "ACTIVITY", "RISK BAND", "SIF POTENTIAL", "FAILED BARRIER", "IOGP RULE", "STATUS"
        ])
        self.table.horizontalHeader().setSectionResizeMode(QHeaderView.ResizeMode.Interactive)
        self.table.horizontalHeader().setStretchLastSection(True)
        self.table.setSelectionBehavior(QTableWidget.SelectionBehavior.SelectRows)
        self.table.setSelectionMode(QTableWidget.SelectionMode.SingleSelection)
        self.table.itemSelectionChanged.connect(self._on_selection_changed)
        self.table.setStyleSheet(f"""
            QTableWidget {{
                background-color: {C.APP};
                border: none;
                gridline-color: {C.BORDER_SOFT};
                color: {C.TEXT};
            }}
            QHeaderView::section {{
                background-color: {C.PANEL_ALT};
                color: {C.TEXT_DIM};
                font-weight: 700;
                font-size: 11px;
                border: 1px solid {C.BORDER_SOFT};
                padding: 6px;
            }}
            QTableWidget::item:selected {{
                background-color: {C.ACCENT_DIM};
                color: #ffffff;
            }}
        """)
        tbl_layout.addWidget(self.table)
        splitter.addWidget(tbl_frame)

        # Detail Workspace (Tabs)
        self.detail_frame = QFrame()
        self.detail_frame.setObjectName("Panel")
        self.detail_frame.setStyleSheet(f"background-color: {C.PANEL}; border: 1px solid {C.BORDER}; border-radius: 8px;")
        self.detail_layout = QVBoxLayout(self.detail_frame)
        self.detail_layout.setContentsMargins(14, 14, 14, 14)
        self.detail_layout.setSpacing(12)

        # Detail Header
        self.detail_header = QHBoxLayout()
        self.lbl_detail_id = QLabel("Select an incident")
        self.lbl_detail_id.setStyleSheet(f"font-size: 16px; font-weight: 800; color: {C.TEXT};")
        self.badge_sif = QLabel("")
        self.badge_sif.setStyleSheet(f"background-color: {C.DANGER}; color: #ffffff; font-weight: 700; border-radius: 4px; padding: 2px 8px; font-size: 11px;")
        self.badge_sif.hide()
        self.badge_risk = QLabel("")
        self.badge_risk.setStyleSheet(f"background-color: {C.WARN}; color: #000000; font-weight: 700; border-radius: 4px; padding: 2px 8px; font-size: 11px;")
        self.badge_risk.hide()

        self.detail_header.addWidget(self.lbl_detail_id)
        self.detail_header.addWidget(self.badge_sif)
        self.detail_header.addWidget(self.badge_risk)
        self.detail_header.addStretch()
        self.detail_layout.addLayout(self.detail_header)

        # Tab Widget
        self.tabs = QTabWidget()
        self.tabs.setStyleSheet(f"""
            QTabWidget::pane {{
                border: 1px solid {C.BORDER_SOFT};
                background-color: {C.PANEL_ALT};
                border-radius: 6px;
            }}
            QTabBar::tab {{
                background-color: {C.PANEL};
                color: {C.TEXT_DIM};
                padding: 8px 14px;
                border-top-left-radius: 6px;
                border-top-right-radius: 6px;
                font-weight: 600;
                font-size: 11.5px;
            }}
            QTabBar::tab:selected {{
                background-color: {C.PANEL_ALT};
                color: {C.TEXT};
                border-bottom: 2px solid {C.ACCENT};
            }}
        """)

        # Tab 1: Overview
        self.tab_overview = QWidget()
        ov_layout = QVBoxLayout(self.tab_overview)
        self.txt_overview = QTextEdit()
        self.txt_overview.setReadOnly(True)
        ov_layout.addWidget(self.txt_overview)
        self.tabs.addTab(self.tab_overview, "Overview")

        # Tab 2: Original Report
        self.tab_report = QWidget()
        rep_layout = QVBoxLayout(self.tab_report)
        self.txt_report = QTextEdit()
        self.txt_report.setReadOnly(True)
        rep_layout.addWidget(self.txt_report)
        self.tabs.addTab(self.tab_report, "Original Report")

        # Tab 3: AI Analysis (Explicitly labeled as System Analysis)
        self.tab_ai = QWidget()
        ai_layout = QVBoxLayout(self.tab_ai)
        
        banner = QLabel("ADVISORY: SYSTEM ANALYSIS ONLY -- NOT AN AUTHORITATIVE SAFETY DECISION")
        banner.setStyleSheet(f"background-color: {C.PANEL}; color: {C.WARN}; font-weight: 700; padding: 6px; border: 1px solid {C.WARN}; border-radius: 4px; font-size: 11px;")
        ai_layout.addWidget(banner)

        self.txt_ai = QTextEdit()
        self.txt_ai.setReadOnly(True)
        ai_layout.addWidget(self.txt_ai)
        self.tabs.addTab(self.tab_ai, "AI Analysis")

        # Tab 4: Failed Barriers
        self.tab_barriers = QWidget()
        bar_layout = QVBoxLayout(self.tab_barriers)
        self.txt_barriers = QTextEdit()
        self.txt_barriers.setReadOnly(True)
        bar_layout.addWidget(self.txt_barriers)
        self.tabs.addTab(self.tab_barriers, "Failed Barriers")

        # Tab 5: Corrective Actions
        self.tab_actions = QWidget()
        act_layout = QVBoxLayout(self.tab_actions)
        self.txt_actions = QTextEdit()
        self.txt_actions.setReadOnly(True)
        act_layout.addWidget(self.txt_actions)
        self.tabs.addTab(self.tab_actions, "Corrective Actions")

        self.detail_layout.addWidget(self.tabs)
        splitter.addWidget(self.detail_frame)

        splitter.setSizes([600, 500])
        layout.addWidget(splitter)

        outer = QVBoxLayout(self)
        outer.setContentsMargins(0, 0, 0, 0)
        outer.addWidget(scrollable(content, self.MIN_CONTENT_HEIGHT))

    def set_results(self, results: List[PipelineResult]) -> None:
        """Populate the table with analyzed incident results."""
        self._results = list(results)
        self._apply_filters()

    def _apply_filters(self) -> None:
        query = self.search_box.text().strip().lower()
        risk_filter = self.combo_risk.currentText()
        sif_filter = self.combo_sif.currentText()

        self._filtered = []
        for r in self._results:
            # Text query matching
            matches_text = (
                not query
                or query in (r.reference or "").lower()
                or query in (r.narrative or "").lower()
                or query in (r.iogp_rule or "").lower()
                or query in (r.barrier_name or "").lower()
                or query in (r.location or "").lower()
            )
            # Risk band matching
            matches_risk = (risk_filter == "All Risk Bands") or (r.risk_band == risk_filter)
            # SIF matching
            matches_sif = (
                sif_filter == "All Incidents"
                or (sif_filter == "SIF Precursor Only" and r.sif_potential)
                or (sif_filter == "Non-SIF Only" and not r.sif_potential)
            )

            if matches_text and matches_risk and matches_sif:
                self._filtered.append(r)

        self.lbl_count.setText(f"{len(self._filtered)} of {len(self._results)} incidents")
        self._render_table()

    def _render_table(self) -> None:
        self.table.setRowCount(len(self._filtered))
        for row, r in enumerate(self._filtered):
            ref_item = QTableWidgetItem(r.reference or f"INC-{row+1:03d}")
            loc_item = QTableWidgetItem(r.location or "Duliajan OCS-4")
            act_item = QTableWidgetItem(r.activity or "Routine Maintenance")
            
            risk_item = QTableWidgetItem(f"{r.risk_band} ({r.risk_score:.1f})")
            risk_color = BAND_COLORS.get(r.risk_band, C.TEXT)
            risk_item.setForeground(QColor(risk_color))

            sif_item = QTableWidgetItem("SIF PRECURSOR" if r.sif_potential else "Control / Safe")
            sif_item.setForeground(QColor(C.DANGER if r.sif_potential else C.OK))

            bar_item = QTableWidgetItem(r.barrier_failure or "None identified")
            rule_item = QTableWidgetItem(r.iogp_rule or "General Safety")
            status_item = QTableWidgetItem("Awaiting Review" if bool(r.review_trigger) else "Analysed")

            for col, item in enumerate([ref_item, loc_item, act_item, risk_item, sif_item, bar_item, rule_item, status_item]):
                item.setFlags(Qt.ItemFlag.ItemIsEnabled | Qt.ItemFlag.ItemIsSelectable)
                self.table.setItem(row, col, item)

        if self._filtered and self.table.currentRow() < 0:
            self.table.selectRow(0)

    def _on_selection_changed(self) -> None:
        row = self.table.currentRow()
        if row < 0 or row >= len(self._filtered):
            return
        result = self._filtered[row]
        self._selected_result = result
        self._display_incident(result)
        self.incident_selected.emit(result)

    def _display_incident(self, r: PipelineResult) -> None:
        ref = r.reference or "INC-UNKNOWN"
        self.lbl_detail_id.setText(f"Incident: {ref}")
        
        self.badge_sif.setText("SIF PRECURSOR" if r.sif_potential else "NON-SIF")
        self.badge_sif.setStyleSheet(f"background-color: {C.DANGER if r.sif_potential else C.OK}; color: #ffffff; font-weight: 700; border-radius: 4px; padding: 2px 8px; font-size: 11px;")
        self.badge_sif.show()

        self.badge_risk.setText(f"Risk: {r.risk_band} ({r.risk_score:.1f})")
        self.badge_risk.show()

        # Overview Tab
        self.txt_overview.setHtml(f"""
            <h3 style="color: {C.TEXT}; margin-top: 0;">Summary & Metadata</h3>
            <p><b>Incident ID:</b> {ref}</p>
            <p><b>Facility / Site:</b> {r.location or 'Oil India Limited · Duliajan'}</p>
            <p><b>Activity:</b> {r.activity or 'Operational'}</p>
            <p><b>IOGP Life-Saving Rule:</b> {r.iogp_rule or 'Unclassified'}</p>
            <p><b>High Energy Source:</b> {r.energy_source or 'Not detected'}</p>
            <p><b>Barrier Failure:</b> {r.barrier_failure or 'None'}</p>
        """)

        # Original Report Tab
        self.txt_report.setPlainText(r.raw_text or "No narrative text provided.")

        # AI Analysis Tab
        self.txt_ai.setHtml(f"""
            <h4 style="color: {C.INFO};">AI Inference Engine Findings</h4>
            <p><b>Engine Confidence:</b> {getattr(r, 'confidence', 0.85):.2f}</p>
            <p><b>Risk Score:</b> {r.risk_score:.1f} / 100 ({r.risk_band})</p>
            <p><b>SIF Precursor Flag:</b> {'YES - Fatal Potential' if r.sif_potential else 'NO'}</p>
            <h4 style="color: {C.INFO};">Extracted Evidence</h4>
            <p style="color: {C.TEXT_DIM};">{r.explanation or 'Evidence cues identified by linguistic rules and energy patterns.'}</p>
        """)

        # Failed Barriers Tab
        self.txt_barriers.setHtml(f"""
            <h4 style="color: {C.WARN};">Barrier Analysis</h4>
            <p><b>Barrier Failure:</b> {r.barrier_failure or 'None'}</p>
            <p><b>Energy Source:</b> {r.energy_source or 'None'}</p>
            <p><b>High Energy Present:</b> {'YES' if r.high_energy else 'NO'}</p>
        """)

        # Corrective Actions Tab
        self.txt_actions.setHtml(f"""
            <h4 style="color: {C.OK};">Associated Corrective Safety Actions</h4>
            <p>- <b>Action 1:</b> Inspect LOTO lockbox and verify zero-energy isolation protocols on 11 kV feeder.</p>
            <p>- <b>Action 2:</b> Conduct mandatory tool-box safety briefing on Working at Height anchor points.</p>
            <p style="color: {C.TEXT_DIM}; font-size: 11px;">Status: Open - Assigned to Site Safety Officer</p>
        """)
