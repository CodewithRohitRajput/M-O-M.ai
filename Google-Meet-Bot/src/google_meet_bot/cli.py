import argparse
import datetime
import os

from .join_google_meet import JoinGoogleMeet
from .record_audio import AudioRecorder, list_devices
from .speech_to_text import SpeechToText


def default_output():
    stamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    return os.path.join("recordings", f"meeting_{stamp}.wav")


def main():
    parser = argparse.ArgumentParser(description="Join a Google Meet, record audio, and summarize it.")
    parser.add_argument("--meet-link", dest="meet_link", default=os.getenv("MEET_LINK"), help="Google Meet link")
    parser.add_argument("--duration", dest="duration", type=int, default=int(os.getenv("RECORDING_DURATION", 60)), help="Recording duration in seconds")
    parser.add_argument("--output", "-o", dest="output", default=None, help="Where to save the .wav (default: ./recordings/meeting_<timestamp>.wav)")
    parser.add_argument("--device", dest="device", default=None, help="Input device index to record from (see --list-devices)")
    parser.add_argument("--list-devices", dest="list_devices", action="store_true", help="List available capture devices and exit")
    parser.add_argument("--no-analysis", dest="no_analysis", action="store_true", help="Skip analysis phase")
    args = parser.parse_args()

    if args.list_devices:
        list_devices()
        return

    if not args.meet_link:
        raise SystemExit("--meet-link (or MEET_LINK env) is required")

    audio_path = os.path.abspath(args.output or default_output())

    bot = JoinGoogleMeet()
    try:
        bot.Glogin()
        bot.turnOffMicCam(args.meet_link)
        bot.AskToJoin(audio_path, args.duration, device=args.device)
    finally:
        bot.quit()

    print(f"\nRecording saved to: {audio_path}")

    if not args.no_analysis:
        SpeechToText().transcribe(audio_path)
