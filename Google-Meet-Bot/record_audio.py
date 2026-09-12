import os
import sounddevice as sd
from scipy.io.wavfile import write
from dotenv import load_dotenv


load_dotenv()


# Names that indicate a loopback ("what the speakers are playing") capture
# device. A plain microphone records the room, not the meeting.
LOOPBACK_HINTS = ("stereo mix", "loopback", "what u hear", "what you hear",
                  "cable output", "voicemeeter out", "blackhole", "soundflower")


def list_devices():
    print(f"{'idx':>4}  {'in':>2}  hostapi              name")
    for idx, dev in enumerate(sd.query_devices()):
        if dev['max_input_channels'] < 1:
            continue
        hostapi = sd.query_hostapis(dev['hostapi'])['name']
        flag = "  <-- loopback" if any(h in dev['name'].lower() for h in LOOPBACK_HINTS) else ""
        print(f"{idx:>4}  {dev['max_input_channels']:>2}  {hostapi:<20} {dev['name']}{flag}")


def find_loopback_device():
    for idx, dev in enumerate(sd.query_devices()):
        if dev['max_input_channels'] < 1:
            continue
        if any(hint in dev['name'].lower() for hint in LOOPBACK_HINTS):
            return idx, dev['name']
    return None, None


class AudioRecorder:
    def __init__(self, device=None):
        self.sample_rate = int(os.getenv('SAMPLE_RATE', 44100))
        if device is None:
            device = os.getenv('AUDIO_DEVICE')
        self.device = int(device) if device not in (None, "") and str(device).isdigit() else device

    def resolve_device(self):
        """Pick the capture device, preferring loopback over the microphone."""
        if self.device is not None:
            return self.device

        idx, name = find_loopback_device()
        if idx is not None:
            print(f"Using loopback device [{idx}] {name}")
            return idx

        default_name = sd.query_devices(kind='input')['name']
        print(
            "WARNING: no loopback device found, falling back to the default input\n"
            f"         [{default_name}]. That records your microphone, not the\n"
            "         meeting audio - the file may be near-silent. Run with\n"
            "         --list-devices and pass --device <idx>, or enable\n"
            "         'Stereo Mix' in Windows sound settings."
        )
        return None

    def get_audio(self, filename, duration):
        device = self.resolve_device()

        channels = 2
        if device is not None:
            max_in = sd.query_devices(device)['max_input_channels']
            channels = min(2, max_in) or 1

        os.makedirs(os.path.dirname(os.path.abspath(filename)), exist_ok=True)

        print(f"Recording for {duration}s...")
        recording = sd.rec(
            int(duration * self.sample_rate),
            samplerate=self.sample_rate,
            channels=channels,
            dtype='int16',
            device=device,
        )
        sd.wait()  # Wait until the recording is finished
        write(filename, self.sample_rate, recording)

        peak = int(abs(recording).max()) if recording.size else 0
        print(f"Recording finished. Saved as {os.path.abspath(filename)}")
        if peak < 200:
            print(
                f"WARNING: the recording looks silent (peak amplitude {peak}).\n"
                "         You are probably capturing a muted mic instead of the\n"
                "         meeting audio. See --list-devices."
            )
