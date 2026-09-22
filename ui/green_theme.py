"""The black-and-lime skin, transcribed from the supplied reference.

:mod:`ui.theme` is mid navy, :mod:`ui.gov_theme` near-black navy with teal, and
:mod:`ui.light_theme` white cards on grey. This one is the reference's own
look: black surfaces on a warm charcoal ground, everything set in capitals, and
a single vivid lime carrying every interactive thing on the page.

How the reference is built, and how that maps onto a console:

``black``
    The header, the navigation rail and every card are pure black. Black is the
    *content* colour here, not the background - the cards sit on the charcoal
    rather than being cut out of it.
``charcoal #3b3733``
    The ground between the cards, warm rather than neutral - a grey mixed
    towards brown, which is what keeps the black from reading as a hole.
``lime #8cef1e``
    One colour, used for exactly three things: the wordmark, anything that can
    be pressed, and the item you are on. Nothing decorative is lime, which is
    why it still reads as "press this" after a page of it.
``capitals``
    The rail is set in capitals, as are the column headings. A Qt style sheet
    cannot change letter case at all, so both come from
    :func:`ui.theme.apply_look`, called in :func:`prepare` below.

Two shapes matter as much as the colours. Buttons are pills - fully rounded,
lime with black text where something is the main action, and a hairline outline
with white text where it is not. Cards are square-cornered black rectangles,
not rounded ones; rounding them softens a design whose whole character is that
it does not soften.

The one thing deliberately not transcribed is the pictographic navigation: the
reference's rail is a list of words and nothing else, so this one drops the
drawn icons that the other skins carry.
"""

from __future__ import annotations

from typing import TYPE_CHECKING

from .theme import ASSETS as _ASSETS

if TYPE_CHECKING:  # pragma: no cover - typing only
    from PyQt6.QtWidgets import QMainWindow

__all__ = ["PALETTE", "STYLESHEET", "NAME", "prepare", "dress"]

#: What to call this look where an operator can see it.
NAME = "Black / lime"

#: Design tokens, sampled from the reference. Names match :class:`ui.theme.C`
#: so the mapping can be applied without translation.
PALETTE = {
    # Surfaces. The ground is the warm charcoal; the content is black.
    "APP": "#3b3733",
    "SIDEBAR": "#000000",
    "HEADER": "#000000",
    "PANEL": "#000000",
    "PANEL_ALT": "#121110",
    "CARD": "#000000",
    "BORDER": "#4e4941",
    "BORDER_SOFT": "#2a2724",

    "TEXT": "#ffffff",
    "TEXT_DIM": "#c2bcb3",
    "TEXT_FAINT": "#928c84",

    "BRAND": "#e63329",
    # The lime. One colour for the wordmark, for anything pressable, and for
    # the page you are on - and for nothing else.
    "ACCENT": "#8cef1e",
    "ACCENT_SOFT": "#a6f752",
    "ACCENT_DIM": "#6cc40f",
    "BLUE": "#4f63f5",
    "PURPLE": "#a78bfa",
    # The selected rail item is lime text on a lighter charcoal row. This skin
    # draws no rail icons, but the colour is part of the palette all the same.
    "ICON_ON": "#8cef1e",

    "SCROLL_TRACK": "#000000",
    "SCROLL_THUMB": "#4e4941",
    "SCROLL_THUMB_HOVER": "#6b655b",

    # Status. Green means ready, and in this design green is the lime - there
    # is no second green that would not look like a mistake beside it.
    "DANGER": "#ff5c52",
    "WARN": "#ffb02e",
    "OK": "#8cef1e",
    # The reference's own badge blue, kept for the one thing it marks: a note
    # about the machine rather than about the work.
    "INFO": "#4f63f5",

    # The rail's safety card: black on black would vanish, so it is the charcoal
    # with a lime rule and a lime heading.
    "RAIL_WASH": "#1a1815",
    "RAIL_LINE": "#8cef1e",
    "RAIL_ACCENT": "#8cef1e",
}

_C = PALETTE
_BLACK = "#000000"
_CHARCOAL = "#3b3733"
#: The band at the top of a page, and the row under the pointer in the rail -
#: one step lighter than the ground, as in the reference.
_RAISED = "#454039"
#: The selected rail item.
_SELECTED = "#3a3733"
_LIME = "#8cef1e"
_EDGE = "#4e4941"
_EDGE_SOFT = "#2a2724"
#: A hairline drawn on black rather than on the charcoal.
_EDGE_BLACK = "#26231f"
_FONT = '"Inter", "Segoe UI", "DejaVu Sans", Arial, sans-serif'
_DISPLAY = '"Instrument Sans", "Inter", "Segoe UI", Arial, sans-serif'
_MONO = '"DM Mono", "Roboto Mono", "DejaVu Sans Mono", "Consolas", monospace'

