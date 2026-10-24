export interface AgentInfo {
  key: string
  agentId: string
  name: string
  subtitle: string
  label: string
  emptyTitle: string
  emptyDescription: { voice: string; text: string }
}

export const AGENTS: AgentInfo[] = [
  {
    key: "bento",
    agentId: process.env.NEXT_PUBLIC_BENTO_AGENT_ID!,
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
    key: "nurse",
    agentId: process.env.NEXT_PUBLIC_NURSE_AGENT_ID!,
    name: "安心醫院 · 門診預先問診",
    subtitle: "AI 護理助理（示範用，非醫療建議；緊急狀況請撥 119）",
    label: "AI 護理助理",
    emptyTitle: "開始預先問診",
    emptyDescription: {
      voice: "按下電話按鈕，描述您今天哪裡不舒服",
      text: "輸入文字，描述您今天哪裡不舒服",
    },
  },
]
