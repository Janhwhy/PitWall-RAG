"""
base_agent.py
-------------
Defines the BaseAgent abstract base class which all specialized PitWall agents
inherit from. Every agent has a name, a set of assigned ChromaDB collections,
and must implement the abstract run() method.
"""

from abc import ABC, abstractmethod
from typing import Any

from utils.retriever import retrieve
from utils.groq_client import ask_groq


class BaseAgent(ABC):
    """
    Abstract base class for all PitWall agents.
    """

    def __init__(self, name: str, collections: list[str]) -> None:
        """
        Initialise the agent with a name and a list of ChromaDB collections to search.

        Parameters
        ----------
        name : str
            The identifier name of the agent.
        collections : list of str
            The database collections this agent is allowed to search/retrieve from.
        """
        self.name = name
        self.collections = collections

    @abstractmethod
    def run(
        self,
        query: str,
        race: str | None = None,
        year: int | None = None,
    ) -> dict[str, Any]:
        """
        Abstract method to process a user query and return an agent response dictionary.

        Parameters
        ----------
        query : str
            The user question/query text.
        race : str | None
            If given, scope retrieval to this race (e.g. "Monaco").
        year : int | None
            If given, scope retrieval to this season.

        Returns
        -------
        dict
            A dictionary containing:
              - "agent" : str (name of the agent that produced the answer)
              - "answer" : str (the LLM generated answer)
              - "chunks_used" : int (count of chunks used to build prompt)
        """
        pass

    def _retrieve(
        self,
        query: str,
        top_k: int = 8,
        distance_threshold: float = 0.50,
        race: str | None = None,
        year: int | None = None,
    ) -> list[dict[str, Any]]:
        """
        Helper method to retrieve chunks from the database, constrained only to
        the collections assigned to this agent.

        Parameters
        ----------
        query : str
            The natural language search query.
        top_k : int
            Number of results to retrieve per collection. Kept modest (8,
            was 15) to bound tokens-per-LLM-call — race/year scoping already
            narrows the candidate pool to one race's data, so the correct
            chunk reliably ranks near the top without needing a wide net.
        distance_threshold : float
            Maximum cosine distance for retrieved chunks.
        race : str | None
            If given, scope retrieval to this race (e.g. "Monaco").
        year : int | None
            If given, scope retrieval to this season.

        Returns
        -------
        list of dict
            Surviving retrieved database chunks.
        """
        return retrieve(
            query=query,
            collections=self.collections,
            top_k=top_k,
            distance_threshold=distance_threshold,
            race=race,
            year=year,
        )
