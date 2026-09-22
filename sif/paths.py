"""Where the console is allowed to write, installed or from a checkout.

Three things the console writes are named by relative path: the rolling log
directory, the trained model, and the MLflow SQLite file. From a source checkout
that is exactly right - they land beside the code, where a developer can see
them.

Installed, it is wrong and quietly so. A Windows installer puts the application
under ``C:\\Program Files``, and a shortcut launches it with that directory as
the working directory; a standard user cannot write there. Windows then either
fails the write or silently redirects it into ``%LOCALAPPDATA%\\VirtualStore``,
where the operator will never find the audit-adjacent files and where a machine
policy may forbid it outright. Either way the console appears to work and then
has no log to show, no model to load, and no training history.

So: a frozen build writes under the per-user application-data directory - the
same one the preferences and the audit trail already use - and a checkout keeps
writing beside the code. One function decides, and the three call sites ask it
rather than each inventing a rule.
"""

from __future__ import annotations

import os
import sys

from .prefs import config_directory

__all__ = ["frozen", "data_directory", "writable"]


def frozen() -> bool:
    """True when running from a PyInstaller bundle rather than a checkout."""
    return bool(getattr(sys, "frozen", False))


def data_directory() -> str:
    """The per-user directory this application owns on the current platform."""
    return config_directory()


def writable(relative: str) -> str:
    """Where ``relative`` may be written from wherever this build is running.

    A checkout gets the path unchanged, so nothing about developing here moves.
    A frozen build gets it under :func:`data_directory`, which is writable by
    the user who launched the application whatever the installer chose.
    """
    if not frozen() or os.path.isabs(relative):
        return relative
    return os.path.join(data_directory(), relative)
