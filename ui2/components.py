"""Emoji-free navigation, grouped sidebar, and enterprise header for SENTRA.

Includes role-based visibility filtering, badge notifications, and interactive
user profile management for Oil India Limited operations.
"""

from __future__ import annotations

from typing import Dict, List, Optional, Sequence, Tuple

from PyQt6.QtCore import QSize, Qt, pyqtSignal
from PyQt6.QtWidgets import (
    QButtonGroup,
    QDialog,
    QDialogButtonBox,
    QFrame,
    QHBoxLayout,
    QLabel,
    QLineEdit,
    QPushButton,
    QScrollArea,
    QVBoxLayout,
    QWidget,
)

from ui.theme import LOOK, PAGE_MARGIN, C
from ui2.auth import AUTH, User
from ui2.icons import nav_icon

__all__ = ["Sidebar", "HeaderBar", "scrollable", "titled", "NAV_GROUPS"]


NAV_GROUPS: List[Tuple[str, List[Tuple[str, str, str]]]] = [
    (
        "OPERATIONS",
        [
            ("dashboard", "Dashboard", "dashboard.view"),
            ("incidents", "Incidents", "reports.view"),
            ("reports", "Reports & Evidence", "reports.view"),
            ("review", "Human Review", "review.view"),
            ("actions", "Corrective Actions", "actions.view"),
        ],
    ),
    (
        "RISK INTELLIGENCE",
        [
            ("hotspots", "Risk Hotspots", "hotspots.view"),
            ("analytics", "Analytics", "analytics.view"),
        ],
    ),
    (
        "PROCESSING",
        [
            ("ingest", "Ingest and OCR", "ingest.view"),
            ("workflow", "Analysis Pipeline", "workflow.view"),
        ],
    ),
    (
        "SYSTEM",
        [
            ("engines", "Intelligence Engines", "engines.view"),
            ("audit", "Audit Trail", "audit.view"),
            ("settings", "Settings", "settings.view"),
        ],
    ),
]


def scrollable(widget: QWidget, minimum_height: int = 0) -> QScrollArea:
    """Wrap a page so it scrolls rather than compressing on a short screen."""
    if minimum_height:
        widget.setMinimumHeight(minimum_height)
    area = QScrollArea()
    area.setWidgetResizable(True)
    area.setFrameShape(QFrame.Shape.NoFrame)
    area.setHorizontalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAsNeeded)
    area.setVerticalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAsNeeded)
    area.setWidget(widget)
    return area


