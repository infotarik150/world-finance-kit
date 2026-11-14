#!/bin/bash
# Installe three.js + la police et télécharge le personnage 3D.
set -e
cd "$(dirname "$0")"
npm install
mkdir -p models
[ -f models/Xbot.glb ] || curl -sSfL -o models/Xbot.glb https://raw.githubusercontent.com/mrdoob/three.js/r170/examples/models/gltf/Xbot.glb
echo "Prêt : node render.js sortie.mp4  (ou : node render.js dossier_apercu 0.5 2.0 4.0)"
