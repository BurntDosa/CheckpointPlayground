import requests

OLLAMA_URL = "http://host.docker.internal:11434/api/chat"

def generate_answer(question: str, contexts: list[str]) -> str:

#Use ollama locally to generate answer

    context_text = "\n\n".join(contexts)

    prompt = f"""
You are a helpful assistant.

Answer the question using ONLY the context below.

If the answer requires understanding a character’s personality or traits,
you MAY infer them from actions, behavior, dialogue, and how others react,
as long as your statements are directly supported by the text.
Do NOT add any facts that are not supported by the context.
If there is truly no supporting evidence, say "I don't know".
Do NOT fabricate any information.

Context:
{context_text}

Question:
{question}

Answer:
"""


    response = requests.post(
    OLLAMA_URL,
    json={
        "model": "mistral",
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": 0.3
        },
        "raw": True
    },
    timeout=120
    )

    response.raise_for_status()
    data = response.json()

    content = data.get("message", {}).get("content", "").strip()

    if content:
        return content

    return "I don't know. The document does not contain enough information to answer this question."

