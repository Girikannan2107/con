"""Split-Screen Enterprise Login View for SENTRA.

Features an industrial Oil & Gas left visual panel and a clean light enterprise
login panel on the right with full role-based authentication for Oil India Limited.
"""

from __future__ import annotations

from PyQt6.QtCore import Qt, pyqtSignal
from PyQt6.QtGui import QColor, QFont, QPainter, QLinearGradient
from PyQt6.QtWidgets import (
    QCheckBox,
    QFrame,
    QHBoxLayout,
    QLabel,
    QLineEdit,
    QPushButton,
    QSplitter,
    QVBoxLayout,
    QWidget,
)

from ui.theme import C
from ui2.auth import AUTH

__all__ = ["LoginView"]


class LeftHeroPanel(QFrame):
    """Left side industrial visual panel with deep overlay and brand context."""

    def __init__(self) -> None:
        super().__init__()
        self.setStyleSheet("""
            QFrame {
                background: qlineargradient(x1:0, y1:0, x2:1, y2:1, stop:0 #050f14, stop:0.5 #081d24, stop:1 #03080b);
                border-right: 1px solid #142a34;
            }
        """)
        layout = QVBoxLayout(self)
        layout.setContentsMargins(48, 48, 48, 48)
        layout.setSpacing(20)

        # Top Brand Mark
        top_row = QHBoxLayout()
        logo_badge = QLabel("S")
        logo_badge.setFixedSize(36, 36)
        logo_badge.setAlignment(Qt.AlignmentFlag.AlignCenter)
        logo_badge.setStyleSheet("""
            background-color: #8CFF32;
            color: #050706;
            font-size: 20px;
            font-weight: 900;
            border-radius: 6px;
        """)
        
        brand_info = QVBoxLayout()
        brand_info.setSpacing(0)
        brand_title = QLabel("SENTRA")
        brand_title.setStyleSheet("font-size: 18px; font-weight: 900; color: #ffffff; letter-spacing: 1px;")
        brand_sub = QLabel("SAFETY INTELLIGENCE PLATFORM")
        brand_sub.setStyleSheet("font-size: 9px; font-weight: 700; color: #18D6C2; letter-spacing: 0.5px;")
        brand_info.addWidget(brand_title)
        brand_info.addWidget(brand_sub)

        top_row.addWidget(logo_badge)
        top_row.addLayout(brand_info)
        top_row.addStretch()
        layout.addLayout(top_row)

        layout.addStretch(1)

        # Center Industrial Graphic / Highlight
        center_box = QFrame()
        center_box.setStyleSheet("background-color: rgba(14, 38, 48, 0.6); border: 1px solid #1b4554; border-radius: 10px; padding: 12px;")
        c_layout = QVBoxLayout(center_box)
        c_layout.setSpacing(10)

        tag = QLabel("PROCESS SAFETY & HSE INTELLIGENCE")
        tag.setStyleSheet("color: #8CFF32; font-size: 11px; font-weight: 800; letter-spacing: 0.8px;")
        c_layout.addWidget(tag)

        quote = QLabel("Turning safety evidence into actionable intelligence before a precursor becomes an event.")
        quote.setWordWrap(True)
        quote.setStyleSheet("color: #e2f1f8; font-size: 17px; font-weight: 700; line-height: 1.3;")
        c_layout.addWidget(quote)

        layout.addWidget(center_box)

        layout.addStretch(1)

        # Bottom Context
        bottom_box = QVBoxLayout()
        bottom_box.setSpacing(4)
        bot_org = QLabel("Oil India Limited")
        bot_org.setStyleSheet("color: #ffffff; font-size: 13px; font-weight: 700;")
        bot_desc = QLabel("Field Operations & Incident Risk Console · Problem Statement 26165")
        bot_desc.setStyleSheet("color: #7b9da8; font-size: 11.5px;")
        bottom_box.addWidget(bot_org)
        bottom_box.addWidget(bot_desc)
        layout.addLayout(bottom_box)


