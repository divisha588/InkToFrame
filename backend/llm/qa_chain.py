from groq import Groq
from backend.llm.prompt_templates import build_prompt

def run_qa_groq(docs, question: str):
    client = Groq()

    context = "\n\n".join([d.page_content for d in docs])
    prompt = build_prompt(context, question)

    completion = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[
            {"role": "user", "content": prompt}
        ],
        temperature=0.2,
        max_completion_tokens=1024,
        top_p=1
    )

    return completion.choices[0].message.content
