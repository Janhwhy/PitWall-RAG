"""
rivals_agent.py
---------------
Defines the RivalsAgent class, a specialized BaseAgent focused on competitor analysis,
tracking rival drivers' tyre age, monitoring their lap time degradation, and
predicting their pit stop windows and potential undercut/overcut options.
"""

from typing import Any

from agents.base_agent import BaseAgent
from utils.groq_client import ask_groq


class RivalsAgent(BaseAgent):
    """
    Agent specializing in rival strategy analysis, pit stop timing, and degradation tracking.
    """

    def __init__(self) -> None:
        """Initialise RivalsAgent with name 'rivals_agent' and access to laps and pitstops."""
        super().__init__(name="rivals_agent", collections=["laps", "pitstops"])

    def run(self, query: str, race: str | None = None, year: int | None = None) -> dict[str, Any]:
        """
        Analyse rival race metrics (tyre age, lap time degradation, pit windows) to answer queries.

        Parameters
        ----------
        query : str
            The user question/query text.
        race : str | None
            If given, scope retrieval to this race.
        year : int | None
            If given, scope retrieval to this season.

        Returns
        -------
        dict
            Structured result containing agent identifier, answer, and count of chunks used.
        """
        # ── 1. Retrieve Scoped Chunks ────────────────────────────────────────
        chunks = self._retrieve(query, race=race, year=year)

        # ── 2. Specialist Prompts ───────────────────────────────────────────
        system_prompt = (
            "You are a Formula 1 competitor analysis expert. You monitor rival teams, "
            "tracking their drivers' tyre age, analyzing their lap time degradation, and "
            "predicting their upcoming pit stop windows to help identify undercut or overcut threats.\n\n"
            "RULES:\n"
            "1. Answer ONLY from the context provided in the user message. Do not draw on outside knowledge, assumptions, or prior races unless explicitly reflected in the supplied context.\n"
            "2. If the context does not contain enough information to answer the question fully and accurately, respond with exactly: \"I don't have enough data to answer that.\"\n"
            "3. Be concise and precise. Use F1 terminology correctly. Prefer structured answers (short paragraphs or bullet points).\n"
            "4. Refer to drivers by their 3-letter code exactly as it appears in the context (e.g. VER, LEC, ANT). "
            "Never expand a code into a full name from your own knowledge — code-to-driver assignments for this "
            "season may not match what you'd expect, and guessing produces wrong names.\n"
            "5. Your retrieved context is a small sample of semantically similar chunks, not a complete result set. "
            "Never state a total count, full tally, or team-wide aggregate (e.g. \"Team X pitted N times\") as if it "
            "were exhaustive — you cannot see every matching record. Team affiliation for a driver is NEVER present "
            "in this context at all, so never attribute a stat to a team unless the chunk text itself names that team. "
            "Describe only what you specifically observed, and say so is better answered from the full database if "
            "the question asks for a precise count or team-level total."
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
            "Please provide a precise strategy answer focused on rival analysis, degradation, and "
            "predicted pit windows based strictly on the retrieved context."
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
