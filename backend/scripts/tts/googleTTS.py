from gtts import gTTS
import sys

textFile = sys.argv[1]
output = sys.argv[2]

with open(textFile, "r", encoding="utf-8") as f:
    text = f.read()

tts = gTTS(
    text=text,
    lang="en",
    slow=False
)

tts.save(output)

print("Audio Saved:", output)