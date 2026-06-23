"""
test_agents.py
--------------
Verification script for the multi-agent PitWall system. Creates an Orchestrator,
routes and runs 3 representative questions, and prints:
  1. The selected/routed agents.
  2. Each agent's individual specialist answer.
  3. The final unified synthesized answer.
"""

import pathlib
import sys

# Ensure project root is in the python path
ROOT_DIR = pathlib.Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from agents.orchestrator import Orchestrator


def main():
    print("=== Initialising PitWall Multi-Agent Orchestrator ===")
    orchestrator = Orchestrator()

    questions = [
        "Should Norris have pitted earlier given the tyre degradation?",
        "How did the weather affect strategy decisions at Monaco?",
        "What were rivals doing when Verstappen made his pit stop on lap 28?",
    ]

    for idx, q in enumerate(questions, start=1):
        border = "=" * 80
        print(f"\n{border}")
        print(f" QUESTION {idx}: {q!r}")
        print(f"{border}\n")

        # ── 1. Show Routing Decision ──────────────────────────────────────────
        routed_agents = orchestrator.route(q)
        print(f"-> Routed to: {[agent.name for agent in routed_agents]}\n")

        # ── 2. Run and Print Individual Agent Answers ─────────────────────────
        print("--- Specialist Agent Runs ---")
        for agent in routed_agents:
            print(f"\n[Executing Agent: {agent.name}] ...")
            try:
                res = agent.run(q)
                print(f"\n=== {agent.name.upper()} ANSWER (Chunks used: {res['chunks_used']}) ===")
                print(res["answer"].strip())
                print("=" * (len(agent.name) + 22))
            except Exception as e:
                print(f"\n[ERROR] Agent {agent.name} failed: {e}")

        # ── 3. Run and Print Synthesized Final Answer ─────────────────────────
        print("\n--- Synthesis Phase ---")
        print("[Executing Orchestrator Synthesis] ...")
        try:
            final_answer = orchestrator.run(q)
            print("\n=== FINAL SYNTHESIZED ANSWER ===")
            print(final_answer.strip())
            print("================================\n")
        except Exception as e:
            print(f"\n[ERROR] Synthesis failed: {e}\n")


if __name__ == "__main__":
    main()
