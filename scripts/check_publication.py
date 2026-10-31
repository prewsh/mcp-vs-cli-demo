#!/usr/bin/env python3
"""Check a curated public export. A passing pattern scan is not a secrecy guarantee."""
import hashlib
import re
from pathlib import Path
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parents[1]
ALLOWED_SUFFIXES = {".md", ".json", ".csv", ".py", ".sha256"}
ALLOWED_DOTFILES = {".gitignore", ".gitattributes"}
PATTERNS = {
    "service token": rb"\bsat_[A-Za-z0-9_-]{12,}",
    "OpenAI-style key": rb"\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}",
    "GitHub-style token": rb"\bgh[pousr]_[A-Za-z0-9_]{20,}",
    "AWS access key": rb"\b(?:AKIA|ASIA)[A-Z0-9]{16}\b",
    "private key": rb"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----",
    "JWT": rb"\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}",
    "bearer value": rb"(?i)Bearer\s+[A-Za-z0-9._~-]{24,}",
    "UUID identifier": rb"\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\b",
    "host home path": rb"/(?:Users|home)/[A-Za-z0-9_.-]+/",
}


def main():
    files = []
    failures = []
    for path in sorted(ROOT.rglob("*")):
        relative = path.relative_to(ROOT)
        if any(part in {".git", "__pycache__"} for part in relative.parts):
            continue
        if path.is_symlink():
            failures.append(f"symlink: {relative}")
            continue
        if not path.is_file():
            continue
        files.append(path)
        if path.suffix not in ALLOWED_SUFFIXES and path.name not in ALLOWED_DOTFILES:
            failures.append(f"unapproved file type: {relative}")
        body = path.read_bytes()
        for label, pattern in PATTERNS.items():
            if re.search(pattern, body):
                failures.append(f"{label}: {relative}")
        if path.suffix == ".md":
            for target in re.findall(r"!?\[[^\]]*\]\(([^)]+)\)", body.decode()):
                if re.match(r"^[a-zA-Z]+://", target) or target.startswith("#"):
                    continue
                destination = (path.parent / unquote(target.split("#", 1)[0])).resolve()
                if not destination.is_relative_to(ROOT) or not destination.exists():
                    failures.append(f"broken/local-external link: {relative}: {target}")
    manifest = ROOT / "manifest.sha256"
    expected = {}
    for line in manifest.read_text().splitlines():
        digest, name = line.split("  ", 1)
        expected[name] = digest
    actual = {str(p.relative_to(ROOT)): hashlib.sha256(p.read_bytes()).hexdigest()
              for p in files if p != manifest}
    if expected != actual:
        failures.append("manifest does not match the complete export")
    if failures:
        raise SystemExit("Publication check failed:\n" + "\n".join(failures))
    print(f"Checked {len(files)} files: checksums, local Markdown links, allowed file types and credential/identifier patterns passed.")
    print("No cloud commands were executed. Review new evidence manually before future publication.")


if __name__ == "__main__":
    main()
