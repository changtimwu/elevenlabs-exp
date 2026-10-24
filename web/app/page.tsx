import { VoiceChat } from "@/components/voice-chat"

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 p-4 sm:p-8">
      <header>
        <h1 className="text-2xl font-semibold">小美 · 客服中心</h1>
        <p className="text-muted-foreground text-sm">
          Mandarin customer-service agent powered by ElevenLabs
        </p>
      </header>
      <VoiceChat />
    </main>
  )
}
