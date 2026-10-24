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

## Agent: Mandarin customer service

This folder is also an ElevenLabs agents project (created with `elevenlabs agents init`).
It holds one conversational agent, **Mandarin Customer Service**
(`agent_3601m5qfnf5pf1g8wg5jrwn64pdk`), built from the `customer-service` template:

- Language `zh`; the system prompt makes it answer in Mandarin (Simplified Chinese)
  as 小美, a patient customer-service rep
- Greeting: 您好，欢迎致电客服中心，我是小美。请问有什么可以帮您？
- Voice: premade **Sarah** (`EXAVITQu4vr4xnSDxMaL`), verified for Chinese and usable on
  the free plan

Talk to it in the browser:
<https://elevenlabs.io/app/talk-to?agent_id=agent_3601m5qfnf5pf1g8wg5jrwn64pdk>

Project layout:

| Path | Purpose |
| --- | --- |
| `agents.json` | Maps each agent to its config file and ElevenLabs ID |
| `agent_configs/Mandarin-Customer-Service.json` | Full agent config (prompt, voice, LLM, …) |
| `tools.json`, `tests.json` | Tool and test registries (empty for now) |

Change the agent by editing its config, then push:

```sh
elevenlabs agents push               # upload local configs to ElevenLabs
elevenlabs agents status             # compare local configs with ElevenLabs
elevenlabs agents pull               # fetch changes made in the web dashboard
```

Create another agent from a template:

```sh
elevenlabs agents templates list
elevenlabs agents add "My Agent" --template customer-service
```

Using a library voice: on the free plan, voices from the ElevenLabs voice library
can't be used through the API, so the agent uses a premade voice. On a paid plan you
can switch to a native Mandarin voice such as "Kathy - Mandarin"
(`GE494ib77Hxb5fJC33Ib`, already added to the account) by setting `voice_id` in the
agent config and running `elevenlabs agents push`. Find other Mandarin voices with:

```sh
elevenlabs voices get_shared --language zh --page-size 15 \
  --query 'voices[].[voice_id,name,locale]' --format table
```

## Notes

- The key is passed explicitly via `ElevenLabs(api_key=os.getenv("ELEVENLABS_API_KEY"))`.
  The SDK reads `ELEVENLABS_API_KEY` as a default argument at import time, so a key
  loaded later by `load_dotenv()` would otherwise be missed.
- To use a different voice, replace `voice_id` in `test_tts.py` with one of the IDs
  printed by the script.
