import streamlit as st
import tempfile
import os
import time
from gtts import gTTS
import base64
from groq import Groq
from supabase import create_client
import bcrypt

st.set_page_config(page_title="Pomodoro AI", page_icon="🍅", layout="centered")

# ── CSS + suono timer ──────────────────────────────────────────────────────────
st.markdown("""
<style>
.timer-display {
    font-size: 80px;
    font-weight: bold;
    text-align: center;
    color: #ff6b6b;
    font-family: monospace;
    letter-spacing: 4px;
}
.phase-label {
    font-size: 18px;
    text-align: center;
    color: #aaa;
    margin-bottom: 8px;
}
.login-box {
    max-width: 400px;
    margin: 0 auto;
    padding: 2rem;
}
</style>
""", unsafe_allow_html=True)

TIMER_SOUND = """
<script>
function playTimerEnd() {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [0, 0.3, 0.6].forEach((t, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.frequency.value = 880;
        g.gain.setValueAtTime(0.4, ctx.currentTime + t);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.25);
        o.start(ctx.currentTime + t);
        o.stop(ctx.currentTime + t + 0.25);
    });
}
playTimerEnd();
</script>
"""

# ── Client setup ───────────────────────────────────────────────────────────────
groq_client = Groq(api_key=st.secrets["GROQ_API_KEY"])
supabase = create_client(st.secrets["SUPABASE_URL"], st.secrets["SUPABASE_KEY"])

# ── Session state ──────────────────────────────────────────────────────────────
defaults = {
    "user": None,
    "phase": "setup",
    "time_left": 25 * 60,
    "running": False,
    "argomento": "",
    "trascrizione": "",
    "analisi": {},
    "chat_history": [],
    "timer_suonato": False,
}
for k, v in defaults.items():
    if k not in st.session_state:
        st.session_state[k] = v

# ── Helpers auth ───────────────────────────────────────────────────────────────
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def check_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

def login(username: str, password: str):
    res = supabase.table("users").select("*").eq("username", username).execute()
    if res.data:
        user = res.data[0]
        if check_password(password, user["password_hash"]):
            return user
    return None

# ── Helpers AI ─────────────────────────────────────────────────────────────────
def genera_audio_b64(testo, lang="it"):
    try:
        tts = gTTS(text=testo, lang=lang)
        tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".mp3")
        tts.save(tmp.name)
        with open(tmp.name, "rb") as f:
            data = f.read()
        os.unlink(tmp.name)
        return base64.b64encode(data).decode()
    except Exception:
        return None

def trascrivi(audio_bytes, filename="audio.wav"):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
        tmp.write(audio_bytes)
        tmp_path = tmp.name
    with open(tmp_path, "rb") as f:
        result = groq_client.audio.transcriptions.create(
            file=(filename, f.read()),
            model="whisper-large-v3",
            language="it"
        )
    os.unlink(tmp_path)
    return result.text

def analizza(argomento, trascrizione):
    r = groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": f"""Sei un tutor esperto. L'utente ha studiato "{argomento}".

Trascrizione: {trascrizione}

Genera analisi in italiano:
1. RIASSUNTO (3-4 frasi)
2. CONCETTI CHIAVE
3. LACUNE

Sii diretto e costruttivo."""}],
        max_tokens=1000
    )
    return r.choices[0].message.content

def genera_domanda(argomento, trascrizione, analisi, chat_history):
    messages = [{
        "role": "system",
        "content": f"""Sei un professore socratico che interroga su "{argomento}".
