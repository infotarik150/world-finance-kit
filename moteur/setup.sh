#!/usr/bin/env bash
# Installe ce qu'il faut pour fabriquer les videos (a lancer une fois par session).
set -e
cd "$(dirname "$0")"
command -v ffmpeg >/dev/null || { echo "ffmpeg manquant (apt-get install -y ffmpeg)"; exit 1; }
node -e "require('playwright')" 2>/dev/null || npm install playwright
fc-list | grep -qi "Inter" || echo "ATTENTION : police Inter absente (installer fonts-inter), le rendu utilisera une autre police."
python3 -m venv .venv && .venv/bin/pip install -q faster-whisper numpy
echo "OK. Transcription : .venv/bin/python -I transcrire_mots.py voix.wav words.js"
