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

## Agent: 小美便當 (Taiwanese Mandarin bento-shop assistant)

This folder is also an ElevenLabs agents project (created with `elevenlabs agents init`).
It holds one conversational agent, **Mandarin Customer Service**
(`agent_3601m5qfnf5pf1g8wg5jrwn64pdk`), built from the `customer-service` template:

- Language `zh`; answers in Taiwanese Mandarin (Traditional Chinese, Taiwanese wording)
  as 小美, who takes phone orders and answers questions for the bento shop 「小美便當」
- Greeting: 您好，歡迎光臨小美便當！我是小美。請問您要訂便當，還是想先看看今天的菜單呢？
- Voice: **Shusita - Taiwanese Accent** (`iCrb0E1mQG2baVhfLIGF`), a young female
  conversational voice from the ElevenLabs voice library (locale `cmn-TW`)

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

Changing the voice: a library voice must first be added to your account, then set as
`conversation_config.tts.voice_id` and pushed. On the free plan library voices work
inside agents, but not with the plain text-to-speech API, and voice design
(`text-to-voice`) needs a paid plan.

```sh
# Find Taiwanese voices (ID, owner, name)
elevenlabs voices get_shared --language zh --locale cmn-TW --page-size 20 \
  --query 'voices[].[voice_id,public_owner_id,name]' --format table

# Add one to your account
elevenlabs voices share --voice-id <voice_id> --public-user-id <public_owner_id> --new-name "<name>"
```

## Agent: 安心守護 (wearable health-alert responder)

A second agent, **Health Alert Responder** (`agent_5201m5r1k3smekysmxwbrctby4cb`), shows
what a voice agent can do in an emergency. When a wearable detects an abnormal reading
(low SpO₂, a sudden heart-rate spike, a very slow heart rate, an irregular rhythm, or a
fall), the system calls the user. The agent opens with what it detected, checks whether
they are safe, and decides whether to send help. It speaks Taiwanese Mandarin /
Traditional Chinese with the calm cmn-TW voice **Ling** (`Z8Aisvg1z70p27kGvkZZ`). It is
a demo, not a medical device.

- **Alert data comes in as dynamic variables:** `user_name`, `alert_type`,
  `alert_summary`, `alert_detail`, `location` and `emergency_contact`. The first message
  is "{{user_name}}您好…我剛剛發現{{alert_summary}}。請問您需要協助嗎？讓我了解一下剛剛您遭遇了什麼。"
  The device is bound to its owner, so the agent never asks who the user is. Placeholder
  defaults in the config keep dashboard test calls working.
- **Safety first:** it asks one short question at a time. Is the user OK, what just
  happened, then symptoms specific to the alert, plus stroke signs every time.
- **Escalation with client tools** (`tool_configs/`):
  - `request_ambulance(reason, patient_responsive, location)`
  - `notify_emergency_contact(message, urgency)`

  The agent calls both right away on chest pain, breathing difficulty, confusion,
  stroke signs, a head injury or being unable to get up after a fall, two unanswered
  turns, or if the user asks. Then it gives short safety instructions and stays on the
  line. The turn timeout is 8 s, so silence is noticed quickly.
- **No emergency:** for a likely false alarm (after exercise, a loose band, cold hands)
  or mild symptoms, it asks the user to rest and re-measure. It offers to notify family
  and suggests seeing a doctor.
- **Post-call data collection:** `alert_type`, `user_responsive`, `what_happened`,
  `symptoms`, `red_flags`, `actions_taken`, `outcome` and `responder_summary`, plus four
  evaluation criteria (safety first, escalation, no diagnosis, clear guidance).

Config: `agent_configs/Health-Alert.json`. Tools are managed like agents:

```sh
elevenlabs tools push       # after editing tool_configs/*.json
```

## Models: normal vs Realtime Mini / Max

Each sample agent exists in three variants, so the models can be compared side by side:

