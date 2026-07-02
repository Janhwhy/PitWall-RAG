"""
orchestrator.py
---------------
Defines the Orchestrator class, which acts as the main routing and synthesis controller
in the multi-agent PitWall system. It routes queries to relevant specialist agents based on
keywords, runs them in parallel using ThreadPoolExecutor, and synthesizes a final,
unified race strategy answer using the Groq LLM.
"""

import concurrent.futures
from typing import Any

from agents.base_agent import BaseAgent
from agents.tyre_agent import TyreAgent
from agents.weather_agent import WeatherAgent
from agents.radio_agent import RadioAgent
from agents.rivals_agent import RivalsAgent
from agents.circuit_agent import CircuitAgent
from utils.groq_client import ask_groq


class Orchestrator:
    """
    Main coordinator that routes user queries to specialized agents,
    orchestrates their parallel execution, and synthesizes their responses.
    """

    def __init__(self) -> None:
        """Initialize and pre-instantiate all specialist agents."""
        self.agents = {
            "tyre": TyreAgent(),
            "weather": WeatherAgent(),
            "radio": RadioAgent(),
            "rivals": RivalsAgent(),
            "circuit": CircuitAgent(),
        }

    def route(self, query: str) -> list[BaseAgent]:
        """
        Route the query to relevant specialist agents based on keyword matching.
        Guarantees that at least 2 unique agents are selected.

        Parameters
        ----------
        query : str
            The user question/query text.

        Returns
        -------
        list of BaseAgent
            The selected specialist agents to run.
        """
        q_lower = query.lower()
        matched: list[BaseAgent] = []

        # Define keyword lists for routing
        tyre_keywords = ["tyre", "compound", "degrad", "stint", "wear", "soft", "medium", "hard"]
        weather_keywords = ["weather", "rain", "temp", "dry", "wet", "humid", "condition"]
        radio_keywords = [
            "radio",
            "team",
            "engineer",
            "communication",
            "driver",
            "talk",
            "say",
            "said",
            "message",
            "hear",
            "voice",
            "transcript",
        ]
        rivals_keywords = ["rival", "competitor", "opponent", "gap", "behind", "ahead", "overcut", "undercut"]
        circuit_keywords = [
            "circuit",
            "safety car",
            "overtake",
            "track",
            "position",
            "monaco",
            "sc",
            "vsc",
            "yellow",
            "incident",
            "wall",
            "crash",
        ]

        # Match keywords
        if any(w in q_lower for w in tyre_keywords):
            matched.append(self.agents["tyre"])
        if any(w in q_lower for w in weather_keywords):
            matched.append(self.agents["weather"])
        if any(w in q_lower for w in radio_keywords):
            matched.append(self.agents["radio"])
        if any(w in q_lower for w in rivals_keywords):
            matched.append(self.agents["rivals"])
        if any(w in q_lower for w in circuit_keywords):
            matched.append(self.agents["circuit"])

        # Always call at least 2 agents. Fill from a prioritized list if needed.
        fill_priority = [
            self.agents["tyre"],
            self.agents["radio"],
            self.agents["weather"],
            self.agents["rivals"],
            self.agents["circuit"],
        ]

        for agent in fill_priority:
            if len(matched) >= 2:
                break
            if agent not in matched:
                matched.append(agent)

        return matched

    def run(self, query: str) -> str:
        """
        Coordinate routing, parallel execution of selected agents, and response synthesis.

        Parameters
        ----------
        query : str
            The user question/query text.

        Returns
        -------
        str
            The synthesized final response from the Orchestrator.
        """
        # ── 1. Route to Specialist Agents ────────────────────────────────────
        selected_agents = self.route(query)

        # ── 2. Run Selected Agents in Parallel ───────────────────────────────
        agent_results = []
        with concurrent.futures.ThreadPoolExecutor() as executor:
            # Submit run methods to thread pool
            futures = {executor.submit(agent.run, query): agent for agent in selected_agents}
            for future in concurrent.futures.as_completed(futures):
                agent = futures[future]
                try:
                    result = future.result()
                    agent_results.append(result)
                except Exception as exc:
                    print(f"[ERROR] Orchestrator: Agent '{agent.name}' failed with exception: {exc}")

        # Fallback if all agents somehow failed
        if not agent_results:
            return "I don't have enough data to answer that."

        # ── 3. Synthesize Final Unified Response ─────────────────────────────
        system_prompt = (
            "You are PitWall, the master F1 race strategy orchestrator. "
            "Your job is to synthesize reports from various specialist strategy agents into "
            "a single, unified, cohesive, and precise answer for the user.\n\n"
            "RULES:\n"
            "1. Base your answer ONLY on the provided specialist reports.\n"
            "2. Ensure all insights are consolidated logically, removing duplicate or contradictory information.\n"
            "3. Cite the specialist agents that provided the information using inline tags where appropriate, "
            "e.g., [tyre_agent], [weather_agent], [radio_agent], [rivals_agent], [circuit_agent].\n"
            "4. If the specialist reports contain insufficient information to answer the question, or if all reports returned "
            "\"I don't have enough data to answer that.\", you must output exactly: \"I don't have enough data to answer that.\"\n"
            "5. Be concise and write in a professional, race-engineer style."
        )

        # Construct context from agent answers
        reports_str = ""
        for res in agent_results:
            agent_name = res.get("agent", "unknown_agent")
            answer = res.get("answer", "No response.")
            chunks = res.get("chunks_used", 0)
            reports_str += f"### Specialist Report from {agent_name} (using {chunks} context chunks):\n"
            reports_str += f"{answer}\n\n"

        user_prompt = (
            "## Specialist Reports Received\n\n"
            f"{reports_str}"
            "---\n\n"
            "## User Question\n"
            f"{query}\n\n"
            "Please synthesize the specialist reports into a single, unified answer."
        )

        # Query the synthesis model
        unified_answer = ask_groq(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
        )

        return unified_answer

    def run_with_details(self, query: str) -> tuple[str, list[dict]]:
        """
        Like run(), but also returns the raw per-agent result dictionaries so
        callers can surface individual agent answers and chunk counts.

        Parameters
        ----------
        query : str
            The user question/query text.

        Returns
        -------
        tuple of (str, list of dict)
            - The synthesised final answer string.
            - A list of agent result dicts, each containing "agent", "answer",
              and "chunks_used" keys (same structure as BaseAgent.run() output).
        """
        # ── 1. Route to Specialist Agents ────────────────────────────────────
        selected_agents = self.route(query)

        # ── 2. Run Selected Agents in Parallel ───────────────────────────────
        agent_results: list[dict] = []
        with concurrent.futures.ThreadPoolExecutor() as executor:
            futures = {executor.submit(agent.run, query): agent for agent in selected_agents}
            for future in concurrent.futures.as_completed(futures):
                agent = futures[future]
                try:
                    result = future.result()
                    agent_results.append(result)
                except Exception as exc:
                    print(f"[ERROR] Orchestrator: Agent '{agent.name}' failed with exception: {exc}")

        if not agent_results:
            return "I don't have enough data to answer that.", []

        # ── 3. Synthesize Final Unified Response ─────────────────────────────
        system_prompt = (
            "You are PitWall, the master F1 race strategy orchestrator. "
            "Your job is to synthesize reports from various specialist strategy agents into "
            "a single, unified, cohesive, and precise answer for the user.\n\n"
            "RULES:\n"
            "1. Base your answer ONLY on the provided specialist reports.\n"
            "2. Ensure all insights are consolidated logically, removing duplicate or contradictory information.\n"
            "3. Cite the specialist agents that provided the information using inline tags where appropriate, "
            "e.g., [tyre_agent], [weather_agent], [radio_agent], [rivals_agent], [circuit_agent].\n"
            "4. If the specialist reports contain insufficient information to answer the question, or if all reports returned "
            "\"I don't have enough data to answer that.\", you must output exactly: \"I don't have enough data to answer that.\"\n"
            "5. Be concise and write in a professional, race-engineer style."
        )

        reports_str = ""
        for res in agent_results:
            agent_name = res.get("agent", "unknown_agent")
            answer = res.get("answer", "No response.")
            chunks = res.get("chunks_used", 0)
            reports_str += f"### Specialist Report from {agent_name} (using {chunks} context chunks):\n"
            reports_str += f"{answer}\n\n"

        user_prompt = (
            "## Specialist Reports Received\n\n"
            f"{reports_str}"
            "---\n\n"
            "## User Question\n"
            f"{query}\n\n"
            "Please synthesize the specialist reports into a single, unified answer."
        )

        unified_answer = ask_groq(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
        )

        return unified_answer, agent_results
