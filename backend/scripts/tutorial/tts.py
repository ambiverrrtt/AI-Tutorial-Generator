import asyncio
import edge_tts
import sys

TEXT = sys.argv[1]
OUTPUT = sys.argv[2]

VOICE = "en-US-JennyNeural"

async def main():
    communicate = edge_tts.Communicate(
        TEXT,
        VOICE
    )

    await communicate.save(OUTPUT)

asyncio.run(main())