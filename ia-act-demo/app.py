from pathlib import Path

import streamlit as st
import streamlit.components.v1 as components


st.set_page_config(
    page_title="IA Act Demo",
    layout="wide",
    initial_sidebar_state="collapsed",
)


BASE_DIR = Path(__file__).resolve().parent
HTML_FILE = BASE_DIR / "index.html"


st.title("Demo IA Act")
st.caption("Version Streamlit de la page HTML de démonstration.")

if not HTML_FILE.exists():
    st.error(f"Fichier introuvable : {HTML_FILE}")
    st.stop()

html = HTML_FILE.read_text(encoding="utf-8", errors="replace")

components.html(html, height=2200, scrolling=True)

