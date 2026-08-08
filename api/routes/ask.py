"""
ask.py
------
POST /ask route — accepts an AskRequest, runs the Orchestrator, and returns
a full AskResponse with the synthesised answer and per-agent breakdowns.
"""

from fastapi import APIRouter

from api.models import AgentResult, AskRequest, AskResponse
from api.race_utils import parse_race_label
from agents.orchestrator import Orchestrator

router = APIRouter()

# Single shared Orchestrator instance (agents are pre-instantiated at startup)
_orchestrator = Orchestrator()


@router.post("/ask", response_model=AskResponse, summary="Ask a race-strategy question")
def ask_question(body: AskRequest) -> AskResponse:
    """
    Route a natural-language question through the multi-agent Orchestrator.

    Parameters
    ----------
    body : AskRequest
        JSON body with ``question`` (required) and optional ``race`` (default
        ``"Monaco 2025"``).

    Returns
    -------
    AskResponse
        The synthesised final answer plus a list of per-agent results.
    """
    race_name, year = parse_race_label(body.race)
    final_answer, raw_results = _orchestrator.run_with_details(
        body.question, race=race_name, year=year
    )

    agents_consulted = [
        AgentResult(
            agent=r.get("agent", "unknown"),
            answer=r.get("answer", ""),
            chunks_used=r.get("chunks_used", 0),
        )
        for r in raw_results
    ]

    return AskResponse(
        question=body.question,
        final_answer=final_answer,
        agents_consulted=agents_consulted,
        race=body.race,
    )
