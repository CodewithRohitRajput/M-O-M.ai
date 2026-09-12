"""Google Meet Bot package.

Automate joining Google Meet, record audio, then transcribe and summarize it with Google Gemini.
"""

from .record_audio import AudioRecorder
from .speech_to_text import SpeechToText
from .join_google_meet import JoinGoogleMeet

__all__ = [
    "AudioRecorder",
    "SpeechToText",
    "JoinGoogleMeet",
]


