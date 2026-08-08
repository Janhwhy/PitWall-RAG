import sys
import os
import json
sys.path.append(os.getcwd())
from utils.groq_client import ask_groq

prompt = """You are a retrieval optimization AI for a Formula 1 RAG system.
Given a user query, extract metadata filters to narrow down the vector search, and generate an optimal semantic search query.
Output MUST be a valid JSON object with EXACTLY these keys:
{
  "where": {
    // Optional ChromaDB 'where' clause dict, e.g. {"$and": [{"race": {"$eq": "Monaco"}}, {"year": {"$in": [2025, 2026]}}]}
    // Valid fields for filtering: "race" (string, e.g. "Monaco", "Bahrain"), "year" (int, e.g. 2025, 2026).
  },
  "search_queries": [
    "first search query",
    "second search query (optional)"
  ]
}
If no specific race or year is mentioned, leave the "where" dict empty: {}.
Return ONLY valid JSON. No markdown code blocks, no explanation."""

res = ask_groq(system_prompt=prompt, user_prompt="Compare Monaco strategy between 2025 and 2026", model="llama-3.3-70b-versatile")
print(res)
