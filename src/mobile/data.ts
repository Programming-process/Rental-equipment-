import type { DashboardResponse } from "../lib/api"

export type Screen = "login" | "home" | "profile" | "equipment" | "detail" | "calendar" | "scanner" | "checkout" | "checkin" | "telemetry" | "anomaly" | "support" | "notifications" | "security"

export const fallbackDashboard: DashboardResponse = {
  summary: {
    totalEquipment: 128,
    rentedToday: 6,
    alerts: 4,
    syncSecondsAgo: "8 сек өмнө",
    siteName: "Улаанбаатар төв",
  },
  equipment: [
    {
      id: "DRL-UB-0247",
      name: "Өрмийн машин D45",
      category: "Цахилгаан багаж",
      model: "Atlas Copco D45",
      status: "Түрээстэй",
      meta: "DRL-UB-0247",
      location: "Нарны зам · Блок B",
      assignee: "Б. Бат",
      tenant: "Хөх Тэнгэр ХХК",
      due: "10-р сарын 18",
      telemetry: { vibration: "4.82", temperature: "78.6", rpm: "1,482" },
      live: true,
    },
    {
      id: "GEN-0162",
      name: "Генератор 150 кВА",
      category: "Үүсгүүр, компрессор, насос",
      model: "Cummins 150 kVA",
      status: "Бэлэн",
      meta: "GEN-0162",
      location: "Зүүн талбай · Хашаа 2",
      assignee: "С. Уран",
      tenant: "Монкон ХХК",
      due: "10-р сарын 14",
      telemetry: { vibration: "2.58", temperature: "64.2", rpm: "840" },
      live: true,
    },
    {
      id: "MIX-4993",
      name: "Бетон зуурагч 8м³",
      category: "Барилгын тоног төхөөрөмж",
      model: "MIX-8 PRO",
      status: "Анхаарах",
      meta: "MIX-4993",
      location: "Талбай 12 · Блок C",
      assignee: "Н. Баяр",
      tenant: "Улаанбаатар бетон",
      due: "10-р сарын 16",
      telemetry: { vibration: "8.41", temperature: "96.2", rpm: "1,824" },
      live: true,
    },
  ],
  alerts: [
    {
      id: "A-8842",
      title: "Бетон зуурагчийн температур",
      equipmentId: "MIX-4993",
      risk: "93.4%",
      location: "Талбай 12",
      severity: "high",
      description: "Температур 96.2°C · автомат мониторинг идэвхтэй",
    },
  ],
  notifications: [
    {
      id: "n-1",
      title: "Хөдөлгүүрийн эрсдэл 18 мин",
      meta: "MIX-4993 · Талбай 12",
      type: "alert",
      createdAt: "Өнөөдөр · 12:43",
    },
    {
      id: "n-2",
      title: "Хугацаа 2 цагийн дараа дуусна",
      meta: "Өрмийн машин D45",
      type: "calendar",
      createdAt: "Өнөөдөр · 12:50",
    },
  ],
  supportTeam: [
    { name: "Д. Эрдэнэ", role: "Техникч · 7 мин" },
    { name: "С. Номин", role: "Менежер · ONLINE" },
  ],
}
