"""Corrective and Preventive Actions (CAPA) Module for SENTRA.

Enables Safety Officers and HSE personnel to track, assign, verify, and close
critical safety interventions linked to SIF precursor findings.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import List, Optional

from PyQt6.QtCore import Qt, pyqtSignal
from PyQt6.QtGui import QColor
from PyQt6.QtWidgets import (
    QComboBox,
    QDialog,
    QDialogButtonBox,
    QFrame,
    QHBoxLayout,
    QHeaderView,
    QLabel,
    QLineEdit,
    QMessageBox,
    QPushButton,
    QScrollArea,
    QTableWidget,
    QTableWidgetItem,
    QTextEdit,
    QVBoxLayout,
    QWidget,
)

from ui.theme import C

__all__ = ["CorrectiveActionsView", "SafetyAction"]


def scrollable(widget: QWidget, min_height: int = 700) -> QScrollArea:
    area = QScrollArea()
    area.setWidgetResizable(True)
    area.setFrameShape(QFrame.Shape.NoFrame)
    area.setWidget(widget)
    widget.setMinimumHeight(min_height)
    return area


@dataclass
class SafetyAction:
    """Individual corrective or preventive safety action item."""
    id: str
    incident_id: str
    description: str
    risk_category: str
    responsible: str
    department: str
    due_date: str
    priority: str  # Critical, High, Medium, Low
    status: str    # Open, In Progress, Pending Verification, Verified, Overdue, Closed


# Initial seed action items for Oil India Limited operations
SEED_ACTIONS = [
    SafetyAction(
        id="ACT-101",
        incident_id="NM-2601",
        description="Verify zero-energy isolation tags and re-certify LOTO padlocks on 11 kV feeder bay.",
        risk_category="Energy Isolation",
        responsible="R. Baruah (Safety Officer)",
        department="Electrical & Maintenance",
        due_date="2026-09-28",
        priority="Critical",
        status="Open",
    ),
    SafetyAction(
        id="ACT-102",
        incident_id="NM-2603",
        description="Conduct structural scaffolding re-inspection and install missing toe boards at Rig-12 mud tank.",
        risk_category="Working at Height",
        responsible="K. Gogoi (Site Lead)",
        department="Rig Operations",
        due_date="2026-09-26",
        priority="Critical",
        status="In Progress",
    ),
    SafetyAction(
        id="ACT-103",
        incident_id="NM-2605",
        description="Calibrate fixed H2S gas detection sensors and update continuous forced ventilation logs in separator sump.",
        risk_category="Confined Space",
        responsible="S. Sharma (HSE Supervisor)",
        department="Process Plant Safety",
        due_date="2026-09-24",
        priority="High",
        status="Overdue",
    ),
    SafetyAction(
        id="ACT-104",
        incident_id="NM-2607",
        description="Establish 10 m barricaded crane exclusion zone during heavy module lifting at Duliajan OCS.",
        risk_category="Safe Mechanical Lifting",
        responsible="M. Phukan (Rig Superintendent)",
        department="Lifting & Rigging",
        due_date="2026-09-29",
        priority="High",
        status="Open",
    ),
]


class CorrectiveActionsView(QWidget):
    """Management interface for HSE corrective actions."""

    action_updated = pyqtSignal()
    MIN_CONTENT_HEIGHT = 720

    def __init__(self) -> None:
        super().__init__()
        self._actions: List[SafetyAction] = list(SEED_ACTIONS)
        self._filtered: List[SafetyAction] = []
        self._build_ui()
        self._apply_filters()

    def _build_ui(self) -> None:
        content = QWidget()
        layout = QVBoxLayout(content)
        layout.setContentsMargins(18, 14, 18, 14)
        layout.setSpacing(14)

        # Header Row
        header = QHBoxLayout()
        title_box = QVBoxLayout()
        title_box.setSpacing(2)
        title = QLabel("CORRECTIVE & PREVENTIVE SAFETY ACTIONS (CAPA)")
        title.setStyleSheet(f"font-size: 18px; font-weight: 800; color: {C.TEXT}; letter-spacing: 0.5px;")
        sub = QLabel("Operational mitigation tracking for high-energy barrier failures and SIF precursor findings")
        sub.setStyleSheet(f"font-size: 11.5px; color: {C.TEXT_DIM};")
        title_box.addWidget(title)
        title_box.addWidget(sub)
        header.addLayout(title_box)
        header.addStretch()

        self.btn_new = QPushButton("+ Create Corrective Action")
        self.btn_new.setCursor(Qt.CursorShape.PointingHandCursor)
        self.btn_new.setStyleSheet(f"""
            QPushButton {{
                background-color: {C.ACCENT};
                color: #ffffff;
                font-weight: 700;
                padding: 8px 16px;
                border-radius: 6px;
                border: 1px solid {C.ACCENT};
            }}
            QPushButton:hover {{
                background-color: #0891b2;
            }}
        """)
        self.btn_new.clicked.connect(self._create_action_dialog)
        header.addWidget(self.btn_new)

        layout.addLayout(header)

        # Filter Panel
        filter_panel = QFrame()
        filter_panel.setObjectName("Panel")
        filter_panel.setStyleSheet(f"background-color: {C.PANEL}; border: 1px solid {C.BORDER}; border-radius: 8px;")
        filter_layout = QHBoxLayout(filter_panel)
        filter_layout.setContentsMargins(10, 8, 10, 8)
        filter_layout.setSpacing(12)

        self.search_input = QLineEdit()
        self.search_input.setPlaceholderText("Search Action ID, Incident, or Assignee...")
        self.search_input.setFixedWidth(280)
        self.search_input.textChanged.connect(self._apply_filters)
        filter_layout.addWidget(self.search_input)

        self.combo_status = QComboBox()
        self.combo_status.addItems(["All Statuses", "Open", "In Progress", "Pending Verification", "Overdue", "Closed"])
        self.combo_status.currentTextChanged.connect(self._apply_filters)
        filter_layout.addWidget(self.combo_status)

        self.combo_priority = QComboBox()
        self.combo_priority.addItems(["All Priorities", "Critical", "High", "Medium", "Low"])
        self.combo_priority.currentTextChanged.connect(self._apply_filters)
        filter_layout.addWidget(self.combo_priority)

        filter_layout.addStretch()

        self.lbl_stats = QLabel("")
        self.lbl_stats.setStyleSheet(f"color: {C.INFO}; font-weight: 700; font-size: 12px;")
        filter_layout.addWidget(self.lbl_stats)

        layout.addWidget(filter_panel)

        # Table Widget
        self.table = QTableWidget()
        self.table.setColumnCount(8)
        self.table.setHorizontalHeaderLabels([
            "ACTION ID", "INCIDENT REF", "ACTION DESCRIPTION", "IOGP CATEGORY", "RESPONSIBLE", "DUE DATE", "PRIORITY", "STATUS"
        ])
        self.table.horizontalHeader().setSectionResizeMode(QHeaderView.ResizeMode.Interactive)
        self.table.horizontalHeader().setStretchLastSection(True)
        self.table.setSelectionBehavior(QTableWidget.SelectionBehavior.SelectRows)
        self.table.setStyleSheet(f"""
            QTableWidget {{
                background-color: {C.APP};
                border: 1px solid {C.BORDER};
                border-radius: 8px;
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
        """)
        self.table.doubleClicked.connect(self._edit_action_status)
        layout.addWidget(self.table)

        outer = QVBoxLayout(self)
        outer.setContentsMargins(0, 0, 0, 0)
        outer.addWidget(scrollable(content, self.MIN_CONTENT_HEIGHT))

    def _apply_filters(self) -> None:
        query = self.search_input.text().strip().lower()
        status_filter = self.combo_status.currentText()
        prio_filter = self.combo_priority.currentText()

        self._filtered = []
        for a in self._actions:
            matches_q = (
                not query
                or query in a.id.lower()
                or query in a.incident_id.lower()
                or query in a.description.lower()
                or query in a.responsible.lower()
            )
            matches_st = (status_filter == "All Statuses") or (a.status == status_filter)
            matches_pr = (prio_filter == "All Priorities") or (a.priority == prio_filter)

            if matches_q and matches_st and matches_pr:
                self._filtered.append(a)

        overdue_cnt = sum(1 for a in self._actions if a.status == "Overdue")
        self.lbl_stats.setText(f"{len(self._filtered)} Actions ({overdue_cnt} Overdue)")
        self._render_table()

    def _render_table(self) -> None:
        self.table.setRowCount(len(self._filtered))
        for row, a in enumerate(self._filtered):
            id_item = QTableWidgetItem(a.id)
            ref_item = QTableWidgetItem(a.incident_id)
            desc_item = QTableWidgetItem(a.description)
            cat_item = QTableWidgetItem(a.risk_category)
            resp_item = QTableWidgetItem(a.responsible)
            due_item = QTableWidgetItem(a.due_date)
            
            prio_item = QTableWidgetItem(a.priority)
            if a.priority in ("Critical", "High"):
                prio_item.setForeground(QColor(C.DANGER))

            status_item = QTableWidgetItem(a.status)
            if a.status == "Overdue":
                status_item.setForeground(QColor(C.DANGER))
            elif a.status == "Open":
                status_item.setForeground(QColor(C.WARN))
            elif a.status == "Closed":
                status_item.setForeground(QColor(C.OK))

            for col, item in enumerate([id_item, ref_item, desc_item, cat_item, resp_item, due_item, prio_item, status_item]):
                item.setFlags(Qt.ItemFlag.ItemIsEnabled | Qt.ItemFlag.ItemIsSelectable)
                self.table.setItem(row, col, item)

    def _create_action_dialog(self) -> None:
        dialog = QDialog(self)
        dialog.setWindowTitle("Create New Corrective Action")
        dialog.setFixedWidth(460)
        d_layout = QVBoxLayout(dialog)

        d_layout.addWidget(QLabel("Linked Incident Reference:"))
        txt_ref = QLineEdit("NM-2601")
        d_layout.addWidget(txt_ref)

        d_layout.addWidget(QLabel("Action Description:"))
        txt_desc = QTextEdit()
        txt_desc.setFixedHeight(70)
        d_layout.addWidget(txt_desc)

        d_layout.addWidget(QLabel("Responsible Person:"))
        txt_resp = QLineEdit("R. Baruah (Safety Officer)")
        d_layout.addWidget(txt_resp)

        d_layout.addWidget(QLabel("Priority:"))
        cmb_prio = QComboBox()
        cmb_prio.addItems(["Critical", "High", "Medium", "Low"])
        d_layout.addWidget(cmb_prio)

        btn_box = QDialogButtonBox(QDialogButtonBox.StandardButton.Ok | QDialogButtonBox.StandardButton.Cancel)
        btn_box.accepted.connect(dialog.accept)
        btn_box.rejected.connect(dialog.reject)
        d_layout.addWidget(btn_box)

        if dialog.exec() == QDialog.DialogCode.Accepted:
            new_id = f"ACT-{len(self._actions) + 101}"
            new_action = SafetyAction(
                id=new_id,
                incident_id=txt_ref.text().strip(),
                description=txt_desc.toPlainText().strip() or "General corrective safety action.",
                risk_category="General HSE",
                responsible=txt_resp.text().strip(),
                department="Operations & HSE",
                due_date="2026-10-01",
                priority=cmb_prio.currentText(),
                status="Open",
            )
            self._actions.insert(0, new_action)
            self._apply_filters()
            self.action_updated.emit()

    def _edit_action_status(self) -> None:
        row = self.table.currentRow()
        if row < 0 or row >= len(self._filtered):
            return
        action = self._filtered[row]

        dialog = QDialog(self)
        dialog.setWindowTitle(f"Update Action: {action.id}")
        d_layout = QVBoxLayout(dialog)

        d_layout.addWidget(QLabel(f"<b>Action:</b> {action.description}"))
        d_layout.addWidget(QLabel("Update Status:"))
        cmb_status = QComboBox()
        cmb_status.addItems(["Open", "In Progress", "Pending Verification", "Verified", "Overdue", "Closed"])
        cmb_status.setCurrentText(action.status)
        d_layout.addWidget(cmb_status)

        btn_box = QDialogButtonBox(QDialogButtonBox.StandardButton.Ok | QDialogButtonBox.StandardButton.Cancel)
        btn_box.accepted.connect(dialog.accept)
        btn_box.rejected.connect(dialog.reject)
        d_layout.addWidget(btn_box)

        if dialog.exec() == QDialog.DialogCode.Accepted:
            action.status = cmb_status.currentText()
            self._apply_filters()
            self.action_updated.emit()
