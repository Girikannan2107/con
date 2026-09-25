"""Professional Enterprise Landing Page for SENTRA.

Oil India Limited - Safety Intelligence & Risk Analysis Platform.
Inspired by modern high-end EHS enterprise landing pages with industrial safety aesthetic.
"""

from __future__ import annotations

from PyQt6.QtCore import Qt, pyqtSignal
from PyQt6.QtGui import QColor, QFont, QPainter, QLinearGradient
from PyQt6.QtWidgets import (
    QFrame,
    QHBoxLayout,
    QLabel,
    QPushButton,
    QScrollArea,
    QVBoxLayout,
    QWidget,
)

from ui.theme import C

__all__ = ["LandingView"]

# Landing Page Color Tokens
BG_DARK = "#050706"
BG_CARD = "#0d1310"
BG_CARD_BORDER = "#1b2820"
ACCENT_GREEN = "#8CFF32"
ACCENT_CYAN = "#18D6C2"
TEXT_WHITE = "#FFFFFF"
TEXT_MUTED = "#A7AFB0"
TEXT_FAINT = "#606b68"


class HeroBanner(QFrame):
    """Hero section with deep industrial gradient and prominent safety headline."""

    def __init__(self, on_access: callable, on_explore: callable) -> None:
        super().__init__()
        self.setStyleSheet(f"""
            QFrame {{
                background: qlineargradient(x1:0, y1:0, x2:1, y2:1, stop:0 #050706, stop:0.5 #08120d, stop:1 #040906);
                border-bottom: 1px solid {BG_CARD_BORDER};
            }}
        """)
        layout = QVBoxLayout(self)
        layout.setContentsMargins(60, 50, 60, 50)
        layout.setSpacing(20)

        # Organization & Trust Badge
        badge_row = QHBoxLayout()
        badge_row.setSpacing(10)
        badge = QLabel("  OIL INDIA LIMITED · HSE SAFETY INTELLIGENCE PLATFORM  ")
        badge.setStyleSheet(f"""
            background-color: #0e1e14;
            color: {ACCENT_GREEN};
            border: 1px solid {ACCENT_GREEN};
            border-radius: 4px;
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 1px;
            padding: 4px 8px;
        """)
        badge_row.addWidget(badge)
        badge_row.addStretch()
        layout.addLayout(badge_row)

        # Main Headline
        h1 = QLabel("SEE RISK BEFORE\nIT BECOMES AN INCIDENT.")
        h1.setStyleSheet(f"""
            color: {TEXT_WHITE};
            font-size: 42px;
            font-weight: 900;
            letter-spacing: 0.5px;
            line-height: 1.1;
        """)
        layout.addWidget(h1)

        # Subtitle
        sub = QLabel(
            "AI-assisted precursor intelligence for faster, evidence-based HSE decisions.\n"
            "Turn incident reports, near misses, and field paperwork into actionable barrier visibility."
        )
        sub.setStyleSheet(f"color: {TEXT_MUTED}; font-size: 16px; line-height: 1.4;")
        layout.addWidget(sub)

        # CTA Button Row
        cta_row = QHBoxLayout()
        cta_row.setSpacing(16)

        btn_access = QPushButton("ACCESS SENTRA ->")
        btn_access.setCursor(Qt.CursorShape.PointingHandCursor)
        btn_access.setStyleSheet(f"""
            QPushButton {{
                background-color: {ACCENT_GREEN};
                color: #050706;
                font-size: 14px;
                font-weight: 800;
                padding: 12px 28px;
                border-radius: 6px;
                border: 1px solid {ACCENT_GREEN};
            }}
            QPushButton:hover {{
                background-color: #a4ff5e;
            }}
        """)
        btn_access.clicked.connect(on_access)

        btn_explore = QPushButton("EXPLORE CAPABILITIES")
        btn_explore.setCursor(Qt.CursorShape.PointingHandCursor)
        btn_explore.setStyleSheet(f"""
            QPushButton {{
                background-color: transparent;
                color: {TEXT_WHITE};
                font-size: 14px;
                font-weight: 700;
                padding: 12px 24px;
                border-radius: 6px;
                border: 1px solid {BG_CARD_BORDER};
            }}
            QPushButton:hover {{
                border-color: {ACCENT_CYAN};
                color: {ACCENT_CYAN};
                background-color: #0d1a16;
            }}
        """)
        btn_explore.clicked.connect(on_explore)

        cta_row.addWidget(btn_access)
        cta_row.addWidget(btn_explore)
        cta_row.addStretch()
        layout.addLayout(cta_row)

        # Trust Strip
        trust_box = QFrame()
        trust_box.setStyleSheet(f"background-color: #08100b; border: 1px solid {BG_CARD_BORDER}; border-radius: 6px;")
        t_layout = QHBoxLayout(trust_box)
        t_layout.setContentsMargins(18, 12, 18, 12)
        t_layout.setSpacing(24)

        for item in (
            "SAFETY-FIRST ANALYSIS",
            "IOGP LIFE-SAVING RULES",
            "FAILED BARRIER DISCOVERY",
            "ACCOUNTABLE HUMAN REVIEW",
            "IMMUTABLE AUDIT TRAIL",
        ):
            dot_lbl = QLabel(f"<span style='color:{ACCENT_GREEN};'>●</span>  <span style='color:{TEXT_MUTED}; font-size:11px; font-weight:700;'>{item}</span>")
            t_layout.addWidget(dot_lbl)
        t_layout.addStretch()

        layout.addWidget(trust_box)


