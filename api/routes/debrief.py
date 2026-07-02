"""
debrief.py
----------
GET /debrief route — runs 3 post-race analysis questions through the Orchestrator
and returns a BriefResponse containing one BriefCard per question.
"""

from fastapi import APIRouter

from api.models import BriefCard, BriefResponse
from agents.orchestrator import Orchestrator

router = APIRouter()

_orchestrator = Orchestrator()

# Post-race debrief questions with short card titles
_DEBRIEF_QUESTIONS: list[tuple[str, str]] = [
    (
        "Suboptimal Stops",
        "Which pit stop calls were suboptimal and why?",
    ),
    (
        "Tyre Degradation",
        "How did tyre degradation compare across the top 5 drivers?",
    ),
    (
        "Decisive Moment",
        "What was the most decisive strategic moment of the race?",
    ),
]


@router.get("/debrief", response_model=BriefResponse, summary="Post-race strategy debrief")
def get_debrief(race: str = "Monaco 2025") -> BriefResponse:
    """
    Run 3 canonical post-race analysis questions through the Orchestrator
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
    for title, question in _DEBRIEF_QUESTIONS:
        answer = _orchestrator.run(question)
        cards.append(BriefCard(title=title, question=question, answer=answer))

    return BriefResponse(cards=cards, race=race)
