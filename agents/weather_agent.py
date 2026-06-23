"""
weather_agent.py
----------------
Defines the WeatherAgent class, a specialized BaseAgent focused on Formula 1
weather conditions, track and air temperatures, rainfall probability/risk,
and how these conditions impact tyre choice and strategy.
"""

from typing import Any

from agents.base_agent import BaseAgent
from utils.groq_client import ask_groq


class WeatherAgent(BaseAgent):
    """
    Agent specializing in track weather analysis, temperature changes, and rain impact.
    """

    def __init__(self) -> None:
        """Initialise WeatherAgent with name 'weather_agent' and access to weather collection."""
        super().__init__(name="weather_agent", collections=["weather"])

    def run(self, query: str) -> dict[str, Any]:
        """
        Analyse F1 weather conditions (temperature, rain risk, tyre choice impact) to answer queries.

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
            "You are a Formula 1 weather strategist. You analyze air temperature, "
            "track temperature, humidity, wind conditions, and rainfall risk to determine "
            "their immediate impact on race strategy and tyre choice.\n\n"
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
            "Please provide a precise strategy answer focused on weather conditions, temperature, "
            "rainfall risk, and how they impact tyre choice based strictly on the retrieved context."
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
