"""
models.py
---------
Pydantic models for the PitWall FastAPI application.
Defines all request and response schemas used across the API routes.
"""

from pydantic import BaseModel


class AskRequest(BaseModel):
    """Request body for POST /ask."""

    question: str
    race: str = "Monaco 2025"


class AgentResult(BaseModel):
    """Per-agent breakdown returned in an AskResponse."""

    agent: str
    answer: str
    chunks_used: int


class AskResponse(BaseModel):
    """Response body for POST /ask."""

    question: str
    final_answer: str
    agents_consulted: list[AgentResult]
    race: str


class BriefCard(BaseModel):
    """A single question/answer card inside a brief or debrief response."""

    title: str
    question: str
    answer: str


class BriefResponse(BaseModel):
    """Response body for GET /brief and GET /debrief."""

    cards: list[BriefCard]
    race: str


class StatusResponse(BaseModel):
    """Response body for GET /status."""

    collections: dict[str, int]
