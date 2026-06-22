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

st.markdown(
    """
    <style>
    .stApp {
        margin: 0;
    }
    .block-container {
        padding: 0;
        max-width: none;
    }
    header[data-testid="stHeader"] {
        display: none;
    }
    div[data-testid="stToolbar"] {
        display: none;
    }
    div[data-testid="stDecoration"] {
        display: none;
    }
    div[data-testid="stStatusWidget"] {
        display: none;
    }
    </style>
    """,
    unsafe_allow_html=True,
)

if not HTML_FILE.exists():
    st.error(f"Fichier introuvable : {HTML_FILE}")
    st.stop()

html = HTML_FILE.read_text(encoding="utf-8", errors="replace")

components.html(html, height=2200, scrolling=True)
