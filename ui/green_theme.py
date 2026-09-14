"""The green-rail skin: a lime navigation column beside a white page.

:mod:`ui.theme` is mid navy, :mod:`ui.gov_theme` near-black navy with teal, and
:mod:`ui.light_theme` white cards on grey with a blue accent. This one keeps a
light page and moves the colour to one side: the navigation rail - and the
brand block directly above it, so the two read as a single column - is filled
lime, and everything to the right of it is white panels on a grey ground.

Why the colour sits where it does. A rail is a fixed, narrow strip that an
operator navigates by rather than reads, which makes it the one place a
saturated colour costs nothing: it is never behind a narrative, a table of
evidence or a risk score. The page keeps the white and grey the content needs,
and the same lime returns on the right only where something is meant to be
pressed.

Two things a light-on-colour rail forces, both of which are the reason this is
a module and not three edited lines:

* **Nothing inside the rail may paint the page's grey.** The nav list sits in a
  scroll area whose viewport, whose inner widget and whose per-row containers
  are all plain ``QWidget``s, and a plain widget takes the application
  background - which on this design would be a grey block laid over the green.
  They are made transparent here, by name.
* **The accent has two strengths.** Lime bright enough to fill a rail is
  unreadable as text on white, so the fill is ``#84cc16`` with near-black on
  it, and anything written in the accent - a link, a KPI value, a selected tab
  - uses ``#4d7c0f``, which carries the same hue at 5:1 against white.

Fonts are named in the reference as Instrument Sans, Inter and DM Mono. Those
are web fonts and will not be installed on a plant workstation, so each is
given the platform's own stack behind it.
"""

from __future__ import annotations

from typing import TYPE_CHECKING

from .theme import ASSETS as _ASSETS

if TYPE_CHECKING:  # pragma: no cover - typing only
    from PyQt6.QtWidgets import QMainWindow

__all__ = ["PALETTE", "STYLESHEET", "NAME", "prepare", "dress"]

#: What to call this look where an operator can see it.
NAME = "Green rail / white page"

#: Design tokens. Names match :class:`ui.theme.C` so the mapping can be applied
#: without translation.
PALETTE = {
    # Surfaces. Grey ground, white content - and one green column on the left.
    "APP": "#f1f4f2",
    "SIDEBAR": "#a3e635",
    "HEADER": "#ffffff",
    "PANEL": "#ffffff",
    "PANEL_ALT": "#f6f8f6",
    "CARD": "#ffffff",
    "BORDER": "#e1e6e2",
    "BORDER_SOFT": "#eef1ef",

    # Text. Near-black rather than black: full black on white vibrates.
    "TEXT": "#101711",
    "TEXT_DIM": "#586158",
    "TEXT_FAINT": "#8b948c",

    "BRAND": "#c62828",
    # The written accent, not the fill: lime bright enough for a rail cannot be
    # read as text on white, so anything set in the accent uses this instead.
    "ACCENT": "#4d7c0f",
    "ACCENT_SOFT": "#65a30d",
    "ACCENT_DIM": "#3f6212",
    "BLUE": "#1d4ed8",
    "PURPLE": "#7c3aed",
    # The selected nav item is a white pill on the green rail, so its icon is
    # the deepest green. White would be an empty pill.
    "ICON_ON": "#365314",

    "SCROLL_TRACK": "#f1f4f2",
    "SCROLL_THUMB": "#c6cec8",
    "SCROLL_THUMB_HOVER": "#98a39b",

    # Status. A true green for OK, distinct from the lime accent, so "this is
    # ready" cannot be mistaken for "this is a control".
    "DANGER": "#c62828",
    "WARN": "#b45309",
    "OK": "#15803d",
    # Blue, but a calmer one than the page's links: beside a lime accent the
    # electric blue of the other skins shouts.
    "INFO": "#0369a1",

    # The rail's safety card sits on the green, so it is a white card with the
    # deepest green on it rather than a tinted wash.
    # Opaque, not a wash: at anything less the labels inside the card - which
    # paint their own white - read as brighter strips across it.
    "RAIL_WASH": "#ffffff",
    "RAIL_LINE": "#ffffff",
    "RAIL_ACCENT": "#2a4d0c",
}

_C = PALETTE
#: Hairlines. On this ground a border is darker than what it encloses.
_EDGE = "#e1e6e2"
_EDGE_SOFT = "#eef1ef"
#: A control's own edge, one step darker again, so a white button on a white
#: panel is still a button.
_EDGE_CONTROL = "#cfd6d1"
#: The rail's fill, and the same lime as a button fill on the right-hand side.
_LIME = "#a3e635"
_LIME_FILL = "#84cc16"
_LIME_DEEP = "#365314"
#: Near-black, for text and icons that sit on the lime.
_ON_LIME = "#14250a"
#: The selected nav item, and the tint the page uses to echo it.
_TINT = "#ecfccb"
_HOVER = "#f4fae9"
_FONT = '"Inter", "Segoe UI", "DejaVu Sans", Arial, sans-serif'
_DISPLAY = '"Instrument Sans", "Inter", "Segoe UI", Arial, sans-serif'
_MONO = '"DM Mono", "Roboto Mono", "DejaVu Sans Mono", "Consolas", monospace'

