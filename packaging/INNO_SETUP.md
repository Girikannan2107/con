# Building SENTRA into a Windows installer (.exe)

Step by step, from a clean Windows machine to `SENTRA-2.0.0-setup.exe`.

**What Inno Setup does and does not do.** It builds an installer out of files
that already exist. It cannot turn Python into a program. So this is two tools
in order:

```
your code  ──PyInstaller──▶  dist\SIFConsole\SIFConsole.exe  ──Inno Setup──▶  SENTRA-2.0.0-setup.exe
             (makes the app)        (a folder that runs)                        (one file to hand out)
```

Everything below runs on **Windows**. PyInstaller builds for the system it runs
on - a Linux machine cannot produce a Windows `.exe`.

---

## Step 1 - Install the two tools

1. **Python 3.11 or 3.12**, 64-bit, from <https://www.python.org/downloads/>.
   On the first screen tick **Add python.exe to PATH**.
2. **Inno Setup 6**, from <https://jrsoftware.org/isdl.php>. Take the default
   options; it installs to `C:\Program Files (x86)\Inno Setup 6`.

Check both from a new Command Prompt:

```bat
python --version
"C:\Program Files (x86)\Inno Setup 6\ISCC.exe" /?
```

---

## Step 2 - Get the code and its dependencies

```bat
git clone https://github.com/tedo001/SIF.git
cd SIF
git checkout tedo

python -m venv .venv
.venv\Scripts\activate

python -m pip install --upgrade pip
pip install -r requirements.txt
pip install pyinstaller
```

`requirements.txt` is the full stack - PyQt6, the sentence encoder, XGBoost,
MLflow and PaddleOCR. It is a few gigabytes and takes a while. Install it in
full: the point of the installer is that the operator does not have to.

Check the console runs from source before packaging it:

```bat
python app.py
```

---

## Step 3 - Build the application with PyInstaller

From the repository root, with the virtual environment still active:

```bat
pyinstaller packaging\sif_console.spec --noconfirm
```

The spec builds the **full** variant by default - every engine included. For the
small build without the optional analysers:

```bat
set SIF_BUILD_VARIANT=slim
pyinstaller packaging\sif_console.spec --noconfirm
```

In PowerShell an environment variable is set differently - `set` is an alias for
something else entirely there:

```powershell
$env:SIF_BUILD_VARIANT = "slim"
pyinstaller packaging\sif_console.spec --noconfirm
```

When it finishes you have `dist\SIFConsole\`. **Test that folder before going
on** - it is the thing the installer ships:

```bat
dist\SIFConsole\SIFConsole.exe
```

Open the **Engines** page. Each line says what was found on this machine. If the
encoder or the model says "not installed" in a full build, the package is
missing something and Step 4 would only wrap the problem up in an installer.

> Want an icon on the executable? Put a `.ico` file somewhere and set `SIF_ICON`
> to its path before the `pyinstaller` line - `set SIF_ICON=C:\path\to\sentra.ico`
> in Command Prompt, `$env:SIF_ICON = "C:\path\to\sentra.ico"` in PowerShell.

---

## Step 4 - Build the installer with Inno Setup

**Which terminal you are in matters here.** VS Code and PyCharm open PowerShell
by default; the Start menu's "Command Prompt" is `cmd.exe`. The two parse this
command differently, so use the line that matches your prompt.

`PS E:\SIF>` - **PowerShell**. A command that begins with a quoted string is a
string *literal* to PowerShell, not a program to run, so it needs the call
operator `&` in front of the path:

```powershell
& "C:\Program Files (x86)\Inno Setup 6\ISCC.exe" "/DAppVersion=2.0.0" packaging\installer.iss
```

`E:\SIF>` - **Command Prompt**, where the quotes are enough on their own:

```bat
"C:\Program Files (x86)\Inno Setup 6\ISCC.exe" /DAppVersion=2.0.0 packaging\installer.iss
```

Without the `&`, PowerShell answers:

```
Unexpected token 'DAppVersion=2.0.0' in expression or statement.
```

which is the parser objecting to the line, not Inno Setup objecting to the
script.

The result is:

```
dist\installer\SENTRA-2.0.0-setup.exe
```

That single file is what you hand out, put on a share, or attach to a release.

**Use the same version everywhere.** `/DAppVersion=2.0.0` must match
`sif/version.py`, or the console reports one version and Windows lists another,
and the built-in update check offers the same update forever. To set both from
one place:

```bat
python packaging\stamp_version.py v2.1.0
```

### Doing it from the Inno Setup window instead

If you prefer not to use the command line: open Inno Setup, **File → Open**,
choose `packaging\installer.iss`, then **Build → Compile** (Ctrl+F9). One change
first - without `/DAppVersion` on the command line the script falls back to
`0.0.0`, so edit the top of the file:

```pascal
#ifndef AppVersion
  #define AppVersion "2.0.0"
