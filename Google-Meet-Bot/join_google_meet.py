# import required modules
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import (
    TimeoutException,
    NoSuchElementException,
    WebDriverException,
)
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.keys import Keys
import time
import os
import tempfile
from dotenv import load_dotenv

from record_audio import AudioRecorder
from speech_to_text import SpeechToText


load_dotenv()


class JoinGoogleMeet:
    def __init__(self):
        self.mail_address = os.getenv('EMAIL_ID')
        self.password = os.getenv('EMAIL_PASSWORD')
        # create chrome instance
        opt = Options()
        opt.add_argument('--disable-blink-features=AutomationControlled')
        opt.add_argument('--start-maximized')
        opt.add_experimental_option("prefs", {
            "profile.default_content_setting_values.media_stream_mic": 1,
            "profile.default_content_setting_values.media_stream_camera": 1,
            "profile.default_content_setting_values.geolocation": 0,
            "profile.default_content_setting_values.notifications": 1
        })
        self.driver = webdriver.Chrome(options=opt)
        # Explicit waits only - a large implicit wait makes every miss hang.
        self.driver.implicitly_wait(0)

    def Glogin(self):
        # Login Page
        self.driver.get(
            'https://accounts.google.com/ServiceLogin?hl=en&passive=true&continue=https://www.google.com/&ec=GAZAAQ')

        # input Gmail
        self.driver.find_element(By.ID, "identifierId").send_keys(self.mail_address)
        self.driver.find_element(By.ID, "identifierNext").click()

        # input Password
        pwd = WebDriverWait(self.driver, 30).until(
            lambda d: next(
                (e for e in d.find_elements(By.CSS_SELECTOR, 'input[type="password"]')
                 if e.is_displayed()),
                None,
            )
        )
        pwd.send_keys(self.password)
        self.driver.find_element(By.ID, "passwordNext").click()

        # 2-Step Verification / device confirmation needs a human.
        try:
            WebDriverWait(self.driver, 20).until(
                lambda d: "myaccount.google.com" in d.current_url
                or "google.com/search" in d.current_url
                or d.current_url.rstrip("/").endswith("google.com")
                or d.find_elements(By.CSS_SELECTOR, 'input[type="tel"]')
                or "challenge" in d.current_url
            )
        except TimeoutException:
            pass

        if "challenge" in self.driver.current_url or "signin/v2" in self.driver.current_url:
            print(
                "Google is asking for extra verification (2FA / device confirmation). "
                "Complete it in the Chrome window that just opened - waiting up to 3 minutes..."
            )
            try:
                WebDriverWait(self.driver, 180).until(
                    lambda d: "challenge" not in d.current_url
                )
            except TimeoutException:
                self.dump_page("login")
                raise RuntimeError("Google login did not complete (verification not finished).")

        print("Gmail login activity: Done")

    def _click_first(self, selectors, what, timeout=20):
        """Try each selector until one yields a visible element we can click."""
        deadline = time.time() + timeout
        while time.time() < deadline:
            for by, sel in selectors:
                try:
                    for el in self.driver.find_elements(by, sel):
                        if el.is_displayed() and el.is_enabled():
                            self.driver.execute_script("arguments[0].click();", el)
                            return True
                except WebDriverException:
                    continue
            time.sleep(0.5)
        print(f"Could not find {what}")
        return False

    def _dismiss_popups(self):
        """Clear the consent / 'got it' dialogs Meet sometimes shows first."""
        labels = ["Got it", "Dismiss", "Continue", "Close", "No thanks"]
        for label in labels:
            try:
                for el in self.driver.find_elements(
                    By.XPATH, f'//button[normalize-space()="{label}"]'
                ):
                    if el.is_displayed():
                        self.driver.execute_script("arguments[0].click();", el)
                        time.sleep(0.5)
            except WebDriverException:
                continue

    def _mute(self, kind, shortcut):
        """Turn off mic or camera. Falls back to Meet's keyboard shortcut."""
        # data-is-muted is set by Meet on the pre-join toggles; aria-label is the
        # human-readable fallback. Both outlive the obfuscated jscontroller ids.
        selectors = [
            (By.CSS_SELECTOR, f'div[role="button"][data-is-muted="false"][aria-label*="{kind}" i]'),
            (By.CSS_SELECTOR, f'button[data-is-muted="false"][aria-label*="{kind}" i]'),
            (By.CSS_SELECTOR, f'[role="button"][aria-label^="Turn off {kind}" i]'),
        ]
        if self._click_first(selectors, f"{kind} toggle", timeout=10):
            print(f"Turn off {kind} activity: Done")
            return True

        try:
            ActionChains(self.driver).key_down(Keys.CONTROL).send_keys(shortcut).key_up(
                Keys.CONTROL
            ).perform()
            print(f"Turn off {kind} activity: Done (keyboard shortcut)")
            return True
        except WebDriverException as exc:
            print(f"Could not turn off {kind}: {exc.__class__.__name__}")
            return False

    def dump_page(self, reason="debug"):
        """Save the current DOM + screenshot so selector drift can be diagnosed."""
        stamp = time.strftime("%Y%m%d%H%M%S")
        base = os.path.join(tempfile.gettempdir(), f"meetbot_{reason}_{stamp}")
        try:
            with open(base + ".html", "w", encoding="utf-8") as f:
                f.write(self.driver.page_source)
            self.driver.save_screenshot(base + ".png")
            print(f"Saved page dump: {base}.html / .png")
        except WebDriverException:
            pass

    def turnOffMicCam(self, meet_link):
        # Navigate to Google Meet URL
        self.driver.get(meet_link)

        # Wait for the pre-join ("green room") screen to render.
        try:
            WebDriverWait(self.driver, 30).until(
                lambda d: d.find_elements(By.CSS_SELECTOR, '[role="button"]')
            )
        except TimeoutException:
            print("Pre-join screen did not load in time")
            self.dump_page("prejoin")
            return

        self._dismiss_popups()
        self._mute("microphone", "d")
        time.sleep(1)
        self._mute("camera", "e")

    def _in_call(self):
        """True once the in-call UI is up (Leave call button present)."""
        try:
            return bool(
                self.driver.find_elements(By.CSS_SELECTOR, '[aria-label*="Leave call" i]')
                or self.driver.find_elements(By.CSS_SELECTOR, '[aria-label*="Share screen" i]')
            )
        except WebDriverException:
            return False

    def checkIfJoined(self):
        try:
            WebDriverWait(self.driver, 60).until(lambda d: self._in_call())
            print("Meeting has been joined")
            return True
        except (TimeoutException, NoSuchElementException):
            print("Meeting has not been joined")
            return False

    def AskToJoin(self, audio_path, duration, device=None):
        # "Join now" appears when you own/are admitted to the meeting;
        # "Ask to join" when you need the host to let you in.
        time.sleep(3)

        # Meet can drop us straight into the call (own meeting, or an
        # already-admitted account) - then there is no join button at all.
        if self._in_call():
            print("Already in the meeting")
            AudioRecorder(device=device).get_audio(audio_path, duration)
            return

        self._dismiss_popups()
        labels = ["Join now", "Ask to join", "Join anyway", "Switch here"]
        selectors = []
        for label in labels:
            selectors.append((By.XPATH, f'//button[.//span[normalize-space()="{label}"]]'))
            selectors.append((By.XPATH, f'//button[normalize-space()="{label}"]'))
            selectors.append((By.XPATH, f'//*[@role="button"][normalize-space()="{label}"]'))

        if not self._click_first(selectors, "join button", timeout=30):
            self.dump_page("joinbutton")
            raise RuntimeError(
                "Could not find the join button. A page dump was saved above - "
                "Meet may have changed its layout, or the meeting link is invalid."
            )

        print("Ask to join activity: Done")
        if not self.checkIfJoined():
            print("Still waiting to be admitted - recording anyway.")
        AudioRecorder(device=device).get_audio(audio_path, duration)

    def quit(self):
        try:
            self.driver.quit()
        except WebDriverException:
            pass


def main():
    DO_ANALYSIS = True
    temp_dir = tempfile.mkdtemp()
    audio_path = os.path.join(temp_dir, "output.wav")
    # Get configuration from environment variables
    meet_link = os.getenv('MEET_LINK')
    duration = int(os.getenv('RECORDING_DURATION', 60))

    obj = JoinGoogleMeet()
    obj.Glogin()
    obj.turnOffMicCam(meet_link)
    obj.AskToJoin(audio_path, duration)
    if DO_ANALYSIS:
        SpeechToText().transcribe(audio_path)




if __name__ == "__main__":
    main()
