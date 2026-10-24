import { VoiceChat } from "@/components/voice-chat"

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 p-4 sm:p-8">
      <header>
        <h1 className="text-2xl font-semibold">小美便當 · 電話點餐</h1>
        <p className="text-muted-foreground text-sm">
          台灣國語便當點餐助理 · Powered by ElevenLabs
        </p>
      </header>
      <VoiceChat />
    </main>
  )
}
