"""Authentication, Role-Based Access Control (RBAC), and Workspaces for SENTRA.

Exposes user models, permissions taxonomy, workspace registry, and session management
from the authoritative backend.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List, Optional, Set

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
    "Workspace",
    "SessionManager",
    "AUTH",
    "DEMO_USERS",
    "USER_CREDENTIALS",
    "PERMISSIONS",
    "ROLE_PERMISSIONS",
    "WORKSPACES",
    "_hash_password",
]


@dataclass
class Workspace:
    """Operational safety intelligence workspace context."""
    id: str
    name: str
    code: str
    description: str
    site: str
    organization: str
    status: str
    icon_initial: str = "S"
    allowed_roles: Set[str] = None

    def to_dict(self) -> Dict[str, object]:
        return {
            "id": self.id,
            "name": self.name,
            "code": self.code,
            "description": self.description,
            "site": self.site,
            "organization": self.organization,
            "status": self.status,
            "icon_initial": self.icon_initial,
        }


# Authoritative Oil India Limited Workspaces
WORKSPACES: List[Workspace] = [
    Workspace(
        id="ws-oil-01",
        name="SENTRA HSE Process Safety Intelligence",
        code="HSE-DULIAJAN",
        description="Central SIF precursor detection, IOGP Life-Saving Rules compliance, and engineering barrier triage.",
        site="Duliajan OCS (Central Production & Gathering)",
        organization="Oil India Limited",
        status="Active",
        icon_initial="H",
        allowed_roles={"HSE Analyst", "Safety Officer", "Admin", "Viewer"},
    ),
    Workspace(
        id="ws-oil-02",
        name="SENTRA Field Operations & Loss Prevention",
        code="OPS-RIG12",
        description="Rig-12 exploration, drilling permit compliance, lifting gear integrity, and shift observation triage.",
        site="Rig-12 Exploration & Field Operations",
        organization="Oil India Limited",
        status="Active",
        icon_initial="F",
        allowed_roles={"HSE Analyst", "Safety Officer", "Admin"},
    ),
    Workspace(
        id="ws-oil-03",
        name="Eastern Asset Gas Gathering (GGS-4 & Pipelines)",
        code="ASSET-GGS4",
        description="High-pressure energy isolation (LOTO), confined space gas monitoring, and pipeline manifold safety.",
        site="GGS-4 & Eastern Asset Pipeline Network",
        organization="Oil India Limited",
        status="Active",
        icon_initial="E",
        allowed_roles={"HSE Analyst", "Safety Officer", "Admin"},
    ),
]