REGOLE: fai UNA sola domanda, NON spiegare mai, sii conciso (max 2 frasi).
Trascrizione studente: {trascrizione}
Lacune: {analisi.get('testo', '')}"""
    }]
    for msg in chat_history:
        messages.append({"role": msg["role"], "content": msg["content"]})
    if not chat_history:
        messages.append({"role": "user", "content": "Inizia con la prima domanda."})
    r = groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=messages,
        max_tokens=200
    )
    return r.choices[0].message.content

def salva_sessione(user_id, argomento, trascrizione, analisi, n_domande, durata):
    supabase.table("sessions").insert({
        "user_id": user_id,
        "argomento": argomento,
        "trascrizione": trascrizione,
        "analisi": analisi,
        "n_domande": n_domande,
        "durata_minuti": durata,
    }).execute()

def get_sessioni(user_id):
    return supabase.table("sessions").select("*").eq("user_id", user_id).order("created_at", desc=True).execute().data

# ══════════════════════════════════════════════════════════════════════════════
# LOGIN
# ══════════════════════════════════════════════════════════════════════════════
if st.session_state.user is None:
    st.markdown("<div class='login-box'>", unsafe_allow_html=True)
    st.title("🍅 Pomodoro AI")
    st.markdown("#### Studia meglio con l'AI socratica")
    st.divider()

    username = st.text_input("Username")
    password = st.text_input("Password", type="password")

    col1, col2 = st.columns(2)
    with col1:
        if st.button("🔑 Accedi", use_container_width=True, type="primary"):
            user = login(username, password)
            if user:
                st.session_state.user = user
                st.rerun()
            else:
                st.error("Username o password errati")
    with col2:
        if st.button("📝 Registrati", use_container_width=True):
            if username and password:
                try:
                    supabase.table("users").insert({
                        "username": username,
                        "password_hash": hash_password(password),
                        "is_admin": False
                    }).execute()
                    user = login(username, password)
                    st.session_state.user = user
                    st.rerun()
                except Exception:
                    st.error("Username già esistente")
            else:
                st.warning("Inserisci username e password")
    st.markdown("</div>", unsafe_allow_html=True)
    st.stop()

# ══════════════════════════════════════════════════════════════════════════════
# SIDEBAR (utente loggato)
# ══════════════════════════════════════════════════════════════════════════════
with st.sidebar:
    st.markdown(f"👤 **{st.session_state.user['username']}**")
    if st.session_state.user.get("is_admin"):
        st.caption("🛡️ Admin")
    st.divider()

    nav = st.radio("Navigazione", ["🍅 App", "📚 Le mie sessioni"] + (["🛡️ Admin"] if st.session_state.user.get("is_admin") else []))

    st.divider()
    if st.button("🚪 Logout", use_container_width=True):
        for k in list(st.session_state.keys()):
            del st.session_state[k]
        st.rerun()

# ══════════════════════════════════════════════════════════════════════════════
# AREA ADMIN
# ══════════════════════════════════════════════════════════════════════════════
if nav == "🛡️ Admin":
    st.title("🛡️ Admin Panel")
    st.divider()

    # Utenti
    st.subheader("👥 Utenti registrati")
    users = supabase.table("users").select("id, username, is_admin, created_at").order("created_at", desc=True).execute().data
    for u in users:
        col1, col2, col3 = st.columns([3, 1, 1])
        with col1:
            st.write(f"**{u['username']}**" + (" 🛡️" if u["is_admin"] else ""))
            st.caption(u["created_at"][:10])
        with col2:
            sessioni_u = supabase.table("sessions").select("id").eq("user_id", u["id"]).execute().data
            st.metric("Sessioni", len(sessioni_u))
        with col3:
            if not u["is_admin"]:
                if st.button("🗑️", key=f"del_{u['id']}", help="Elimina utente"):
                    supabase.table("sessions").delete().eq("user_id", u["id"]).execute()
                    supabase.table("users").delete().eq("id", u["id"]).execute()
                    st.rerun()
        st.divider()

    # Tutte le sessioni
    st.subheader("📊 Tutte le sessioni")
    all_sessions = supabase.table("sessions").select("*, users(username)").order("created_at", desc=True).execute().data
    for s in all_sessions:
        username_s = s.get("users", {}).get("username", "?") if s.get("users") else "?"
        with st.expander(f"🍅 {s['argomento']} — {username_s} — {s['created_at'][:10]}"):
            st.markdown(f"**Domande AI:** {s['n_domande']} | **Durata:** {s['durata_minuti']} min")
            st.markdown(s.get("analisi", ""))

# ══════════════════════════════════════════════════════════════════════════════
# STORICO SESSIONI UTENTE
# ══════════════════════════════════════════════════════════════════════════════
elif nav == "📚 Le mie sessioni":
    st.title("📚 Le mie sessioni")
    st.divider()

    sessioni = get_sessioni(st.session_state.user["id"])
    if not sessioni:
        st.info("Non hai ancora sessioni. Torna all'app e studia qualcosa! 🍅")
    else:
        st.metric("Sessioni totali", len(sessioni))
        st.metric("Domande totali ricevute", sum(s["n_domande"] for s in sessioni))
        st.divider()
        for s in sessioni:
            with st.expander(f"🍅 {s['argomento']} — {s['created_at'][:10]}"):
                col1, col2 = st.columns(2)
                col1.metric("Domande AI", s["n_domande"])
                col2.metric("Durata", f"{s['durata_minuti']} min")
                st.markdown("**Analisi AI:**")
                st.markdown(s.get("analisi", ""))
                st.markdown("**Trascrizione:**")
                st.caption(s.get("trascrizione", ""))

# ══════════════════════════════════════════════════════════════════════════════
# APP PRINCIPALE
# ══════════════════════════════════════════════════════════════════════════════
elif nav == "🍅 App":

    # ── FASE SETUP ────────────────────────────────────────────────────────────
    if st.session_state.phase == "setup":
        st.title("🍅 Pomodoro AI")
        st.markdown(f"Ciao **{st.session_state.user['username']}**! Cosa studi oggi?")
        st.divider()

        argomento = st.text_input("Argomento", placeholder="es. La fotosintesi, Python list comprehension...")

        st.markdown("**Durata sessione (minuti)**")
        durata = st.number_input("", min_value=5, max_value=120, value=25, step=5, label_visibility="collapsed")

        if st.button("▶️ Inizia sessione", use_container_width=True, type="primary"):
            if argomento:
                st.session_state.argomento = argomento
                st.session_state.time_left = durata * 60
                st.session_state.durata_minuti = durata
                st.session_state.phase = "pomodoro"
                st.session_state.running = True
                st.session_state.timer_suonato = False
                st.rerun()
            else:
                st.warning("Inserisci l'argomento!")

    # ── FASE POMODORO ─────────────────────────────────────────────────────────
    elif st.session_state.phase == "pomodoro":
        st.markdown(f"<div class='phase-label'>📚 {st.session_state.argomento}</div>", unsafe_allow_html=True)

        mins = st.session_state.time_left // 60
        secs = st.session_state.time_left % 60
        colore = "#ff6b6b" if st.session_state.time_left > 60 else "#ff3333"
        st.markdown(f"<div class='timer-display' style='color:{colore}'>{mins:02d}:{secs:02d}</div>", unsafe_allow_html=True)

        # Barra progresso
        durata_tot = st.session_state.get("durata_minuti", 25) * 60
        progresso = 1 - (st.session_state.time_left / durata_tot)
        st.progress(progresso)

        col1, col2 = st.columns(2)
        with col1:
            if st.button("⏸ Pausa" if st.session_state.running else "▶️ Riprendi", use_container_width=True):
                st.session_state.running = not st.session_state.running
                st.rerun()
        with col2:
            if st.button("⏭ Vai alla sintesi", use_container_width=True, type="primary"):
                st.session_state.phase = "sintesi"
                st.rerun()

        if st.session_state.running and st.session_state.time_left > 0:
            time.sleep(1)
            st.session_state.time_left -= 1
            st.rerun()
        elif st.session_state.time_left == 0 and not st.session_state.timer_suonato:
            st.session_state.timer_suonato = True
            st.markdown(TIMER_SOUND, unsafe_allow_html=True)
            st.success("⏰ Tempo scaduto! Ottimo lavoro.")
            time.sleep(2)
            st.session_state.phase = "sintesi"
            st.rerun()

    # ── FASE SINTESI ──────────────────────────────────────────────────────────
    elif st.session_state.phase == "sintesi":
        st.title("🎙️ Sintesi vocale")
        st.markdown(f"Hai studiato **{st.session_state.argomento}**. Spiega a voce tutto quello che ricordi.")
        st.info("Parla liberamente per 2-5 minuti. Più dettagli dai, migliore sarà l'interrogazione!")

        tab_registra, tab_carica = st.tabs(["🔴 Registra ora", "📁 Carica file"])

        with tab_registra:
            audio_recorded = st.audio_input("🎙️ Registra la tua spiegazione", key="rec_sintesi")
            if audio_recorded is not None:
                audio_bytes_sintesi = audio_recorded.getvalue()
                if st.button("📝 Trascrivi e analizza", use_container_width=True, type="primary", key="analizza_rec"):
                    with st.spinner("Trascrizione con Whisper..."):
                        trascrizione = trascrivi(audio_bytes_sintesi)
                    st.session_state.trascrizione = trascrizione
                    with st.spinner("Analisi AI in corso..."):
                        analisi_testo = analizza(st.session_state.argomento, trascrizione)
                    st.session_state.analisi = {"testo": analisi_testo}
                    st.session_state.phase = "analisi"
                    st.rerun()

        with tab_carica:
            audio_file = st.file_uploader("Carica audio (mp3, wav, m4a)", type=["mp3", "wav", "m4a", "ogg"])
            if audio_file:
                st.audio(audio_file)
                if st.button("📝 Trascrivi e analizza", use_container_width=True, type="primary", key="analizza_file"):
                    with st.spinner("Trascrizione con Whisper..."):
                        trascrizione = trascrivi(audio_file.read(), audio_file.name)
                    st.session_state.trascrizione = trascrizione
                    with st.spinner("Analisi AI in corso..."):
                        analisi_testo = analizza(st.session_state.argomento, trascrizione)
                    st.session_state.analisi = {"testo": analisi_testo}
                    st.session_state.phase = "analisi"
                    st.rerun()

    # ── FASE ANALISI ──────────────────────────────────────────────────────────
    elif st.session_state.phase == "analisi":
        st.title("🧠 Analisi AI")
        st.markdown(f"**Argomento:** {st.session_state.argomento}")
        st.divider()

        with st.expander("📄 Trascrizione", expanded=False):
            st.write(st.session_state.trascrizione)

        st.markdown(st.session_state.analisi["testo"])
        st.divider()

        if st.button("🎯 Inizia interrogazione AI", use_container_width=True, type="primary"):
            st.session_state.chat_history = []
            st.session_state.phase = "interrogazione"
            st.rerun()

    # ── FASE INTERROGAZIONE ───────────────────────────────────────────────────
    elif st.session_state.phase == "interrogazione":
        st.title("🤖 Interrogazione AI")
        st.markdown(f"**Argomento:** {st.session_state.argomento}")
        st.caption("L'AI fa domande. Tu rispondi. Pensa ad alta voce!")
        st.divider()

        for i, msg in enumerate(st.session_state.chat_history):
            with st.chat_message(msg["role"]):
                st.write(msg["content"])
                if msg["role"] == "assistant":
                    if st.button("🔊 Ascolta", key=f"ascolta_{i}"):
                        b64 = genera_audio_b64(msg["content"])
                        if b64:
                            st.markdown(f'<audio controls autoplay><source src="data:audio/mp3;base64,{b64}" type="audio/mp3"></audio>', unsafe_allow_html=True)
                        else:
                            st.warning("Audio non disponibile")

        if not st.session_state.chat_history:
            with st.spinner("L'AI sta preparando la prima domanda..."):
                domanda = genera_domanda(
                    st.session_state.argomento,
                    st.session_state.trascrizione,
                    st.session_state.analisi,
                    []
                )
            st.session_state.chat_history.append({"role": "assistant", "content": domanda})
            st.rerun()

        st.markdown("**La tua risposta:**")
        tab_testo, tab_voce = st.tabs(["⌨️ Testo", "🎙️ Voce"])

        with tab_testo:
            risposta_testo = st.text_area("Scrivi la tua risposta", height=100, key="risposta_txt")
            if st.button("Invia", use_container_width=True, type="primary", key="invia_txt"):
                if risposta_testo:
                    st.session_state.chat_history.append({"role": "user", "content": risposta_testo})
                    with st.spinner("L'AI sta pensando..."):
                        domanda = genera_domanda(
                            st.session_state.argomento,
                            st.session_state.trascrizione,
                            st.session_state.analisi,
                            st.session_state.chat_history
                        )
                    st.session_state.chat_history.append({"role": "assistant", "content": domanda})
                    st.rerun()

        with tab_voce:
            audio_risposta = st.audio_input("🎙️ Registra risposta", key="rec_risposta")
            if audio_risposta is not None:
                audio_bytes_risp = audio_risposta.getvalue()
                if st.button("Trascrivi e invia", use_container_width=True, key="invia_audio"):
                    with st.spinner("Trascrizione..."):
                        risposta_trascritta = trascrivi(audio_bytes_risp)
                    st.info(f"Hai detto: *{risposta_trascritta}*")
                    st.session_state.chat_history.append({"role": "user", "content": risposta_trascritta})
                    with st.spinner("L'AI sta pensando..."):
                        domanda = genera_domanda(
                            st.session_state.argomento,
                            st.session_state.trascrizione,
                            st.session_state.analisi,
                            st.session_state.chat_history
                        )
                    st.session_state.chat_history.append({"role": "assistant", "content": domanda})
                    st.rerun()

        st.divider()
        if st.button("✅ Termina e salva sessione", use_container_width=True):
            with st.spinner("Salvataggio sessione..."):
                salva_sessione(
                    user_id=st.session_state.user["id"],
                    argomento=st.session_state.argomento,
                    trascrizione=st.session_state.trascrizione,
                    analisi=st.session_state.analisi.get("testo", ""),
                    n_domande=len([m for m in st.session_state.chat_history if m["role"] == "assistant"]),
                    durata=st.session_state.get("durata_minuti", 25)
                )
            st.success("Sessione salvata! 🎉")
            st.session_state.phase = "setup"
            st.session_state.chat_history = []
            time.sleep(1)
            st.rerun()