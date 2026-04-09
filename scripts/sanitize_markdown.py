"""
Sanitize generated markdown files before deployment.
Replaces sensitive strings (paths, emails) with safe placeholders.

Usage:
    python scripts/sanitize_markdown.py
"""

import os

MARKDOWN_DIR = os.path.join(os.path.dirname(__file__), "..", "src", "data", "markdown")

REPLACEMENTS = [
    (r"C:\Users\Paul\Synology Drive - Paul\Freiberuflichkeit - Paul\Produkte", "C:\\"),
    ("paul@moldmann.onmicrosoft.com", "ilove@semadoc.io"),
    ("admin@moldmann.onmicrosoft.com", "beautiful@semadoc.io"),
]


def sanitize_file(filepath: str) -> int:
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    original = content
    for old, new in REPLACEMENTS:
        content = content.replace(old, new)

    if content != original:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        return 1
    return 0


def main():
    md_dir = os.path.normpath(MARKDOWN_DIR)
    changed = 0
    scanned = 0

    for root, _, files in os.walk(md_dir):
        for fname in files:
            if fname.endswith(".md"):
                scanned += 1
                filepath = os.path.join(root, fname)
                changed += sanitize_file(filepath)

    print(f"Scanned {scanned} files, updated {changed}.")


if __name__ == "__main__":
    main()
