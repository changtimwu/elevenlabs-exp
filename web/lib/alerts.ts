/**
 * Simulated wearable alerts for the Health Alert Responder demo. In a real
 * deployment the device backend would start the call with live readings;
 * here one scenario is picked at random and passed as dynamic variables.
 */
export interface HealthAlert {
  icon: string
  title: string
  detail: string
  variables: {
    user_name: string
    alert_type: string
    /** Spoken in the first message: "我剛剛發現{{alert_summary}}" */
    alert_summary: string
    alert_detail: string
    location: string
    emergency_contact: string
  }
}

export const HEALTH_ALERTS: HealthAlert[] = [
  {
    icon: "🫁",
    title: "血氧過低",
    detail: "SpO₂ 86%（平常約 97%），持續 2 分鐘 · 心跳 108",
    variables: {
      user_name: "王阿姨",
      alert_type: "low_spo2",
      alert_summary: "您的血氧濃度突然降到 86%",
      alert_detail: "血氧 86%（平常約 97%），持續 2 分鐘；心跳 108 次／分",
      location: "台北市大安區信義路四段 1 號 5 樓（住家）",
      emergency_contact: "女兒 王小姐",
    },
  },
  {
    icon: "💓",
    title: "心跳急遽升高",
    detail: "5 分鐘內 75 → 152 bpm，持續 4 分鐘 · 血氧 97%",
    variables: {
      user_name: "林先生",
      alert_type: "tachycardia",
      alert_summary: "您的心跳在五分鐘內從 75 急遽升高到每分鐘 152 下",
      alert_detail: "心跳 152 次／分（靜止心率約 75），持續 4 分鐘；血氧 97%",
      location: "台中市西屯區市政路 200 號附近步道",
      emergency_contact: "太太 林太太",
    },
  },
  {
    icon: "🐢",
    title: "心跳過慢",
    detail: "心跳 38 bpm（平常約 68），持續 3 分鐘",
    variables: {
      user_name: "張奶奶",
      alert_type: "bradycardia",
      alert_summary: "您的心跳變得很慢，只有每分鐘 38 下",
      alert_detail: "心跳 38 次／分（平常約 68），持續 3 分鐘；血氧 95%",
      location: "高雄市苓雅區四維三路 2 號 8 樓（住家）",
      emergency_contact: "兒子 張先生",
    },
  },
  {
    icon: "〰️",
    title: "心律不整",
    detail: "疑似心房顫動，不規則心律 6 分鐘 · 心跳 118",
    variables: {
      user_name: "李先生",
      alert_type: "irregular_rhythm",
      alert_summary: "您的心跳節奏很不規律，已經持續六分鐘",
      alert_detail: "不規則心律（疑似心房顫動）持續 6 分鐘；心跳 118 次／分",
      location: "台南市東區大學路 1 號（辦公室）",
      emergency_contact: "太太 李太太",
    },
  },
  {
    icon: "⚠️",
    title: "跌倒偵測",
    detail: "偵測到大力撞擊，之後 60 秒沒有移動",
    variables: {
      user_name: "陳伯伯",
      alert_type: "fall",
      alert_summary: "您好像跌倒了，而且之後一分鐘都沒有移動",
      alert_detail:
        "跌倒偵測觸發，撞擊力道大；之後 60 秒沒有動作；心跳 96 次／分",
      location: "新北市板橋區文化路一段 100 號 3 樓（住家）",
      emergency_contact: "兒子 陳先生",
    },
  },
]

export function randomAlert(exclude?: HealthAlert): HealthAlert {
  const pool = HEALTH_ALERTS.filter((a) => a !== exclude)
  return pool[Math.floor(Math.random() * pool.length)]
}
