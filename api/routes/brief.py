"""
brief.py
--------
GET /brief route — runs 5 pre-race strategy questions through the Orchestrator
and returns a BriefResponse containing one BriefCard per question.
"""

from fastapi import APIRouter

from api.models import BriefCard, BriefResponse
from api.race_utils import parse_race_label
from agents.orchestrator import Orchestrator

router = APIRouter()

_orchestrator = Orchestrator()

# The 5 brief questions are fixed and the underlying race data never changes
# once ingested, so re-running all 5 through the full multi-agent pipeline
# (routing + parallel agents + synthesis, per question) on every single page
# view is pure wasted latency — cache per race label for the process
# lifetime, with an explicit bypass for anyone who wants a fresh run.
_cache: dict[str, BriefResponse] = {}

# Pre-race briefing questions with short card titles
_BRIEF_QUESTIONS: list[tuple[str, str]] = [
    (
        "Tyre Strategies",
        "What tyre strategies are available for this race?",
    ),
    (
        "Weather Impact",
        "What does the weather mean for strategy?",
    ),
    (
        "Key Rivals",
        "Who are the key rivals to watch?",
    ),
    (
        "Pit Timing",
        "What does the circuit layout mean for pit timing?",
    ),
    (
        "Base Strategy",
        "What is the recommended base race strategy?",
    ),
]


@router.get("/brief", response_model=BriefResponse, summary="Pre-race strategy brief")
def get_brief(race: str = "Monaco 2025", force_refresh: bool = False) -> BriefResponse:
    """
    Run 5 canonical pre-race strategy questions through the Orchestrator
    and return the answers as a set of BriefCards.

    Parameters
    ----------
    race : str
        The race identifier label to embed in the response (default
        ``"Monaco 2025"``).
    force_refresh : bool
        Bypass the cache and re-run all 5 questions fresh (default False).

    Returns
    -------
    BriefResponse
        A list of BriefCards, one per question, plus the race label.
    """
    if not force_refresh and race in _cache:
        return _cache[race]

    race_name, year = parse_race_label(race)

    cards: list[BriefCard] = []
    for title, question in _BRIEF_QUESTIONS:
        answer = _orchestrator.run(question, race=race_name, year=year)
        cards.append(BriefCard(title=title, question=question, answer=answer))

    response = BriefResponse(cards=cards, race=race)
    _cache[race] = response
    return response
