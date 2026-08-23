import argparse
import os
import base64
import requests
import sys
import time
from dotenv import load_dotenv

load_dotenv()

parser = argparse.ArgumentParser()

parser.add_argument("text_file")
parser.add_argument("output_file")

args = parser.parse_args()

with open(args.text_file, "r", encoding="utf-8") as f:
    text = f.read()

api_key = os.getenv("SARVAM_API_KEY")

if not api_key:
    print("ERROR: SARVAM_API_KEY not found.")
    sys.exit(1)

url = "https://api.sarvam.ai/text-to-speech"

headers = {
    "api-subscription-key": api_key,
    "Content-Type": "application/json"
}

payload = {
    "text": text,
    "target_language_code": "hi-IN",
    "speaker": "ritu",
    "model": "bulbul:v3",
    "pace": 1.0,
    "speech_sample_rate": 24000,
    "output_audio_codec": "wav"
}

MAX_RETRIES = 3

for attempt in range(1, MAX_RETRIES + 1):

    try:

        print(f"Generating Audio (Attempt {attempt}/{MAX_RETRIES})")

        response = requests.post(
            url,
            json=payload,
            headers=headers,
            timeout=120
        )

        response.raise_for_status()

        data = response.json()

        if "audios" not in data or len(data["audios"]) == 0:
            raise Exception("No audio returned from Sarvam.")

        audio_base64 = data["audios"][0]

        audio_bytes = base64.b64decode(audio_base64)

        with open(args.output_file, "wb") as f:
            f.write(audio_bytes)

        print("Hindi Audio Generated Successfully")

        sys.exit(0)

    except (
        requests.exceptions.ConnectionError,
        requests.exceptions.Timeout,
        requests.exceptions.HTTPError
    ) as e:

        print(f"\nAttempt {attempt} Failed")
        print(e)

        if attempt == MAX_RETRIES:
            print("\nSarvam API Failed After Maximum Retries.")
            sys.exit(1)

        wait = attempt * 2

        print(f"Retrying in {wait} seconds...\n")

        time.sleep(wait)

    except Exception as e:

        print("\nUnexpected Error")
        print(e)

        sys.exit(1)