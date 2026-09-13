"""The white-and-grey skin, from the supplied design.

:mod:`ui.theme` is mid navy, :mod:`ui.gov_theme` is near-black navy with teal.
Both assume a dim control room. This one assumes the opposite: white cards on a
light grey ground with a blue accent, the way a government console looks in a
lit hall - which is where this one is demonstrated.

Every value below comes from the reference design's tokens (its ``index.css``
and the palette at the head of its ``App.tsx``), so the console can be checked
against it colour by colour:

* ground ``#f0f2f5``, cards ``#ffffff`` at a 10px radius behind a ``#e2e8f0``
  hairline; the raised feel there comes from a shadow, which a Qt style sheet
  cannot draw, so the border carries the separation on its own;
* blue ``#2563eb`` as the interactive colour, with the selected navigation item
  a ``#dbeafe`` pill in ``#1d4ed8`` - filled, not tinted;
* text in four weights of slate, ``#0f172a`` down to ``#9ca3af``;
* status in the light-ground versions of the same hues: green ``#16a34a``,
  amber ``#d97706``, red ``#dc2626``;
* table headings in small capitals - which is why :func:`prepare` sets
  ``DataTable.UPPERCASE_HEADERS``: Qt style sheets have no ``text-transform``,
  so capitals can only come from the code that builds the heading.

A light design is not a dark one with the colours flipped. Two things have to
change with the ground or the console stops being readable: the status colours
are darkened, because amber ``#fbbf24`` and teal ``#2dd4bf`` are chosen to glow
on near-black and all but vanish on white; and separation runs the other way,
since there is nothing lighter than white to draw a hairline in, so a border
here is darker than what it encloses.

Three deliberate departures from the reference, each because a web page and a
workstation are not the same surface:

``scroll bars``
    4px in the design. That is a mouse target nobody hits, so they are 9px.
``fonts``
    Instrument Sans, Inter and DM Mono are web fonts and will not be installed
    on a plant machine, so each is given the platform's own stack behind it.
``the header``
    The mark, the avatar and the search box stay hidden, as asked for earlier.
    :func:`dress` is where that happens, and undoing it is one line.
"""

from __future__ import annotations

from typing import TYPE_CHECKING

from .theme import ASSETS as _ASSETS

if TYPE_CHECKING:  # pragma: no cover - typing only
    from PyQt6.QtWidgets import QMainWindow

__all__ = ["PALETTE", "STYLESHEET", "NAME", "prepare", "dress"]

#: What to call this look where an operator can see it.
NAME = "White / grey"

#: The design's tokens. Names match :class:`ui.theme.C` so the mapping can be
#: applied without translation.
PALETTE = {
    # Surfaces. The ground is grey and the content is white - the reverse of
    # the dark skins, where the ground is darkest and the cards lift off it.
    "APP": "#f0f2f5",
    "SIDEBAR": "#ffffff",
    "HEADER": "#ffffff",
    "PANEL": "#ffffff",
    "PANEL_ALT": "#f8fafc",
    "CARD": "#ffffff",
    "BORDER": "#e2e8f0",
    "BORDER_SOFT": "#f1f5f9",

    # Text, in the design's four weights of slate.
    "TEXT": "#0f172a",
    "TEXT_DIM": "#6b7280",
    "TEXT_FAINT": "#9ca3af",

    "BRAND": "#dc2626",
    "ACCENT": "#2563eb",
    "ACCENT_SOFT": "#3b82f6",
    "ACCENT_DIM": "#1d4ed8",
    "BLUE": "#3b82f6",
    "PURPLE": "#8b5cf6",
    # The selected nav item is a pale blue pill, so its icon is the deep blue
    # of the label on it. White would be an empty pill.
    "ICON_ON": "#1d4ed8",

    "SCROLL_TRACK": "#f0f2f5",
    "SCROLL_THUMB": "#cbd5e1",
    "SCROLL_THUMB_HOVER": "#94a3b8",

    # Status, in the design's light-ground values. Same meanings, same order.
    "DANGER": "#dc2626",
    "WARN": "#d97706",
    "OK": "#16a34a",
    "INFO": "#2563eb",

    # The rail's safety card: blue here, not green - in this design it reads as
    # part of the navigation rather than as a status.
    "RAIL_WASH": "#eff6ff",
    "RAIL_LINE": "#bfdbfe",
    "RAIL_ACCENT": "#2563eb",
}

_C = PALETTE
#: Hairlines. On this ground a border is darker than what it encloses.
_EDGE = "#e2e8f0"
_EDGE_SOFT = "#f1f5f9"
#: A control's own edge, one step darker again, so a white button on a white
#: panel is still a button.
_EDGE_CONTROL = "#d1d5db"
#: The selected navigation item: filled pale blue, with a deep blue label.
_TINT = "#dbeafe"
_HOVER = "#eff6ff"
_FONT = '"Inter", "Segoe UI", "DejaVu Sans", Arial, sans-serif'
_DISPLAY = '"Instrument Sans", "Inter", "Segoe UI", Arial, sans-serif'
#: Small capitals in the design are set in a monospace face - column headings,
#: KPI captions, the reference numbers in the header.
_MONO = '"DM Mono", "Roboto Mono", "DejaVu Sans Mono", "Consolas", monospace'

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
QSplitter#Shell::handle:hover {{ background-color: {_C["ACCENT_SOFT"]}; }}
QFrame#Header {{
    background-color: {_C["HEADER"]};
    border-bottom: 1px solid {_EDGE};
}}
QWidget#HeaderBrand {{ background: transparent; }}
/* The page heading sits on white above the grey page, as in the design, which
   separates "where am I" from the content of the page itself. */