class LoginView(QWidget):
    """Split-screen enterprise login page."""

    authenticated = pyqtSignal()
    back_to_landing = pyqtSignal()
    report_incident_requested = pyqtSignal()

    def __init__(self) -> None:
        super().__init__()
        self.setObjectName("LoginView")
        self._build_ui()

    def _build_ui(self) -> None:
        root_layout = QHBoxLayout(self)
        root_layout.setContentsMargins(0, 0, 0, 0)
        root_layout.setSpacing(0)

        # Left Side: Hero Panel (52% width)
        self.left_panel = LeftHeroPanel()
        root_layout.addWidget(self.left_panel, stretch=52)

        # Right Side: Clean Light Enterprise Login Form (48% width)
        right_container = QWidget()
        right_container.setStyleSheet("background-color: #f8fafc; color: #0f172a; font-family: 'Segoe UI', Arial, sans-serif;")
        r_layout = QVBoxLayout(right_container)
        r_layout.setContentsMargins(50, 40, 50, 40)
        r_layout.setSpacing(16)

        # Back to Home link
        top_actions = QHBoxLayout()
        btn_back = QPushButton("<- Back to Home")
        btn_back.setCursor(Qt.CursorShape.PointingHandCursor)
        btn_back.setStyleSheet("""
            QPushButton {
                background: transparent;
                border: none;
                color: #64748b;
                font-size: 12px;
                font-weight: 600;
                text-align: left;
            }
            QPushButton:hover {
                color: #0f172a;
            }
        """)
        btn_back.clicked.connect(self.back_to_landing.emit)
        top_actions.addWidget(btn_back)
        top_actions.addStretch()
        r_layout.addLayout(top_actions)

        r_layout.addStretch(1)

        # Form Container
        form_box = QVBoxLayout()
        form_box.setSpacing(14)

        title = QLabel("Welcome back")
        title.setStyleSheet("font-size: 26px; font-weight: 800; color: #0f172a;")
        sub = QLabel("Sign in to your Oil India safety intelligence workspace.")
        sub.setStyleSheet("font-size: 13px; color: #64748b;")
        form_box.addWidget(title)
        form_box.addWidget(sub)

        form_box.addSpacing(10)

        # Employee ID Field
        lbl_emp = QLabel("EMPLOYEE ID / EMAIL")
        lbl_emp.setStyleSheet("font-size: 11px; font-weight: 700; color: #475569; letter-spacing: 0.5px;")
        self.txt_emp = QLineEdit()
        self.txt_emp.setPlaceholderText("e.g. HSE001 or SAFE001")
        self.txt_emp.setText("HSE001")
        self.txt_emp.setFixedHeight(40)
        self.txt_emp.setStyleSheet("""
            QLineEdit {
                background-color: #ffffff;
                border: 1px solid #cbd5e1;
                border-radius: 6px;
                color: #0f172a;
                padding: 0 12px;
                font-size: 13.5px;
            }
            QLineEdit:focus {
                border: 1px solid #0891b2;
            }
        """)
        form_box.addWidget(lbl_emp)
        form_box.addWidget(self.txt_emp)

        # Password Field
        pwd_header = QHBoxLayout()
        lbl_pwd = QLabel("PASSWORD")
        lbl_pwd.setStyleSheet("font-size: 11px; font-weight: 700; color: #475569; letter-spacing: 0.5px;")
        lbl_forgot = QLabel("Forgot Password?")
        lbl_forgot.setStyleSheet("font-size: 11.5px; color: #0891b2; font-weight: 600;")
        pwd_header.addWidget(lbl_pwd)
        pwd_header.addStretch()
        pwd_header.addWidget(lbl_forgot)
        form_box.addLayout(pwd_header)

        self.txt_pwd = QLineEdit()
        self.txt_pwd.setEchoMode(QLineEdit.EchoMode.Password)
        self.txt_pwd.setText("sentra2026")
        self.txt_pwd.setFixedHeight(40)
        self.txt_pwd.setStyleSheet("""
            QLineEdit {
                background-color: #ffffff;
                border: 1px solid #cbd5e1;
                border-radius: 6px;
                color: #0f172a;
                padding: 0 12px;
                font-size: 13.5px;
            }
            QLineEdit:focus {
                border: 1px solid #0891b2;
            }
        """)
        self.txt_pwd.returnPressed.connect(self._handle_login)
        form_box.addWidget(self.txt_pwd)

        # Remember workstation checkbox
        chk_row = QHBoxLayout()
        self.chk_remember = QCheckBox("Remember this workstation")
        self.chk_remember.setChecked(True)
        self.chk_remember.setStyleSheet("color: #64748b; font-size: 12px;")
        chk_row.addWidget(self.chk_remember)
        chk_row.addStretch()
        form_box.addLayout(chk_row)

        # Error Message Label
        self.lbl_error = QLabel("")
        self.lbl_error.setStyleSheet("color: #ef4444; font-size: 12px; font-weight: 600;")
        self.lbl_error.hide()
        form_box.addWidget(self.lbl_error)

        # Primary Sign In Button
        self.btn_login = QPushButton("SIGN IN")
        self.btn_login.setFixedHeight(44)
        self.btn_login.setCursor(Qt.CursorShape.PointingHandCursor)
        self.btn_login.setStyleSheet("""
            QPushButton {
                background-color: #0f172a;
                color: #ffffff;
                font-size: 13.5px;
                font-weight: 800;
                border-radius: 6px;
                border: 1px solid #0f172a;
            }
            QPushButton:hover {
                background-color: #1e293b;
            }
        """)
        self.btn_login.clicked.connect(self._handle_login)
        form_box.addWidget(self.btn_login)

        # SSO Option Button
        self.btn_sso = QPushButton("SIGN IN WITH OIL INDIA SSO")
        self.btn_sso.setFixedHeight(40)
        self.btn_sso.setCursor(Qt.CursorShape.PointingHandCursor)
        self.btn_sso.setStyleSheet("""
            QPushButton {
                background-color: #ffffff;
                color: #334155;
                font-size: 12.5px;
                font-weight: 700;
                border-radius: 6px;
                border: 1px solid #cbd5e1;
            }
            QPushButton:hover {
                background-color: #f1f5f9;
                border-color: #94a3b8;
            }
        """)
        self.btn_sso.clicked.connect(lambda: self._quick_login("HSE001"))
        form_box.addWidget(self.btn_sso)

        # Demo Role Switcher
        demo_sec = QVBoxLayout()
        demo_sec.setSpacing(6)
        lbl_demo = QLabel("DEMO ROLE QUICK ACCESS")
        lbl_demo.setStyleSheet("font-size: 10px; font-weight: 800; color: #94a3b8; letter-spacing: 0.8px;")
        demo_sec.addWidget(lbl_demo)

        demo_pills = QHBoxLayout()
        demo_pills.setSpacing(10)

        btn_analyst = QPushButton("HSE Analyst (HSE001)")
        btn_analyst.setFixedHeight(30)
        btn_analyst.setStyleSheet("background-color: #e2e8f0; color: #1e293b; font-weight: 700; font-size: 11px; border-radius: 4px; border: none;")
        btn_analyst.clicked.connect(lambda: self._quick_login("HSE001"))

        btn_officer = QPushButton("Safety Officer (SAFE001)")
        btn_officer.setFixedHeight(30)
        btn_officer.setStyleSheet("background-color: #e2e8f0; color: #1e293b; font-weight: 700; font-size: 11px; border-radius: 4px; border: none;")
        btn_officer.clicked.connect(lambda: self._quick_login("SAFE001"))

        demo_pills.addWidget(btn_analyst)
        demo_pills.addWidget(btn_officer)
        demo_sec.addLayout(demo_pills)
        form_box.addLayout(demo_sec)

        r_layout.addLayout(form_box)

        r_layout.addStretch(1)

        # Bottom Utilities
        bot_row = QHBoxLayout()
        btn_report = QPushButton("REPORT AN INCIDENT")
        btn_report.setCursor(Qt.CursorShape.PointingHandCursor)
        btn_report.setStyleSheet("background: transparent; border: none; color: #0891b2; font-size: 11.5px; font-weight: 700;")
        btn_report.clicked.connect(self.report_incident_requested.emit)

        btn_help = QLabel("Need Help? Contact Admin")
        btn_help.setStyleSheet("color: #94a3b8; font-size: 11.5px;")

        bot_row.addWidget(btn_report)
        bot_row.addStretch()
        bot_row.addWidget(btn_help)
        r_layout.addLayout(bot_row)

        root_layout.addWidget(right_container, stretch=48)

    def _quick_login(self, emp_id: str) -> None:
        self.txt_emp.setText(emp_id)
        self.txt_pwd.setText("sentra2026")
        self._handle_login()

    def _handle_login(self) -> None:
        emp_id = self.txt_emp.text().strip()
        pwd = self.txt_pwd.text()

        if not emp_id:
            self.lbl_error.setText("Please enter your Employee ID.")
            self.lbl_error.show()
            return

        self.btn_login.setText("Signing in...")
        self.btn_login.setEnabled(False)

        if AUTH.login(emp_id, pwd):
            self.lbl_error.hide()
            self.btn_login.setText("SIGN IN")
            self.btn_login.setEnabled(True)
            self.authenticated.emit()
        else:
            self.lbl_error.setText("Employee ID or password is incorrect.")
            self.lbl_error.show()
            self.btn_login.setText("SIGN IN")
            self.btn_login.setEnabled(True)
