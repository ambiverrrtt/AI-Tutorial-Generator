import argparse
import asyncio
import edge_tts
import os
import subprocess
import sys
import tempfile

parser = argparse.ArgumentParser()

parser.add_argument("text_file")
parser.add_argument("output_file")

args = parser.parse_args()

with open(args.text_file, "r", encoding="utf-8") as f:
    text = f.read().strip()

if not text:
    print("Text file is empty.")
    sys.exit(1)

# Temporary mp3 file
temp_mp3 = tempfile.mktemp(suffix=".mp3")

VOICE = "hi-IN-SwaraNeural"

# Try this first
RATE = "-12%"

async def generate():
    communicate = edge_tts.Communicate(
        text=text,
        voice=VOICE,
        rate=RATE
    )
    await communicate.save(temp_mp3)

asyncio.run(generate())

# Convert MP3 -> WAV using FFmpeg
command = [
    "ffmpeg",
    "-y",
    "-i",
    temp_mp3,
    "-af",
    "silenceremove=stop_periods=-1:stop_duration=0.15:stop_threshold=-45dB",
    "-ar",
    "24000",
    "-ac",
    "1",
    args.output_file,
]

result = subprocess.run(command, capture_output=True, text=True)

if result.returncode != 0:
    print(result.stderr)
    os.remove(temp_mp3)
    sys.exit(1)

os.remove(temp_mp3)

print("Hindi Audio Generated Successfully")