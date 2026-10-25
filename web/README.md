# web — custom voice/text UI for the ElevenLabs agents

Next.js app built with [ElevenLabs UI](https://ui.elevenlabs.io/docs) (the `voice-chat-03`
block: orb, live transcript, and a conversation bar for voice or text input). It connects
to the ElevenLabs agent over WebRTC via `@elevenlabs/react`.

## Run

```sh
cp .env.example .env.local   # sets the six agent IDs (normal / Realtime Mini / Realtime Max per agent)
npm install
npm run dev                  # http://localhost:3000
```

Switch agent (小美便當 / 安心守護), model (一般 / Realtime Mini / Realtime Max; voice mode only) and mode (語音: voice + typing, spoken replies; 文字: text only, no mic or audio) from the top bar.

No API key is needed in the browser because the agents are public (auth disabled).

## Layout

- `app/page.tsx` — agent and mode switcher, page header
- `lib/agents.ts` — agent list (IDs from env)
- `lib/alerts.ts` — simulated wearable alerts passed to 安心守護 as dynamic variables
- `components/voice-chat.tsx` — conversation state and transcript
- `components/ui/conversation-bar.tsx` — call controls, with added `textOnly` and `label` props
- `components/ui/` — ElevenLabs UI / shadcn components, copied in and editable
