# web — custom voice UI for the Mandarin agent

Next.js app built with [ElevenLabs UI](https://ui.elevenlabs.io/docs) (the `voice-chat-03`
block: orb, live transcript, and a conversation bar for voice or text input). It connects
to the ElevenLabs agent over WebRTC via `@elevenlabs/react`.

## Run

```sh
cp .env.example .env.local   # sets NEXT_PUBLIC_ELEVENLABS_AGENT_ID
npm install
npm run dev                  # http://localhost:3000
```

No API key is needed in the browser because the agent is public (auth disabled).

## Layout

- `app/page.tsx` — page header + chat
- `components/voice-chat.tsx` — conversation state and transcript (strips `[...]` audio tags)
- `components/ui/` — ElevenLabs UI / shadcn components, copied in and editable