QFrame#PageHead {{
    background-color: {_C["HEADER"]};
    border-bottom: 1px solid {_EDGE};
    padding-bottom: 12px;
}}
QFrame#Footer {{
    background-color: {_C["HEADER"]};
    border-top: 1px solid {_EDGE};
}}
QFrame#Panel, QFrame#Card, QFrame#Tile {{
    background-color: {_C["PANEL"]};
    border: 1px solid {_EDGE};
    border-radius: 10px;
}}

QLabel#AppTitle {{ font-family: {_DISPLAY}; font-size: 26px; font-weight: 700; }}
QLabel#AppSubtitle {{ font-size: 12.5px; color: {_C["TEXT_DIM"]}; }}
QLabel#BrandName {{
    font-family: {_DISPLAY};
    font-size: 14px;
    font-weight: 700;
    color: {_C["TEXT"]};
    letter-spacing: -0.2px;
}}
QLabel#BrandSub {{
    font-family: {_MONO};
    font-size: 8px;
    color: {_C["TEXT_FAINT"]};
    letter-spacing: 0.4px;
}}
QLabel#PageTitle {{
    font-family: {_DISPLAY};
    font-size: 20px;
    font-weight: 700;
    letter-spacing: -0.4px;
}}
QLabel#SectionTitle {{
    font-family: {_DISPLAY};
    font-size: 13.5px;
    font-weight: 600;
    color: {_C["TEXT"]};
}}
/* Small capitals in mono: the KPI captions and the block labels above a
   field. The design sets every one of these the same way. */
QLabel#Caption {{
    font-family: {_MONO};
    font-size: 10px;
    font-weight: 600;
    color: {_C["TEXT_FAINT"]};
    letter-spacing: 1.1px;
}}
QLabel#Muted {{ color: {_C["TEXT_DIM"]}; font-size: 12px; }}
QLabel#Faint {{ color: {_C["TEXT_FAINT"]}; font-size: 11.5px; }}
QLabel#KpiValue {{
    font-family: {_DISPLAY};
    font-size: 30px;
    font-weight: 700;
    letter-spacing: -0.6px;
}}
QLabel#KpiUnit {{ font-size: 12px; color: {_C["TEXT_FAINT"]}; }}

/* The design's ghost button: white, a grey edge, and blue on hover. */
QPushButton {{
    background-color: {_C["PANEL"]};
    border: 1px solid {_EDGE_CONTROL};
    border-radius: 6px;
    padding: 8px 14px;
    font-family: {_DISPLAY};
    font-weight: 500;
    color: #374151;
}}
QPushButton:hover {{
    background-color: {_C["PANEL_ALT"]};
    border-color: #93c5fd;
    color: {_C["ACCENT_DIM"]};
}}
QPushButton:pressed {{ background-color: {_HOVER}; }}
QPushButton:disabled {{ color: {_C["TEXT_FAINT"]}; border-color: {_EDGE}; }}
QPushButton#Primary {{
    background-color: {_C["ACCENT"]};
    border: 1px solid {_C["ACCENT"]};
    color: #ffffff;
    font-weight: 600;
}}
QPushButton#Primary:hover {{
    background-color: {_C["ACCENT_DIM"]};
    border-color: {_C["ACCENT_DIM"]};
    color: #ffffff;
}}
QPushButton#Primary:disabled {{
    background-color: #bfdbfe;
    border-color: #bfdbfe;
    color: #ffffff;
}}
/* The design's danger button is white with a red edge - a destructive action
   that does not shout until it is hovered. */
QPushButton#Warning {{
    background-color: {_C["PANEL"]};
    border: 1px solid #fca5a5;
    border-radius: 6px;
    color: {_C["DANGER"]};
    font-weight: 600;
}}
QPushButton#Warning:hover {{
    background-color: #fef2f2;
    border-color: {_C["DANGER"]};
    color: {_C["DANGER"]};
}}
QPushButton#Nav {{
    background-color: transparent;
    border: none;
    border-radius: 7px;
    padding: 8px 12px;
    margin: 1px 8px;
    text-align: left;
    font-family: {_DISPLAY};
    font-weight: 500;
    color: #64748b;
}}
QPushButton#Nav:hover {{
    background-color: {_HOVER};
    color: {_C["ACCENT_DIM"]};
}}
QPushButton#Nav:checked {{
    background-color: {_TINT};
    color: {_C["ACCENT_DIM"]};
    font-weight: 600;
}}

