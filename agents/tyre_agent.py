"""
tyre_agent.py
-------------
Defines the TyreAgent class, a specialized BaseAgent focused on Formula 1
tyre strategy, tyre compound selection, degradation analysis, stint lengths,
and pit stop/undercut windows.
"""

from typing import Any

from agents.base_agent import BaseAgent
from utils.groq_client import ask_groq


class TyreAgent(BaseAgent):
    """
    Agent specializing in tyre strategy, stint lengths, compounds, and pit stops.
    """

    def __init__(self) -> None:
        """Initialise TyreAgent with name 'tyre_agent' and access to laps and pitstops."""
        super().__init__(name="tyre_agent", collections=["laps", "pitstops"])

    def run(self, query: str) -> dict[str, Any]:
        """
        Analyse F1 tyre data (compounds, degradation, stint lengths, undercut windows, pit stops)
        to answer queries.

        Parameters
        ----------
        query : str
            The user question/query text.

        Returns
        -------
        dict
            Structured result containing agent identifier, answer, and count of chunks used.
        """
        # ── 1. Retrieve Scoped Chunks ────────────────────────────────────────
        chunks = self._retrieve(query)

        # ── 2. Specialist Prompts ───────────────────────────────────────────
        system_prompt = (
            "You are a Formula 1 tyre strategy expert. You analyze lap telemetry, "
            "timing data, tyre compounds, degradation, stint lengths, undercut windows, "
            "and pit stops to deliver precise, data-driven answers.\n\n"
            "RULES:\n"
            "1. Answer ONLY from the context provided in the user message. Do not draw on outside knowledge, assumptions, or prior races unless explicitly reflected in the supplied context.\n"
            "2. If the context does not contain enough information to answer the question fully and accurately, respond with exactly: \"I don't have enough data to answer that.\"\n"
            "3. Be concise and precise. Use F1 terminology correctly. Prefer structured answers (short paragraphs or bullet points)."
        )

        # Build context section from chunks
        context_lines = []
        if not chunks:
            context_lines.append("*(No relevant context was found for this query.)*")
        else:
            for idx, chunk in enumerate(chunks, start=1):
                col = chunk.get("collection", "unknown")
                text = chunk.get("text", "").strip()
                distance = chunk.get("distance")
                metadata = chunk.get("metadata", {})

                # Construct a descriptive header for reference
                header_parts = [f"Chunk {idx}", f"collection={col}"]
                if distance is not None:
                    header_parts.append(f"distance={distance:.4f}")
                if metadata:
                    meta_snippets = [f"{k}={v}" for k, v in metadata.items() if k != "source"]
                    if meta_snippets:
                        header_parts.append(", ".join(meta_snippets))

                context_lines.append(f"**[{' | '.join(header_parts)}]**")
                context_lines.append(text)
                context_lines.append("")

        context_str = "\n".join(context_lines)

        user_prompt = (
            "## Retrieved Context\n\n"
            f"{context_str}\n"
            "---\n\n"
            "## Question\n"
            f"{query}\n\n"
            "Please provide a precise strategy answer focused on tyre compounds, degradation, stint lengths, "
            "and undercut windows based strictly on the retrieved context."
        )

        # ── 3. Query LLM ────────────────────────────────────────────────────
        answer = ask_groq(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
        )

        # ── 4. Return Structured Result ─────────────────────────────────────
        return {
            "agent": self.name,
            "answer": answer,
            "chunks_used": len(chunks),
        }
