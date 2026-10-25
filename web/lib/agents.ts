/**
 * Which model runs the conversation. "normal" is the cascaded pipeline
 * (speech-to-text → LLM → TTS). The Realtime options are speech-to-speech
 * models; the Realtime model can't be overridden per session, so each one is a
 * separate agent generated from the same config (scripts/realtime_variants.py).
 */
export type ModelOption = "normal" | "realtime-mini" | "realtime-max"

export const MODEL_OPTIONS: { key: ModelOption; label: string }[] = [
  { key: "normal", label: "一般" },
  { key: "realtime-mini", label: "Realtime Mini" },
  { key: "realtime-max", label: "Realtime Max" },
]

export interface AgentInfo {
  key: string
  // NEXT_PUBLIC_* values are inlined at build time, so each is read literally
  agentIds: Record<ModelOption, string>
  name: string
  subtitle: string
  label: string
  emptyTitle: string
  emptyDescription: { voice: string; text: string }
  /** Start each call with a random simulated wearable alert (see alerts.ts) */
  simulatedAlerts?: boolean
}

export const AGENTS: AgentInfo[] = [
  {
    key: "bento",
    agentIds: {
      normal: process.env.NEXT_PUBLIC_BENTO_AGENT_ID!,
      "realtime-mini": process.env.NEXT_PUBLIC_BENTO_REALTIME_MINI_AGENT_ID!,
      "realtime-max": process.env.NEXT_PUBLIC_BENTO_REALTIME_MAX_AGENT_ID!,
    },
    name: "小美便當 · 電話點餐",
    subtitle: "台灣國語便當點餐助理",
    label: "小美便當",
    emptyTitle: "開始點餐",
    emptyDescription: {
      voice: "按下電話按鈕跟小美說話，通話中也可以打字",
      text: "直接輸入文字開始點餐",
    },
  },
  {
    key: "alert",
    agentIds: {
      normal: process.env.NEXT_PUBLIC_ALERT_AGENT_ID!,
      "realtime-mini": process.env.NEXT_PUBLIC_ALERT_REALTIME_MINI_AGENT_ID!,
      "realtime-max": process.env.NEXT_PUBLIC_ALERT_REALTIME_MAX_AGENT_ID!,
    },
    name: "安心守護 · 穿戴裝置緊急應變",
    subtitle:
      "手錶偵測到異常時主動來電（示範用，非醫療建議；緊急狀況請撥 119）",
    label: "安心守護",
    emptyTitle: "手錶偵測到異常",
    emptyDescription: {
      voice: "按下電話按鈕接聽 AI 助理的關心來電",
      text: "AI 助理正在連線…",
    },
    simulatedAlerts: true,
  },
]