QLineEdit, QTextEdit, QPlainTextEdit {{
    background-color: {_C["PANEL_ALT"]};
    border: 1px solid {_EDGE_CONTROL};
    border-radius: 6px;
    padding: 8px 10px;
    color: #111827;
    selection-background-color: {_C["ACCENT_SOFT"]};
    selection-color: #ffffff;
}}
QLineEdit:focus, QTextEdit:focus, QPlainTextEdit:focus {{
    border: 1px solid {_C["ACCENT_SOFT"]};
    background-color: {_C["PANEL"]};
}}
QComboBox {{
    background-color: {_C["PANEL_ALT"]};
    border: 1px solid {_EDGE_CONTROL};
    border-radius: 6px;
    padding: 7px 10px;
    color: #111827;
}}
QComboBox:focus {{ border: 1px solid {_C["ACCENT_SOFT"]}; }}
QComboBox QAbstractItemView {{
    background-color: {_C["PANEL"]};
    border: 1px solid {_EDGE};
    selection-background-color: {_TINT};
    selection-color: {_C["ACCENT_DIM"]};
}}
QCheckBox {{ spacing: 8px; background: transparent; }}
/* The indicator has to be drawn here. A style sheet rule anywhere on QCheckBox
   puts Qt's own drawing aside, and an unstyled indicator then arrives as an
   invisible square - a toggle nobody can see the state of. */
QCheckBox::indicator {{
    width: 15px;
    height: 15px;
    border: 1px solid {_EDGE_CONTROL};
    border-radius: 4px;
    background-color: #ffffff;
}}
QCheckBox::indicator:hover {{ border-color: {_C["ACCENT_SOFT"]}; }}
QCheckBox::indicator:checked {{
    background-color: {_C["ACCENT"]};
    border-color: {_C["ACCENT"]};
    image: url({_ASSETS}/check.svg);
}}
QCheckBox::indicator:disabled {{
    border-color: {_EDGE};
    background-color: {_C["PANEL_ALT"]};
}}

QTableWidget {{
    background-color: {_C["PANEL"]};
    alternate-background-color: {_C["PANEL_ALT"]};
    gridline-color: {_EDGE_SOFT};
    border: 1px solid {_EDGE};
    border-radius: 10px;
    selection-background-color: {_HOVER};
    selection-color: {_C["TEXT"]};
}}
/* Small capitals in mono over a hairline, the design's table heading exactly.
   The capitals themselves come from DataTable.UPPERCASE_HEADERS - Qt style
   sheets have no text-transform. */
QHeaderView::section {{
    background-color: {_C["PANEL"]};
    color: {_C["TEXT_FAINT"]};
    padding: 9px 10px;
    border: none;
    border-bottom: 1px solid {_EDGE};
    font-family: {_MONO};
    font-weight: 600;
    font-size: 10px;
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
    color: {_C["ACCENT_DIM"]};
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

/* The design's bars are 4px. That is a mouse target nobody hits on a
   workstation, so they keep the look and gain the width back. */
QScrollBar:vertical {{
    background: transparent;
    width: 9px;
    margin: 0px;
    border: none;
}}
QScrollBar::handle:vertical {{
    background: {_C["SCROLL_THUMB"]};
    border-radius: 4px;
    min-height: 36px;
    margin: 2px;
}}
QScrollBar::handle:vertical:hover {{ background: {_C["SCROLL_THUMB_HOVER"]}; }}
QScrollBar:horizontal {{
    background: transparent;
    height: 9px;
    margin: 0px;
    border: none;
}}
QScrollBar::handle:horizontal {{
    background: {_C["SCROLL_THUMB"]};
    border-radius: 4px;
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
QMenuBar::item:selected {{ background: {_TINT}; color: {_C["ACCENT_DIM"]}; }}
QMenu {{
    background-color: {_C["PANEL"]};
    border: 1px solid {_EDGE};
    border-radius: 8px;
    padding: 4px;
}}
QMenu::item {{ padding: 6px 22px; border-radius: 5px; }}
QMenu::item:selected {{ background: {_TINT}; color: {_C["ACCENT_DIM"]}; }}
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

    Table headings in capitals come from the same call, for the same reason and
    one more: Qt style sheets have no ``text-transform``, so the only place the
    capitals can come from is the code that sets the heading text.
    """
    from .components import DataTable
    from .theme import apply_palette

    apply_palette(PALETTE)
    DataTable.UPPERCASE_HEADERS = True


def dress(window: "QMainWindow") -> None:
    """Put the skin on a built window: the style sheet and the quiet header.

    The mark, the avatar and the search box are hidden rather than removed from
    :class:`ui2.components.HeaderBar`, so the header itself stays one widget
    with one behaviour and only its appearance differs by entry point.

    The reference design draws all three. They stay hidden because they were
    asked for that way earlier; showing them again is deleting one line here,
    and the search box brings its filter on the reports table back with it.
    """
    window.setStyleSheet(STYLESHEET)
    header = getattr(window, "header", None)
    for name in ("mark", "avatar", "search"):
        widget = getattr(header, name, None)
        if widget is not None:
            widget.hide()