#endif
```

---

## Step 5 - Install it and check the console

Run `SENTRA-2.0.0-setup.exe` on a machine that has never had the code on it.

1. It installs to `C:\Program Files\SENTRA` (or to your own folder if Windows
   does not offer administrator rights).
2. The last page of the wizard shows what still needs doing - the local LLM.
3. Start it from the Start menu.

Then check the three things a packaged build gets wrong most often:

| Check | Where | What you should see |
| --- | --- | --- |
| The interface is the black-and-lime one | on opening | a black rail, capitals, a lime wordmark |
| Every engine came along | **Engines** page | encoder, OCR and model all report a version, not "not installed" |
| It can write its own data | **Settings** page, log panel | lines appearing, and a path under `%APPDATA%` |

---

## Step 6 - The local LLM (gemma2, llama3.2)

This is the one part **no installer can carry**. Ollama is a separate service
with its own multi-gigabyte model files, and it is what performs translation of
non-English reports and the optional fourth opinion on each narrative.

On the machine that will run SENTRA:

```bat
:: 1. install Ollama from https://ollama.com/download, then:
ollama pull llama3.2
ollama serve
```

In SENTRA: **Engines → Use the local LLM as an additional analyser**, put
`llama3.2` in the Model box, press **Check connection**. The line beneath says
exactly what it found; the workflow map's "Translate" box turns green.

Any model works - `gemma2`, `mistral`, `qwen2.5` - as long as the name in the
Model box matches what `ollama list` shows. An untagged pull is stored as
`:latest`, and the console compares the two correctly, so `gemma2` and
`gemma2:latest` are the same model to it.

**On speed.** Run `ollama ps` while a model is loaded:

```
NAME             SIZE      PROCESSOR
gemma2:latest    7.1 GB    20%/80% CPU/GPU     <- does not fit the card; slow
llama3.2:latest  2.9 GB    100% GPU            <- fully on the card; fast
```

A model that does not fit the graphics card is split with the processor and is
several times slower. If translation feels slow, that line is why - pull a
smaller model rather than waiting.

Without Ollama the console still runs. Non-English reports are analysed in
their original wording and that fact is recorded on the report; nothing is
silently skipped.

---

## If something goes wrong

| Symptom | Cause | Fix |
| --- | --- | --- |
| `ISCC.exe` is not recognised | Inno Setup is not on PATH | use the full path, as in Step 4 |
| `Unexpected token 'DAppVersion=2.0.0'` | PowerShell read the quoted path as a string | put `&` in front of it - see Step 4 |
| `The system cannot find the file specified` from ISCC | the script name is mistyped | it is `installer.iss`, one `s` at the end and no trailing letter |
| Inno Setup says the source folder is empty | Step 3 did not run, or ran elsewhere | `dist\SIFConsole\` must exist next to `packaging\`; compile from the repository root |
| The installed app opens and closes at once | a module PyInstaller did not find | build once with `console=True` in the spec's `EXE(...)` and run the exe from a Command Prompt to read the traceback |
| Engines page says "not installed" in a full build | the package was missing from the build environment | `pip install -r requirements.txt` inside the venv, then rebuild from Step 3 |
| The log panel stays empty | an older build writing into Program Files | this build writes under `%APPDATA%\SIF Insight Console`; rebuild from current code |
| Windows SmartScreen warns on first run | the installer is not code-signed | "More info" → "Run anyway", or sign it with your organisation's certificate |

## Where the installed console keeps its data

`%APPDATA%\SIF Insight Console` - preferences, the audit trail, the decision
trail, the rolling log, the trained model and the MLflow database. Never the
installation folder, which a standard user cannot write to. Uninstalling leaves
that folder alone: the decision trail is a record, and a reinstall should find
it where it was.
