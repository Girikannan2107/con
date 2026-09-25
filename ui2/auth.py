"""Authentication and Role-Based Access Control (RBAC) for SENTRA.

Implements secure user sessions, granular permissions, and role-based
authorization for Oil India Limited HSE operations.
"""

from __future__ import annotations

import hashlib
import time
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Set

__all__ = ["User", "Role", "SessionManager", "AUTH"]


@dataclass
class User:
    """Enterprise user profile with assigned role and site context."""
    id: str
    employee_id: str
    name: str
    email: str
    role: str
    department: str
    site: str
    avatar_initials: str
    permissions: Set[str] = field(default_factory=set)


# Granular Permissions Taxonomy
PERMISSIONS = {
    # Workflow / Pipeline
    "workflow.view",
    "workflow.execute",
    
    # Ingest & OCR
    "ingest.view",
    "ingest.upload",
    "ingest.analyse",
    
    # Reports & Incidents
    "reports.view",
    "reports.edit",
    "reports.analyse",
    
    # Risk Hotspots & Analytics
    "hotspots.view",
    "analytics.view",
    
    # Human Review Bench
    "review.view",
    "review.decide",
    
    # Corrective Safety Actions
    "actions.view",
    "actions.create",
    "actions.assign",
    "actions.close",
    
    # Intelligence Engines & MLOps
    "engines.view",
    "engines.configure",
    "model.train",
    
    # System Settings & Audit
    "settings.view",
    "audit.view",
    "users.manage",
}

# Role Definitions & Permission Matrix
ROLE_PERMISSIONS: Dict[str, Set[str]] = {
    "HSE Analyst": {
        "workflow.view",
        "workflow.execute",
        "ingest.view",
        "ingest.upload",
        "ingest.analyse",
        "reports.view",
        "reports.edit",
        "reports.analyse",
        "hotspots.view",
        "analytics.view",
        "review.view",
        "review.decide",
        "engines.view",
        "engines.configure",
        "model.train",
        "settings.view",
        "audit.view",
        "actions.view",
    },
    "Safety Officer": {
        "workflow.view",
        "ingest.view",
        "ingest.upload",
        "reports.view",
        "hotspots.view",
        "analytics.view",
        "review.view",
        "review.decide",
        "actions.view",
        "actions.create",
        "actions.assign",
        "actions.close",
        "audit.view",
    },
}

# Pre-seeded Demo Accounts for Oil India Limited
DEMO_USERS: Dict[str, User] = {
    "HSE001": User(
        id="usr-101",
        employee_id="HSE001",
        name="D. Manikandan",
        email="d.manikandan@oilindia.in",
        role="HSE Analyst",
        department="HSE Process Safety Intelligence",
        site="Oil India Limited · Duliajan OCS",
        avatar_initials="DM",
        permissions=ROLE_PERMISSIONS["HSE Analyst"],
    ),
    "SAFE001": User(
        id="usr-102",
        employee_id="SAFE001",
        name="R. Baruah",
        email="r.baruah@oilindia.in",
        role="Safety Officer",
        department="Field Safety & Loss Prevention",
        site="Oil India Limited · Rig-12 & Field Ops",
        avatar_initials="RB",
        permissions=ROLE_PERMISSIONS["Safety Officer"],
    ),
}

# Secure password hashing (SHA-256 with fixed salt for demo simplicity, extensible to bcrypt)
SALT = "sentra_oil_india_2026"


def _hash_password(password: str) -> str:
    return hashlib.sha256((password + SALT).encode("utf-8")).hexdigest()


# Passwords for demo accounts: "sentra2026"
DEFAULT_PASSWORD_HASH = _hash_password("sentra2026")

USER_CREDENTIALS: Dict[str, str] = {
    "HSE001": DEFAULT_PASSWORD_HASH,
    "SAFE001": DEFAULT_PASSWORD_HASH,
}


class SessionManager:
    """Manages user authentication state, permissions, and active session."""

    def __init__(self) -> None:
        self._current_user: Optional[User] = None
        self._login_time: Optional[float] = None
        self._session_token: Optional[str] = None
        self._auth_listeners: List[callable] = []

    @property
    def is_authenticated(self) -> bool:
        return self._current_user is not None

    @property
    def current_user(self) -> Optional[User]:
        return self._current_user

    def add_listener(self, callback: callable) -> None:
        """Register a callback for auth state changes (login/logout)."""
        self._auth_listeners.append(callback)

    def _notify(self) -> None:
        for listener in self._auth_listeners:
            try:
                listener(self._current_user)
            except Exception:
                pass

    def login(self, employee_id: str, password: str) -> bool:
        """Authenticate an employee with their credentials."""
        emp_id = employee_id.strip().upper()
        if emp_id not in DEMO_USERS:
            return False

        # Demo mode allows "sentra2026" or empty password if quick-logging
        expected_hash = USER_CREDENTIALS.get(emp_id)
        if password and _hash_password(password) != expected_hash and password != "sentra2026":
            return False

        user = DEMO_USERS[emp_id]
        self._current_user = user
        self._login_time = time.time()
        self._session_token = hashlib.sha256(f"{emp_id}:{self._login_time}".encode()).hexdigest()
        self._notify()
        return True

    def login_as(self, role: str) -> bool:
        """Helper to login directly as a specific role for testing/dev."""
        for user in DEMO_USERS.values():
            if user.role.lower() == role.lower():
                return self.login(user.employee_id, "sentra2026")
        return False

    def logout(self) -> None:
        """Terminate the current user session."""
        self._current_user = None
        self._login_time = None
        self._session_token = None
        self._notify()

    def has_permission(self, permission: str) -> bool:
        """Verify whether the currently authenticated user has a specific permission."""
        if not self._current_user:
            return False
        return permission in self._current_user.permissions


# Global Authentication Instance
AUTH = SessionManager()
