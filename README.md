# elevenlabs-exp

Minimal smoke test for the [ElevenLabs Python SDK](https://github.com/elevenlabs/elevenlabs-python).
`test_tts.py` lists the voices available to your account, then synthesizes a short
sentence to `out.mp3`.

## Requirements

- [uv](https://docs.astral.sh/uv/) (installs Python and the dependencies automatically)
- An ElevenLabs API key — create one at <https://elevenlabs.io/app/settings/api-keys>

## Setup

Create a `.env` file in the project root (it is gitignored):

```
ELEVENLABS_API_KEY=your_api_key_here
```

## Usage

```sh
uv run test_tts.py
```

Expected output:

```
10 voices available, e.g.:
  56bWURjYFHyYyVf490Dp  Emma
  ...
Wrote out.mp3
```

Play the result (macOS):

```sh
afplay out.mp3
```

## Without uv

```sh
pip install elevenlabs python-dotenv
python test_tts.py
```

## Notes

- The key is passed explicitly via `ElevenLabs(api_key=os.getenv("ELEVENLABS_API_KEY"))`.
  The SDK reads `ELEVENLABS_API_KEY` as a default argument at import time, so a key
  loaded later by `load_dotenv()` would otherwise be missed.
- To use a different voice, replace `voice_id` in `test_tts.py` with one of the IDs
  printed by the script.
