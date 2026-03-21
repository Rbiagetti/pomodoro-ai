import tempfile
import os
from groq import Groq
from config import settings

groq_client = Groq(api_key=settings.GROQ_API_KEY)


def trascrivi(audio_bytes: bytes, filename: str = "audio.wav") -> str:
    """Trascrive audio con Whisper via Groq."""
    with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(filename)[1] or ".wav") as tmp:
        tmp.write(audio_bytes)
        tmp_path = tmp.name

    try:
        with open(tmp_path, "rb") as f:
            result = groq_client.audio.transcriptions.create(
                file=(filename, f.read()),
                model="whisper-large-v3",
                language="it",
            )
        return result.text
    finally:
        os.unlink(tmp_path)


def analizza(argomento: str, trascrizione: str) -> str:
    """Analizza la spiegazione dello studente."""
    r = groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{
            "role": "user",
            "content": f"""Sei un tutor esperto. L'utente ha studiato "{argomento}".

Trascrizione: {trascrizione}

Genera analisi in italiano:
1. RIASSUNTO (3-4 frasi)
2. CONCETTI CHIAVE
3. LACUNE

Sii diretto e costruttivo."""
        }],
        max_tokens=1000,
    )
    return r.choices[0].message.content


def genera_domanda(argomento: str, trascrizione: str, analisi: str, chat_history: list[dict]) -> str:
    """Genera la prossima domanda socratica."""
    messages = [{
        "role": "system",
        "content": f"""Sei un professore socratico che interroga su "{argomento}".
REGOLE: fai UNA sola domanda, NON spiegare mai, sii conciso (max 2 frasi).
Trascrizione studente: {trascrizione}
Lacune: {analisi}""",
    }]

    for msg in chat_history:
        messages.append({"role": msg["role"], "content": msg["content"]})

    if not chat_history:
        messages.append({"role": "user", "content": "Inizia con la prima domanda."})

    r = groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=messages,
        max_tokens=200,
    )
    return r.choices[0].message.content
