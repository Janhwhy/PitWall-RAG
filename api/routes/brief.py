"""
brief.py
--------
GET /brief route — runs 5 pre-race strategy questions through the Orchestrator
and returns a BriefResponse containing one BriefCard per question.
"""

from fastapi import APIRouter

from api.models import BriefCard, BriefResponse
from agents.orchestrator import Orchestrator

router = APIRouter()

_orchestrator = Orchestrator()

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
        "What does the Monaco circuit mean for pit timing?",
    ),
    (
        "Base Strategy",
        "What is the recommended base race strategy?",
    ),
]


@router.get("/brief", response_model=BriefResponse, summary="Pre-race strategy brief")
def get_brief(race: str = "Monaco 2025") -> BriefResponse:
    """
    Run 5 canonical pre-race strategy questions through the Orchestrator
    and return the answers as a set of BriefCards.

    Parameters
    ----------
    race : str
        The race identifier label to embed in the response (default
        ``"Monaco 2025"``).

    Returns
    -------
    BriefResponse
        A list of BriefCards, one per question, plus the race label.
    """
    cards: list[BriefCard] = []
    for title, question in _BRIEF_QUESTIONS:
        answer = _orchestrator.run(question)
        cards.append(BriefCard(title=title, question=question, answer=answer))

    return BriefResponse(cards=cards, race=race)