STYLESHEET = f"""
QWidget {{
    background-color: {_CHARCOAL};
    color: {_C["TEXT"]};
    font-family: {_FONT};
    font-size: 13px;
}}
QLabel {{ background: transparent; border: none; }}

/* ---- the black rail -------------------------------------------------- */
QFrame#Sidebar {{ background-color: {_BLACK}; border: none; }}
/* Everything inside the rail is a plain widget, and a plain widget paints the
   application background - which here is the charcoal, laid in a block over
   the black. The nav list, its scroll area and its row containers are cleared
   by name; the controls set their own backgrounds and outrank this rule. */
QFrame#Sidebar QWidget, QFrame#Sidebar QScrollArea {{ background: transparent; }}
QFrame#Sidebar QScrollArea {{ border: none; }}

/* The wordmark is the one place the lime appears without being pressable. */
QWidget#HeaderBrand {{ background-color: {_BLACK}; }}
QWidget#HeaderBrand QLabel#BrandName {{
    color: {_LIME};
    font-size: 17px;
    font-weight: 800;
    letter-spacing: 0.2px;
}}

/* The capitals come from apply_look(); the spacing and the lime are here.
   Square, not rounded: the reference's selected row is a rectangle. */
QPushButton#Nav {{
    background-color: transparent;
    border: none;
    border-radius: 0px;
    padding: 11px 14px;
    margin: 0px;
    text-align: left;
    font-family: {_DISPLAY};
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.4px;
    color: {_C["TEXT"]};
}}
QPushButton#Nav:hover {{ background-color: #1c1a18; color: {_LIME}; }}
QPushButton#Nav:checked {{
    background-color: {_SELECTED};
    color: {_LIME};
    font-weight: 700;
}}

/* ---- the charcoal page ----------------------------------------------- */
QSplitter#Shell::handle {{ background-color: {_EDGE_BLACK}; }}
QSplitter#Shell::handle:hover {{ background-color: {_LIME}; }}
QFrame#Header {{
    background-color: {_BLACK};
    /* The reference's indigo strip across the very top of the window. */
    border-top: 3px solid #3c3cd2;
    border-bottom: 1px solid {_EDGE_BLACK};
}}
/* The page heading sits on a band one step lighter than the page, with a
   hairline under it - the reference's "SAFETY" bar exactly. */
QFrame#PageHead {{
    background-color: {_RAISED};
    border-bottom: 1px solid {_EDGE};
    padding-bottom: 12px;
}}
QFrame#Footer {{
    background-color: {_BLACK};
    border-top: 1px solid {_EDGE_BLACK};
}}
/* Black rectangles on the charcoal, square-cornered. */
QFrame#Panel, QFrame#Card, QFrame#Tile {{
    background-color: {_BLACK};
    border: 1px solid {_EDGE_BLACK};
    border-radius: 2px;
}}

QLabel#AppTitle {{ font-family: {_DISPLAY}; font-size: 26px; font-weight: 700; }}
QLabel#AppSubtitle {{ font-size: 12.5px; color: {_C["TEXT_DIM"]}; }}
QLabel#BrandName {{
    font-family: {_DISPLAY};
    font-size: 14px;
    font-weight: 700;
    color: {_C["TEXT"]};
    letter-spacing: 0.2px;
}}
QLabel#BrandSub {{
    font-family: {_MONO};
    font-size: 8px;
    color: {_C["TEXT_FAINT"]};
    letter-spacing: 0.4px;
}}
QLabel#PageTitle {{
    font-family: {_DISPLAY};
    font-size: 22px;
    font-weight: 700;
    letter-spacing: 0.4px;
}}
QLabel#SectionTitle {{
    font-family: {_DISPLAY};
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.4px;
    color: {_C["TEXT"]};
}}
QLabel#Caption {{
    font-family: {_MONO};
    font-size: 10px;
    font-weight: 600;
    color: {_C["TEXT_FAINT"]};
    letter-spacing: 1.2px;
}}
QLabel#Muted {{ color: {_C["TEXT_DIM"]}; font-size: 12px; }}
QLabel#Faint {{ color: {_C["TEXT_FAINT"]}; font-size: 11.5px; }}
QLabel#KpiValue {{
    font-family: {_DISPLAY};
    font-size: 32px;
    font-weight: 700;
    letter-spacing: -0.4px;
}}
QLabel#KpiUnit {{ font-size: 12px; color: {_C["TEXT_FAINT"]}; }}

/* Pills. An outline with white text for the ordinary action, as the
   reference draws "view overview". */
QPushButton {{
    background-color: transparent;
    border: 1px solid #6e675d;
    border-radius: 17px;
    padding: 8px 18px;
    font-family: {_DISPLAY};
    font-weight: 600;
    letter-spacing: 0.3px;
    color: {_C["TEXT"]};
}}
QPushButton:hover {{
    border-color: {_LIME};
    color: {_LIME};
}}
QPushButton:pressed {{ background-color: #1c1a18; }}
QPushButton:disabled {{ color: {_C["TEXT_FAINT"]}; border-color: {_EDGE_SOFT}; }}
/* And a filled lime pill with black on it for the main one. */
QPushButton#Primary {{
    background-color: {_LIME};
    border: 1px solid {_LIME};
    color: {_BLACK};
    font-weight: 700;
}}
QPushButton#Primary:hover {{
    background-color: {_C["ACCENT_SOFT"]};
    border-color: {_C["ACCENT_SOFT"]};
    color: {_BLACK};
}}
QPushButton#Primary:disabled {{
    background-color: #4a5c30;
    border-color: #4a5c30;
    color: #9aa88a;
}}
QPushButton#Warning {{
    background-color: transparent;
    border: 1px solid {_C["DANGER"]};
    border-radius: 17px;
    color: {_C["DANGER"]};
    font-weight: 700;
}}
QPushButton#Warning:hover {{
    background-color: {_C["DANGER"]};
    border-color: {_C["DANGER"]};
    color: {_BLACK};
}}

QLineEdit, QTextEdit, QPlainTextEdit {{
    background-color: #121110;
    border: 1px solid {_EDGE};
    border-radius: 3px;
    padding: 8px 10px;
    color: {_C["TEXT"]};
    selection-background-color: {_C["ACCENT_DIM"]};
    selection-color: {_BLACK};
}}
QLineEdit:focus, QTextEdit:focus, QPlainTextEdit:focus {{
    border: 1px solid {_LIME};
}}
QComboBox {{
    background-color: #121110;
    border: 1px solid {_EDGE};
    border-radius: 3px;
    padding: 7px 10px;
    color: {_C["TEXT"]};
}}
QComboBox:focus {{ border: 1px solid {_LIME}; }}
QComboBox QAbstractItemView {{
    background-color: {_BLACK};
    border: 1px solid {_EDGE};
    selection-background-color: {_SELECTED};
    selection-color: {_LIME};
}}
QCheckBox {{ spacing: 8px; background: transparent; }}
/* The indicator has to be drawn here. A style sheet rule anywhere on QCheckBox
   puts Qt's own drawing aside, and an unstyled indicator then arrives as an
   invisible square - a toggle nobody can see the state of. */
QCheckBox::indicator {{
    width: 15px;
    height: 15px;
    border: 1px solid {_EDGE};
    border-radius: 3px;
    background-color: #121110;
}}
QCheckBox::indicator:hover {{ border-color: {_LIME}; }}
QCheckBox::indicator:checked {{
    background-color: {_LIME};
    border-color: {_LIME};
    image: url({_ASSETS}/check-dark.svg);
}}
QCheckBox::indicator:disabled {{
    border-color: {_EDGE_SOFT};
    background-color: #1a1815;
}}

QTableWidget {{
    background-color: {_BLACK};
    alternate-background-color: {_C["PANEL_ALT"]};
    gridline-color: {_EDGE_BLACK};
    border: 1px solid {_EDGE_BLACK};
    border-radius: 2px;
    selection-background-color: {_SELECTED};
    selection-color: {_LIME};
}}
QHeaderView::section {{
    background-color: {_BLACK};
    color: {_C["TEXT_FAINT"]};
    padding: 10px 10px;
    border: none;
    border-bottom: 1px solid {_EDGE_BLACK};
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
    font-weight: 700;
    letter-spacing: 0.4px;
}}
QTabBar::tab:selected {{
    color: {_LIME};
    border-bottom: 2px solid {_LIME};
}}

QProgressBar {{
    background-color: #121110;
    border: 1px solid {_EDGE_BLACK};
    border-radius: 4px;
    height: 6px;
    text-align: center;
}}
QProgressBar::chunk {{ background-color: {_LIME}; border-radius: 3px; }}

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

QStatusBar {{ background-color: {_BLACK}; color: {_C["TEXT_DIM"]}; }}
QMenuBar {{
    background-color: {_BLACK};
    color: {_C["TEXT_DIM"]};
    border-bottom: 1px solid {_EDGE_BLACK};
}}
QMenuBar::item:selected {{ background: {_SELECTED}; color: {_LIME}; }}
QMenu {{
    background-color: {_BLACK};
    border: 1px solid {_EDGE};
    padding: 4px;
}}
QMenu::item {{ padding: 6px 22px; }}
QMenu::item:selected {{ background: {_SELECTED}; color: {_LIME}; }}
QToolTip {{
    background-color: {_BLACK};
    color: {_C["TEXT"]};
    border: 1px solid {_LIME};
    padding: 6px;
}}
"""


def prepare() -> None:
    """Repoint the shared colours and the typography. Call this *before* a
    window is built.

    Half of a re-skin cannot be delivered by a style sheet: badges, KPI values,
    chart series, the rail's safety card and the navigation icons read the
    palette in their constructors, so the palette has to be in place before any
    of them is built.

    The capitals and the wordless rail are the same kind of thing one step
    further on - a style sheet cannot change letter case, and cannot take an
    icon off a button - so they come from :func:`ui.theme.apply_look`, which
    every theme calls with the full set so that none of these switches can be
    left behind by the theme prepared before it.
    """
    from .theme import apply_look, apply_palette

    apply_palette(PALETTE)
    apply_look(table_headers_upper=True, nav_upper=True, nav_icons=False)


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
