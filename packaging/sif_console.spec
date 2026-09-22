# -*- mode: python ; coding: utf-8 -*-
"""PyInstaller build for SENTRA.

Build (from the repository root):

    pyinstaller packaging/sif_console.spec --noconfirm

Two variants, chosen with the ``SIF_BUILD_VARIANT`` environment variable:

``full`` (default)
    Everything: the interface, the rule engine, PDF ingestion, and the optional
    stack - sentence-transformers, XGBoost, MLflow and PaddleOCR. Around 3 GB
    packaged, and the only variant where every page of the console does what it
    says without the operator installing anything afterwards.

``slim``
    Interface, deterministic rule engine and PDF text-layer ingestion only.
    Roughly 200 MB. The console detects the missing engines at run time and the
    Engines page says which are absent; an operator can add them later with
    ``pip install -r requirements.txt`` only if the machine has Python, which an
    installed build does not require. Choose this only when the download size
    matters more than the analysers.

The local LLM is not bundled in either variant and cannot be: Ollama is a
separate service with its own installer and its own model files (``gemma2``,
``llama3.2``), often several gigabytes each. The console finds it over HTTP at
run time - see the Engines page, and INNO_SETUP.md for what to tell an operator.
"""

import os
import sys

from PyInstaller.utils.hooks import collect_all, collect_submodules

VARIANT = os.environ.get("SIF_BUILD_VARIANT", "full").lower()
APP_NAME = "SENTRA"
#: The executable and one-folder bundle keep this stem. It is wired into
#: installer.iss (AppExeName), the release workflow's tar step and the published
#: asset names, so renaming it is a pipeline change rather than a label change.
#: The name an operator sees is APP_NAME.
EXECUTABLE = "SIFConsole"
#: app.py is the shipped interface. app2.py is the same console in the deep-navy
#: design and is not packaged; building the wrong one ships a window the
#: operator has never been shown.
ENTRY = "app.py"

ROOT = os.path.abspath(os.path.join(os.getcwd()))

# Every module of our own three packages, by name. PyInstaller follows imports,
# but the theme modules are imported inside functions and the page modules
# through a table, and a module reached only that way is a module it can miss.
hidden = ["main", "main2", "app", "app2"]
for package in ("sif", "ui", "ui2"):
    hidden += [package] + collect_submodules(package)

datas = [
    # The scroll arrows and the two check marks the style sheets address by path.
    (os.path.join(ROOT, "ui", "assets"), os.path.join("ui", "assets")),
    (os.path.join(ROOT, "sample_reports.csv"), "."),
    (os.path.join(ROOT, "samples"), "samples"),
]
binaries = []

#: The optional stack. In the full build each is collected whole - data files,
#: dynamic libraries and all - because every one of them loads resources that an
#: import graph alone does not reveal: torch its shared libraries, sklearn and
#: xgboost their compiled cores, mlflow its migration scripts and store plugins,
#: paddleocr its inference models and character dictionaries.
OPTIONAL = ["torch", "transformers", "sentence_transformers", "xgboost", "sklearn",
            "scipy", "mlflow", "paddle", "paddleocr", "pandas"]

if VARIANT == "slim":
    excludes = list(OPTIONAL) + ["matplotlib"]
else:
    excludes = ["matplotlib"]
    for package in OPTIONAL:
        try:
            package_datas, package_binaries, package_hidden = collect_all(package)
        except Exception as exc:                 # not installed on this machine
            print(f"[spec] {package} not collected: {exc}")
            continue
        datas += package_datas
        binaries += package_binaries
        hidden += package_hidden

a = Analysis(
    [os.path.join(ROOT, ENTRY)],
    pathex=[ROOT],
    binaries=binaries,
    datas=datas,
    hiddenimports=sorted(set(hidden)),
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=excludes,
    noarchive=False,
)
pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name=EXECUTABLE,
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=False,
    console=False,                      # a desktop app, not a terminal tool
    icon=os.environ.get("SIF_ICON") or None,
)

coll = COLLECT(
    exe,
    a.binaries,
    a.datas,
    strip=False,
    upx=False,
    name=EXECUTABLE,
)

if sys.platform == "darwin":
    app = BUNDLE(
        coll,
        name=f"{APP_NAME}.app",
        icon=os.environ.get("SIF_ICON") or None,
        bundle_identifier="in.co.oilindia.sifconsole",
        info_plist={
            "CFBundleShortVersionString": os.environ.get("SIF_VERSION", "0.0.0"),
            "CFBundleVersion": os.environ.get("SIF_VERSION", "0.0.0"),
            "NSHighResolutionCapable": True,
        },
    )