| Option | How it works | 小美便當 | 安心守護 |
| --- | --- | --- | --- |
| 一般 (normal) | Cascaded: `scribe_realtime` speech-to-text → `gemini-2.5-flash` → `eleven_v4_turbo` TTS | `agent_3601m5qfnf5pf1g8wg5jrwn64pdk` | `agent_5201m5r1k3smekysmxwbrctby4cb` |
| Realtime Mini | Speech-to-speech `eleven_realtime_v1_mini` | `agent_3001m5r3g4f5e35tp3b8fyzhzcny` | `agent_5901m5r3gh0vfwdtpztzx5nqw5fe` |
| Realtime Max | Speech-to-speech `eleven_realtime_v1_max` (reasoning and tool calls) | `agent_8001m5r3gfg2ea59p5960x321r10` | `agent_1801m5r3gjrqf53r97krdn8bh2de` |

The Realtime model is selected with `conversation_config.realtime_model`. With it set,
the agent ignores `agent.prompt.llm`, `tts.model_id` and `asr.provider`, but keeps the
prompt, first message, voice, language, tools and turn settings. The field **can't be
overridden per conversation**: the server drops it from the allowed overrides. So each
model is a separate agent, and the web UI picks the agent ID at runtime. Users switch
models on the page; no redeploy is needed.

The variants are generated from the base configs, which are the only files to edit:

```sh
# after editing agent_configs/Mandarin-Customer-Service.json or Health-Alert.json
python3 scripts/realtime_variants.py   # rewrites agent_configs/*.realtime-{mini,max}.json
elevenlabs agents push                 # pushes all six agents
```

Notes:
- Realtime models are voice-only, so the web UI's text mode always uses the normal
  agent.
- Client tools must be listed in `client_events` (`client_tool_call`). Without it, voice
  sessions never receive tool calls; text-only sessions get them regardless.
- Observed in testing: Realtime Max sometimes says "已經幫您叫救護車" a moment before
  the tool call goes out. The normal model and Mini call the tool first.

## Web UI

`web/` is a custom front end for both agents, built with
[ElevenLabs UI](https://ui.elevenlabs.io/docs) (a shadcn/ui component registry) on
Next.js. It is based on the `voice-chat-03` block: an animated orb, a live text
transcript of both sides, and a conversation bar.

The top bar switches **agent** (小美便當 / 安心守護), **model** (一般 / Realtime Mini / Realtime Max, see above) and **mode**:

| Mode | Input | Output | Connection |
| --- | --- | --- | --- |
| 語音 (voice) | Speech, plus typing while on the call | Spoken reply + text transcript | WebRTC, needs mic permission |
| 文字 (text) | Typing only, no mic | Text only, no audio | WebSocket, connects as soon as the mode opens |

Text mode uses the SDK's `textOnly` session option, which the agents allow through
`platform_settings.overrides.conversation_config_override.conversation.text_only`. Both
agents also list `user_transcript` and `agent_response` in
`conversation_config.conversation.client_events`; without those, the transcript stays
empty.

Requires Node.js 18+ (`brew install node`).

```sh
cd web
cp .env.example .env.local   # agent IDs: NEXT_PUBLIC_{BENTO,ALERT}_AGENT_ID and _REALTIME_{MINI,MAX}_AGENT_ID
npm install
npm run dev                  # open http://localhost:3000
```

The browser connects straight to the agents (`@elevenlabs/react`). No API key is
exposed, because the agents are public (auth disabled). For a private agent, add a
server route that fetches a conversation token with your API key, and pass it to
`startSession` instead of the agent ID. Microphone access only works on `localhost` or
HTTPS. To demo remotely, use `tailscale serve`, a tunnel, or a deployment.

| Path | Purpose |
| --- | --- |
| `web/app/page.tsx` | Agent and mode switcher, page header |
| `web/lib/agents.ts` | The agent list (IDs from env, names, labels, empty-state text) |
| `web/lib/alerts.ts` | Simulated wearable alerts. For 安心守護, a random one is shown as a card and passed to the call as dynamic variables (use 換一個異常 to pick another) |
| `web/components/voice-chat.tsx` | Conversation state and transcript (kept after hanging up). Handles the `request_ambulance` / `notify_emergency_contact` client tools by showing a red "simulated" notice instead of really dispatching |
| `web/components/ui/conversation-bar.tsx` | Call controls; adds `textOnly` and `label` props to the upstream component, and strips audio tags like `[抱歉]` via `stripAudioTags` |
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
