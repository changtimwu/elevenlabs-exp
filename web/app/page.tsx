"use client"

import { useState } from "react"
import { KeyboardIcon, MicIcon, ShuffleIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { AGENTS } from "@/lib/agents"
import { HEALTH_ALERTS, randomAlert } from "@/lib/alerts"
import { Button } from "@/components/ui/button"
import { VoiceChat } from "@/components/voice-chat"

type Mode = "voice" | "text"

export default function Home() {
  const [agentKey, setAgentKey] = useState(AGENTS[0].key)
  const [mode, setMode] = useState<Mode>("voice")
  // Picked in event handlers (not during render) so SSR and client agree
  const [alert, setAlert] = useState(HEALTH_ALERTS[0])
  const agent = AGENTS.find((a) => a.key === agentKey) ?? AGENTS[0]
  const activeAlert = agent.simulatedAlerts ? alert : undefined

  const selectAgent = (key: string) => {
    if (key !== agentKey) setAlert(randomAlert())
    setAgentKey(key)
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 p-4 sm:p-8">
      <nav className="flex flex-wrap items-center justify-between gap-2">
        <div className="bg-muted flex gap-1 rounded-lg p-1">
          {AGENTS.map((a) => (
            <Button
              key={a.key}
              size="sm"
              variant={a.key === agentKey ? "default" : "ghost"}
              onClick={() => selectAgent(a.key)}
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
      {activeAlert && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-950 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-50">
          <span className="text-2xl" aria-hidden>
            {activeAlert.icon}
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-medium">
              手錶偵測：{activeAlert.title}（{activeAlert.variables.user_name}）
            </p>
            <p className="text-sm opacity-80">{activeAlert.detail}</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setAlert(randomAlert(activeAlert))}
            className="shrink-0 gap-1.5"
          >
            <ShuffleIcon className="size-4" />
            換一個異常
          </Button>
        </div>
      )}
      {/* Remount on agent/mode/alert change so each starts a fresh session and transcript */}
      <VoiceChat
        key={`${agent.key}-${mode}-${activeAlert?.variables.alert_type ?? ""}`}
        agentId={agent.agentId}
        textOnly={mode === "text"}
        label={agent.label}
        emptyTitle={agent.emptyTitle}
        emptyDescription={agent.emptyDescription[mode]}
        dynamicVariables={activeAlert?.variables}
      />
    </main>
  )
}