class Sidebar(QFrame):
    """Grouped navigation rail with role-based filtering and notification badges."""

    navigated = pyqtSignal(str)

    def __init__(self, items: Optional[Sequence[Tuple[str, str]]] = None) -> None:
        super().__init__()
        self.setObjectName("Sidebar")
        self.setMinimumWidth(212)
        self.setMaximumWidth(330)
        self.resize(238, self.height())
        self._buttons: Dict[str, QPushButton] = {}
        self._badges: Dict[str, QLabel] = {}
        self._group_headers: List[QLabel] = []
        self._group = QButtonGroup(self)
        self._group.setExclusive(True)

        self._build_ui()

    def _build_ui(self) -> None:
        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)

        nav = QWidget()
        self.nav_layout = QVBoxLayout(nav)
        self.nav_layout.setContentsMargins(0, 8, 0, 8)
        self.nav_layout.setSpacing(2)

        scroller = QScrollArea()
        scroller.setWidgetResizable(True)
        scroller.setFrameShape(QFrame.Shape.NoFrame)
        scroller.setHorizontalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAlwaysOff)
        scroller.setWidget(nav)

        # Build Navigation Items by Category Group
        for group_title, group_items in NAV_GROUPS:
            # Group Header
            grp_lbl = QLabel(f"  {group_title}")
            grp_lbl.setStyleSheet(f"""
                color: {C.TEXT_FAINT};
                font-size: 10px;
                font-weight: 800;
                letter-spacing: 0.8px;
                padding-top: 10px;
                padding-bottom: 2px;
                padding-left: 10px;
            """)
            self.nav_layout.addWidget(grp_lbl)
            self._group_headers.append(grp_lbl)

            for key, label, perm in group_items:
                row = QWidget()
                row_layout = QHBoxLayout(row)
                row_layout.setContentsMargins(0, 0, 12, 0)
                row_layout.setSpacing(0)

                text = f"  {label}"
                button = QPushButton(text)
                button.setObjectName("Nav")
                button.setCheckable(True)
                if LOOK.NAV_ICONS:
                    button.setIcon(nav_icon(key))
                    button.setIconSize(QSize(17, 17))
                button.setCursor(Qt.CursorShape.PointingHandCursor)
                button.clicked.connect(lambda _checked, name=key: self.navigated.emit(name))
                self._group.addButton(button)

                badge = QLabel("")
                badge.setVisible(False)
                badge.setFixedHeight(18)
                badge.setAlignment(Qt.AlignmentFlag.AlignCenter)
                badge.setStyleSheet(
                    f"background-color: {C.DANGER}; color: white; border-radius: 9px;"
                    "padding: 0 6px; font-size: 10px; font-weight: 700;")

                row_layout.addWidget(button, stretch=1)
                row_layout.addWidget(badge)
                self.nav_layout.addWidget(row)
                self._buttons[key] = button
                self._badges[key] = badge

        self.nav_layout.addStretch(1)
        layout.addWidget(scroller, stretch=1)
        layout.addWidget(self._footer())

    def update_role_permissions(self) -> None:
        """Hide or show navigation links based on active user permissions."""
        user = AUTH.current_user
        if not user:
            return

        for group_title, group_items in NAV_GROUPS:
            for key, label, perm in group_items:
                btn = self._buttons.get(key)
                if btn:
                    allowed = AUTH.has_permission(perm) if perm else True
                    btn.parent().setVisible(allowed)

    def select(self, key: str) -> None:
        """Check a nav item without emitting a navigation signal."""
        button = self._buttons.get(key)
        if button is not None:
            button.setChecked(True)

    def set_badge(self, key: str, count: int) -> None:
        """Show a count beside a nav item; hidden at zero."""
        badge = self._badges.get(key)
        if badge is None:
            return
        badge.setText(str(count))
        badge.setVisible(count > 0)

    @staticmethod
    def _footer() -> QWidget:
        card = QFrame()
        card.setStyleSheet(
            f"background-color: {C.RAIL_WASH}; border: 1px solid {C.RAIL_LINE};"
            "border-radius: 10px;")
        layout = QVBoxLayout(card)
        layout.setContentsMargins(14, 10, 14, 10)
        layout.setSpacing(2)
        title = QLabel("OIL INDIA LIMITED HSE")
        title.setStyleSheet(f"color: {C.RAIL_ACCENT}; font-size: 10px; font-weight: 800;"
                            "letter-spacing: 0.8px; border: none;")
        layout.addWidget(title)
        for line in ("No finding is closed unseen.",
                     "Every flag carries its evidence."):
            label = QLabel(line)
            label.setWordWrap(True)
            label.setStyleSheet(f"color: {C.TEXT_DIM}; font-size: 10.5px; border: none;")
            layout.addWidget(label)

        holder = QWidget()
        holder_layout = QVBoxLayout(holder)
        holder_layout.setContentsMargins(12, 6, 12, 12)
        holder_layout.addWidget(card)
        return holder


