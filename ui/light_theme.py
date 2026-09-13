"""The third skin: white and grey, for a lit room.

:mod:`ui.theme` is mid navy, :mod:`ui.gov_theme` is near-black navy with teal.
Both assume a dim control room. This one assumes the opposite: a white page on
a light grey ground, the way a printed government form looks, for a screen
beside a window or a projector in a bright hall.

A light design is not a dark one with the colours flipped. Three things have to
change with the ground or the console stops being readable:

* **Status colours.** Amber ``#fbbf24`` and teal ``#2dd4bf`` are chosen to glow
  on near-black. On white they are close to invisible, so every status colour
  here is a darker, denser version of the same hue - the meaning survives, the
  contrast comes back.
* **Separation.** Dark skins separate a card from its ground with a white-alpha
  hairline. On white there is nothing to lighten, so the card *is* the white
  and the ground is the grey, with a solid grey border to close it.
* **The selected navigation item.** White-on-teal does not exist here; the
  selection is a pale grey pill with graphite text, and the icon on it is
  graphite too (``ICON_ON``), not white.

The accent is graphite rather than a colour, because the request was white and
grey: the interactive colour is the darkest thing on the page, which on a light
ground reads as "press this" without adding a hue. The status colours stay
coloured - they carry meaning, not styling - and the brand red stays the brand.
"""

from __future__ import annotations

from typing import TYPE_CHECKING

from .theme import ASSETS as _ASSETS

if TYPE_CHECKING:  # pragma: no cover - typing only
    from PyQt6.QtWidgets import QMainWindow

__all__ = ["PALETTE", "STYLESHEET", "NAME", "prepare", "dress"]

#: What to call this look where an operator can see it.
NAME = "White / grey"

#: Design tokens. Names match :class:`ui.theme.C` so the mapping can be applied
#: without translation.
PALETTE = {
    # Surfaces. The ground is grey and the content is white - the reverse of
    # the dark skins, where the ground is darkest and the cards lift off it.
    "APP": "#eef1f5",
    "SIDEBAR": "#ffffff",
    "HEADER": "#ffffff",
    "PANEL": "#ffffff",
    "PANEL_ALT": "#f5f7fa",
    "CARD": "#ffffff",
    "BORDER": "#d6dce5",
    "BORDER_SOFT": "#e4e9f0",

    # Text. Near-black rather than black: full black on white vibrates.
    "TEXT": "#111a26",
    "TEXT_DIM": "#4f5b6b",
    "TEXT_FAINT": "#7b8798",

    "BRAND": "#c62828",
    # Graphite, not a hue. Dark enough to sit under white text.
    "ACCENT": "#1f2d3d",
    "ACCENT_SOFT": "#33465c",
    "ACCENT_DIM": "#4a5b70",
    "BLUE": "#1d4ed8",
    "PURPLE": "#6d28d9",
    # Graphite on the pale grey selection: white would vanish.
    "ICON_ON": "#111a26",

    "SCROLL_TRACK": "#eef1f5",
    "SCROLL_THUMB": "#c2cad6",
    "SCROLL_THUMB_HOVER": "#9aa5b5",

    # Status, darkened for white. Same meanings, same order of severity.
    "DANGER": "#c62828",
    "WARN": "#b45309",
    "OK": "#0f766e",
    "INFO": "#1d4ed8",
    "OK_WASH": "rgba(15, 118, 110, 0.08)",
}

_C = PALETTE
#: Solid grey hairlines. There is no lighter colour than white to draw an edge
#: in, so on this ground a border is darker than what it encloses.
_EDGE = "#d6dce5"
_EDGE_SOFT = "#e4e9f0"
#: The selected navigation item: a pale grey pill, not a block of colour.
_TINT = "#e7ebf1"
_HOVER = "#f2f5f8"
_FONT = '"Inter", "Segoe UI", "DejaVu Sans", Arial, sans-serif'
_DISPLAY = '"Instrument Sans", "Inter", "Segoe UI", Arial, sans-serif'

