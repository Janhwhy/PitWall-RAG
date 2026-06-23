"""
test_rag.py
-----------
Manual end-to-end test for the PitWall RAG pipeline.

Runs three representative questions through the full pipeline
(retrieve -> prompt -> generate) and prints each question together
with the LLM's answer, clearly separated.

Run from the project root:
    python utils/test_rag.py
"""

import pathlib
import sys

# ── Path bootstrap ───────────────────────────────────────────────────────────
ROOT_DIR = pathlib.Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from utils.rag import ask  # noqa: E402  (import after sys.path setup)

# ── Test questions ────────────────────────────────────────────────────────────
QUESTIONS: list[str] = [
    "When did Verstappen pit and what tyres did he switch to?",
    "What was the track temperature like during the Monaco race?",
    "Was there any front wing damage during the race and which team was affected?",
]


def _banner(text: str) -> None:
    """Print a plain-ASCII section banner."""
    border = "=" * 72
    print(border)
    print(f"  {text}")
    print(border)


def _sub_banner(text: str) -> None:
    border = "-" * 72
    print(border)
    print(f"  {text}")
    print(border)


def _print_result(index: int, question: str, answer: str) -> None:
    """Print a single Q and A pair with clear visual separation."""
    print()
    _sub_banner(f"Question {index} of {len(QUESTIONS)}")
    print(f"\n  Q: {question}\n")
    print("  A:")
    # Indent each line of the answer for readability
    for line in answer.splitlines():
        print(f"     {line}")
    print()


# ── Main ──────────────────────────────────────────────────────────────────────
def main() -> None:
    _banner(f"PitWall RAG -- End-to-End Test  ({len(QUESTIONS)} questions)")

    errors: list[tuple[int, str, Exception]] = []

    for i, question in enumerate(QUESTIONS, start=1):
        try:
            answer = ask(question)
            _print_result(i, question, answer)
        except EnvironmentError as exc:
            # Missing API key — no point continuing.
            print(f"\n[CONFIG ERROR] {exc}")
            print("Ensure GROQ_API_KEY is set in your .env file and re-run.\n")
            sys.exit(1)
        except Exception as exc:
            # Log the failure but continue with remaining questions.
            errors.append((i, question, exc))
            _print_result(i, question, f"Pipeline error: [{type(exc).__name__}] {exc}")

    # Summary
    print()
    passed = len(QUESTIONS) - len(errors)
    _banner(f"Done: {passed}/{len(QUESTIONS)} answered successfully")

    if errors:
        print("\n  Failed questions:")
        for idx, q, exc in errors:
            print(f"    [{idx}] {q}")
            print(f"         {type(exc).__name__}: {exc}")
        print()


if __name__ == "__main__":
    main()
