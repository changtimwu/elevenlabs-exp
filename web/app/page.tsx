"use client"

import { useState } from "react"
import { KeyboardIcon, MicIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { AGENTS } from "@/lib/agents"
import { Button } from "@/components/ui/button"
import { VoiceChat } from "@/components/voice-chat"

type Mode = "voice" | "text"

export default function Home() {
  const [agentKey, setAgentKey] = useState(AGENTS[0].key)
  const [mode, setMode] = useState<Mode>("voice")
  const agent = AGENTS.find((a) => a.key === agentKey) ?? AGENTS[0]

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 p-4 sm:p-8">
      <nav className="flex flex-wrap items-center justify-between gap-2">
        <div className="bg-muted flex gap-1 rounded-lg p-1">
          {AGENTS.map((a) => (
            <Button
              key={a.key}
              size="sm"
              variant={a.key === agentKey ? "default" : "ghost"}
              onClick={() => setAgentKey(a.key)}
            >
              {a.label}
            </Button>
          ))}
        </div>
        <div
          className="bg-muted flex gap-1 rounded-lg p-1"
          aria-label="輸入輸出模式"
        >
          {(
            [
              ["voice", "語音", MicIcon],
              ["text", "文字", KeyboardIcon],
            ] as const
          ).map(([m, text, Icon]) => (
            <Button
              key={m}
              size="sm"
              variant={mode === m ? "default" : "ghost"}
              onClick={() => setMode(m)}
              className={cn("gap-1.5")}
            >
              <Icon className="size-4" />
              {text}
            </Button>
          ))}
        </div>
      </nav>
      <header>
        <h1 className="text-2xl font-semibold">{agent.name}</h1>
        <p className="text-muted-foreground text-sm">
          {agent.subtitle} ·{" "}
          {mode === "voice" ? "語音＋文字輸入，語音回覆" : "純文字對話"}
        </p>
      </header>
      {/* Remount on agent/mode change so each starts a fresh session and transcript */}
      <VoiceChat
        key={`${agent.key}-${mode}`}
        agentId={agent.agentId}
        textOnly={mode === "text"}
        label={agent.label}
        emptyTitle={agent.emptyTitle}
        emptyDescription={agent.emptyDescription[mode]}
      />
    </main>
  )
}
