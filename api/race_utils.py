"""
race_utils.py
-------------
Shared helper for parsing the "<Country> <Year>" race labels sent by the
frontend (e.g. "Monaco 2026", "Saudi Arabia 2025") into the separate
(race, year) values used to scope retrieval — matches the "race"/"year"
metadata fields chunks are tagged with at ingestion time.
"""

from __future__ import annotations

import re

_LABEL_RE = re.compile(r"^(.*\S)\s+(\d{4})$")


def parse_race_label(label: str) -> tuple[str | None, int | None]:
    """
    Split a race label into (race_name, year).

    >>> parse_race_label("Monaco 2026")
    ('Monaco', 2026)
    >>> parse_race_label("Saudi Arabia 2025")
    ('Saudi Arabia', 2025)
    >>> parse_race_label("")
    (None, None)
    """
    if not label or not label.strip():
        return None, None

    match = _LABEL_RE.match(label.strip())
    if not match:
        # No trailing year found — treat the whole thing as the race name.
        return label.strip(), None

    race_name, year_str = match.groups()
    return race_name, int(year_str)
