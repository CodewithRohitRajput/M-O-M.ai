"""Polls the server for scheduled meetings, records them, posts the .wav back.

Run with:  python -m google_meet_bot.runner
"""
import datetime
import os
import time
import traceback

import requests
from dotenv import load_dotenv

from .join_google_meet import JoinGoogleMeet

# The .env lives next to this module, so load it by path - a bare load_dotenv()
# searches up from the working directory and misses it.
load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))
load_dotenv()  # anything else the working directory provides

API_BASE = os.getenv("API_BASE_URL", "http://localhost:8000")
BOT_TOKEN = os.getenv("BOT_TOKEN")
POLL_SECONDS = int(os.getenv("POLL_SECONDS", 15))
HEADERS = {"x-bot-token": BOT_TOKEN or ""}


def claim_job():
    response = requests.get(f"{API_BASE}/meet/bot/next", headers=HEADERS, timeout=20)
    response.raise_for_status()
    return response.json().get("data")


def upload_recording(job_id, audio_path):
    with open(audio_path, "rb") as handle:
        response = requests.post(
            f"{API_BASE}/meet/bot/{job_id}/recording",
            headers=HEADERS,
            files={"audio": (os.path.basename(audio_path), handle, "audio/wav")},
            timeout=900,
        )
    response.raise_for_status()


def report_failure(job_id, message):
    try:
        requests.post(
            f"{API_BASE}/meet/bot/{job_id}/fail",
            headers=HEADERS,
            json={"error": message[-500:]},
            timeout=20,
        )
    except requests.RequestException:
        pass


def run_job(job):
    stamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    audio_path = os.path.abspath(
        os.path.join("recordings", f"meeting_{stamp}.wav")
    )

    bot = JoinGoogleMeet()
    try:
        bot.Glogin()
        bot.turnOffMicCam(job["meetLink"])
        bot.AskToJoin(audio_path, job["duration"])
    finally:
        bot.quit()

    # No SpeechToText here on purpose - the server transcribes with Gemini.
    # Doing it locally too would pay twice for a result nobody reads.
    print(f"Uploading {audio_path} ...")
    upload_recording(job["jobId"], audio_path)
    print(f"Job {job['jobId']} handed off to the server.")


def main():
    if not BOT_TOKEN:
        raise SystemExit("BOT_TOKEN is required - set it in .env to match the server")

    print(f"Runner polling {API_BASE} every {POLL_SECONDS}s. Ctrl-C to stop.")
    while True:
        job = None
        try:
            job = claim_job()
            if not job:
                time.sleep(POLL_SECONDS)
                continue
            print(f"Claimed job {job['jobId']} -> {job['meetLink']} ({job['duration']}s)")
            run_job(job)
        except KeyboardInterrupt:
            print("\nStopped.")
            return
        except Exception:
            traceback.print_exc()
            if job:
                report_failure(job["jobId"], traceback.format_exc())
            time.sleep(POLL_SECONDS)


if __name__ == "__main__":
    main()
