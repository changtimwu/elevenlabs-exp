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

## Agent: 小美便当 (Mandarin bento-shop assistant)

This folder is also an ElevenLabs agents project (created with `elevenlabs agents init`).
It holds one conversational agent, **Mandarin Customer Service**
(`agent_3601m5qfnf5pf1g8wg5jrwn64pdk`), built from the `customer-service` template:

- Language `zh`; answers in Mandarin (Simplified Chinese) as 小美, who takes phone
  orders and answers questions for the bento shop 「小美便当」
- Greeting: 您好，欢迎光临小美便当！我是小美。请问您想订便当，还是想了解今天的菜单呢？
- Voice: premade **Sarah** (`EXAVITQu4vr4xnSDxMaL`), verified for Chinese and usable on
  the free plan

### Conversation logic

There is no conversation code: the agent's behaviour is defined by its config and run
by an LLM (`gemini-2.5-flash`) on ElevenLabs' servers. In
`agent_configs/Mandarin-Customer-Service.json`:

| Field | What it controls |
| --- | --- |
| `conversation_config.agent.first_message` | Fixed opening line |
| `conversation_config.agent.prompt.prompt` | System prompt: shop info, **menu and prices** (sample data — replace with your own), the ordering flow, and guardrails (no invented items, no pretending to process payment or delivery) |
| `platform_settings.data_collection` | Fields extracted from each call after it ends: `order_items`, `order_total`, `pickup_time`, `customer_name`, `customer_phone` — visible per conversation in the dashboard |

The agent has no tools, so it can't actually submit orders; it reads the order back,
and the collected fields are how a shop would pick them up. Read recent orders with:

```sh
elevenlabs agents conversations list --agent-id agent_3601m5qfnf5pf1g8wg5jrwn64pdk
elevenlabs agents conversations get --conversation-id <conv_id> \
  --query 'analysis.data_collection_results'
```

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

## Web UI

`web/` is a custom front end for the agent, built with
[ElevenLabs UI](https://ui.elevenlabs.io/docs) (a shadcn/ui component registry) on
Next.js. It uses the `voice-chat-03` block: an animated orb, a live text transcript of
both sides, and a conversation bar to start/end the call, mute, or type instead of talk.

Requires Node.js 18+ (`brew install node`).

```sh
cd web
cp .env.example .env.local   # NEXT_PUBLIC_ELEVENLABS_AGENT_ID=agent_3601m5qfnf5pf1g8wg5jrwn64pdk
npm install
npm run dev                  # open http://localhost:3000, click the phone button, allow the mic
```

The browser connects straight to the agent over WebRTC (`@elevenlabs/react`); no API
key is exposed because the agent is public (auth disabled). For a private agent, add a
server route that fetches a conversation token with your API key and pass it to
`startSession` instead of the agent ID.

| Path | Purpose |
| --- | --- |
| `web/app/page.tsx` | Page header and layout |
| `web/components/voice-chat.tsx` | Conversation state and transcript; strips audio tags like `[抱歉]` from displayed text |
| `web/components/ui/` | ElevenLabs UI / shadcn components, copied into the project and freely editable |

Add more ElevenLabs UI components (run inside `web/`):

```sh
npx shadcn@latest add https://ui.elevenlabs.io/r/<component>.json   # e.g. orb, waveform, voice-button
```

If that returns HTTP 429 (the site's bot protection), download the component's JSON
from [`apps/www/public/r/`](https://github.com/elevenlabs/ui/tree/main/apps/www/public/r)
in the elevenlabs/ui repo and pass the local file path to `shadcn add` instead.

## Notes

- The key is passed explicitly via `ElevenLabs(api_key=os.getenv("ELEVENLABS_API_KEY"))`.
  The SDK reads `ELEVENLABS_API_KEY` as a default argument at import time, so a key
  loaded later by `load_dotenv()` would otherwise be missed.
- To use a different voice, replace `voice_id` in `test_tts.py` with one of the IDs
  printed by the script.