STYLESHEET = f"""
QWidget {{
    background-color: {_C["APP"]};
    color: {_C["TEXT"]};
    font-family: {_FONT};
    font-size: 13px;
}}
QLabel {{ background: transparent; border: none; }}

/* ---- the green column ------------------------------------------------ */
QFrame#Sidebar {{ background-color: {_LIME}; border: none; }}
/* Everything inside the rail is a plain widget, and a plain widget paints the
   application background - which here is the page's grey, laid in a block over
   the green. The nav list, its scroll area and its per-row containers are
   therefore cleared by name. The controls below set their own backgrounds and
   are unaffected: an id selector outranks this one. */
QFrame#Sidebar QWidget, QFrame#Sidebar QScrollArea {{ background: transparent; }}
QFrame#Sidebar QScrollArea {{ border: none; }}
/* The brand block sits directly above the rail and is exactly as wide, so the
   green runs from the top of the window to the bottom in one column. */
QWidget#HeaderBrand {{ background-color: {_LIME}; }}
QWidget#HeaderBrand QLabel {{ color: {_ON_LIME}; }}
QWidget#HeaderBrand QLabel#BrandName {{ color: {_ON_LIME}; font-weight: 800; }}

QPushButton#Nav {{
    background-color: transparent;
    border: none;
    border-radius: 7px;
    padding: 8px 12px;
    margin: 1px 8px;
    text-align: left;
    font-family: {_DISPLAY};
    font-weight: 600;
    color: {_ON_LIME};
}}
QPushButton#Nav:hover {{ background-color: rgba(255, 255, 255, 0.38); }}
QPushButton#Nav:checked {{
    background-color: #ffffff;
    color: {_LIME_DEEP};
    font-weight: 700;
}}

/* ---- the white page -------------------------------------------------- */
QSplitter#Shell::handle {{ background-color: {_EDGE}; }}
QSplitter#Shell::handle:hover {{ background-color: {_LIME_FILL}; }}
QFrame#Header {{
    background-color: {_C["HEADER"]};
    border-bottom: 1px solid {_EDGE};
}}
/* The page heading on its own white band above the grey page. */
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

QPushButton {{
    background-color: {_C["PANEL"]};
    border: 1px solid {_EDGE_CONTROL};
    border-radius: 6px;
    padding: 8px 14px;
    font-family: {_DISPLAY};
    font-weight: 500;
    color: #2f3a31;
}}
QPushButton:hover {{
    background-color: {_HOVER};
    border-color: {_LIME_FILL};
    color: {_C["ACCENT_DIM"]};
}}
QPushButton:pressed {{ background-color: {_TINT}; }}
QPushButton:disabled {{ color: {_C["TEXT_FAINT"]}; border-color: {_EDGE}; }}
/* The one loud control on the page, and the same lime as the rail: near-black
   on it, because white on this green is barely a contrast at all. */
QPushButton#Primary {{
    background-color: {_LIME_FILL};
    border: 1px solid {_LIME_FILL};
    color: {_ON_LIME};
    font-weight: 700;
}}
QPushButton#Primary:hover {{
    background-color: {_LIME};
    border-color: {_LIME};
    color: {_ON_LIME};
}}
QPushButton#Primary:disabled {{
    background-color: #d9e8c0;
    border-color: #d9e8c0;
    color: #ffffff;
}}
QPushButton#Warning {{
    background-color: {_C["PANEL"]};
    border: 1px solid #e9a8a8;
    border-radius: 6px;
    color: {_C["DANGER"]};
    font-weight: 600;
}}
QPushButton#Warning:hover {{
    background-color: #fdf3f3;
    border-color: {_C["DANGER"]};
    color: {_C["DANGER"]};
}}

QLineEdit, QTextEdit, QPlainTextEdit {{
    background-color: {_C["PANEL_ALT"]};
    border: 1px solid {_EDGE_CONTROL};
    border-radius: 6px;
    padding: 8px 10px;
    color: {_C["TEXT"]};
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
    color: {_C["TEXT"]};
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
    selection-background-color: {_TINT};
    selection-color: {_C["TEXT"]};
}}
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
    border-bottom: 2px solid {_LIME_FILL};
}}

QProgressBar {{
    background-color: {_C["PANEL_ALT"]};
    border: 1px solid {_EDGE};
    border-radius: 4px;
    height: 6px;
    text-align: center;
}}
QProgressBar::chunk {{ background-color: {_LIME_FILL}; border-radius: 3px; }}

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
/* On the green rail a grey handle disappears; there it is the deepest green
   at a third strength. */
QFrame#Sidebar QScrollBar::handle:vertical {{ background: rgba(20, 37, 10, 0.32); }}
QFrame#Sidebar QScrollBar::handle:vertical:hover {{ background: rgba(20, 37, 10, 0.52); }}

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
    of them is built. On this design that includes the icon on the selected nav
    item, which sits on a white pill and so is the deepest green rather than
    white, and the safety card, which sits on the lime and so is white rather
    than a wash.

    Column headings are set in small capitals here, as in the white-and-grey
    build: Qt style sheets have no ``text-transform``, so the capitals can only
    come from the code that sets the heading text.
    """
    from .components import DataTable
    from .theme import apply_palette

    apply_palette(PALETTE)
    DataTable.UPPERCASE_HEADERS = True


def dress(window: "QMainWindow") -> None:
    """Put the skin on a built window: the style sheet and the quiet header.

    The mark, the avatar and the search box are hidden rather than removed from
    :class:`ui2.components.HeaderBar`, so the header itself stays one widget
    with one behaviour and only its appearance differs by entry point. Undoing
    that is deleting the loop below, and the search box brings its filter on the
    reports table back with it.
    """
    window.setStyleSheet(STYLESHEET)
    header = getattr(window, "header", None)
    for name in ("mark", "avatar", "search"):
        widget = getattr(header, name, None)
        if widget is not None:
            widget.hide()
