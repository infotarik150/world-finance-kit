#!/usr/bin/env bash
# Usage : ./assembler.sh video_sans_son.mp4 audio.wav finale.mp4
set -e
ffmpeg -loglevel error -y -i "$1" -i "$2" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart "$3"
echo "Video finale : $3"