def titled(page: QWidget, title: str, subtitle: str) -> QWidget:
    """Put a page behind its own heading."""
    if not title:
        return page

    heading = QLabel(title)
    heading.setObjectName("PageTitle")
    caption = QLabel(subtitle)
    caption.setObjectName("Muted")
    caption.setWordWrap(True)

    head = QFrame()
    head.setObjectName("PageHead")
    head_layout = QVBoxLayout(head)
    head_layout.setContentsMargins(PAGE_MARGIN, 14, PAGE_MARGIN, 0)
    head_layout.setSpacing(1)
    head_layout.addWidget(heading)
    head_layout.addWidget(caption)

    wrapper = QWidget()
    layout = QVBoxLayout(wrapper)
    layout.setContentsMargins(0, 0, 0, 0)
    layout.setSpacing(0)
    layout.addWidget(head)
    layout.addWidget(page, stretch=1)
    return wrapper


def _divider() -> QLabel:
    rule = QLabel()
    rule.setFixedSize(1, 20)
    rule.setStyleSheet(f"background-color: {C.BORDER};")
    return rule


class HeaderBar(QFrame):
    """Full-width header with enterprise user profile popover and sign-out."""

    search_changed = pyqtSignal(str)
    sign_out_requested = pyqtSignal()
    role_switch_requested = pyqtSignal(str)

    def __init__(self, product: str, title: str, subtitle: str, user_name: str = "",
                 user_role: str = "") -> None:
        super().__init__()
        self.setObjectName("Header")
        self.setFixedHeight(58)

        self.brand = QWidget()
        self.brand.setObjectName("HeaderBrand")
        brand_layout = QHBoxLayout(self.brand)
        brand_layout.setContentsMargins(22, 0, 12, 0)
        brand_layout.setSpacing(10)

        self.mark = QLabel("S")
        self.mark.setFixedSize(30, 30)
        self.mark.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.mark.setStyleSheet(
            f"background-color: {C.ACCENT}; color: white; border-radius: 8px;"
            "font-size: 16px; font-weight: 700;")
        product_label = QLabel(product)
        product_label.setObjectName("BrandName")
        brand_layout.addWidget(self.mark)
        brand_layout.addWidget(product_label)
        brand_layout.addStretch(1)

        organisation = QLabel(title)
        organisation.setObjectName("BrandName")
        context_label = QLabel(subtitle)
        context_label.setObjectName("Muted")

        titles = QHBoxLayout()
        titles.setSpacing(10)
        titles.setContentsMargins(PAGE_MARGIN, 0, 0, 0)
        titles.addWidget(organisation)
        titles.addWidget(_divider())
        titles.addWidget(context_label)

        self.search = QLineEdit()
        self.search.setPlaceholderText("Search reports, sites, activities...")
        self.search.setClearButtonEnabled(True)
        self.search.setMinimumWidth(180)
        self.search.setMaximumWidth(360)
        self.search.textChanged.connect(self.search_changed.emit)

        self.engine_label = QLabel("Engines: starting")
        self.engine_label.setObjectName("Faint")
        self.engine_label.setAlignment(Qt.AlignmentFlag.AlignRight)

        # Profile Pill (Clickable)
        self.profile_btn = QPushButton()
        self.profile_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        self.profile_btn.setStyleSheet(f"""
            QPushButton {{
                background-color: {C.PANEL_ALT};
                border: 1px solid {C.BORDER};
                border-radius: 18px;
                padding: 4px 12px 4px 6px;
            }}
            QPushButton:hover {{
                border-color: {C.ACCENT};
                background-color: {C.CARD};
            }}
        """)
        p_layout = QHBoxLayout(self.profile_btn)
        p_layout.setContentsMargins(0, 0, 0, 0)
        p_layout.setSpacing(8)

        self.avatar = QLabel("DM")
        self.avatar.setFixedSize(28, 28)
        self.avatar.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.avatar.setStyleSheet(
            f"background-color: {C.ACCENT}; color: white; border-radius: 14px;"
            "font-weight: 700; font-size: 11px;")

        user_text = QVBoxLayout()
        user_text.setSpacing(0)
        self.lbl_name = QLabel(user_name or "D. Manikandan")
        self.lbl_name.setStyleSheet("font-weight: 700; font-size: 12px; color: " + C.TEXT + ";")
        self.lbl_role = QLabel(user_role or "HSE Analyst")
        self.lbl_role.setStyleSheet("font-size: 10px; color: " + C.INFO + ";")
        user_text.addWidget(self.lbl_name)
        user_text.addWidget(self.lbl_role)

        p_layout.addWidget(self.avatar)
        p_layout.addLayout(user_text)
        self.profile_btn.clicked.connect(self._show_profile_dialog)

        layout = QHBoxLayout(self)
        layout.setContentsMargins(0, 10, PAGE_MARGIN, 10)
        layout.setSpacing(14)
        layout.addWidget(self.brand)
        layout.addLayout(titles)
        layout.addStretch(1)
        layout.addWidget(self.engine_label)
        layout.addWidget(self.search)
        layout.addWidget(self.profile_btn)

    def set_user(self, user: Optional[User]) -> None:
        """Update header bar when user logs in or switches."""
        if not user:
            return
        self.lbl_name.setText(user.name)
        self.lbl_role.setText(user.role)
        self.avatar.setText(user.avatar_initials)

    def set_rail_width(self, width: int) -> None:
        self.brand.setFixedWidth(max(width, 0))

    def set_engines(self, text: str) -> None:
        self.engine_label.setText(text)

    def _show_profile_dialog(self) -> None:
        user = AUTH.current_user
        if not user:
            return

        dialog = QDialog(self)
        dialog.setWindowTitle("User Profile & Permissions")
        dialog.setFixedWidth(420)
        d_layout = QVBoxLayout(dialog)
        d_layout.setContentsMargins(20, 20, 20, 20)
        d_layout.setSpacing(14)

        # Profile Card
        card = QFrame()
        card.setStyleSheet(f"background-color: {C.PANEL_ALT}; border: 1px solid {C.BORDER}; border-radius: 8px; padding: 10px;")
        c_layout = QVBoxLayout(card)
        c_layout.setSpacing(4)
        
        c_layout.addWidget(QLabel(f"<b>Name:</b> {user.name}"))
        c_layout.addWidget(QLabel(f"<b>Employee ID:</b> {user.employee_id}"))
        c_layout.addWidget(QLabel(f"<b>Role:</b> {user.role}"))
        c_layout.addWidget(QLabel(f"<b>Department:</b> {user.department}"))
        c_layout.addWidget(QLabel(f"<b>Facility / Site:</b> {user.site}"))
        c_layout.addWidget(QLabel(f"<b>Status:</b> <span style='color:{C.OK};'>● Online (Session Active)</span>"))
        d_layout.addWidget(card)

        # Permissions Summary
        d_layout.addWidget(QLabel(f"<b>Granted System Permissions ({len(user.permissions)}):</b>"))
        perm_box = QLabel(", ".join(sorted(user.permissions)))
        perm_box.setWordWrap(True)
        perm_box.setStyleSheet(f"color: {C.TEXT_DIM}; font-size: 11px; background-color: {C.APP}; padding: 8px; border-radius: 6px;")
        d_layout.addWidget(perm_box)

        # Actions Row
        actions_row = QHBoxLayout()
        
        btn_switch = QPushButton("Switch Role (Demo)")
        btn_switch.setStyleSheet(f"background-color: {C.CARD}; color: {C.TEXT}; padding: 6px 12px; border-radius: 6px;")
        other_role = "Safety Officer" if user.role == "HSE Analyst" else "HSE Analyst"
        btn_switch.clicked.connect(lambda: [dialog.accept(), self.role_switch_requested.emit(other_role)])

        btn_logout = QPushButton("Sign Out")
        btn_logout.setStyleSheet(f"background-color: {C.DANGER}; color: white; padding: 6px 14px; border-radius: 6px; font-weight: 700;")
        btn_logout.clicked.connect(lambda: [dialog.accept(), self.sign_out_requested.emit()])

        actions_row.addWidget(btn_switch)
        actions_row.addStretch()
        actions_row.addWidget(btn_logout)
        d_layout.addLayout(actions_row)

        dialog.exec()
