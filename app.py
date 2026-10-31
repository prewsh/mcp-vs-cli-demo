"""
mcp-vs-cli-demo

A deliberately tiny web app used as the target for an experiment:
the same AI agent is asked to deploy this app and inspect its logs,
once through the PipeOps CLI and once through the PipeOps MCP server.

The app itself is not the point. It has one planted, non-fatal error
so we can check whether each agent run actually finds problems in the logs.
"""

import logging
import os
import sys

from flask import Flask, jsonify

logging.basicConfig(
    stream=sys.stdout,
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)
log = logging.getLogger("mcp-cli-demo")

app = Flask(__name__)

# Planted error: DEMO_GREETING is never set in the deployment config.
# The app keeps running with a fallback, but logs an ERROR on startup.
GREETING = os.environ.get("DEMO_GREETING")
if not GREETING:
    log.error(
        "DEMO_GREETING environment variable is not set; "
        "falling back to default greeting. Set DEMO_GREETING in the project environment."
    )
    GREETING = "Hello from mcp-cli-demo"

log.info("mcp-cli-demo starting up")


@app.route("/")
def index():
    return jsonify(message=GREETING, app="mcp-cli-demo")


@app.route("/health")
def health():
    return jsonify(status="ok")


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8080"))
    app.run(host="0.0.0.0", port=port)
