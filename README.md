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

## CLI

The same things can be done from the terminal with the
[ElevenLabs CLI](https://elevenlabs.io/docs/eleven-agents/operate/cli).

Install (macOS):

```sh
brew install elevenlabs/tap/elevenlabs
```

Other options: `npm install -g @elevenlabs/cli`, or Scoop on Windows (see the docs).

Authenticate — either run the CLI from this folder (it reads `ELEVENLABS_API_KEY`
from `.env`), or log in once so it works anywhere:

```sh
elevenlabs auth login     # opens a browser; stores credentials in the OS keychain
elevenlabs auth status
```

Examples:

```sh
# List voices (ID and name)
elevenlabs voices search --query 'voices[].[voice_id,name]' --format table

# Text to speech, saved to a file
elevenlabs text-to-speech convert \
  --voice-id JBFqnCBsd6RMkjVDRZzb \
  --model-id eleven_multilingual_v2 \
  --text "Hello from the ElevenLabs CLI." \
  -o cli_out.mp3

# List available models as a table
elevenlabs models list --human
```

Every command accepts `--help`; add `--dry-run` to validate a request without sending it.

## Notes

- The key is passed explicitly via `ElevenLabs(api_key=os.getenv("ELEVENLABS_API_KEY"))`.
  The SDK reads `ELEVENLABS_API_KEY` as a default argument at import time, so a key
  loaded later by `load_dotenv()` would otherwise be missed.
- To use a different voice, replace `voice_id` in `test_tts.py` with one of the IDs
  printed by the script.