STYLESHEET = f"""
QWidget {{
    background-color: {_C["APP"]};
    color: {_C["TEXT"]};
    font-family: {_FONT};
    font-size: 13px;
}}
QLabel {{ background: transparent; border: none; }}
QFrame#Sidebar {{
    background-color: {_C["SIDEBAR"]};
    border-right: 1px solid {_EDGE};
}}
QSplitter#Shell::handle {{ background-color: {_EDGE}; }}
QSplitter#Shell::handle:hover {{ background-color: {_C["ACCENT_DIM"]}; }}
QFrame#Header {{
    background-color: {_C["HEADER"]};
    border-bottom: 1px solid {_EDGE};
}}
QWidget#HeaderBrand {{ background: transparent; }}
QFrame#Footer {{
    background-color: {_C["HEADER"]};
    border-top: 1px solid {_EDGE};
}}
QFrame#Panel, QFrame#Card, QFrame#Tile {{
    background-color: {_C["PANEL"]};
    border: 1px solid {_EDGE};
    border-radius: 8px;
}}

QLabel#AppTitle {{ font-family: {_DISPLAY}; font-size: 26px; font-weight: 700; }}
QLabel#AppSubtitle {{ font-size: 12.5px; color: {_C["TEXT_DIM"]}; }}
QLabel#BrandName {{
    font-family: {_DISPLAY};
    font-size: 15px;
    font-weight: 700;
    color: {_C["TEXT"]};
    letter-spacing: 0.4px;
}}
QLabel#BrandSub {{ font-size: 8px; color: {_C["TEXT_DIM"]}; letter-spacing: 0.4px; }}
QLabel#PageTitle {{
    font-family: {_DISPLAY};
    font-size: 21px;
    font-weight: 700;
    letter-spacing: -0.2px;
}}
QLabel#SectionTitle {{
    font-family: {_DISPLAY};
    font-size: 14.5px;
    font-weight: 600;
    color: {_C["TEXT"]};
}}
QLabel#Caption {{
    font-size: 10px;
    color: {_C["TEXT_DIM"]};
    letter-spacing: 1.1px;
}}
QLabel#Muted {{ color: {_C["TEXT_DIM"]}; }}
QLabel#Faint {{ color: {_C["TEXT_FAINT"]}; font-size: 11.5px; }}
QLabel#KpiValue {{
    font-family: {_DISPLAY};
    font-size: 32px;
    font-weight: 700;
    letter-spacing: -0.6px;
}}
QLabel#KpiUnit {{ font-size: 12px; color: {_C["TEXT_DIM"]}; }}

/* A white button on a white panel needs its edge to do the work, so the
   border is a full step darker than the panel border around it. */
QPushButton {{
    background-color: {_C["PANEL"]};
    border: 1px solid #c4cdd9;
    border-radius: 5px;
    padding: 9px 15px;
    font-family: {_DISPLAY};
    font-weight: 500;
    color: {_C["TEXT"]};
}}
QPushButton:hover {{
    background-color: {_HOVER};
    border-color: {_C["ACCENT_DIM"]};
    color: {_C["TEXT"]};
}}
QPushButton:pressed {{ background-color: {_TINT}; }}
QPushButton:disabled {{ color: {_C["TEXT_FAINT"]}; border-color: {_EDGE_SOFT}; }}
QPushButton#Primary {{
    background-color: {_C["ACCENT"]};
    border: 1px solid {_C["ACCENT"]};
    color: #ffffff;
    font-weight: 600;
}}
QPushButton#Primary:hover {{
    background-color: {_C["ACCENT_SOFT"]};
    border-color: {_C["ACCENT_SOFT"]};
    color: #ffffff;
}}
QPushButton#Primary:disabled {{
    background-color: #c4cdd9;
    border-color: #c4cdd9;
    color: #ffffff;
}}
QPushButton#Warning {{
    background-color: {_C["WARN"]};
    border: 1px solid {_C["WARN"]};
    color: #ffffff;
    font-weight: 600;
}}
QPushButton#Nav {{
    background-color: transparent;
    border: none;
    border-radius: 6px;
    padding: 9px 14px;
    margin: 1px 8px;
    text-align: left;
    font-family: {_DISPLAY};
    font-weight: 500;
    color: {_C["TEXT_DIM"]};
}}
QPushButton#Nav:hover {{
    background-color: {_HOVER};
    color: {_C["TEXT"]};
}}
QPushButton#Nav:checked {{
    background-color: {_TINT};
    color: {_C["TEXT"]};
    font-weight: 600;
}}

QLineEdit, QTextEdit, QPlainTextEdit {{
    background-color: {_C["PANEL"]};
    border: 1px solid #c4cdd9;
    border-radius: 5px;
    padding: 8px 10px;
    color: {_C["TEXT"]};
    selection-background-color: {_C["ACCENT_SOFT"]};
    selection-color: #ffffff;
}}
QLineEdit:focus, QTextEdit:focus, QPlainTextEdit:focus {{
    border: 1px solid {_C["ACCENT"]};
}}
QComboBox {{
    background-color: {_C["PANEL"]};
    border: 1px solid #c4cdd9;
    border-radius: 5px;
    padding: 7px 10px;
    color: {_C["TEXT"]};
}}
QComboBox:focus {{ border: 1px solid {_C["ACCENT"]}; }}
QComboBox QAbstractItemView {{
    background-color: {_C["PANEL"]};
    border: 1px solid {_EDGE};
    selection-background-color: {_TINT};
    selection-color: {_C["TEXT"]};
}}
QCheckBox {{ spacing: 8px; background: transparent; }}
/* The indicator has to be drawn here. A style sheet rule anywhere on QCheckBox
   puts Qt's own drawing aside, and an unstyled indicator then arrives as an
   invisible square - a toggle nobody can see the state of. */
QCheckBox::indicator {{
    width: 15px;
    height: 15px;
    border: 1px solid #b3bece;
    border-radius: 3px;
    background-color: #ffffff;
}}
QCheckBox::indicator:hover {{ border-color: {_C["ACCENT"]}; }}
QCheckBox::indicator:checked {{
    background-color: {_C["ACCENT"]};
    border-color: {_C["ACCENT"]};
    image: url({_ASSETS}/check.svg);
}}
QCheckBox::indicator:disabled {{
    border-color: {_EDGE_SOFT};
    background-color: {_C["PANEL_ALT"]};
}}

QTableWidget {{
    background-color: {_C["PANEL"]};
    alternate-background-color: {_C["PANEL_ALT"]};
    gridline-color: {_EDGE_SOFT};
    border: 1px solid {_EDGE};
    border-radius: 8px;
    selection-background-color: {_TINT};
    selection-color: {_C["TEXT"]};
}}
QHeaderView::section {{
    background-color: {_C["PANEL_ALT"]};
    color: {_C["TEXT_DIM"]};
    padding: 9px 8px;
    border: none;
    border-bottom: 1px solid {_EDGE};
    font-family: {_DISPLAY};
    font-weight: 600;
    font-size: 11.5px;
}}
QTableWidget::item {{ padding: 4px; }}

QTabWidget::pane {{ border: none; }}
QTabBar::tab {{
    background: transparent;
    color: {_C["TEXT_DIM"]};
    padding: 9px 18px;
    border-bottom: 2px solid transparent;
    font-family: {_DISPLAY};
    font-weight: 600;
}}
QTabBar::tab:selected {{
    color: {_C["TEXT"]};
    border-bottom: 2px solid {_C["ACCENT"]};
}}

QProgressBar {{
    background-color: {_C["PANEL_ALT"]};
    border: 1px solid {_EDGE};
    border-radius: 4px;
    height: 6px;
    text-align: center;
}}
QProgressBar::chunk {{ background-color: {_C["ACCENT"]}; border-radius: 3px; }}

QScrollBar:vertical {{
    background: transparent;
    width: 10px;
    margin: 0px;
    border: none;
}}
QScrollBar::handle:vertical {{
    background: {_C["SCROLL_THUMB"]};
    border-radius: 5px;
    min-height: 36px;
    margin: 2px;
}}
QScrollBar::handle:vertical:hover {{ background: {_C["SCROLL_THUMB_HOVER"]}; }}
QScrollBar:horizontal {{
    background: transparent;
    height: 10px;
    margin: 0px;
    border: none;
}}
QScrollBar::handle:horizontal {{
    background: {_C["SCROLL_THUMB"]};
    border-radius: 5px;
    min-width: 36px;
    margin: 2px;
}}
QScrollBar::handle:horizontal:hover {{ background: {_C["SCROLL_THUMB_HOVER"]}; }}
QScrollBar::add-line, QScrollBar::sub-line {{
    background: transparent;
    border: none;
    width: 0px;
    height: 0px;
}}
QScrollBar::add-page, QScrollBar::sub-page {{ background: transparent; }}

QStatusBar {{ background-color: {_C["HEADER"]}; color: {_C["TEXT_DIM"]}; }}
QMenuBar {{ background-color: {_C["HEADER"]}; color: {_C["TEXT_DIM"]}; }}
QMenuBar::item:selected {{ background: {_TINT}; color: {_C["TEXT"]}; }}
QMenu {{
    background-color: {_C["PANEL"]};
    border: 1px solid {_EDGE};
    padding: 4px;
}}
QMenu::item {{ padding: 6px 22px; border-radius: 4px; }}
QMenu::item:selected {{ background: {_TINT}; color: {_C["TEXT"]}; }}
QToolTip {{
    background-color: {_C["TEXT"]};
    color: #ffffff;
    border: 1px solid {_C["TEXT"]};
    padding: 6px;
}}
"""


def prepare() -> None:
    """Repoint the shared colours. Call this *before* building a window.

    Half of a re-skin cannot be delivered by a style sheet: badges, KPI values,
    chart series, the rail's safety card and the navigation icons read the
    palette in their constructors, so the palette has to be in place before any
    of them is built. On a light ground this matters more than on a dark one -
    a widget that keeps a dark skin's colour here is not merely off-key, it is
    unreadable.
    """
    from .theme import apply_palette

    apply_palette(PALETTE)


def dress(window: "QMainWindow") -> None:
    """Put the skin on a built window: the style sheet and the quiet header.

    The mark, the avatar and the search box are hidden rather than removed from
    :class:`ui2.components.HeaderBar`, so the header itself stays one widget
    with one behaviour and only its appearance differs by entry point.
    """
    window.setStyleSheet(STYLESHEET)
    header = getattr(window, "header", None)
    for name in ("mark", "avatar", "search"):
        widget = getattr(header, name, None)
        if widget is not None:
            widget.hide()
