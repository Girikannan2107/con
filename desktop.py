"""SENTRA - Native Desktop Application Launcher.

Launches the unified SENTRA desktop shell, serving the compiled React + TypeScript
user interface powered by the authoritative Python SIF safety intelligence engine.
"""

import logging
import os
import socket
import sys
import threading
import time
import urllib.request
import uvicorn
import webview

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s")
logger = logging.getLogger("sentra.desktop")


def find_free_port() -> int:
    """Find a random available port on the loopback interface."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(("127.0.0.1", 0))
        s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        return s.getsockname()[1]


def start_backend(port: int):
    """Run uvicorn server in a dedicated background daemon thread."""
    from server import app
    config = uvicorn.Config(
        app=app,
        host="127.0.0.1",
        port=port,
        log_level="warning",
        access_log=False,
    )
    server = uvicorn.Server(config)
    server.run()


def wait_for_backend(port: int, timeout: float = 15.0) -> bool:
    """Wait until backend responds to health check."""
    start_time = time.time()
    url = f"http://127.0.0.1:{port}/api/health"
    while time.time() - start_time < timeout:
        try:
            with urllib.request.urlopen(url, timeout=1.0) as resp:
                if resp.status == 200:
                    return True
        except Exception:
            time.sleep(0.15)
    return False


def main():
    logger.info("Initializing SENTRA Desktop Shell...")
    port = find_free_port()

    # Launch background backend server
    backend_thread = threading.Thread(target=start_backend, args=(port,), daemon=True)
    backend_thread.start()

    logger.info(f"Awaiting internal safety engine readiness on internal port {port}...")
    if not wait_for_backend(port):
        logger.error("Failed to start internal safety intelligence engine.")
        sys.exit(1)

    logger.info("Starting Native Desktop Window (WebView2)...")
    app_url = f"http://127.0.0.1:{port}"

    # Create native Windows desktop window
    window = webview.create_window(
        title="SENTRA — Oil India Limited Safety Intelligence Platform",
        url=app_url,
        width=1420,
        height=920,
        min_size=(1080, 720),
        background_color="#050505",
        confirm_close=False,
    )

    # Start the desktop window event loop
    webview.start(debug=False)
    logger.info("SENTRA Desktop exited cleanly.")


if __name__ == "__main__":
    main()
