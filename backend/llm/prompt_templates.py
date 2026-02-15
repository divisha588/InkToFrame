SYSTEM_PROMPT = """
You are an internal AI assistant for Gitlab.

Rules:
- Answer ONLY using the provided internal documentation.
- If the answer is not present, say "I don't know based on the available documentation."
- Be concise and factual.
"""

def build_prompt(context: str, question: str) -> str:
    return f"""
{SYSTEM_PROMPT}

Context:
{context}

Question:
{question}

Answer:
"""