class LandingView(QWidget):
    """Full-screen interactive enterprise landing page."""

    access_requested = pyqtSignal()
    login_requested = pyqtSignal()
    report_incident_requested = pyqtSignal()

    def __init__(self) -> None:
        super().__init__()
        self.setObjectName("LandingView")
        self.setStyleSheet(f"background-color: {BG_DARK}; color: {TEXT_WHITE}; font-family: 'Segoe UI', Arial, sans-serif;")
        self._build_ui()

    def _build_ui(self) -> None:
        root_layout = QVBoxLayout(self)
        root_layout.setContentsMargins(0, 0, 0, 0)
        root_layout.setSpacing(0)

        # Top Sticky Header
        header = QFrame()
        header.setFixedHeight(64)
        header.setStyleSheet(f"background-color: {BG_DARK}; border-bottom: 1px solid {BG_CARD_BORDER};")
        h_layout = QHBoxLayout(header)
        h_layout.setContentsMargins(40, 0, 40, 0)
        h_layout.setSpacing(20)

        # Brand Mark
        mark_box = QHBoxLayout()
        mark_box.setSpacing(10)
        logo = QLabel("S")
        logo.setFixedSize(32, 32)
        logo.setAlignment(Qt.AlignmentFlag.AlignCenter)
        logo.setStyleSheet(f"""
            background-color: {ACCENT_GREEN};
            color: #050706;
            font-size: 18px;
            font-weight: 900;
            border-radius: 6px;
        """)
        
        brand_text = QVBoxLayout()
        brand_text.setSpacing(0)
        brand_name = QLabel("SENTRA")
        brand_name.setStyleSheet(f"font-size: 16px; font-weight: 900; color: {TEXT_WHITE}; letter-spacing: 1px;")
        brand_sub = QLabel("SAFETY INTELLIGENCE PLATFORM")
        brand_sub.setStyleSheet(f"font-size: 9px; font-weight: 700; color: {ACCENT_CYAN}; letter-spacing: 0.5px;")
        brand_text.addWidget(brand_name)
        brand_text.addWidget(brand_sub)

        mark_box.addWidget(logo)
        mark_box.addLayout(brand_text)
        h_layout.addLayout(mark_box)

        h_layout.addStretch()

        # Nav Links
        for label in ("Platform", "Safety Intelligence", "Incident Analysis", "Risk Insights", "How It Works"):
            lbl_nav = QLabel(label)
            lbl_nav.setStyleSheet(f"color: {TEXT_MUTED}; font-size: 13px; font-weight: 600; padding: 0 8px;")
            h_layout.addWidget(lbl_nav)

        h_layout.addSpacing(20)

        # Login / Access Buttons
        btn_login = QPushButton("LOGIN")
        btn_login.setCursor(Qt.CursorShape.PointingHandCursor)
        btn_login.setStyleSheet(f"""
            QPushButton {{
                background-color: transparent;
                color: {TEXT_WHITE};
                font-size: 12.5px;
                font-weight: 700;
                padding: 6px 16px;
                border-radius: 5px;
                border: 1px solid {BG_CARD_BORDER};
            }}
            QPushButton:hover {{
                border-color: {TEXT_WHITE};
            }}
        """)
        btn_login.clicked.connect(self.login_requested.emit)
        h_layout.addWidget(btn_login)

        btn_access_top = QPushButton("ACCESS SENTRA")
        btn_access_top.setCursor(Qt.CursorShape.PointingHandCursor)
        btn_access_top.setStyleSheet(f"""
            QPushButton {{
                background-color: {ACCENT_GREEN};
                color: #050706;
                font-size: 12.5px;
                font-weight: 800;
                padding: 6px 18px;
                border-radius: 5px;
                border: 1px solid {ACCENT_GREEN};
            }}
            QPushButton:hover {{
                background-color: #a4ff5e;
            }}
        """)
        btn_access_top.clicked.connect(self.access_requested.emit)
        h_layout.addWidget(btn_access_top)

        root_layout.addWidget(header)

        # Scrollable Page Body
        scroller = QScrollArea()
        scroller.setWidgetResizable(True)
        scroller.setFrameShape(QFrame.Shape.NoFrame)
        scroller.setHorizontalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAlwaysOff)
        
        content = QWidget()
        c_layout = QVBoxLayout(content)
        c_layout.setContentsMargins(0, 0, 0, 0)
        c_layout.setSpacing(0)

        # 1. Hero Section
        hero = HeroBanner(
            on_access=self.access_requested.emit,
            on_explore=lambda: scroller.verticalScrollBar().setValue(450),
        )
        c_layout.addWidget(hero)

        # 2. Section: One Safety Workspace (5 Workflow Cards)
        c_layout.addWidget(self._build_workflow_section())

        # 3. Section: Process Intelligence Flow
        c_layout.addWidget(self._build_process_flow_section())

        # 4. Section: Key Capabilities
        c_layout.addWidget(self._build_capabilities_section())

        # 5. Section: Why SENTRA (Evidence First)
        c_layout.addWidget(self._build_philosophy_section())

        # 6. Section: Operations Console Preview
        c_layout.addWidget(self._build_preview_section())

        # 7. Final Call to Action
        c_layout.addWidget(self._build_final_cta())

        # 8. Footer
        c_layout.addWidget(self._build_footer())

        scroller.setWidget(content)
        root_layout.addWidget(scroller, stretch=1)

    def _build_workflow_section(self) -> QWidget:
        sec = QFrame()
        sec.setStyleSheet(f"background-color: {BG_DARK}; border-bottom: 1px solid {BG_CARD_BORDER};")
        layout = QVBoxLayout(sec)
        layout.setContentsMargins(60, 48, 60, 48)
        layout.setSpacing(24)

        head = QLabel("ONE SAFETY WORKSPACE. FROM REPORT TO DECISION.")
        head.setStyleSheet(f"font-size: 24px; font-weight: 800; color: {TEXT_WHITE}; letter-spacing: 0.5px;")
        sub = QLabel("An end-to-end architecture built to turn field observations into accountable safety interventions.")
        sub.setStyleSheet(f"font-size: 13px; color: {TEXT_MUTED};")
        layout.addWidget(head)
        layout.addWidget(sub)

        cards_row = QHBoxLayout()
        cards_row.setSpacing(14)

        stages = [
            ("01", "INGEST", "Incident reports, night logs, PDFs and scanned safety observation cards.", ACCENT_CYAN),
            ("02", "UNDERSTAND", "Multi-lingual OCR, document splitting and local LLM translation.", ACCENT_GREEN),
            ("03", "ANALYSE", "High-energy detection, barrier failure analysis, and IOGP rules.", ACCENT_CYAN),
            ("04", "REVIEW", "Human-in-the-loop triage bench for critical & thin-evidence reports.", "#f59e0b"),
            ("05", "LEARN", "Active learning and MLOps model training from real reviewer decisions.", ACCENT_GREEN),
        ]

        for num, title, desc, color in stages:
            card = QFrame()
            card.setStyleSheet(f"""
                QFrame {{
                    background-color: {BG_CARD};
                    border: 1px solid {BG_CARD_BORDER};
                    border-radius: 8px;
                    padding: 10px;
                }}
                QFrame:hover {{
                    border-color: {color};
                }}
            """)
            card_l = QVBoxLayout(card)
            card_l.setContentsMargins(14, 16, 14, 16)
            card_l.setSpacing(8)

            num_lbl = QLabel(num)
            num_lbl.setStyleSheet(f"font-size: 18px; font-weight: 900; color: {color};")
            title_lbl = QLabel(title)
            title_lbl.setStyleSheet(f"font-size: 14px; font-weight: 800; color: {TEXT_WHITE};")
            desc_lbl = QLabel(desc)
            desc_lbl.setWordWrap(True)
            desc_lbl.setStyleSheet(f"font-size: 12px; color: {TEXT_MUTED}; line-height: 1.3;")

            card_l.addWidget(num_lbl)
            card_l.addWidget(title_lbl)
            card_l.addWidget(desc_lbl)
            card_l.addStretch()
            cards_row.addWidget(card, stretch=1)

        layout.addLayout(cards_row)
        return sec

    def _build_process_flow_section(self) -> QWidget:
        sec = QFrame()
        sec.setStyleSheet(f"background-color: #070e0a; border-bottom: 1px solid {BG_CARD_BORDER};")
        layout = QVBoxLayout(sec)
        layout.setContentsMargins(60, 40, 60, 40)
        layout.setSpacing(18)

        head = QLabel("FROM RAW REPORTS TO SAFETY INTELLIGENCE")
        head.setStyleSheet(f"font-size: 20px; font-weight: 800; color: {TEXT_WHITE}; letter-spacing: 0.5px;")
        layout.addWidget(head)

        flow_row = QHBoxLayout()
        flow_row.setSpacing(8)

        steps = ["RAW REPORT", "OCR / EXTRACTION", "SIF AI ANALYSIS", "RISK SIGNALS", "HUMAN REVIEW", "SAFETY ACTION"]
        for idx, step in enumerate(steps):
            pill = QLabel(f" {step} ")
            pill.setAlignment(Qt.AlignmentFlag.AlignCenter)
            pill.setStyleSheet(f"""
                background-color: {BG_CARD};
                color: {ACCENT_GREEN if idx in (2, 4, 5) else TEXT_WHITE};
                border: 1px solid {ACCENT_GREEN if idx in (2, 4, 5) else BG_CARD_BORDER};
                border-radius: 6px;
                padding: 10px 14px;
                font-size: 12px;
                font-weight: 700;
            """)
            flow_row.addWidget(pill, stretch=1)
            if idx < len(steps) - 1:
                arrow = QLabel("->")
                arrow.setStyleSheet(f"color: {TEXT_FAINT}; font-weight: 900; font-size: 14px;")
                flow_row.addWidget(arrow)

        layout.addLayout(flow_row)
        return sec

    def _build_capabilities_section(self) -> QWidget:
        sec = QFrame()
        sec.setStyleSheet(f"background-color: {BG_DARK}; border-bottom: 1px solid {BG_CARD_BORDER};")
        layout = QVBoxLayout(sec)
        layout.setContentsMargins(60, 48, 60, 48)
        layout.setSpacing(24)

        head = QLabel("KEY CAPABILITIES & INTELLIGENCE ENGINES")
        head.setStyleSheet(f"font-size: 22px; font-weight: 800; color: {TEXT_WHITE};")
        layout.addWidget(head)

        grid = QHBoxLayout()
        grid.setSpacing(14)

        col1 = QVBoxLayout()
        col1.setSpacing(12)
        col2 = QVBoxLayout()
        col2.setSpacing(12)

        items1 = [
            ("Incident & Near-Miss Analysis", "Extracts operational narratives and maps activities and location metadata."),
            ("SIF Potential Detection", "Applies high-energy and failed-barrier logic to flag potential fatal events."),
            ("Risk Hotspot Discovery", "Identifies repeat clusters across sites, activities, and barrier failure modes."),
            ("Failed Barrier Analysis", "Surfaces bypassed or degraded controls across all 11 IOGP Life-Saving Rules."),
        ]
        items2 = [
            ("Human Review Bench", "One-touch triage queue ensuring no high-consequence finding is filed away unseen."),
            ("Evidence & Audit Trail", "Immutable, tamper-evident chronological record of all user decisions and inferences."),
            ("MLOps & Continuous Learning", "XGBoost classifier trained directly on verified human safety decisions."),
            ("Multi-Lingual OCR Processing", "PaddleOCR text extraction for Indian languages with local LLM translation."),
        ]

        def make_cap_card(title, desc):
            c = QFrame()
            c.setStyleSheet(f"""
                QFrame {{
                    background-color: {BG_CARD};
                    border: 1px solid {BG_CARD_BORDER};
                    border-radius: 8px;
                    padding: 8px;
                }}
                QFrame:hover {{
                    border-color: {ACCENT_CYAN};
                }}
            """)
            cl = QVBoxLayout(c)
            cl.setContentsMargins(14, 12, 14, 12)
            cl.setSpacing(4)
            t = QLabel(title)
            t.setStyleSheet(f"font-size: 13.5px; font-weight: 700; color: {TEXT_WHITE};")
            d = QLabel(desc)
            d.setWordWrap(True)
            d.setStyleSheet(f"font-size: 11.5px; color: {TEXT_MUTED};")
            cl.addWidget(t)
            cl.addWidget(d)
            return c

        for t, d in items1:
            col1.addWidget(make_cap_card(t, d))
        for t, d in items2:
            col2.addWidget(make_cap_card(t, d))

        grid.addLayout(col1)
        grid.addLayout(col2)
        layout.addLayout(grid)
        return sec

    def _build_philosophy_section(self) -> QWidget:
        sec = QFrame()
        sec.setStyleSheet(f"background-color: #060c08; border-bottom: 1px solid {BG_CARD_BORDER};")
        layout = QVBoxLayout(sec)
        layout.setContentsMargins(60, 48, 60, 48)
        layout.setSpacing(20)

        head = QLabel("SAFETY DECISIONS NEED EVIDENCE.")
        head.setStyleSheet(f"font-size: 22px; font-weight: 800; color: {TEXT_WHITE};")
        layout.addWidget(head)

        row = QHBoxLayout()
        row.setSpacing(16)

        principles = [
            ("01", "EVIDENCE FIRST", "Every flag names its high-energy cue, its failed control, and the exact words from the field report."),
            ("02", "HUMAN REVIEW", "The AI assists and surfaces risk; it never replaces accountable human safety engineer judgment."),
            ("03", "AUDITABLE & REPEATABLE", "Every review decision and model training step is recorded in an immutable ledger for compliance."),
        ]

        for num, title, desc in principles:
            card = QFrame()
            card.setStyleSheet(f"background-color: {BG_CARD}; border: 1px solid {BG_CARD_BORDER}; border-radius: 8px;")
            cl = QVBoxLayout(card)
            cl.setContentsMargins(18, 18, 18, 18)
            cl.setSpacing(8)

            n = QLabel(num)
            n.setStyleSheet(f"font-size: 16px; font-weight: 900; color: {ACCENT_GREEN};")
            t = QLabel(title)
            t.setStyleSheet(f"font-size: 14px; font-weight: 800; color: {TEXT_WHITE};")
            d = QLabel(desc)
            d.setWordWrap(True)
            d.setStyleSheet(f"font-size: 12px; color: {TEXT_MUTED}; line-height: 1.3;")

            cl.addWidget(n)
            cl.addWidget(t)
            cl.addWidget(d)
            cl.addStretch()
            row.addWidget(card, stretch=1)

        layout.addLayout(row)
        return sec

    def _build_preview_section(self) -> QWidget:
        sec = QFrame()
        sec.setStyleSheet(f"background-color: {BG_DARK}; border-bottom: 1px solid {BG_CARD_BORDER};")
        layout = QVBoxLayout(sec)
        layout.setContentsMargins(60, 48, 60, 48)
        layout.setSpacing(16)

        head = QLabel("THE SENTRA OPERATIONS CONSOLE")
        head.setStyleSheet(f"font-size: 22px; font-weight: 800; color: {TEXT_WHITE};")
        sub = QLabel("One unified operations interface for incident intelligence, hotspot ranking, and rapid safety review.")
        sub.setStyleSheet(f"font-size: 13px; color: {TEXT_MUTED};")
        layout.addWidget(head)
        layout.addWidget(sub)

        # Mock Console Shell Preview Frame
        preview = QFrame()
        preview.setFixedHeight(180)
        preview.setStyleSheet(f"""
            background-color: #0b1a2e;
            border: 2px solid #22405f;
            border-radius: 10px;
        """)
        pl = QHBoxLayout(preview)
        pl.setContentsMargins(20, 20, 20, 20)
        pl.setSpacing(16)

        side_mock = QFrame()
        side_mock.setFixedWidth(140)
        side_mock.setStyleSheet("background-color: #0d1f36; border-radius: 6px;")
        s_layout = QVBoxLayout(side_mock)
        for item in ("Dashboard", "Incidents", "Reports", "Human Review", "Hotspots"):
            lbl = QLabel(f"  {item}")
            lbl.setStyleSheet("color: #8fa8c0; font-size: 10px; font-weight: 600;")
            s_layout.addWidget(lbl)
        s_layout.addStretch()
        pl.addWidget(side_mock)

        dash_mock = QFrame()
        dash_mock.setStyleSheet("background-color: #13273f; border-radius: 6px;")
        dl = QVBoxLayout(dash_mock)
        dl.setSpacing(8)
        d_title = QLabel("Live Operations Telemetry · Duliajan OCS-4 & Rig-12")
        d_title.setStyleSheet("color: #38bdf8; font-weight: 700; font-size: 11px;")
        
        kpi_row = QHBoxLayout()
        for k_title, k_val, k_col in (("TOTAL REPORTS", "18", "#38bdf8"), ("SIF POTENTIAL", "13", "#ef4444"), ("MEAN RISK", "72.4", "#f59e0b")):
            k_box = QFrame()
            k_box.setStyleSheet("background-color: #182f4a; border-radius: 4px; padding: 6px;")
            kl = QVBoxLayout(k_box)
            kl.setSpacing(2)
            kt = QLabel(k_title)
            kt.setStyleSheet("color: #8fa8c0; font-size: 9px; font-weight: 700;")
            kv = QLabel(k_val)
            kv.setStyleSheet(f"color: {k_col}; font-size: 16px; font-weight: 800;")
            kl.addWidget(kt)
            kl.addWidget(kv)
            kpi_row.addWidget(k_box)
        
        dl.addWidget(d_title)
        dl.addLayout(kpi_row)
        pl.addWidget(dash_mock, stretch=1)

        layout.addWidget(preview)
        return sec

    def _build_final_cta(self) -> QWidget:
        sec = QFrame()
        sec.setStyleSheet(f"background-color: #0a140e; border-bottom: 1px solid {BG_CARD_BORDER};")
        layout = QVBoxLayout(sec)
        layout.setContentsMargins(60, 50, 60, 50)
        layout.setSpacing(18)
        layout.setAlignment(Qt.AlignmentFlag.AlignCenter)

        head = QLabel("READY TO ENTER THE SAFETY INTELLIGENCE CONSOLE?")
        head.setAlignment(Qt.AlignmentFlag.AlignCenter)
        head.setStyleSheet(f"font-size: 24px; font-weight: 900; color: {TEXT_WHITE};")
        layout.addWidget(head)

        sub = QLabel("Sign in with your Oil India Limited credentials to access your safety workspace.")
        sub.setAlignment(Qt.AlignmentFlag.AlignCenter)
        sub.setStyleSheet(f"font-size: 13.5px; color: {TEXT_MUTED};")
        layout.addWidget(sub)

        btn_row = QHBoxLayout()
        btn_row.setSpacing(16)
        btn_row.setAlignment(Qt.AlignmentFlag.AlignCenter)

        btn_access = QPushButton("ACCESS SENTRA ->")
        btn_access.setCursor(Qt.CursorShape.PointingHandCursor)
        btn_access.setStyleSheet(f"""
            QPushButton {{
                background-color: {ACCENT_GREEN};
                color: #050706;
                font-size: 14px;
                font-weight: 800;
                padding: 12px 32px;
                border-radius: 6px;
                border: 1px solid {ACCENT_GREEN};
            }}
            QPushButton:hover {{
                background-color: #a4ff5e;
            }}
        """)
        btn_access.clicked.connect(self.access_requested.emit)

        btn_report = QPushButton("REPORT AN INCIDENT")
        btn_report.setCursor(Qt.CursorShape.PointingHandCursor)
        btn_report.setStyleSheet(f"""
            QPushButton {{
                background-color: transparent;
                color: {TEXT_WHITE};
                font-size: 14px;
                font-weight: 700;
                padding: 12px 24px;
                border-radius: 6px;
                border: 1px solid {BG_CARD_BORDER};
            }}
            QPushButton:hover {{
                border-color: {ACCENT_CYAN};
                color: {ACCENT_CYAN};
                background-color: #0d1a16;
            }}
        """)
        btn_report.clicked.connect(self.report_incident_requested.emit)

        btn_row.addWidget(btn_access)
        btn_row.addWidget(btn_report)
        layout.addLayout(btn_row)
        return sec

    def _build_footer(self) -> QWidget:
        footer = QFrame()
        footer.setStyleSheet(f"background-color: {BG_DARK};")
        layout = QHBoxLayout(footer)
        layout.setContentsMargins(60, 24, 60, 24)

        left = QLabel("SENTRA · Oil India Limited  ·  HSE Safety Intelligence Platform (PS 26165)")
        left.setStyleSheet(f"font-size: 11.5px; color: {TEXT_FAINT};")
        layout.addWidget(left)

        layout.addStretch()

        right = QLabel("Confidential · Industrial Operations & Process Safety")
        right.setStyleSheet(f"font-size: 11.5px; color: {TEXT_FAINT};")
        layout.addWidget(right)
        return footer
