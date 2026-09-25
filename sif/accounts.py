"""Authentication and Role-Based Access Control (RBAC) for SENTRA.

Exposes user models, permissions taxonomy, and session management
from the authoritative backend.
"""

from __future__ import annotations

from ui2.auth import (
    AUTH,
    DEMO_USERS,
    PERMISSIONS,
    ROLE_PERMISSIONS,
    USER_CREDENTIALS,
    SessionManager,
    User,
    _hash_password,
)

__all__ = [
    "User",
    "SessionManager",
    "AUTH",
    "DEMO_USERS",
    "USER_CREDENTIALS",
    "PERMISSIONS",
    "ROLE_PERMISSIONS",
    "_hash_password",
]
