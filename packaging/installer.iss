; Inno Setup script for SENTRA (Windows installer).
;
; It packages a folder that PyInstaller has already produced - it does not
; compile Python. The order is always:
;
;     pyinstaller packaging\sif_console.spec --noconfirm     -> dist\SIFConsole\
;     iscc /DAppVersion=2.0.0 packaging\installer.iss        -> dist\installer\...exe
;
; See INNO_SETUP.md in this folder for the whole procedure, step by step.
;
; The version always comes from the git tag via /DAppVersion, so the installer's
; "Programs and Features" entry, the app's own version and the tag agree.

#ifndef AppVersion
  #define AppVersion "0.0.0"
#endif

#define AppName "SENTRA"
#define AppPublisher "Oil India Limited"
#define AppExeName "SIFConsole.exe"
#define SourceDir "..\dist\SIFConsole"

[Setup]
AppId={{4C7F2E1A-9B3D-4E6F-8A21-5C0D7E9F1B34}
AppName={#AppName}
AppVersion={#AppVersion}
AppVerName={#AppName} {#AppVersion}
AppPublisher={#AppPublisher}
VersionInfoVersion={#AppVersion}
VersionInfoDescription=SIF precursor console - Problem Statement 26165
DefaultDirName={autopf}\SENTRA
DefaultGroupName={#AppName}
DisableProgramGroupPage=yes
OutputDir=..\dist\installer
OutputBaseFilename=SENTRA-{#AppVersion}-setup
Compression=lzma2/max
SolidCompression=yes
WizardStyle=modern
; Per-machine when elevated, per-user otherwise: a plant workstation is often locked down.
PrivilegesRequiredOverridesAllowed=dialog commandline
ArchitecturesInstallIn64BitMode=x64compatible
; PyQt6 needs Windows 10 or newer; saying so here beats a DLL error after a
; 3 GB install.
MinVersion=10.0
UninstallDisplayName={#AppName} {#AppVersion}
UninstallDisplayIcon={app}\{#AppExeName}
; Let an update overwrite the previous install without a manual uninstall.
CloseApplications=yes
RestartApplications=no
; Shown on the last page of the wizard: what the console needs that an
; installer cannot provide - the local LLM, and where its data lives.
InfoAfterFile=after_install.txt

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "Create a desktop shortcut"; GroupDescription: "Additional shortcuts:"; Flags: unchecked

[Files]
; The whole PyInstaller one-folder bundle. "recursesubdirs" matters: the full
; build carries the model and OCR payloads several directories deep.
Source: "{#SourceDir}\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "after_install.txt"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{group}\{#AppName}"; Filename: "{app}\{#AppExeName}"
Name: "{group}\Uninstall {#AppName}"; Filename: "{uninstallexe}"
Name: "{autodesktop}\{#AppName}"; Filename: "{app}\{#AppExeName}"; Tasks: desktopicon

[Run]
Filename: "{app}\{#AppExeName}"; Description: "Start {#AppName}"; Flags: nowait postinstall skipifsilent

; The console writes its preferences, audit trail, decisions, logs, trained
; model and MLflow database under %APPDATA%\SIF Insight Console - never into
; this folder, which a standard user cannot write to. Nothing to declare here;
; it is noted so the next person does not add a [Dirs] entry that suggests
; otherwise. Uninstalling deliberately leaves that data behind: the decision
; trail is a record, and a reinstall should find it.
